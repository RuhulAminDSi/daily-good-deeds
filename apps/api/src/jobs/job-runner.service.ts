import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import type { PgBoss } from 'pg-boss';
import { APP_CONFIG, type WorkerConfig } from '../config/env.js';
import { Job, type JobDefinition, type JobHandler, QUEUE_DEFAULTS, dlqName } from './job.js';
import { PG_BOSS } from './jobs.client.js';

/** On SIGTERM, wait this long for in-flight jobs; then they are failed (and retried) by pg-boss. */
const DRAIN_TIMEOUT_MS = 25_000;

/** Starts pg-boss, provisions queues for every @Job provider, and drains them on shutdown. */
@Injectable()
export class JobRunner implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(JobRunner.name);

  constructor(
    @Inject(PG_BOSS) private readonly boss: PgBoss,
    @Inject(APP_CONFIG) private readonly config: WorkerConfig,
    private readonly discovery: DiscoveryService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.boss.on('error', (err) => this.logger.error({ err }, 'pg-boss error'));
    // Includes `queue_backlog` for any non-empty dead-letter queue (warningQueueSize 1 below).
    this.boss.on('warning', (warning) => this.logger.warn({ warning }, 'pg-boss warning'));
    await this.boss.start();

    const jobs = this.discovery.getProviders({ metadataKey: Job.meta.KEY }).map((wrapper) => ({
      definition: this.discovery.getMetadataByDecorator(Job.meta, wrapper)!,
      handler: wrapper.instance as JobHandler,
    }));
    await Promise.all(jobs.map(({ definition, handler }) => this.register(definition, handler)));

    // A schedule whose job no longer declares one would keep firing forever; remove it.
    const scheduled = new Set(
      jobs.filter((j) => j.definition.schedule).map((j) => j.definition.name),
    );
    for (const { name, key } of await this.boss.getSchedules()) {
      if (!scheduled.has(name)) await this.boss.unschedule(name, key);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    // Stops fetching, waits for in-flight handlers, then aborts their signal and closes the pool.
    await this.boss.stop({ graceful: true, timeout: DRAIN_TIMEOUT_MS });
  }

  private async register({ name, schema, queue, schedule }: JobDefinition, handler: JobHandler) {
    const dlq = dlqName(name);
    // Dead jobs stay in the DLQ (inspectable/retryable, ADMIN-014); a backlog of 1 raises a warning.
    await this.boss.createQueue(dlq, { warningQueueSize: 1 });
    const options = { ...QUEUE_DEFAULTS, ...queue, deadLetter: dlq };
    await this.boss.createQueue(name, options);
    await this.boss.updateQueue(name, options); // createQueue never changes an existing queue

    await this.boss.work(
      name,
      { pollingIntervalSeconds: this.config.JOB_POLL_SECONDS },
      async ([job]) => {
        await handler.handle(schema.parse(job!.data), {
          jobId: job!.id,
          retryCount: job!.retryCount,
          signal: job!.signal,
        });
      },
    );
    if (schedule) await this.boss.schedule(name, schedule.cron, {}, { tz: schedule.tz ?? 'UTC' });
    this.logger.log(`queue ready: ${name}`);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { defineJob, Job, type JobHandler } from './job.js';

export const Heartbeat = defineJob({
  name: 'system.heartbeat',
  schema: z.unknown(),
  schedule: { cron: '0 * * * *' },
});

/** Proves end to end that the worker is polling and completing jobs (T-P2-PLAT-004). */
@Injectable()
@Job(Heartbeat)
export class HeartbeatJob implements JobHandler {
  private readonly logger = new Logger(HeartbeatJob.name);

  async handle(): Promise<void> {
    this.logger.log('worker heartbeat');
  }
}

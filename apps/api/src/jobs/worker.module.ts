import { type DynamicModule, Module, type Type } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { PgBoss } from 'pg-boss';
import { loggerOptions } from '../common/logging/logger.options.js';
import { ConfigModule } from '../config/config.module.js';
import type { WorkerConfig } from '../config/env.js';
import { HeartbeatJob } from './heartbeat.job.js';
import { JobRunner } from './job-runner.service.js';
import { JobsClient, PG_BOSS } from './jobs.client.js';

/** Job handlers the worker runs. Feature modules add their `jobs/` providers here. */
const JOBS: Type[] = [HeartbeatJob];

/**
 * pg-boss's internal timers dominate idle load (several fire every 5 s by default). The product's
 * per-minute reminder tick keeps production compute on anyway (ADR-005), so these only trim noise.
 */
const IDLE_TUNING = {
  flowIntervalSeconds: 300, // job flows are unused
  cronWorkerIntervalSeconds: 45, // maximum allowed
  cronMonitorIntervalSeconds: 45, // maximum allowed
  instanceHeartbeatSeconds: 300,
  superviseIntervalSeconds: 300, // also how often DLQ backlog warnings can fire
  queueCacheIntervalSeconds: 300,
  bamIntervalSeconds: 300,
};

/** Root module of the worker process: no HTTP, only pg-boss consumers (and producers). */
@Module({})
export class WorkerModule {
  static forRoot(config: WorkerConfig): DynamicModule {
    return {
      module: WorkerModule,
      imports: [
        LoggerModule.forRoot(loggerOptions(config)),
        ConfigModule.forRoot(config),
        DiscoveryModule,
      ],
      providers: [
        // Direct (unpooled) URL: pg-boss holds long-lived connections and uses advisory locks,
        // which Neon's transaction pooler does not support (DL-026).
        {
          provide: PG_BOSS,
          useFactory: () =>
            new PgBoss({
              connectionString: config.DIRECT_URL,
              max: 3,
              schema: 'pgboss',
              ...IDLE_TUNING,
            }),
        },
        JobsClient,
        JobRunner,
        ...JOBS,
      ],
      exports: [JobsClient],
    };
  }
}

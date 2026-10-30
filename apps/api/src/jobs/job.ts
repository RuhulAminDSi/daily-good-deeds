import { DiscoveryService } from '@nestjs/core';
import type { QueueOptions, ScheduleOptions } from 'pg-boss';
import type { z } from 'zod';

/** Retry policy shared by every queue unless a job overrides it (ADR-005). */
export const QUEUE_DEFAULTS = {
  retryLimit: 3,
  retryDelay: 30,
  retryBackoff: true,
  retryDelayMax: 3600,
} as const satisfies QueueOptions;

/**
 * A job's contract, shared by producers (JobsClient.send) and the handler (@Job). Define it in the
 * owning module's `jobs/` folder so producers import the contract, not the worker-only handler.
 */
export interface JobDefinition<S extends z.ZodType = z.ZodType> {
  /** Queue name, e.g. `email.send`. Terminal failures are kept in `<name>.dlq`. */
  name: string;
  /** Payload contract; validated when sent and again before handling. */
  schema: S;
  queue?: QueueOptions;
  /**
   * Recurring jobs: one cron per queue, UTC by default. Per-time-zone work (e.g. "at 02:00 local")
   * runs an hourly UTC cron that fans out to the users whose local time matches.
   */
  schedule?: { cron: string } & Pick<ScheduleOptions, 'tz'>;
}

export const defineJob = <S extends z.ZodType>(definition: JobDefinition<S>) => definition;

export interface JobContext {
  jobId: string;
  retryCount: number;
  /** Aborted when the worker shuts down mid-job; the job is then retried. */
  signal: AbortSignal;
}

/**
 * Processes one queue. Handlers must be idempotent (keyed on `jobId` or a natural key): a job can
 * run again after a retry or a shutdown that interrupted it.
 */
export interface JobHandler<S extends z.ZodType = z.ZodType> {
  handle(data: z.infer<S>, context: JobContext): Promise<void>;
}

export const dlqName = (queue: string) => `${queue}.dlq`;

const JobMeta = DiscoveryService.createDecorator<JobDefinition>();
/** Marks a provider as the handler for a job; the worker discovers it at startup. */
export const Job = (definition: JobDefinition) => JobMeta(definition);
Job.meta = JobMeta;

import { Inject, Injectable } from '@nestjs/common';
import type { PgBoss, SendOptions } from 'pg-boss';
import type { z } from 'zod';
import type { JobDefinition } from './job.js';

export const PG_BOSS = Symbol('PG_BOSS');

/** Typed producer: validates the payload against the job's contract before enqueueing. */
@Injectable()
export class JobsClient {
  constructor(@Inject(PG_BOSS) private readonly boss: PgBoss) {}

  /** Returns the job id, or null when a singleton/throttle option suppressed the job. */
  send<S extends z.ZodType>(
    job: JobDefinition<S>,
    data: z.input<S>,
    options?: SendOptions,
  ): Promise<string | null> {
    return this.boss.send(job.name, job.schema.parse(data) as object, options);
  }
}

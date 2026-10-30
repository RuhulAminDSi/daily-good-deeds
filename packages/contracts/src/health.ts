import { z } from 'zod';

export const HealthLiveSchema = z.object({ status: z.literal('ok') });
export type HealthLive = z.infer<typeof HealthLiveSchema>;

/** Per-dependency readiness, e.g. `{ db: 'ok' }`. */
export const ReadinessChecksSchema = z.record(z.string(), z.enum(['ok', 'fail']));

export const HealthReadySchema = z.object({
  status: z.literal('ok'),
  checks: ReadinessChecksSchema,
});
export type HealthReady = z.infer<typeof HealthReadySchema>;

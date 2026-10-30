import { ProblemSchema } from './errors.js';
import { HealthLiveSchema, HealthReadySchema } from './health.js';

/**
 * Schemas published under `components.schemas` in the API's OpenAPI document (by name), so the
 * generated client types and the runtime validators come from the same Zod definitions.
 */
export const OPENAPI_SCHEMAS = {
  Problem: ProblemSchema,
  HealthLive: HealthLiveSchema,
  HealthReady: HealthReadySchema,
} as const;

import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export class InvalidConfigError extends Error {
  override readonly name = 'InvalidConfigError';
}

/** Parses process env into typed config. Throws (aborting boot) on any invalid value. */
export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    throw new InvalidConfigError(
      `Invalid environment configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

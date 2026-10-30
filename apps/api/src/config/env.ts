import { z } from 'zod';

const postgresUrl = z.url({ protocol: /^postgres(ql)?$/ });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** Pooled connection (Neon pooler) used by the running app. */
  DATABASE_URL: postgresUrl,
  /** Connections per process; Neon pooler fronts these (DL-026). */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
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

/** DI token for AppConfig. */
export const APP_CONFIG = Symbol('APP_CONFIG');

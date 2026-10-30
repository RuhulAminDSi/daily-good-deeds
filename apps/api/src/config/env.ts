import { z } from 'zod';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Postgres URL; remote hosts must verify the server certificate (sslmode=verify-full). */
const postgresUrl = z.url({ protocol: /^postgres(ql)?$/ }).refine(
  (value) => {
    const url = new URL(value);
    return LOCAL_HOSTS.has(url.hostname) || url.searchParams.get('sslmode') === 'verify-full';
  },
  { message: 'remote database URLs must use sslmode=verify-full' },
);

/** Settings every process needs. */
const BaseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

/** API (HTTP) process. */
const ApiSchema = BaseSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  /** Pooled connection (Neon pooler) used by the running app. */
  DATABASE_URL: postgresUrl,
  /** Connections per process; Neon pooler fronts these (DL-026). */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
});

/** Worker process: pg-boss needs a direct (unpooled) connection (DL-026). */
const WorkerSchema = BaseSchema.extend({
  DIRECT_URL: postgresUrl,
  /** Idle polling interval; the pg-boss default (2 s) means needless queries on Neon (ADR-005). */
  JOB_POLL_SECONDS: z.coerce.number().min(0.5).max(60).default(10),
});

export type BaseConfig = z.infer<typeof BaseSchema>;
export type AppConfig = z.infer<typeof ApiSchema>;
export type WorkerConfig = z.infer<typeof WorkerSchema>;

export class InvalidConfigError extends Error {
  override readonly name = 'InvalidConfigError';
}

function parse<S extends z.ZodType>(schema: S, env: NodeJS.ProcessEnv): z.infer<S> {
  const result = schema.safeParse(env);
  if (!result.success) {
    throw new InvalidConfigError(
      `Invalid environment configuration:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

/** Parses process env into typed config. Throws (aborting boot) on any invalid value. */
export const loadConfig = (env: NodeJS.ProcessEnv): AppConfig => parse(ApiSchema, env);
export const loadWorkerConfig = (env: NodeJS.ProcessEnv): WorkerConfig => parse(WorkerSchema, env);

/** DI token for the process config (AppConfig in the API, WorkerConfig in the worker). */
export const APP_CONFIG = Symbol('APP_CONFIG');

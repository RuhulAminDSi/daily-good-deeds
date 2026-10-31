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
  /** Error reporting (NFR-OBSERVABILITY-005); unset = errors are only logged. */
  SENTRY_DSN: z.url().optional(),
  /** Deployed version (git SHA) for error reports; set by the deploy. */
  APP_RELEASE: z.string().min(1).default('dev'),
});

/** Comma-separated web origins allowed by CORS (NFR-SECURITY-027), e.g. `https://app.example.com`. */
const originList = z
  .string()
  .transform((s) =>
    s
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url()).min(1));

/** API (HTTP) process. */
const ApiSchema = BaseSchema.extend({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  /** Allowed web origins. Required in production; development defaults to DEV_WEB_ORIGINS. */
  WEB_ORIGINS: originList.optional(),
  /**
   * Reverse-proxy hops in front of the API, so rate limiting sees real client IPs. Required in
   * production (0 only if the API is exposed directly): a wrong value puts every client behind
   * the proxy into one rate-limit bucket.
   */
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).optional(),
  /** Pooled connection (Neon pooler) used by the running app. */
  DATABASE_URL: postgresUrl,
  /** Connections per process; Neon pooler fronts these (DL-026). */
  DB_POOL_MAX: z.coerce.number().int().min(1).max(50).default(5),
  /**
   * Server-side secret mixed into every password hash (AUTHENTICATION §3), so a database leak alone
   * cannot be brute-forced. Required in production; changing it invalidates every password.
   */
  PASSWORD_PEPPER: z.string().min(32).optional(),
});

/** Local web dev servers: Next's default port, and 3210 used where 3000 is taken (README). */
export const DEV_WEB_ORIGINS = ['http://localhost:3000', 'http://localhost:3210'];

const ApiConfigSchema = ApiSchema.transform((env, ctx) => {
  if (env.NODE_ENV === 'production') {
    for (const key of ['WEB_ORIGINS', 'TRUST_PROXY', 'PASSWORD_PEPPER'] as const) {
      if (env[key] === undefined) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'required in production' });
      }
    }
  }
  return {
    ...env,
    WEB_ORIGINS: env.WEB_ORIGINS ?? DEV_WEB_ORIGINS,
    TRUST_PROXY: env.TRUST_PROXY ?? 0,
  };
});

/** Worker process: pg-boss needs a direct (unpooled) connection (DL-026). */
const WorkerSchema = BaseSchema.extend({
  DIRECT_URL: postgresUrl,
  /** Idle polling interval; the pg-boss default (2 s) means needless queries on Neon (ADR-005). */
  JOB_POLL_SECONDS: z.coerce.number().min(0.5).max(60).default(10),
});

export type BaseConfig = z.infer<typeof BaseSchema>;
export type AppConfig = z.infer<typeof ApiConfigSchema>;
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
export const loadConfig = (env: NodeJS.ProcessEnv): AppConfig => parse(ApiConfigSchema, env);
export const loadWorkerConfig = (env: NodeJS.ProcessEnv): WorkerConfig => parse(WorkerSchema, env);

/** DI token for the process config (AppConfig in the API, WorkerConfig in the worker). */
export const APP_CONFIG = Symbol('APP_CONFIG');

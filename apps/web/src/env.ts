import { z } from 'zod';

const ServerEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    /** Server-side base URL of the API; never exposed to the browser. */
    API_URL: z.url().optional(),
    /** Sentry project of the web app (server and browser); unset → errors are not reported. */
    NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
    /** Build identifier (git SHA) attached to error reports. */
    NEXT_PUBLIC_APP_RELEASE: z.string().min(1).default('dev'),
  })
  .transform((env, ctx) => {
    if (!env.API_URL && env.NODE_ENV === 'production') {
      ctx.addIssue({ code: 'custom', path: ['API_URL'], message: 'required in production' });
      return z.NEVER;
    }
    return { ...env, API_URL: env.API_URL ?? 'http://localhost:4000' };
  });

let cached: z.infer<typeof ServerEnvSchema> | undefined;

/** Validated server env. First parsed at server start (instrumentation.ts), so a bad value fails boot. */
export const serverEnv = () => (cached ??= ServerEnvSchema.parse(process.env));

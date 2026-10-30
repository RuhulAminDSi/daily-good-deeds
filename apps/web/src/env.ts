import { z } from 'zod';

const ServerEnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    /** Server-side base URL of the API; never exposed to the browser. */
    API_URL: z.url().optional(),
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

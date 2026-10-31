import type { Reporter } from '@dgd/observability/node';
import type { Instrumentation } from 'next';

let reporter: Reporter | undefined;

/** Runs once when the Next server starts: fail fast on misconfiguration instead of per request. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const [{ serverEnv }, { createNodeReporter }] = await Promise.all([
      import('./env'),
      import('@dgd/observability/node'),
    ]);
    const env = serverEnv();
    reporter = await createNodeReporter({
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
      release: env.NEXT_PUBLIC_APP_RELEASE,
      environment: env.NODE_ENV,
    });
  }
}

/** Server render, route handler and server action errors (NFR-OBSERVABILITY-005). */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const requestId = request.headers['x-request-id'];
  // React replaces server component errors with a `digest`; the browser's report carries it too.
  const digest = (error as { digest?: unknown } | null)?.digest;
  reporter?.report(error, {
    requestId: typeof requestId === 'string' ? requestId : undefined,
    tags: {
      routePath: context.routePath,
      routeType: context.routeType,
      ...(typeof digest === 'string' && { digest }),
    },
  });
};

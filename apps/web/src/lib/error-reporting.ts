// Browser error reporting (NFR-OBSERVABILITY-005).
import type * as SentryBrowser from '@sentry/browser';

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
let sentry: Promise<typeof SentryBrowser> | undefined;

/** Loads and starts the Sentry SDK on first use; without a DSN no Sentry code is downloaded. */
const load = () =>
  (sentry ??= Promise.all([import('@sentry/browser'), import('@dgd/observability')]).then(
    ([Sentry, { scrubEvent }]) => {
      Sentry.init({
        dsn: DSN,
        release: process.env.NEXT_PUBLIC_APP_RELEASE ?? 'dev',
        environment: process.env.NODE_ENV,
        beforeSend: (event) => scrubEvent(event),
      });
      return Sentry;
    },
  ));

/** Starts reporting uncaught errors and unhandled rejections (src/instrumentation-client.ts). */
export function initErrorReporting(): void {
  if (DSN) void load();
}

/** Reports an error an error boundary caught; React does not surface those as uncaught. */
export function reportError(error: unknown, digest?: string): void {
  if (DSN) void load().then((Sentry) => Sentry.captureException(error, { tags: { digest } }));
}

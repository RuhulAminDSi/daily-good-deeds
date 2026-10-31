// Server-side (Node) error reporting, shared by the API, the worker and the web server.
import type { NodeOptions } from '@sentry/node';
import { scrubEvent } from './scrub.js';

export interface ReportContext {
  requestId?: string;
  tags?: Record<string, string>;
}

export interface Reporter {
  report(error: unknown, context?: ReportContext): void;
  /** Flushes pending reports (shutdown). */
  close(): Promise<void>;
}

export interface ReporterOptions {
  /** Unset → a no-op reporter (unconfigured integrations degrade, never fake). */
  dsn?: string;
  release: string;
  environment: string;
  /** Tests pass a capturing transport. */
  transport?: NodeOptions['transport'];
}

/**
 * Errors only: no tracing (P10, DL-032), no integrations (they gather request and user data), and
 * every event scrubbed (NFR-PRIVACY-010). A scope per report: no global Sentry state, so nothing
 * leaks between requests or tests. The SDK is loaded only when a DSN is set.
 */
export async function createNodeReporter({
  dsn,
  release,
  environment,
  transport,
}: ReporterOptions): Promise<Reporter> {
  if (!dsn) return { report() {}, close: async () => {} };
  const { defaultStackParser, makeNodeTransport, NodeClient, Scope } = await import('@sentry/node');
  const client = new NodeClient({
    dsn,
    release,
    environment,
    transport: transport ?? makeNodeTransport,
    stackParser: defaultStackParser,
    integrations: [],
    beforeSend: (event) => scrubEvent(event),
  });
  client.init();
  return {
    report(error, { requestId, tags } = {}) {
      const scope = new Scope();
      scope.setClient(client);
      if (requestId) scope.setTag('requestId', requestId);
      if (tags) scope.setTags(tags);
      scope.captureException(error);
    },
    close: async () => {
      await client.close(2000);
    },
  };
}

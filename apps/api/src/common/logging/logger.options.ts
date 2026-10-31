import { randomUUID } from 'node:crypto';
import { scrubEvent, SENSITIVE_FIELDS } from '@dgd/observability';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Params } from 'nestjs-pino';
import { z } from 'zod';
import type { BaseConfig } from '../../config/env.js';

/**
 * Secrets and personal data that must never reach logs (NFR-PRIVACY, docs/api/ERROR_HANDLING.md §4).
 * Field names come from the list shared with error reporting (@dgd/observability).
 */
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  ...SENSITIVE_FIELDS.map((field) => `*.${field}`),
];

const isUuid = (value: unknown) => z.uuid().safeParse(value).success;

export function loggerOptions(config: BaseConfig): Params {
  return {
    pinoHttp: {
      level: config.LOG_LEVEL,
      // Reuse a well-formed client X-Request-Id, otherwise generate one; echo it back.
      genReqId: (req: IncomingMessage, res: ServerResponse) => {
        const incoming = req.headers['x-request-id'];
        const id = isUuid(incoming) ? (incoming as string) : randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },
      // Probes hit these every few seconds; logging them is noise.
      autoLogging: { ignore: (req) => req.url?.startsWith('/api/v1/health/') ?? false },
      // One completion line per request: 4xx at info, 5xx at error (with the cause, see filter).
      customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : 'info'),
      redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
      // Error messages and stacks can embed secrets (e.g. a connection string): same scrub as Sentry.
      serializers: { err: (err: object) => scrubEvent(err) },
      ...(config.NODE_ENV === 'development' ? { transport: { target: 'pino-pretty' } } : {}),
    },
  };
}

import express, { type RequestHandler } from 'express';
import { DomainError } from '../errors/domain-error.js';
import type { ErrorCode } from '@dgd/contracts';

/** SRS NFR-SECURITY-019. `/sync` gets its own larger limit when that module lands (P9). */
export const JSON_BODY_LIMIT = '256kb';

// body-parser error `type`s → catalog codes. Mapped here because Nest's adapter turns a JSON
// SyntaxError into a bare BadRequestException that is indistinguishable from other 400s.
const CODE_BY_PARSER_TYPE: Record<string, ErrorCode> = {
  'entity.parse.failed': 'MALFORMED_JSON',
  'entity.too.large': 'PAYLOAD_TOO_LARGE',
  'encoding.unsupported': 'UNSUPPORTED_MEDIA_TYPE',
  'charset.unsupported': 'UNSUPPORTED_MEDIA_TYPE',
};

/**
 * JSON-only body parser (the API accepts no other body types) whose failures surface as
 * DomainErrors. Applied as Nest module middleware, so it runs after request logging and the
 * request id are set up, and its errors reach ProblemDetailsFilter.
 */
export function jsonBody(limit = JSON_BODY_LIMIT): RequestHandler {
  const parse = express.json({ limit });
  return (req, res, next) =>
    parse(req, res, (err?: unknown) => {
      if (!err) return next();
      const type = (err as { type?: string }).type;
      next(new DomainError((type && CODE_BY_PARSER_TYPE[type]) || 'VALIDATION_FAILED'));
    });
}

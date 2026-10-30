import express, { type RequestHandler } from 'express';
import type { ErrorCode } from '@dgd/contracts';
import { DomainError } from '../errors/domain-error.js';

/** SRS NFR-SECURITY-019. `/sync` gets its own larger limit when that module lands (P9). */
export const JSON_BODY_LIMIT = '256kb';
/** Deeper nesting than any API schema needs; bounds parser/validator recursion on hostile input. */
export const JSON_MAX_DEPTH = 32;

// body-parser error `type`s → catalog codes. Mapped here because Nest's adapter turns a JSON
// SyntaxError into a bare BadRequestException that is indistinguishable from other 400s.
const CODE_BY_PARSER_TYPE: Record<string, ErrorCode> = {
  'entity.parse.failed': 'MALFORMED_JSON',
  'entity.too.large': 'PAYLOAD_TOO_LARGE',
  'encoding.unsupported': 'UNSUPPORTED_MEDIA_TYPE',
  'charset.unsupported': 'UNSUPPORTED_MEDIA_TYPE',
};
const TOO_DEEP = 'entity.too.deep';

/** Single pass over the raw bytes, before JSON.parse: throws once nesting exceeds `max`. */
export function assertJsonDepth(buf: Buffer, max = JSON_MAX_DEPTH): void {
  let depth = 0;
  let inString = false;
  for (let i = 0; i < buf.length; i++) {
    const c = buf[i];
    if (inString) {
      if (c === 0x5c) {
        i++; // backslash: skip the escaped byte
      } else if (c === 0x22) {
        inString = false;
      }
    } else if (c === 0x22) {
      inString = true;
    } else if (c === 0x7b || c === 0x5b) {
      if (++depth > max) {
        throw Object.assign(new Error('JSON too deep'), { status: 400, type: TOO_DEEP });
      }
    } else if (c === 0x7d || c === 0x5d) depth--;
  }
}

/**
 * JSON-only body parser (the API accepts no other body types) whose failures surface as
 * DomainErrors. Applied as Nest module middleware, so it runs after request logging and the
 * request id are set up, and its errors reach ProblemDetailsFilter.
 */
export function jsonBody(limit = JSON_BODY_LIMIT): RequestHandler {
  const parse = express.json({ limit, verify: (_req, _res, buf) => assertJsonDepth(buf) });
  return (req, res, next) =>
    parse(req, res, (err?: unknown) => {
      if (!err) return next();
      const type = (err as { type?: string }).type;
      if (type === TOO_DEEP) {
        return next(
          new DomainError('VALIDATION_FAILED', {
            errors: [{ pointer: '', code: 'max_depth', params: { max: JSON_MAX_DEPTH } }],
          }),
        );
      }
      next(new DomainError((type && CODE_BY_PARSER_TYPE[type]) || 'VALIDATION_FAILED'));
    });
}

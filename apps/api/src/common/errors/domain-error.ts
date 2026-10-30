import type { ErrorCode } from './error-codes.js';

export interface FieldError {
  /** JSON Pointer (RFC 6901) into the body, e.g. "/title/bn". */
  pointer?: string;
  /** Query/path parameter name, used instead of `pointer`. */
  parameter?: string;
  code: string;
  i18nKey?: string;
  params?: Record<string, unknown>;
}

export interface DomainErrorOptions {
  detail?: string;
  errors?: FieldError[];
  extensions?: Record<string, unknown>;
}

/** Throw from services/controllers; ProblemDetailsFilter renders it as problem+json. */
export class DomainError extends Error {
  constructor(
    readonly code: ErrorCode,
    readonly options: DomainErrorOptions = {},
  ) {
    super(options.detail ?? code);
  }
}

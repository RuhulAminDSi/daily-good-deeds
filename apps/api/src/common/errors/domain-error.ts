import type { ErrorCode, FieldError } from '@dgd/contracts';

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

import { z } from 'zod';

/**
 * Error catalog (docs/api/ERROR_HANDLING.md §3), shared by the API and its clients. Clients branch
 * on `code` and render the message from `i18nKey`. `title` is the English fallback until the API
 * localizes titles from `i18nKey` (T-P2-I18N-006).
 */
export const ERROR_CODES = {
  VALIDATION_FAILED: { status: 400, title: 'Some fields are invalid' },
  MALFORMED_JSON: { status: 400, title: 'The request body is not valid JSON' },
  UNAUTHENTICATED: { status: 401, title: 'Sign in to continue' },
  PERMISSION_DENIED: { status: 403, title: 'You do not have permission to do this' },
  RESOURCE_NOT_FOUND: { status: 404, title: 'Not found' },
  METHOD_NOT_ALLOWED: { status: 405, title: 'Method not allowed' },
  CONFLICT: { status: 409, title: 'This conflicts with existing data' },
  PAYLOAD_TOO_LARGE: { status: 413, title: 'The request is too large' },
  UNSUPPORTED_MEDIA_TYPE: { status: 415, title: 'Unsupported content type' },
  BUSINESS_RULE_VIOLATION: { status: 422, title: 'This action is not allowed' },
  RATE_LIMITED: { status: 429, title: 'Too many requests' },
  INTERNAL_ERROR: { status: 500, title: 'Something went wrong' },
  DEPENDENCY_UNAVAILABLE: { status: 503, title: 'A service is temporarily unavailable' },
} as const satisfies Record<string, { status: number; title: string }>;

export type ErrorCode = keyof typeof ERROR_CODES;
export const ErrorCodeSchema = z.enum(Object.keys(ERROR_CODES) as [ErrorCode, ...ErrorCode[]]);

/** Generic code per HTTP status: the first catalog entry with that status wins. */
export const CODE_BY_STATUS: ReadonlyMap<number, ErrorCode> = new Map(
  (Object.entries(ERROR_CODES) as [ErrorCode, { status: number }][])
    .reverse()
    .map(([code, { status }]) => [status, code]),
);

/** errors.validation_failed */
export const i18nKeyOf = (code: ErrorCode) => `errors.${code.toLowerCase()}`;

/** https://docs.dailygooddeeds.app/errors/validation-failed */
export const typeUriOf = (code: ErrorCode) =>
  `https://docs.dailygooddeeds.app/errors/${code.toLowerCase().replaceAll('_', '-')}`;

export const FieldErrorSchema = z.object({
  /** JSON Pointer (RFC 6901) into the body, e.g. "/title/bn". */
  pointer: z.string().optional(),
  /** Query/path parameter name, used instead of `pointer`. */
  parameter: z.string().optional(),
  code: z.string(),
  i18nKey: z.string().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
});
export type FieldError = z.infer<typeof FieldErrorSchema>;

/** RFC 9457 problem+json body returned for every API error. Extension members are allowed. */
export const ProblemSchema = z
  .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string().optional(),
    instance: z.string().optional(),
    code: ErrorCodeSchema,
    i18nKey: z.string(),
    requestId: z.string().optional(),
    errors: z.array(FieldErrorSchema).optional(),
  })
  .loose();
export type Problem = z.infer<typeof ProblemSchema>;

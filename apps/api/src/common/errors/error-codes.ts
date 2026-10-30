// Error catalog (docs/api/ERROR_HANDLING.md §3). Clients branch on `code`; `i18nKey` renders the message.
// Moves to packages/contracts with T-P2-PLAT-006 so the web client shares it. `title` is the English
// fallback until the API localizes titles from `i18nKey` (T-P2-I18N-006).
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

/** Generic code per HTTP status: the first catalog entry with that status wins. */
export const CODE_BY_STATUS = new Map<number, ErrorCode>();
for (const [code, { status }] of Object.entries(ERROR_CODES) as [ErrorCode, { status: number }][]) {
  if (!CODE_BY_STATUS.has(status)) CODE_BY_STATUS.set(status, code);
}

/** errors.validation_failed */
export const i18nKeyOf = (code: ErrorCode) => `errors.${code.toLowerCase()}`;

/** https://docs.dailygooddeeds.app/errors/validation-failed */
export const typeUriOf = (code: ErrorCode) =>
  `https://docs.dailygooddeeds.app/errors/${code.toLowerCase().replaceAll('_', '-')}`;

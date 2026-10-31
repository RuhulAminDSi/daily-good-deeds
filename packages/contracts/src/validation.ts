import { z } from 'zod';
import type { FieldError } from './errors.js';

/**
 * Validation messages are i18n keys, never prose (F-I18N-007): the API sends `errors[].i18nKey` +
 * `params`, and clients render them in the UI locale. Keys live in the `validation` namespace of
 * `@dgd/i18n`. Schemas can name their own key: `.refine(ok, { error: 'validation.password_weak' })`.
 */
const PREFIX = 'validation.';

/** validation.too_big */
export const validationKeyOf = (code: string) => `${PREFIX}${code}`;

/** Every Zod issue code; the type check fails when a Zod upgrade adds or drops one. */
const ZOD_ISSUE_CODES = Object.keys({
  invalid_type: 1,
  too_big: 1,
  too_small: 1,
  invalid_format: 1,
  not_multiple_of: 1,
  unrecognized_keys: 1,
  invalid_union: 1,
  invalid_key: 1,
  invalid_element: 1,
  invalid_value: 1,
  custom: 1,
} satisfies Record<z.core.$ZodIssue['code'], 1>);

/** Every key this package produces (asserted to exist in EN and BN). */
export const VALIDATION_KEYS = ['required', 'max_depth', ...ZOD_ISSUE_CODES].map(validationKeyOf);

/**
 * Global Zod error map: the issue's message becomes its i18n key. Only here is the raw input
 * still on the issue, so a missing value (`required`) is told apart from a wrong type.
 */
export const zodErrorMap: z.core.$ZodErrorMap = (issue) =>
  issue.code === 'invalid_type' && issue.input === undefined
    ? validationKeyOf('required')
    : validationKeyOf(issue.code);

// Applied on import: the API and the web app both import this package, so every schema parsed in
// either one reports keys. Per-schema and per-parse messages still take precedence.
z.config({ customError: zodErrorMap });

/** RFC 6901: "/a~1b/0" for path ["a/b", 0]. */
const toPointer = (path: PropertyKey[]) =>
  path.map((part) => `/${String(part).replaceAll('~', '~0').replaceAll('/', '~1')}`).join('');

/** ICU arguments for the issue's message (see the `validation` namespace in @dgd/i18n). */
function paramsOf(issue: z.core.$ZodIssue): Record<string, unknown> | undefined {
  switch (issue.code) {
    case 'too_big':
      return { max: Number(issue.maximum), origin: issue.origin };
    case 'too_small':
      return { min: Number(issue.minimum), origin: issue.origin };
    case 'invalid_format':
      return { format: issue.format };
    case 'not_multiple_of':
      return { divisor: issue.divisor };
    case 'unrecognized_keys':
      return { keys: issue.keys.join(', ') };
    case 'custom':
      return issue.params;
    default:
      return undefined;
  }
}

/**
 * A Zod issue as a problem+json field error. `code` is the key without its namespace, so it is as
 * stable as the key: `{ pointer: "/title", code: "too_big", i18nKey: "validation.too_big" }`.
 */
export function fieldErrorFromIssue(issue: z.core.$ZodIssue): FieldError {
  const i18nKey = issue.message.startsWith(PREFIX) ? issue.message : validationKeyOf(issue.code);
  const params = paramsOf(issue);
  return {
    pointer: toPointer(issue.path),
    code: i18nKey.slice(PREFIX.length),
    i18nKey,
    ...(params && Object.keys(params).length ? { params } : {}),
  };
}

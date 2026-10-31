import { z } from 'zod';
import type { FieldError } from './errors.js';

/**
 * Validation messages are i18n keys, never prose (F-I18N-007): the API sends `errors[].i18nKey` +
 * `params`, and clients render them in the UI locale. Keys live in the `validation` namespace of
 * `@dgd/i18n`. Schemas can name their own key: `.refine(ok, { error: 'validation.password_weak' })`.
 */
const PREFIX = 'validation.';

/** Every Zod issue code; the type check fails when a Zod upgrade adds one without a message. */
const ZOD_ISSUE_CODES = [
  'invalid_type',
  'too_big',
  'too_small',
  'invalid_format',
  'not_multiple_of',
  'unrecognized_keys',
  'invalid_union',
  'invalid_key',
  'invalid_element',
  'invalid_value',
  'custom',
] as const satisfies readonly z.core.$ZodIssue['code'][];
type Missing = Exclude<z.core.$ZodIssue['code'], (typeof ZOD_ISSUE_CODES)[number]>;
const exhaustive: [Missing] extends [never] ? true : Missing = true;
void exhaustive;

/** Every key the error map below can produce (asserted to exist in EN and BN). */
export const VALIDATION_KEYS = ['required', 'max_depth', ...ZOD_ISSUE_CODES].map(
  (code) => `${PREFIX}${code}`,
);

/**
 * Global Zod error map: the issue's message becomes its i18n key. Only here is the raw input
 * still on the issue, so a missing value (`required`) is told apart from a wrong type.
 */
export const zodErrorMap: z.core.$ZodErrorMap = (issue) =>
  issue.code === 'invalid_type' && issue.input === undefined
    ? `${PREFIX}required`
    : `${PREFIX}${issue.code}`;

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
  const i18nKey = issue.message.startsWith(PREFIX) ? issue.message : `${PREFIX}${issue.code}`;
  const params = paramsOf(issue);
  return {
    pointer: toPointer(issue.path),
    code: i18nKey.slice(PREFIX.length),
    i18nKey,
    ...(params && Object.keys(params).length ? { params } : {}),
  };
}

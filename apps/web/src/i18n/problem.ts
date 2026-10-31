import { type FieldError, type Problem, validationKeyOf } from '@dgd/contracts';
import { useClientTranslations } from './client';

type Params = Record<string, string | number>;
/** A namespace's `t` with runtime keys: problem+json keys come from the API, not from code. */
type Translate = ((key: string, params?: Params) => string) & { has: (key: string) => boolean };

/**
 * Renders API problems (problem+json, docs/api/ERROR_HANDLING.md §5) in the current UI locale from
 * their i18n keys, so the text follows the page language rather than the request that produced it.
 * Unknown keys (a newer API) fall back to the server's `title` and the generic field message.
 */
export function useProblemMessages() {
  const namespaces = {
    errors: useClientTranslations('errors'),
    validation: useClientTranslations('validation'),
  } as unknown as Partial<Record<string, Translate>> & { validation: Translate };
  const message = (i18nKey: string, params?: FieldError['params']) => {
    const dot = i18nKey.indexOf('.');
    const t = namespaces[i18nKey.slice(0, dot)];
    const key = i18nKey.slice(dot + 1);
    return t?.has(key) ? t(key, params as Params | undefined) : undefined;
  };

  return {
    /** Summary line for the whole problem. */
    title: (problem: Problem) => message(problem.i18nKey) ?? problem.title,
    /** One message per field, keyed by JSON pointer (or query parameter); the first issue wins. */
    fieldErrors: (problem: Problem): Record<string, string> => {
      const byField: Record<string, string> = {};
      for (const error of problem.errors ?? []) {
        const field = error.pointer ?? error.parameter ?? '';
        byField[field] ??=
          message(error.i18nKey ?? validationKeyOf(error.code), error.params) ??
          namespaces.validation('custom');
      }
      return byField;
    },
  };
}

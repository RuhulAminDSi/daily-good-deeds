// The UI catalogs (ICU MessageFormat), namespaced by feature. Web loads them per request
// (apps/web/src/i18n/request.ts); the API and worker use `translator()` for emails, push and errors.
import { createTranslator } from 'use-intl/core';
import { LOCALES, type Locale } from './index.js';
import bn from './messages/bn.json' with { type: 'json' };
import en from './messages/en.json' with { type: 'json' };

/** English is the reference catalog: its shape types every key. */
export type Messages = typeof en;

type Tree = { [key: string]: string | Tree };

/**
 * `catalog` with every message it lacks taken from `reference` (fallback BN → EN, F-I18N-009), and
 * the dotted keys that were filled in.
 */
export function withFallback(
  catalog: object,
  reference: object,
): { messages: Tree; missing: string[] } {
  const missing: string[] = [];
  const merge = (own: Tree | undefined, ref: Tree, prefix: string): Tree =>
    Object.fromEntries(
      Object.entries(ref).map(([key, value]) => {
        const mine = own?.[key];
        if (typeof value === 'object') {
          return [
            key,
            merge(typeof mine === 'object' ? mine : undefined, value, `${prefix}${key}.`),
          ];
        }
        if (typeof mine === 'string' && mine.trim() !== '') return [key, mine];
        missing.push(`${prefix}${key}`);
        return [key, value];
      }),
    );
  return { messages: merge(catalog as Tree, reference as Tree, ''), missing };
}

const bnWithFallback = withFallback(bn, en);

export const MESSAGES: Record<Locale, Messages> = { en, bn: bnWithFallback.messages as Messages };

/** Keys each locale renders in English. Empty in CI (catalog tests), so normally only in dev. */
export const MISSING_KEYS: Record<Locale, readonly string[]> = {
  en: [],
  bn: bnWithFallback.missing,
};

export class MissingTranslationsError extends Error {
  override name = 'MissingTranslationsError';
  constructor(
    readonly locale: Locale,
    readonly keys: readonly string[],
  ) {
    super(
      `missing_translation: ${keys.length} ${locale} key(s) fall back to English: ${keys.join(', ')}`,
    );
  }
}

/** Dev mode: an incomplete catalog fails the page instead of quietly rendering English. */
export function assertComplete(locale: Locale, missing = MISSING_KEYS): void {
  if (missing[locale].length) throw new MissingTranslationsError(locale, missing[locale]);
}

const reported = new Set<Locale>();

/**
 * Production: reports each incomplete locale once per process. Catalogs are static, so the
 * missing set never changes after startup and one event per locale is the whole story.
 */
export function reportMissingTranslations(
  report: (error: MissingTranslationsError) => void,
  missing = MISSING_KEYS,
): void {
  for (const locale of LOCALES) {
    if (!missing[locale].length || reported.has(locale)) continue;
    reported.add(locale);
    report(new MissingTranslationsError(locale, missing[locale]));
  }
}

/** Server-side translation with typed keys: `translator('bn')('nav.today')`. */
export const translator = (locale: Locale) =>
  createTranslator({ locale, messages: MESSAGES[locale] });

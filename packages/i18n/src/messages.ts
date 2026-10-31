// The UI catalogs (ICU MessageFormat), namespaced by feature. Web loads them per request
// (apps/web/src/i18n/request.ts); the API and worker use `translator()` for emails, push and errors.
import { createTranslator } from 'use-intl/core';
import type { Locale } from './index.js';
import bn from './messages/bn.json' with { type: 'json' };
import en from './messages/en.json' with { type: 'json' };

/** English is the reference catalog: its shape types every key. */
export type Messages = typeof en;

export const MESSAGES: Record<Locale, Messages> = { en, bn };

/** Server-side translation with typed keys: `translator('bn')('nav.today')`. */
export const translator = (locale: Locale) =>
  createTranslator({ locale, messages: MESSAGES[locale] });

// Minimal message lookup for the skeleton (server and client). Replaced by next-intl +
// packages/i18n in T-P2-I18N-001.
import bn from './messages/bn.json';
import en from './messages/en.json';
import type { Locale } from './locales';

export type Messages = typeof en;
const MESSAGES: Record<Locale, Messages> = { en, bn };

export const getMessages = (locale: Locale): Messages => MESSAGES[locale];

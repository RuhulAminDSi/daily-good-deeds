// Locales only: safe to import anywhere, including browser code. The catalogs themselves are in
// `@dgd/i18n/messages` (server side), so client bundles never carry both languages.

export const LOCALES = ['en', 'bn'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

export * from './format.js';

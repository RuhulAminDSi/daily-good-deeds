import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from './locales';

/**
 * Locale for a request without one in the path (src/proxy.ts) or outside the locale routes
 * (src/app/manifest.ts): saved choice cookie → Accept-Language (q-weighted) → English.
 */
export function preferredLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie;
  const accepted = new Negotiator({
    headers: { 'accept-language': acceptLanguage ?? '' },
  }).languages();
  return match(accepted, LOCALES, DEFAULT_LOCALE) as Locale;
}

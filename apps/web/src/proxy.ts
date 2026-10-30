import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { type NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES, type Locale } from './i18n/locales';

/** Locale for a request without one in the path: cookie → Accept-Language (q-weighted) → English. */
function preferredLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  const accepted = new Negotiator({
    headers: { 'accept-language': req.headers.get('accept-language') ?? '' },
  }).languages();
  return match(accepted, LOCALES, DEFAULT_LOCALE) as Locale;
}

/** Every page lives under /{locale}; requests without one are redirected there. */
export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Runs only for paths without a locale: skips /en, /bn (and below), Next internals, API routes
  // and files with an extension. Keep the locale list in sync with LOCALES.
  matcher: ['/((?!_next|api|(?:en|bn)(?:/|$)|.*\\..*).*)'],
};

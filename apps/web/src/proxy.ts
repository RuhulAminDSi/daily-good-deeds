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

/**
 * Strict CSP (NFR-SECURITY-015): scripts only with this request's nonce (Next applies it to its
 * own scripts), no `unsafe-inline` scripts. Styles allow inline (Next/Tailwind inject them).
 * Development adds what React dev tooling and HMR need.
 */
function contentSecurityPolicy(nonce: string): string {
  const dev = process.env.NODE_ENV !== 'production';
  const directives: Record<string, (string | false)[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", dev && "'unsafe-eval'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:'],
    'font-src': ["'self'"],
    'connect-src': ["'self'", dev && 'ws:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };
  const policy = Object.entries(directives).map(
    ([name, sources]) => `${name} ${sources.filter(Boolean).join(' ')}`,
  );
  return [...policy, ...(dev ? [] : ['upgrade-insecure-requests'])].join('; ');
}

export function proxy(req: NextRequest) {
  const [, first] = req.nextUrl.pathname.split('/');
  if (!isLocale(first)) {
    // Every page lives under /{locale}.
    const url = req.nextUrl.clone();
    url.pathname = `/${preferredLocale(req)}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce);
  // Next reads the nonce from the request's CSP header and adds it to the scripts it renders.
  const headers = new Headers(req.headers);
  headers.set('content-security-policy', csp);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set('content-security-policy', csp);
  return res;
}

export const config = {
  // Pages only: skip Next internals, API routes and files with an extension (icons, manifest…).
  // Prefetches don't render HTML, so they need no nonce.
  matcher: [
    {
      source: '/((?!_next|api|.*\\..*).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

import { type NextRequest, NextResponse } from 'next/server';
import { isLocale, LOCALE_COOKIE } from './i18n/locales';
import { preferredLocale } from './i18n/preferred-locale';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
/** The browser sends error reports straight to Sentry's ingest host. */
const SENTRY_ORIGIN = SENTRY_DSN ? new URL(SENTRY_DSN).origin : false;
/** Violation reports: `report-to` (Reporting API) with `report-uri` for browsers without it. */
const CSP_REPORT_PATH = '/api/csp-report';
/** Request header next-intl reads the locale from (what its own middleware would set). Not a
 *  documented API: e2e/i18n.spec.ts fails if a next-intl upgrade changes it. */
const LOCALE_HEADER = 'X-NEXT-INTL-LOCALE';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    'connect-src': ["'self'", dev && 'ws:', SENTRY_ORIGIN],
    // The service worker: with 'strict-dynamic', script-src would ignore 'self' for it.
    'worker-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'report-uri': [CSP_REPORT_PATH],
    'report-to': ['csp'],
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
    const locale = preferredLocale(
      req.cookies.get(LOCALE_COOKIE)?.value,
      req.headers.get('accept-language'),
    );
    url.pathname = `/${locale}${req.nextUrl.pathname === '/' ? '' : req.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  // next-intl's request locale (src/i18n/request.ts), for every page request.
  const headers = new Headers(req.headers);
  headers.set(LOCALE_HEADER, first);
  // Prefetches render no HTML: they need the locale but no nonce, CSP or request id.
  if (req.headers.has('next-router-prefetch') || req.headers.get('purpose') === 'prefetch') {
    return NextResponse.next({ request: { headers } });
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = contentSecurityPolicy(nonce);
  // Correlates this render's error reports, and is forwarded to the API (src/lib/api.ts). A
  // well-formed upstream id (load balancer, edge) is kept, as the API does.
  const incoming = req.headers.get('x-request-id');
  const requestId = incoming && UUID.test(incoming) ? incoming : crypto.randomUUID();
  // Next reads the nonce from the request's CSP header and adds it to the scripts it renders.
  headers.set('content-security-policy', csp);
  headers.set('x-request-id', requestId);
  const res = NextResponse.next({ request: { headers } });
  res.headers.set('content-security-policy', csp);
  res.headers.set('reporting-endpoints', `csp="${CSP_REPORT_PATH}"`);
  res.headers.set('x-request-id', requestId);
  return res;
}

export const config = {
  // Pages only (prefetches included: they need the locale): skip Next internals, API routes and
  // files with an extension (icons, manifest…).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};

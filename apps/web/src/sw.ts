/// <reference lib="esnext" />
/// <reference lib="webworker" />
// The service worker (F-PWA-003, PWA_ARCHITECTURE §3, ADR-011), bundled by Serwist and served at
// /serwist/sw.js (src/app/serwist/[path]/route.ts). Personalized data is never cached here: API
// reads stay out of Cache Storage (they arrive with TanStack Query persistence, P9).
import { DEFAULT_LOCALE, LOCALES } from '@dgd/i18n';
import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  type PrecacheEntry,
  type RouteMatchCallback,
  Serwist,
  type SerwistGlobalConfig,
  StaleWhileRevalidate,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

/** `/{locale}` followed by `rest`: `^/(en|bn)` + rest. */
const localePath = (rest: string) => new RegExp(`^/(${LOCALES.join('|')})${rest}`);
/** Any page under a locale; group 1 is the locale. */
const ANY_PAGE = localePath('(/|$)');

/**
 * An HTML page request: a navigation, or the provider's CACHE_URLS fetch after a client-side
 * navigation. React Server Component payloads (`RSC` header, `_rsc` param) are not pages.
 */
const page =
  (path: RegExp): RouteMatchCallback =>
  ({ request, url, sameOrigin }) =>
    sameOrigin &&
    path.test(url.pathname) &&
    !request.headers.has('RSC') &&
    !url.searchParams.has('_rsc');

const expire = (maxEntries: number, days: number) => [
  new ExpirationPlugin({ maxEntries, maxAgeSeconds: days * 24 * 60 * 60 }),
];

const serwist = new Serwist({
  // Build assets (JS, CSS, icons) and the offline page of each locale.
  precacheEntries: self.__SW_MANIFEST,
  // Updates wait for the user's "Refresh" (F-PWA-009, src/components/service-worker.tsx); Serwist
  // answers its SKIP_WAITING message. The first install takes control at once.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Admin is never cached (auth pages join this rule when they land).
    { matcher: page(localePath('/admin(/|$)')), handler: new NetworkOnly() },
    // The public landing page.
    {
      matcher: page(localePath('/?$')),
      handler: new StaleWhileRevalidate({ cacheName: 'public-pages', plugins: expire(30, 7) }),
    },
    // App pages: fresh when the network answers within 3 s, the saved copy otherwise.
    {
      matcher: page(ANY_PAGE),
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        plugins: expire(50, 7),
      }),
    },
    // Fonts on first use rather than precached: English visitors never download Bengali faces.
    {
      matcher: ({ url }) => url.pathname.endsWith('.woff2'),
      handler: new CacheFirst({ cacheName: 'fonts', plugins: expire(20, 365) }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/icons/'),
      handler: new CacheFirst({ cacheName: 'images', plugins: expire(20, 30) }),
    },
  ],
  // A page that was never saved: the offline page in the URL's language (the default locale otherwise).
  fallbacks: {
    entries: [
      ...LOCALES.map((locale) => ({
        url: `/${locale}/offline`,
        matcher: ({ request }: { request: Request }) =>
          request.destination === 'document' &&
          ANY_PAGE.exec(new URL(request.url).pathname)?.[1] === locale,
      })),
      {
        url: `/${DEFAULT_LOCALE}/offline`,
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

serwist.addEventListeners();

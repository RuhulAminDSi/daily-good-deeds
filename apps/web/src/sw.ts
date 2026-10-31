/// <reference lib="esnext" />
/// <reference lib="webworker" />
// The service worker (F-PWA-003, PWA_ARCHITECTURE §3, ADR-011), bundled by Serwist and served at
// /serwist/sw.js (src/app/serwist/[path]/route.ts). Personalized data is never cached here: API
// reads stay out of Cache Storage (they arrive with TanStack Query persistence, P9).
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

const DAY = 24 * 60 * 60;

/**
 * An HTML page request: a navigation, or the provider's CACHE_URLS fetch after a client-side
 * navigation. React Server Component payloads (`RSC` header, `_rsc` param) are not pages.
 */
const page =
  (path: RegExp): RouteMatchCallback =>
  ({ request, url }) =>
    url.origin === self.location.origin &&
    path.test(url.pathname) &&
    !request.headers.has('RSC') &&
    !url.searchParams.has('_rsc');

const serwist = new Serwist({
  // Build assets (JS, CSS, icons) and the two offline pages.
  precacheEntries: self.__SW_MANIFEST,
  // Updates wait for the user's "Refresh" (F-PWA-009, src/components/update-prompt.tsx); Serwist
  // answers its SKIP_WAITING message. The first install takes control at once.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Admin is never cached (auth pages join this rule when they land).
    { matcher: page(/^\/(en|bn)\/admin(\/|$)/), handler: new NetworkOnly() },
    // The public landing page.
    {
      matcher: page(/^\/(en|bn)\/?$/),
      handler: new StaleWhileRevalidate({
        cacheName: 'public-pages',
        plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 7 * DAY })],
      }),
    },
    // App pages: fresh when the network answers within 3 s, the saved copy otherwise.
    {
      matcher: page(/^\/(en|bn)(\/|$)/),
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * DAY })],
      }),
    },
    // Fonts on first use rather than precached: English visitors never download Bengali faces.
    {
      matcher: ({ url }) => url.pathname.endsWith('.woff2'),
      handler: new CacheFirst({
        cacheName: 'fonts',
        plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * DAY })],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith('/icons/'),
      handler: new CacheFirst({
        cacheName: 'images',
        plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 30 * DAY })],
      }),
    },
  ],
  // A page that was never saved: the offline page in the URL's language.
  fallbacks: {
    entries: [
      {
        url: '/bn/offline',
        matcher: ({ request }) =>
          request.destination === 'document' && new URL(request.url).pathname.startsWith('/bn'),
      },
      { url: '/en/offline', matcher: ({ request }) => request.destination === 'document' },
    ],
  },
});

serwist.addEventListeners();

// Locale-aware navigation (next-intl, without its middleware: src/proxy.ts negotiates the locale).
// `Link` adds the `/{locale}` prefix; `usePathname` returns the path without it.
import { DEFAULT_LOCALE, LOCALES } from '@dgd/i18n';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { LOCALE_COOKIE } from './locales';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  // Switching locale (router / Link with `locale`) writes the guest's choice here; src/proxy.ts
  // reads it for locale-less URLs. next-intl's default is a session cookie: keep it for a year.
  localeCookie: { name: LOCALE_COOKIE, maxAge: 60 * 60 * 24 * 365 },
});

export const { Link, usePathname, useRouter, redirect } = createNavigation(routing);

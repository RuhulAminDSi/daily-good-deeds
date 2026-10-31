// Locale-aware navigation (next-intl, without its middleware: src/proxy.ts negotiates the locale).
// `Link` adds the `/{locale}` prefix; `usePathname` returns the path without it.
import { DEFAULT_LOCALE, LOCALES } from '@dgd/i18n';
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({ locales: LOCALES, defaultLocale: DEFAULT_LOCALE });

export const { Link, usePathname, useRouter, redirect } = createNavigation(routing);

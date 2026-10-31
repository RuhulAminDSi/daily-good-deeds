import { UiProvider } from '@dgd/ui';
import { COLORS } from '@dgd/tokens';
import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { CLIENT_NAMESPACES } from '@/i18n/client-namespaces';
import { iconRef } from '@/lib/app-icons';
import { routeLocale } from '@/i18n/route-locale';
import { themeAttribute } from '@/theme';
import { readTheme } from '@/theme.server';
import '../globals.css';

/**
 * Rendered per request: the CSP nonce (src/proxy.ts) is new for every response, and static HTML
 * cannot carry it. Expensive data is cached at the fetch level instead.
 */
export const dynamic = 'force-dynamic';

/**
 * Fonts (TYPOGRAPHY §1, §7), self-hosted by next/font with size-adjusted fallbacks (no layout
 * shift). One stack for both languages (@dgd/tokens FONT_SANS): Inter has no Bengali glyphs, so Bengali text
 * falls through to Hind Siliguri, and per-subset `unicode-range` means an English page never
 * downloads it. Hind Siliguri is not preloaded: next/font cannot preload per locale, and English
 * pages must not pay for it.
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  // Two weights keep Bengali within the font budget (DL-042): CSS font matching renders 500 with
  // 400 and 700 with 600 (a real weight, never synthesized bold).
  weight: ['400', '600'],
  variable: '--font-hind-siliguri',
  display: 'swap',
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app');
  return {
    title: { default: t('name'), template: `%s · ${t('name')}` },
    description: t('tagline'),
    icons: {
      icon: { ...iconRef('tab-32.png'), url: iconRef('tab-32.png').src },
      apple: { ...iconRef('apple-180.png'), url: iconRef('apple-180.png').src },
    },
  };
}

/** Browser and status-bar colour: the top bar's surface, per colour scheme. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: COLORS.surface.light },
    { media: '(prefers-color-scheme: dark)', color: COLORS.surface.dark },
  ],
};

/** Root layout: one per locale, so `<html lang>` is always correct (screen readers, fonts). */
export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const [locale, theme, messages] = await Promise.all([
    routeLocale(params),
    readTheme(),
    getMessages(),
  ]);
  // Only the namespaces client components use are sent to the browser.
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));
  return (
    // The saved theme is in the server-rendered HTML, so the first paint is already right.
    <html
      lang={locale}
      data-theme={themeAttribute(theme)}
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <body className="min-h-dvh bg-bg text-body text-text antialiased">
        <NextIntlClientProvider messages={clientMessages}>
          <UiProvider locale={locale} strings={messages.ui}>
            {children}
          </UiProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

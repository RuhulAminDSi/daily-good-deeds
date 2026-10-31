import type { Messages } from '@dgd/i18n/messages';
import { UiProvider } from '@dgd/ui';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routeLocale } from '@/i18n/route-locale';
import { themeAttribute } from '@/theme';
import { readTheme } from '@/theme.server';
import '../globals.css';

/**
 * Rendered per request: the CSP nonce (src/proxy.ts) is new for every response, and static HTML
 * cannot carry it. Expensive data is cached at the fetch level instead.
 */
export const dynamic = 'force-dynamic';

/** Namespaces client components use; only these are sent to the browser. */
const CLIENT_NAMESPACES = ['common', 'nav', 'theme'] as const satisfies (keyof Messages)[];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app');
  return {
    title: { default: t('name'), template: `%s · ${t('name')}` },
    description: t('tagline'),
  };
}

/** Root layout: one per locale, so `<html lang>` is always correct (screen readers, fonts). */
export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const [locale, theme, messages] = await Promise.all([
    routeLocale(params),
    readTheme(),
    getMessages(),
  ]);
  const clientMessages = Object.fromEntries(CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]]));
  return (
    // The saved theme is in the server-rendered HTML, so the first paint is already right.
    <html lang={locale} data-theme={themeAttribute(theme)}>
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

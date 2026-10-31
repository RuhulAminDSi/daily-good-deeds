import { UiProvider } from '@dgd/ui';
import type { Metadata } from 'next';
import { BoundaryMessagesProvider } from '@/i18n/boundary-messages';
import { routeMessages } from '@/i18n/route-locale';
import { themeAttribute } from '@/theme';
import { readTheme } from '@/theme.server';
import '../globals.css';

/**
 * Rendered per request: the CSP nonce (src/proxy.ts) is new for every response, and static HTML
 * cannot carry it. Expensive data is cached at the fetch level instead.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { m } = await routeMessages(params);
  return {
    title: { default: m.app.name, template: `%s · ${m.app.name}` },
    description: m.app.tagline,
  };
}

/** Root layout: one per locale, so `<html lang>` is always correct (screen readers, fonts). */
export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const [{ locale, m }, theme] = await Promise.all([routeMessages(params), readTheme()]);
  return (
    // The saved theme is in the server-rendered HTML, so the first paint is already right.
    <html lang={locale} data-theme={themeAttribute(theme)}>
      <body className="min-h-dvh bg-bg text-body text-text antialiased">
        <UiProvider locale={locale} strings={m.ui}>
          <BoundaryMessagesProvider value={{ locale, common: m.common }}>
            {children}
          </BoundaryMessagesProvider>
        </UiProvider>
      </body>
    </html>
  );
}

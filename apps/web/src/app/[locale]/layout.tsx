import type { Metadata } from 'next';
import { BoundaryMessagesProvider } from '@/i18n/boundary-messages';
import { LOCALES } from '@/i18n/locales';
import { routeMessages } from '@/i18n/route-locale';
import '../globals.css';

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { m } = await routeMessages(params);
  return {
    title: { default: m.app.name, template: `%s · ${m.app.name}` },
    description: m.app.tagline,
  };
}

/** Root layout: one per locale, so `<html lang>` is always correct (screen readers, fonts). */
export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale, m } = await routeMessages(params);
  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-stone-50 text-stone-900 antialiased">
        <BoundaryMessagesProvider value={{ locale, common: m.common }}>
          {children}
        </BoundaryMessagesProvider>
      </body>
    </html>
  );
}

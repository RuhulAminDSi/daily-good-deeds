import { notFound } from 'next/navigation';
import { isLocale, type Locale } from './locales';

/** Reads and validates the `[locale]` route param; unknown locales are a 404. */
export async function routeLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

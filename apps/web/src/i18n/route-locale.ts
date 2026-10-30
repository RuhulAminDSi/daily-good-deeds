import { notFound } from 'next/navigation';
import { getMessages, type Messages } from './dictionary';
import { isLocale, type Locale } from './locales';

/** Reads and validates the `[locale]` route param; unknown locales are a 404. */
export async function routeLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

/** The validated locale and its messages, for server layouts and pages. */
export async function routeMessages(
  params: Promise<{ locale: string }>,
): Promise<{ locale: Locale; m: Messages }> {
  const locale = await routeLocale(params);
  return { locale, m: getMessages(locale) };
}

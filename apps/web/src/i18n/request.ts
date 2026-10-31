// next-intl request config: the catalogs for this request's locale. The locale comes from the
// X-NEXT-INTL-LOCALE header that src/proxy.ts sets from the URL's `/{locale}` segment.
import { DEFAULT_LOCALE, isLocale } from '@dgd/i18n';
import { MESSAGES } from '@dgd/i18n/messages';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return { locale, messages: MESSAGES[locale] };
});

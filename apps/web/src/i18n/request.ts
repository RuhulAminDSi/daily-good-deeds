// next-intl request config: the catalogs for this request's locale. The locale comes from the
// X-NEXT-INTL-LOCALE header that src/proxy.ts sets from the URL's `/{locale}` segment. Missing BN
// messages render in English (F-I18N-009); dev fails the page instead, and production reports them
// once at startup (src/instrumentation.ts).
import { DEFAULT_LOCALE, isLocale } from '@dgd/i18n';
import { assertComplete, MESSAGES } from '@dgd/i18n/messages';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  if (process.env.NODE_ENV === 'development') assertComplete(locale);
  return { locale, messages: MESSAGES[locale] };
});

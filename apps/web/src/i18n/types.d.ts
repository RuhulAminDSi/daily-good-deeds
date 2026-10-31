import type { Locale } from '@dgd/i18n';
import type { Messages } from '@dgd/i18n/messages';

// Typed keys and locales for next-intl: `t('nav.today')` is checked against the English catalog.
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}

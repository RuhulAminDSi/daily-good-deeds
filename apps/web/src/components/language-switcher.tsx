'use client';

import { SegmentedControl } from '@dgd/ui';
import { useLocale } from 'next-intl';
import { useClientTranslations } from '@/i18n/client';
import { LOCALES, type Locale } from '@/i18n/locales';
import { usePathname, useRouter } from '@/i18n/navigation';

/**
 * EN / বাংলা (F-I18N-002/003). Keeps the current page (`/en/calendar` → `/bn/calendar`) and
 * remembers the choice for a year in the guest cookie that src/proxy.ts uses for locale-less URLs. Saving it
 * to the account (user_preferences.locale) comes with auth. Language names are endonyms, each
 * tagged with its own `lang` so screen readers pronounce it right. (A locale change remounts the
 * [locale] layout, so a More sheet holding the switch closes by itself.)
 */
export function LanguageSwitcher() {
  const t = useClientTranslations('language');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const choose = (next: Locale) => {
    // next-intl's router also stores the choice in the guest cookie (routing.localeCookie).
    router.replace(pathname, { locale: next });
  };

  return (
    <SegmentedControl
      label={t('label')}
      value={locale}
      onValueChange={choose}
      options={LOCALES.map((l) => ({ value: l, label: t(l), lang: l }))}
    />
  );
}

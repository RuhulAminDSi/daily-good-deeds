'use client';

import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { NAV_GROUPS } from '@/components/app-shell/nav-config';
import { useClientTranslations } from '@/i18n/client';

const ITEMS = NAV_GROUPS.flatMap((group) => group.items);

/**
 * Links to the sections saved for offline use (FR-PWA-003-02). Plain links: a full navigation is
 * what the service worker answers from its cache.
 */
export function SavedPages() {
  const locale = useLocale();
  const t = useClientTranslations('nav');
  const tPwa = useClientTranslations('pwa');
  const [saved, setSaved] = useState<typeof ITEMS | null>(null);

  useEffect(() => {
    const isSaved = async (item: (typeof ITEMS)[number]) =>
      'caches' in window && (await caches.match(`/${locale}${item.href}`)) !== undefined;
    void Promise.all(ITEMS.map(isSaved)).then((found) =>
      setSaved(ITEMS.filter((_, i) => found[i])),
    );
  }, [locale]);

  if (saved === null) return null;
  if (saved.length === 0) return <p className="text-body text-text-muted">{tPwa('offlineNone')}</p>;
  return (
    <>
      <p className="text-body text-text-muted">{tPwa('offlineBody')}</p>
      <ul className="flex flex-col gap-2">
        {saved.map((item) => (
          <li key={item.href}>
            <a href={`/${locale}${item.href}`} className="text-primary underline">
              {t(item.label)}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

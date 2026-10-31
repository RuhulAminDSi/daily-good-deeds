'use client';

import { WifiOff } from 'lucide-react';
import { useClientTranslations } from '@/i18n/client';
import { useOnline } from '@/lib/online';

/** Shown in the app shell while offline (F-PWA-003, AC-PWA-003-01): the page is a saved copy. */
export function OfflineBanner() {
  const t = useClientTranslations('pwa');
  if (useOnline()) return null;
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-md bg-surface-sunken px-3 py-2 text-body-sm text-text"
    >
      <WifiOff aria-hidden className="size-4 shrink-0" />
      {t('offlineBanner')}
    </p>
  );
}

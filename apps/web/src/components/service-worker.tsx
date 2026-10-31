'use client';

import { useSerwist } from '@serwist/turbopack/react';
import { useToast } from '@dgd/ui';
import { useEffect } from 'react';
import { useClientTranslations } from '@/i18n/client';

/**
 * Page side of the service worker (src/sw.ts):
 * - The first install takes control of a page that loaded before it, so that page is saved now:
 *   "visited once, reloaded offline" works from the first visit (AC-PWA-003-01).
 * - "A new version is available — Refresh" (F-PWA-009, PWA_ARCHITECTURE §8): a new worker waits
 *   until the user accepts, then takes over and the page reloads once. (Flushing the offline outbox
 *   first joins with the outbox, P9.)
 */
export function ServiceWorker() {
  const { serwist } = useSerwist();
  const toast = useToast();
  const t = useClientTranslations('pwa');

  useEffect(() => {
    if (!serwist) return;
    const onControlling = () =>
      void serwist.messageSW({
        type: 'CACHE_URLS',
        payload: { urlsToCache: [location.pathname + location.search] },
      });
    const onWaiting = () =>
      toast({
        title: t('updateTitle'),
        duration: Infinity,
        action: {
          label: t('updateAction'),
          altText: t('updateAltText'),
          onClick: () => {
            serwist.addEventListener('controlling', () => location.reload());
            serwist.messageSkipWaiting();
          },
        },
      });
    serwist.addEventListener('controlling', onControlling);
    serwist.addEventListener('waiting', onWaiting);
    return () => {
      serwist.removeEventListener('controlling', onControlling);
      serwist.removeEventListener('waiting', onWaiting);
    };
  }, [serwist, toast, t]);

  return null;
}

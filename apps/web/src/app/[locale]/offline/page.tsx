import { getTranslations } from 'next-intl/server';
import { SavedPages } from './saved-pages';

/**
 * Offline fallback (F-PWA-003, FR-PWA-003-02): precached per locale by the service worker and
 * served for a page that was never saved. Needs no API, so it renders anywhere.
 */
export async function generateMetadata() {
  const t = await getTranslations('pwa');
  return { title: t('offlineTitle') };
}

export default async function OfflinePage() {
  const t = await getTranslations('pwa');
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <h1 className="text-h2">{t('offlineTitle')}</h1>
      <SavedPages />
    </main>
  );
}

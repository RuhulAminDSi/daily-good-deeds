import { Button } from '@dgd/ui';
import { getTranslations } from 'next-intl/server';
import { InAppBrowserBanner } from '@/components/in-app-browser-banner';
import { Link } from '@/i18n/navigation';
import { api, unwrap } from '@/lib/api';

/**
 * The status probe is cached for a minute (fetch cache) and hits `/health/live`, which does not
 * touch the database, so public traffic never wakes Neon (ADR-005).
 */
const STATUS_TTL_SECONDS = 60;

async function apiIsUp(): Promise<boolean> {
  try {
    unwrap(
      await api().GET('/api/v1/health/live', {
        next: { revalidate: STATUS_TTL_SECONDS },
        signal: AbortSignal.timeout(3000),
      }),
    );
    return true;
  } catch {
    return false;
  }
}

export default async function Landing() {
  const [t, up] = await Promise.all([getTranslations(), apiIsUp()]);
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-16">
      <InAppBrowserBanner />
      <h1 className="text-display text-primary">{t('app.name')}</h1>
      <p className="text-h3 font-normal text-text-muted">{t('app.tagline')}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/register">{t('landing.createAccount')}</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/today">{t('landing.explore')}</Link>
        </Button>
      </div>
      <p className="text-body-sm">
        <span className="font-medium">{t('status.label')}: </span>
        {up ? t('status.ok') : t('status.unavailable')}
      </p>
    </main>
  );
}

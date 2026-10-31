import { routeMessages } from '@/i18n/route-locale';
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

export default async function Landing({ params }: PageProps<'/[locale]'>) {
  const { m } = await routeMessages(params);
  const up = await apiIsUp();
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-16">
      <h1 className="text-display text-primary">{m.app.name}</h1>
      <p className="text-h3 font-normal text-text-muted">{m.app.tagline}</p>
      <p className="text-body-sm">
        <span className="font-medium">{m.status.label}: </span>
        {up ? m.status.ok : m.status.unavailable}
      </p>
    </main>
  );
}

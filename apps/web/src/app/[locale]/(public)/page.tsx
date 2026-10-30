import { routeMessages } from '@/i18n/route-locale';
import { api, unwrap } from '@/lib/api';

/**
 * Static and cached: regenerated at most once a minute. The status probes `/health/live`, which
 * does not touch the database, so public traffic never wakes Neon (ADR-005).
 */
export const revalidate = 60;

async function apiIsUp(): Promise<boolean> {
  try {
    unwrap(
      await api().GET('/api/v1/health/live', {
        next: { revalidate },
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
      <h1 className="text-3xl font-bold text-emerald-800">{m.app.name}</h1>
      <p className="text-lg text-stone-700">{m.app.tagline}</p>
      <p className="text-sm">
        <span className="font-medium">{m.status.label}: </span>
        {up ? m.status.ok : m.status.unavailable}
      </p>
    </main>
  );
}

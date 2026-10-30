import { notFound } from 'next/navigation';

/**
 * Test-only scenarios for the Playwright smoke suite (loading and error boundaries). The `.e2e.tsx`
 * extension keeps this file out of normal builds; see `pageExtensions` in next.config.ts.
 */
// Explicit props: typegen skips this route in normal builds, so PageProps has no entry for it.
export default async function E2EScenario({ params }: { params: Promise<{ scenario: string }> }) {
  const { scenario } = await params;
  if (scenario === 'error') throw new Error('e2e: intentional render error');
  if (scenario === 'slow') {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return <p>done</p>;
  }
  notFound();
}

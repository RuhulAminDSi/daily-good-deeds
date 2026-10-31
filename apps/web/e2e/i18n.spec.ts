// T-P2-I18N-001: every shipped page renders fully in English and Bengali. Each page's accessibility
// tree is snapshotted per locale (text, headings, landmarks, labels), so a missing or untranslated
// string, server- or client-rendered, changes a snapshot. Update with `--update-snapshots` and
// review the diff.
import { expect, test } from '@playwright/test';

const PAGES = [
  ['landing', ''],
  ['register', '/register'],
  ['today', '/today'],
  ['calendar', '/calendar'],
  ['islamic', '/islamic'],
  ['growth', '/growth'],
  ['admin', '/admin'],
  ['not-found', '/no-such-page'],
] as const;

for (const locale of ['en', 'bn'] as const) {
  for (const [name, path] of PAGES) {
    test(`${name} renders in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}${path}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('body')).toMatchAriaSnapshot({
        name: `${name}-${locale}.aria.yml`,
      });
    });
  }
}

test('client-side navigation keeps the language (prefetched pages are localized too)', async ({
  page,
}) => {
  await page.goto('/bn/today');
  await page
    .getByRole('navigation', { name: 'প্রধান নেভিগেশন' })
    .getByRole('link', { name: 'ক্যালেন্ডার' })
    .click();
  await expect(page).toHaveURL(/\/bn\/calendar$/);
  await expect(page.getByRole('heading', { level: 1, name: 'ক্যালেন্ডার' })).toBeVisible();
  await expect(page.getByText('এই অংশটি পরবর্তী হালনাগাদে আসছে।')).toBeVisible();
});

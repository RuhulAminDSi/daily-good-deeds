// T-P2-PWA-002 (F-PWA-003, AC-PWA-003-01): with the service worker installed, a page visited once
// reloads offline with a notice, and a never-visited page gets the localized offline page instead of
// the browser's error page.
import { expect, type Page, test } from '@playwright/test';
import { gotoHydrated } from './helpers';

/** Waits until the service worker controls the page and has saved it. */
async function installed(page: Page, path: string) {
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await expect.poll(() => page.evaluate((url) => caches.match(url).then(Boolean), path)).toBe(true);
}

// Every test starts from one visit to Today, saved by the freshly installed worker.
test.beforeEach(async ({ page }) => {
  await gotoHydrated(page, '/en/today');
  await installed(page, '/en/today');
});

test('a page visited once reloads offline, with a notice', async ({ page, context }) => {
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  await expect(page.getByRole('status').filter({ hasText: "You're offline" })).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByRole('status').filter({ hasText: "You're offline" })).toHaveCount(0);
});

test('a never-visited page shows the offline page in its language, with saved pages', async ({
  page,
  context,
}) => {
  await context.setOffline(true);

  await page.goto('/en/calendar');
  await expect(page.getByRole('heading', { level: 1, name: "You're offline" })).toBeVisible();
  const saved = page.getByRole('link', { name: 'Today' });
  await expect(saved).toHaveAttribute('href', '/en/today');
  await expect(page.getByRole('link', { name: 'Calendar' })).toHaveCount(0);

  await page.goto('/bn/growth');
  await expect(page.getByRole('heading', { level: 1, name: 'আপনি অফলাইনে আছেন' })).toBeVisible();
  // Nothing in Bengali was visited.
  await expect(page.getByText('এখনও কোনো পৃষ্ঠা সংরক্ষিত হয়নি', { exact: false })).toBeVisible();

  await page.goto('/en/today');
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
});

test('admin pages are never saved', async ({ page }) => {
  await gotoHydrated(page, '/en/admin');
  // A page visited after admin is saved, so a cache write for admin would have landed by then.
  await gotoHydrated(page, '/en/calendar');
  await installed(page, '/en/calendar');
  expect(await page.evaluate(() => caches.match('/en/admin').then(Boolean))).toBe(false);
});

test('a new version waits for "Refresh", then takes over', async ({ page }) => {
  const first = await page.evaluate(() => navigator.serviceWorker.controller!.scriptURL);

  // The next deploy. Playwright cannot intercept the browser's own update check, so the new
  // version is the same worker under a new script URL, which the browser installs as an update.
  await page.evaluate(() =>
    navigator.serviceWorker.register('/serwist/sw.js?next', { scope: '/', type: 'module' }),
  );

  // The toast's button (Radix also copies the title into a live region, so match the button).
  const refresh = page.getByRole('button', { name: 'Refresh' });
  await expect(refresh).toBeVisible();
  // Nothing changes until the user accepts.
  expect(await page.evaluate(() => navigator.serviceWorker.controller!.scriptURL)).toBe(first);
  await Promise.all([page.waitForEvent('load'), refresh.click()]);
  await expect(refresh).toHaveCount(0);
  expect(await page.evaluate(() => navigator.serviceWorker.controller!.scriptURL)).toMatch(
    /\?next$/,
  );
});

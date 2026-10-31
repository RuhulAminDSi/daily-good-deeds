// T-P2-PWA-004 (F-PWA-008, AC: "with service workers disabled, the app still works online"): with
// the service worker blocked and the optional APIs removed, every page works and nothing throws.
import { expect, type Page, test } from '@playwright/test';
import { gotoHydrated, hydrated } from './helpers';

const INSTAGRAM_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 307.0.0.34.111 (iPhone14,5; iOS 17_1; en_US; en; scale=3.00; 1170x2532; 532277361)';

test.use({ serviceWorkers: 'block' });

/** An old browser or locked-down webview: none of the optional APIs exist. */
async function withoutOptionalApis(page: Page) {
  await page.addInitScript(() => {
    for (const name of ['PushManager', 'SyncManager', 'Notification', 'MediaRecorder']) {
      delete (window as unknown as Record<string, unknown>)[name];
    }
    delete (window as { onbeforeinstallprompt?: unknown }).onbeforeinstallprompt;
    for (const name of ['serviceWorker', 'share', 'clipboard', 'storage', 'vibrate', 'wakeLock']) {
      delete (Navigator.prototype as unknown as Record<string, unknown>)[name];
    }
  });
}

test('every page works without the service worker and optional APIs', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await withoutOptionalApis(page);

  await gotoHydrated(page, '/en');
  expect(await page.evaluate(() => 'serviceWorker' in navigator || 'share' in navigator)).toBe(
    false,
  );
  await expect(page.getByRole('heading', { level: 1, name: 'Daily Good Deeds' })).toBeVisible();

  for (const [path, heading] of [
    ['/en/today', 'Today'],
    ['/en/calendar', 'Calendar'],
    ['/en/admin', 'Admin dashboard'],
  ] as const) {
    await gotoHydrated(page, path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  }

  // Client-side navigation and the language switch still work.
  await gotoHydrated(page, '/en/today');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await hydrated(nav.getByRole('link', { name: 'Calendar' }));
  await nav.getByRole('link', { name: 'Calendar' }).click();
  await expect(page).toHaveURL(/\/en\/calendar$/);
  const language = page.getByRole('banner').getByRole('radiogroup', { name: 'Language' });
  await hydrated(language.getByRole('radio', { name: 'বাংলা' }));
  await language.getByRole('radio', { name: 'বাংলা' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'ক্যালেন্ডার' })).toBeVisible();

  expect(errors).toEqual([]);
});

test.describe('in a webview without the clipboard API', () => {
  test.use({ userAgent: INSTAGRAM_IOS });

  test('the open-in-browser banner shows the link to copy by hand', async ({ page }) => {
    await withoutOptionalApis(page);
    await gotoHydrated(page, '/en/today');
    const banner = page.getByRole('region', {
      name: 'For the best experience, open this in your browser',
    });
    await expect(banner).toContainText(page.url());
    await expect(banner.getByRole('button', { name: 'Copy link' })).toHaveCount(0);
  });
});

// T-P2-PWA-003 (F-PWA-007): inside social apps' webviews, an "open in your browser" banner with
// per-platform help; never in a real browser. Detection itself is unit-tested against fixtures.
import { expect, type Page, test } from '@playwright/test';
import { gotoHydrated } from './helpers';

const FACEBOOK_ANDROID =
  'Mozilla/5.0 (Linux; Android 13; SM-S911B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.163 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/442.0.0.33.113;]';
const INSTAGRAM_IOS =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 307.0.0.34.111 (iPhone14,5; iOS 17_1; en_US; en; scale=3.00; 1170x2532; 532277361)';

const banner = (page: Page) =>
  page.getByRole('region', { name: 'For the best experience, open this in your browser' });

test('a real browser sees no banner', async ({ page }) => {
  await gotoHydrated(page, '/en/today');
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  await expect(banner(page)).toHaveCount(0);
});

test.describe('Facebook on Android', () => {
  test.use({ userAgent: FACEBOOK_ANDROID });

  test('offers to open the page in the default browser, and can be dismissed', async ({ page }) => {
    await gotoHydrated(page, '/en/today');
    await expect(banner(page)).toContainText('inside Facebook');
    await expect(banner(page).getByRole('link', { name: 'Open in browser' })).toHaveAttribute(
      'href',
      /^intent:\/\/localhost:\d+\/en\/today#Intent;scheme=http;/,
    );

    await banner(page).getByRole('button', { name: 'Not now' }).click();
    await expect(banner(page)).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
  });

  test('is shown on the landing page too, in Bengali', async ({ page }) => {
    await gotoHydrated(page, '/bn');
    await expect(
      page.getByRole('region', { name: 'সবচেয়ে ভালো অভিজ্ঞতার জন্য এটি আপনার ব্রাউজারে খুলুন' }),
    ).toContainText('Facebook-এর ভেতরে');
  });
});

test.describe('Instagram on iOS', () => {
  test.use({ userAgent: INSTAGRAM_IOS });

  test("gives the app's menu steps and a copy-link button; no install prompt", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await gotoHydrated(page, '/en/today');
    await expect(banner(page)).toContainText('Open in external browser');
    await banner(page).getByRole('button', { name: 'Copy link' }).click();
    await expect(banner(page).getByRole('button', { name: 'Link copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());

    // A second visit would offer installing in a browser; a webview cannot install.
    const second = await context.newPage();
    await gotoHydrated(second, '/en/today');
    await expect(banner(second)).toBeVisible();
    await expect(second.getByRole('region', { name: 'Install Daily Good Deeds' })).toHaveCount(0);
  });
});

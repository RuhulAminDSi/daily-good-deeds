// T-P2-PWA-001: one installable manifest (named in the visitor's language), icons, and the app's own
// deferred install prompt.
import { type BrowserContext, expect, type Page, test } from '@playwright/test';
import { gotoHydrated } from './helpers';

/** Width and height from a PNG's IHDR chunk. */
const pngSize = (png: Buffer) => [png.readUInt32BE(16), png.readUInt32BE(20)];

test('manifest: single scope, locale-less start URL, named in the visitor language', async ({
  request,
}) => {
  const en = await (await request.get('/manifest.webmanifest')).json();
  expect(en).toMatchObject({
    name: 'Daily Good Deeds',
    short_name: 'Good Deeds',
    lang: 'en',
    scope: '/',
    start_url: '/today?source=pwa',
    display: 'standalone',
  });
  expect(en.icons.map((icon: { purpose: string }) => icon.purpose)).toContain('maskable');

  const bn = await request.get('/manifest.webmanifest', {
    headers: { 'Accept-Language': 'bn-BD,bn;q=0.9' },
  });
  expect(await bn.json()).toMatchObject({ name: 'ডেইলি গুড ডিডস', lang: 'bn', scope: '/' });
  // The saved language choice wins over the browser's preference, as for pages.
  const chosen = await request.get('/manifest.webmanifest', {
    headers: { 'Accept-Language': 'bn', Cookie: 'NEXT_LOCALE=en' },
  });
  expect((await chosen.json()).lang).toBe('en');

  for (const { src, sizes } of en.icons as { src: string; sizes: string }[]) {
    const icon = await request.get(src);
    expect(icon.headers()['content-type']).toBe('image/png');
    expect(pngSize(await icon.body()).join('x')).toBe(sizes);
  }
  for (const path of ['/icon', '/apple-icon']) {
    const icon = await request.get(path, { maxRedirects: 0 });
    expect(icon.status(), path).toBe(200);
  }
});

test('Chromium finds the app installable, and the start URL opens in the right language', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'installability is reported over the Chrome DevTools protocol',
  );
  await page.goto('/en/today');
  const cdp = await context.newCDPSession(page);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  expect(installabilityErrors).toEqual([]);

  // A language chosen later: the installed app's start URL follows it.
  await context.addCookies([
    { name: 'NEXT_LOCALE', value: 'bn', url: new URL('/', page.url()).href },
  ]);
  await page.goto('/today?source=pwa');
  await expect(page).toHaveURL(/\/bn\/today\?source=pwa$/);
});

/** A fresh tab is a new browser session, so it counts as a new visit. */
async function visit(context: BrowserContext): Promise<Page> {
  const page = await context.newPage();
  await gotoHydrated(page, '/en/today');
  // Chromium fires this only when its own heuristics are met; tests stand in for it.
  await page.evaluate(() => {
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt: async () => {
        (window as { prompted?: boolean }).prompted = true;
      },
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    });
    dispatchEvent(event);
  });
  return page;
}

const banner = (page: Page) => page.getByRole('region', { name: 'Install Daily Good Deeds' });

test('install prompt: never on the first visit, then Install opens the browser dialog', async ({
  context,
}) => {
  const first = await visit(context);
  await first.reload(); // same session: still the first visit
  await expect(banner(first)).toHaveCount(0);

  const second = await visit(context);
  await expect(banner(second)).toBeVisible();
  await banner(second).getByRole('button', { name: 'Install' }).click();
  await expect
    .poll(() => second.evaluate(() => (window as { prompted?: boolean }).prompted))
    .toBe(true);
  await expect(banner(second)).toHaveCount(0);
});

test('install prompt: "Not now" snoozes it for 30 days', async ({ context }) => {
  await visit(context);
  const second = await visit(context);
  await banner(second).getByRole('button', { name: 'Not now' }).click();
  await expect(banner(second)).toHaveCount(0);

  await expect(banner(await visit(context))).toHaveCount(0);

  const later = await visit(context);
  const day = 24 * 60 * 60 * 1000;
  await later.evaluate(
    (at) => localStorage.setItem('dgd.installDismissedAt', String(at)),
    Date.now() - 31 * day,
  );
  await expect(banner(await visit(context))).toBeVisible();
});

test.describe('on iOS', () => {
  test.use({
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  });

  test('install prompt: Add to Home Screen steps instead of a button', async ({ context }) => {
    await visit(context);
    const second = await visit(context);
    await expect(banner(second)).toContainText('Add to Home Screen');
    await expect(banner(second).getByRole('button', { name: 'Install' })).toHaveCount(0);
  });
});

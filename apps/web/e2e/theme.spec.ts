// T-P2-UI-004: light / dark / system, applied at once, remembered, and correct on the very first
// paint after a reload (the server renders `data-theme` from the cookie: no flash, no script).
import { expect, type Page, test } from '@playwright/test';
import { gotoHydrated, hydrated } from './helpers';

const LIGHT_BG = 'rgb(250, 247, 242)'; // --color-bg, light
const DARK_BG = 'rgb(18, 22, 19)'; // --color-bg, dark

const background = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);
/** The theme attribute in the HTML the server sends (what the first paint uses). */
const serverTheme = async (page: Page) => {
  const html = await (await page.request.get('/en/today')).text();
  return /<html[^>]*data-theme="(\w+)"/.exec(html)?.[1] ?? null;
};

test.use({ colorScheme: 'dark' });

test('follows the system by default, and a choice applies at once and survives reloads', async ({
  page,
  context,
}) => {
  await gotoHydrated(page, '/en/today');
  const theme = page.getByRole('radiogroup', { name: 'Theme' });
  await hydrated(theme.getByRole('radio', { name: 'Light' }));
  await expect(theme.getByRole('radio', { name: 'System' })).toBeChecked();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  expect(await background(page)).toBe(DARK_BG);

  // Light, although the OS is dark: applied without a reload.
  await theme.getByRole('radio', { name: 'Light' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await background(page)).toBe(LIGHT_BG);
  const cookie = (await context.cookies()).find((c) => c.name === 'dgd_theme');
  expect(cookie?.value).toBe('light');
  expect(cookie!.expires - Date.now() / 1000).toBeGreaterThan(300 * 24 * 3600);

  // No flash: the server's HTML already carries the choice.
  expect(await serverTheme(page)).toBe('light');
  await page.reload();
  await hydrated(theme.getByRole('radio', { name: 'System' }));
  await expect(theme.getByRole('radio', { name: 'Light' })).toBeChecked();
  expect(await background(page)).toBe(LIGHT_BG);

  // Back to System: the attribute goes, and the OS setting applies again.
  await theme.getByRole('radio', { name: 'System' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  expect(await background(page)).toBe(DARK_BG);
  expect(await serverTheme(page)).toBeNull();
});

test('ignores an invalid theme cookie', async ({ page, context }) => {
  await context.addCookies([{ name: 'dgd_theme', value: 'neon', url: 'http://localhost' }]);
  await page.goto('/en/today');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme');
  await expect(page.getByRole('radio', { name: 'System' })).toBeChecked();
});

test('the theme switch is keyboard operable', async ({ page }) => {
  await gotoHydrated(page, '/bn/today');
  const theme = page.getByRole('radiogroup', { name: 'থিম' });
  await hydrated(theme.getByRole('radio', { name: 'সিস্টেম' }));
  await theme.getByRole('radio', { name: 'সিস্টেম' }).focus();
  await page.keyboard.press('ArrowLeft');
  // Radix moves roving focus in a setTimeout: wait for it, or Space can still hit "System".
  await expect(theme.getByRole('radio', { name: 'ডার্ক' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

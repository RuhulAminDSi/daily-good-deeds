// T-P2-I18N-003: the language switch keeps the page, and the guest's choice is remembered: a URL
// without a locale opens in the chosen language even when the browser prefers another.
import { expect, test } from '@playwright/test';
import { gotoHydrated } from './helpers';

test.use({ extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });

test('desktop: switching keeps the page and is remembered for locale-less URLs', async ({
  page,
  context,
}) => {
  await gotoHydrated(page, '/en/calendar');
  const language = page.getByRole('banner').getByRole('radiogroup', { name: 'Language' });
  await expect(language.getByRole('radio', { name: 'English' })).toBeChecked();
  // Endonyms carry their own language for screen readers.
  await expect(language.getByRole('radio', { name: 'বাংলা' })).toHaveAttribute('lang', 'bn');

  await language.getByRole('radio', { name: 'বাংলা' }).click();
  await expect(page).toHaveURL(/\/bn\/calendar$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.getByRole('heading', { level: 1, name: 'ক্যালেন্ডার' })).toBeVisible();
  const cookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE');
  expect(cookie?.value).toBe('bn');
  // Remembered for a year, not just this browser session.
  expect(cookie!.expires - Date.now() / 1000).toBeGreaterThan(300 * 24 * 3600);

  // The browser prefers English, but the remembered choice wins, also after a reload.
  await page.goto('/');
  await expect(page).toHaveURL(/\/bn$/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');

  // And back.
  await gotoHydrated(page, '/bn/today');
  await page.getByRole('banner').getByRole('radio', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/today$/);
  await page.goto('/');
  await expect(page).toHaveURL(/\/en$/);
});

test.describe('phone (360px)', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('the switch is in the More sheet, which closes after switching', async ({ page }) => {
    await gotoHydrated(page, '/en/growth');
    await expect(
      page.getByRole('banner').getByRole('radiogroup', { name: 'Language' }),
    ).toBeHidden();
    await page.getByRole('button', { name: 'More' }).click();
    const sheet = page.getByRole('dialog', { name: 'More' });
    await sheet.getByRole('radio', { name: 'বাংলা' }).click();
    await expect(page).toHaveURL(/\/bn\/growth$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'উন্নতি' })).toBeVisible();
  });
});

// T-P2-UI-003: the app shell's navigation per breakpoint (RESPONSIVE_GUIDELINES §2), focus order
// and the More sheet. Viewports are set per test, so these run once (desktop project).
import { expect, type Page, test } from '@playwright/test';
import { gotoHydrated } from './helpers';

const nav = (page: Page) => page.getByRole('navigation', { name: 'Main navigation' });

/** No horizontal page scroll (WCAG 1.4.10 Reflow). */
const noHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

test.describe('phone (360px): bottom bar', () => {
  test.use({ viewport: { width: 360, height: 740 } });

  test('shows 5 items with the current page marked, and More opens the grouped sheet', async ({
    page,
  }) => {
    await gotoHydrated(page, '/en/today');
    const bar = nav(page);
    await expect(bar).toBeVisible();
    await expect(bar.getByRole('link')).toHaveText(['Today', 'Calendar', 'Islamic', 'Growth']);
    await expect(bar.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page');
    // The bar sits at the bottom of the viewport.
    const box = (await bar.boundingBox())!;
    expect(Math.round(box.y + box.height)).toBe(740);
    expect(await noHorizontalScroll(page)).toBe(true);

    await bar.getByRole('button', { name: 'More' }).click();
    const sheet = page.getByRole('dialog', { name: 'More' });
    await expect(sheet.getByRole('region', { name: 'Daily' })).toBeVisible();
    await sheet.getByRole('link', { name: 'Calendar' }).click();
    await expect(page).toHaveURL(/\/en\/calendar$/);
    await expect(sheet).toBeHidden();
    await expect(bar.getByRole('link', { name: 'Calendar' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByRole('heading', { level: 1, name: 'Calendar' })).toBeVisible();
  });

  test('focus order: skip link, then navigation; the skip link moves focus to main', async ({
    page,
  }) => {
    await page.goto('/en/today');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(nav(page).getByRole('link', { name: 'Today' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
});

test('Bengali bottom bar labels fit on one line at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/bn/today');
  const bar = page.getByRole('navigation', { name: 'প্রধান নেভিগেশন' });
  await expect(bar.getByRole('link', { name: 'ক্যালেন্ডার' })).toBeVisible();
  const overflowing = await bar
    .locator('span')
    .evaluateAll((labels) =>
      labels.filter((l) => l.scrollWidth > l.parentElement!.clientWidth).map((l) => l.textContent),
    );
  expect(overflowing).toEqual([]);
  expect(await noHorizontalScroll(page)).toBe(true);
});

test('tablet (768px): a 72px navigation rail with More', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await gotoHydrated(page, '/en/today');
  const rail = nav(page);
  const box = (await rail.boundingBox())!;
  expect([box.x, box.width]).toEqual([0, 72]);
  await expect(rail.getByRole('link', { name: 'Today' })).toHaveAttribute('aria-current', 'page');
  await expect(rail.getByRole('button', { name: 'More' })).toBeVisible();

  await expect(page.getByRole('navigation')).toHaveCount(1);

  // Opened with a real click, the sheet focuses its ✕ (its only non-link control at this width),
  // which must not pop the tooltip: tooltips open on keyboard focus only.
  await rail.getByRole('button', { name: 'More' }).click();
  await expect(
    page.getByRole('dialog', { name: 'More' }).getByRole('button', { name: 'Close' }),
  ).toBeFocused();
  await page.waitForTimeout(500);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
});

test('desktop (1280px): a 260px sidebar with groups, no More', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/en/growth');
  const sidebar = nav(page);
  const box = (await sidebar.boundingBox())!;
  expect([box.x, box.width]).toEqual([0, 260]);
  for (const group of ['Daily', 'Faith', 'Growth']) {
    await expect(sidebar.getByRole('region', { name: group })).toBeVisible();
  }
  await expect(sidebar.getByRole('link', { name: 'Growth' })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(sidebar.getByRole('button', { name: 'More' })).toBeHidden();
  await expect(page.getByRole('navigation')).toHaveCount(1);

  // Keyboard: skip link first, then the first sidebar link.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(sidebar.getByRole('link', { name: 'Today' })).toBeFocused();
});

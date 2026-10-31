// T-P2-I18N-005: fonts load without visible layout shift (CLS ≤ 0.05) even when they arrive late,
// Bengali text uses Hind Siliguri, and each locale stays within the font budget (TYPOGRAPHY §7).
import { expect, type Page, test } from '@playwright/test';

/** TYPOGRAPHY §7 (DL-042): Bengali pages also need Inter for spaces and punctuation. */
const BUDGET_BYTES = { en: 120 * 1024, bn: 130 * 1024 };
/** Loaded faces of exactly this family (next/font also adds a local "<family> Fallback"). */
const loadedFaces = (page: Page, family: string) =>
  page.evaluate(
    (name) =>
      [...document.fonts].filter(
        (f) => f.status === 'loaded' && f.family.replace(/['"]/g, '') === name,
      ).length,
    family,
  );

type Shift = PerformanceEntry & { value: number; hadRecentInput: boolean };

/**
 * CLS once the fonts are in. Layout-shift entries reach only a PerformanceObserver (`buffered`
 * replays earlier ones; `getEntriesByType` never lists them). Two frames after `fonts.ready` let a
 * swap shift be laid out and recorded.
 */
async function clsAfterFonts(): Promise<number> {
  await document.fonts.ready;
  const shifts: Shift[] = [];
  const observer = new PerformanceObserver((list) =>
    shifts.push(...(list.getEntries() as Shift[])),
  );
  observer.observe({ type: 'layout-shift', buffered: true });
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  shifts.push(...(observer.takeRecords() as Shift[]));
  observer.disconnect();
  return shifts.filter((s) => !s.hadRecentInput).reduce((sum, s) => sum + s.value, 0);
}

/** Loads a page with every font delayed (they arrive after the first paint, the worst case for
 *  layout shift) and returns its CLS and the font bytes it downloaded. */
async function loadWithSlowFonts(page: Page, url: string) {
  let fontBytes = 0;
  await page.route('**/*.woff2', async (route) => {
    await new Promise((r) => setTimeout(r, 800));
    const response = await route.fetch();
    fontBytes += (await response.body()).length;
    await route.fulfill({ response });
  });
  await page.goto(url);
  const cls = await page.evaluate(clsAfterFonts);
  return { cls, fontBytes };
}

test('Bengali pages: Hind Siliguri renders the text, no layout shift, within budget', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  const { cls, fontBytes } = await loadWithSlowFonts(page, '/bn/today');
  expect(cls).toBeLessThanOrEqual(0.05);
  expect(fontBytes).toBeLessThanOrEqual(BUDGET_BYTES.bn);
  expect(await loadedFaces(page, 'Hind Siliguri')).toBeGreaterThanOrEqual(1);
});

test('English pages: Inter, plus one Bengali face only for the "বাংলা" endonym; no layout shift', async ({
  page,
}) => {
  const { cls, fontBytes } = await loadWithSlowFonts(page, '/en/today');
  expect(cls).toBeLessThanOrEqual(0.05);
  expect(fontBytes).toBeLessThanOrEqual(BUDGET_BYTES.en);
  expect(await loadedFaces(page, 'Inter')).toBeGreaterThanOrEqual(1);
  expect(await loadedFaces(page, 'Hind Siliguri')).toBeLessThanOrEqual(1);
});

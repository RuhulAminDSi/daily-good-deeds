import type { Page } from '@playwright/test';

/**
 * Navigates and waits until React has hydrated the document. Before that, clicks and key presses
 * reach no handlers and are lost (the server HTML is already visible and focusable); afterwards
 * React replays early events itself. Use it before interacting with client-side behaviour.
 */
export async function gotoHydrated(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.waitForFunction(() =>
    Object.keys(document).some((k) => k.startsWith('__reactContainer')),
  );
}

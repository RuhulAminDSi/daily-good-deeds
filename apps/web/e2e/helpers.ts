import type { Locator, Page } from '@playwright/test';

/**
 * Navigates, then waits until `ready` (default: the page body) is hydrated: React has attached its
 * props, and so its event handlers, to that element. Before that, clicks and key presses on it are
 * lost while the server HTML is already visible and focusable. Waiting for React's root alone is
 * not enough: hydration then continues part by part (seen failing on slower CI machines).
 */
export async function gotoHydrated(page: Page, url: string, ready?: Locator): Promise<void> {
  await page.goto(url);
  await hydrated(ready ?? page.locator('body'));
}

/** Waits until React has hydrated this element (its event handlers are attached). */
export async function hydrated(locator: Locator): Promise<void> {
  await locator.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const check = () =>
          Object.keys(element).some((key) => key.startsWith('__reactProps'))
            ? resolve()
            : requestAnimationFrame(check);
        check();
      }),
  );
}

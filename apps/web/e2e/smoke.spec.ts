import { expect, test } from '@playwright/test';

test.describe('a Bengali-first browser', () => {
  test.use({ locale: 'bn-BD' });

  test('is redirected from / to /bn', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/bn$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  });
});

test.describe('an English-first browser that also accepts Bengali', () => {
  test.use({ extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8' } });

  test('is redirected to /en (q-values respected)', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });
});

test('renders the public landing in English and Bengali @responsive', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Daily Good Deeds');
  await page.goto('/bn');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ডেইলি গুড ডিডস');
});

test('reports the API as unavailable instead of failing when it is down', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByText('Service is temporarily unavailable')).toBeVisible();
});

test('renders the (app) and admin route groups with their own layouts @responsive', async ({
  page,
}) => {
  await page.goto('/en/today');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();

  await page.goto('/bn/admin');
  await expect(page.getByRole('navigation', { name: 'অ্যাডমিন' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'অ্যাডমিন ড্যাশবোর্ড' })).toBeVisible();
});

test('returns a real 404 with the localized page for unknown routes and locales', async ({
  page,
}) => {
  const res = await page.goto('/en/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();

  expect((await page.goto('/fr'))?.status()).toBe(404);
});

test('streams the loading state while a slow page renders', async ({ page }) => {
  await page.goto('/en/e2e/slow', { waitUntil: 'commit' });
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByText('done')).toBeVisible();
  await expect(page.getByRole('status')).toHaveCount(0);
});

test('shows the error boundary (without error details) when a page throws', async ({ page }) => {
  await page.goto('/en/e2e/error');
  // Next also renders a role=alert route announcer, so match ours by its text.
  await expect(page.getByRole('alert').filter({ hasText: 'Something went wrong' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  await expect(page.getByText('intentional render error')).toHaveCount(0);
});

test('enforces a nonce-based CSP and still hydrates', async ({ page }) => {
  const violations: string[] = [];
  page.on('console', (msg) => {
    if (/Content Security Policy|Refused to/i.test(msg.text())) violations.push(msg.text());
  });
  const res = await page.goto('/en/e2e/error');
  const csp = res?.headers()['content-security-policy'] ?? '';
  const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
  expect(nonce).toBeTruthy();
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  // Every script Next rendered carries this response's nonce.
  const scriptNonces = await page
    .locator('script')
    .evaluateAll((els) => els.map((el) => (el as HTMLScriptElement).nonce));
  expect(scriptNonces.length).toBeGreaterThan(0);
  expect(scriptNonces.every((n) => n === nonce)).toBe(true);
  // Hydrated: the client error boundary's retry button is interactive.
  await page.getByRole('button', { name: 'Try again' }).click();
  expect(violations).toEqual([]);
});

test('sends the static security headers', async ({ page }) => {
  const res = await page.goto('/en');
  const headers = res?.headers() ?? {};
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['permissions-policy']).toContain('camera=()');
});

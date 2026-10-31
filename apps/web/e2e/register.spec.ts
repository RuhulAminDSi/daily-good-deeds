// T-P2-AUTH-002: the register page in both languages. No API runs in the smoke suite, so the
// browser's call to /api/v1/auth/register is answered here (the API side has its own tests).
import { expect, type Page, test } from '@playwright/test';
import { gotoHydrated } from './helpers';

const PASSWORD = 'a long enough passphrase';

async function fill(page: Page, { terms = true } = {}) {
  await page.getByRole('textbox', { name: 'Your name' }).fill('Amina');
  await page.getByRole('textbox', { name: 'Email' }).fill('  Amina@Example.COM ');
  await page.getByLabel('Password').fill(PASSWORD);
  if (terms) await page.getByRole('checkbox', { name: /I agree/ }).check();
}

const createButton = (page: Page) => page.getByRole('button', { name: 'Create account' });
const submit = (page: Page) => createButton(page).click();

test('validates in the browser, in English', async ({ page }) => {
  let called = false;
  await page.route('**/api/v1/auth/register', (route) => {
    called = true;
    return route.abort();
  });
  await gotoHydrated(page, '/en/register', createButton(page));
  await page.getByLabel('Password').fill('short');
  await submit(page);

  const name = page.getByRole('textbox', { name: 'Your name' });
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(name).toHaveAccessibleDescription('This field is required.');
  await expect(page.getByLabel('Password')).toHaveAccessibleDescription(
    /Use at least 10 characters\./,
  );
  await expect(page.getByRole('checkbox', { name: /I agree/ })).toHaveAccessibleDescription(
    'Please accept the Terms and Privacy Policy.',
  );
  expect(called).toBe(false);
});

test('validates in the browser, in Bengali (Bengali digits)', async ({ page }) => {
  const button = page.getByRole('button', { name: 'অ্যাকাউন্ট তৈরি করুন' });
  await gotoHydrated(page, '/bn/register', button);
  await page.getByLabel('পাসওয়ার্ড').fill('short');
  await button.click();
  await expect(page.getByLabel('পাসওয়ার্ড')).toHaveAccessibleDescription(
    /কমপক্ষে ১০টি অক্ষর ব্যবহার করুন।/,
  );
});

test('sends the normalized request and asks to check email', async ({ page }) => {
  let sent: Record<string, unknown> | undefined;
  await page.route('**/api/v1/auth/register', async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ status: 202, json: { status: 'check_email' } });
  });
  await gotoHydrated(page, '/en/register', createButton(page));
  await fill(page);
  await submit(page);

  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  await expect(page.getByText('amina@example.com')).toBeVisible();
  expect(sent).toEqual({
    email: 'amina@example.com',
    password: PASSWORD,
    displayName: 'Amina',
    locale: 'en',
    timezone: expect.stringMatching(/^[A-Za-z_]+\//),
    acceptTermsVersion: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
  });
});

test("shows the API's answer: a breached password, then a rate limit", async ({ page }) => {
  const answers = [
    {
      status: 422,
      json: {
        type: 'https://docs.dailygooddeeds.app/errors/password-too-weak',
        title: 'Choose a stronger password',
        status: 422,
        code: 'PASSWORD_TOO_WEAK',
        i18nKey: 'errors.password_too_weak',
        errors: [
          {
            pointer: '/password',
            code: 'password_breached',
            i18nKey: 'validation.password_breached',
          },
        ],
      },
    },
    {
      status: 429,
      json: {
        type: 'https://docs.dailygooddeeds.app/errors/rate-limited',
        title: 'Too many requests',
        status: 429,
        code: 'RATE_LIMITED',
        i18nKey: 'errors.rate_limited',
      },
    },
  ];
  await page.route('**/api/v1/auth/register', (route) =>
    route.fulfill({ ...answers.shift()!, contentType: 'application/problem+json' }),
  );
  await gotoHydrated(page, '/en/register', createButton(page));
  await fill(page);
  await submit(page);

  const alert = page.locator('form').getByRole('alert');
  await expect(alert).toHaveText('Choose a stronger password');
  await expect(page.getByLabel('Password')).toHaveAccessibleDescription(
    /appeared in a data breach/,
  );

  await submit(page);
  await expect(alert).toHaveText('Too many requests');
});

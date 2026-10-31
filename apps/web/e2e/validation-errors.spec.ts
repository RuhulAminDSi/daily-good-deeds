// T-P2-I18N-006: API field errors render in the page's language from their i18n keys (client side),
// wired to their controls, with a generic message for codes this client doesn't know.
import { expect, test } from '@playwright/test';
import { gotoHydrated } from './helpers';

const CASES = {
  en: {
    title: 'Some fields are invalid',
    fields: {
      Title: 'Use at most 120 characters.',
      Email: 'Enter a valid email address.',
      Note: 'This value is not valid.',
    },
  },
  bn: {
    title: 'কিছু ঘরে ভুল আছে',
    fields: {
      Title: 'সর্বোচ্চ ১২০টি অক্ষর ব্যবহার করুন।',
      Email: 'সঠিক ইমেইল ঠিকানা লিখুন।',
      Note: 'মানটি সঠিক নয়।',
    },
  },
} as const;

for (const [locale, expected] of Object.entries(CASES)) {
  test(`field errors render in ${locale}`, async ({ page }) => {
    const save = page.getByRole('button', { name: 'Save' });
    await gotoHydrated(page, `/${locale}/e2e/field-errors`, save);
    await save.click();
    // Scoped to the form: Next's route announcer is an (empty) alert too.
    await expect(page.locator('form').getByRole('alert')).toHaveText(expected.title);
    for (const [label, message] of Object.entries(expected.fields)) {
      const input = page.getByRole('textbox', { name: label });
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(input).toHaveAccessibleDescription(message);
    }
  });
}

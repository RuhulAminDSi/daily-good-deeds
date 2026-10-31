import { RegisterRequestSchema, TERMS_VERSION } from './auth.js';
import { fieldErrorFromIssue } from './validation.js';

const valid = {
  email: '  Amina@Example.COM ',
  password: 'a long enough passphrase',
  displayName: ' Amina ',
  locale: 'bn',
  timezone: 'Asia/Dhaka',
  acceptTermsVersion: TERMS_VERSION,
};

const errorsFor = (input: object) =>
  RegisterRequestSchema.safeParse(input).error?.issues.map(fieldErrorFromIssue) ?? [];

describe('RegisterRequestSchema', () => {
  it('normalizes email (trimmed, lowercased) and the display name', () => {
    expect(RegisterRequestSchema.parse(valid)).toMatchObject({
      email: 'amina@example.com',
      displayName: 'Amina',
    });
  });

  it.each([
    ['a short password', { password: 'short' }, '/password', 'too_small'],
    ['an over-long password', { password: 'x'.repeat(129) }, '/password', 'too_big'],
    ['a malformed email', { email: 'not-an-email' }, '/email', 'invalid_format'],
    ['an unknown time zone', { timezone: 'Mars/Olympus' }, '/timezone', 'timezone'],
    [
      'terms not accepted',
      { acceptTermsVersion: undefined },
      '/acceptTermsVersion',
      'terms_required',
    ],
    ['old terms', { acceptTermsVersion: '2020-01-01' }, '/acceptTermsVersion', 'terms_required'],
    ['an unknown field', { role: 'admin' }, '', 'unrecognized_keys'],
  ])('rejects %s', (_, change, pointer, code) => {
    expect(errorsFor({ ...valid, ...change })).toContainEqual(
      expect.objectContaining({ pointer, code }),
    );
  });
});

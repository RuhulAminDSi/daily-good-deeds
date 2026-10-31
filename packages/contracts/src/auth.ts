import { LOCALES } from '@dgd/i18n';
import { z } from 'zod';

/** Password length bounds (SRS FR-AUTH-001-02); no composition rules (NIST 800-63B). */
export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

/** Version of the Terms and Privacy Policy a new account accepts (FR-AUTH-001-04). */
export const TERMS_VERSION = '2026-10-31';

/** An IANA time zone this runtime knows, e.g. "Asia/Dhaka". */
const isTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

/**
 * POST /auth/register (API_SPECIFICATION §1, FR-AUTH-001-01..04). Email is trimmed and lowercased.
 * Shared by the API (validation, OpenAPI) and the register page (client-side validation).
 */
export const RegisterRequestSchema = z.strictObject({
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  password: z.string().min(PASSWORD_MIN).max(PASSWORD_MAX),
  displayName: z.string().trim().min(1, { error: 'validation.required' }).max(60),
  locale: z.enum(LOCALES),
  timezone: z.string().refine(isTimeZone, { error: 'validation.timezone' }),
  /** The Terms version shown when the user ticked "I agree". */
  acceptTermsVersion: z.literal(TERMS_VERSION, { error: 'validation.terms_required' }),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

/**
 * Always the same for new and already-registered emails, so the response never reveals whether an
 * account exists (FR-AUTH-001-03).
 */
export const RegisterResponseSchema = z.object({ status: z.literal('check_email') });
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

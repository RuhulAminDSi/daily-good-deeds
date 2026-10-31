import { createHash } from 'node:crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';

/** `fetch`, injectable so tests answer for the Pwned Passwords API. */
export const PWNED_FETCH = Symbol('PWNED_FETCH');

const RANGE_URL = 'https://api.pwnedpasswords.com/range/';
const TIMEOUT_MS = 2000;

/**
 * Breached-password check (FR-AUTH-001-02) with k-anonymity: only the first 5 hex characters of
 * the password's SHA-1 leave the server, and padded responses hide which suffixes matched. When
 * the service is unavailable the check fails open (the password is accepted) and is logged.
 */
@Injectable()
export class BreachedPasswords {
  private readonly logger = new Logger(BreachedPasswords.name);

  constructor(@Inject(PWNED_FETCH) private readonly fetchFn: typeof fetch) {}

  async isBreached(password: string): Promise<boolean> {
    const digest = createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = digest.slice(0, 5);
    const suffix = digest.slice(5);
    try {
      const res = await this.fetchFn(RANGE_URL + prefix, {
        headers: { 'Add-Padding': 'true' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Lines are "SUFFIX:COUNT"; padding entries have a count of 0.
      return (await res.text()).split('\n').some((line) => {
        const [lineSuffix, count] = line.split(':');
        return lineSuffix === suffix && Number(count) > 0;
      });
    } catch (error) {
      this.logger.warn({ err: error }, 'password_breach_check_unavailable');
      return false;
    }
  }
}

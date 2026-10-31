import { Inject, Injectable } from '@nestjs/common';
import { hash } from '@node-rs/argon2';
import { APP_CONFIG, type AppConfig } from '../config/env.js';

/**
 * Argon2id at SRS FR-AUTH-002-01's floor (m=19 MiB, t=2, p=1): about 11 ms per hash on the dev
 * laptop (benchmark in the T-P2-AUTH-002 changelog), so memory, not time, bounds concurrent logins.
 * Hashes record their parameters, so raising them later rehashes on login (AUTHENTICATION §3).
 */
const ARGON2_PARAMS = {
  algorithm: 2, // Algorithm.Argon2id (a const enum, not importable under verbatimModuleSyntax)
  memoryCost: 19 * 1024,
  timeCost: 2,
  parallelism: 1,
} as const;

/** Password hashing with a server-side pepper (PASSWORD_PEPPER), kept outside the database. */
@Injectable()
export class PasswordHasher {
  private readonly secret?: Buffer;

  constructor(@Inject(APP_CONFIG) config: AppConfig) {
    this.secret = config.PASSWORD_PEPPER ? Buffer.from(config.PASSWORD_PEPPER) : undefined;
  }

  hash(password: string): Promise<string> {
    return hash(password, { ...ARGON2_PARAMS, secret: this.secret });
  }
}

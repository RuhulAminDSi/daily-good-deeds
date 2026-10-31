import { Injectable } from '@nestjs/common';
import type { RegisterRequest } from '@dgd/contracts';
import { validationKeyOf } from '@dgd/contracts';
import { DomainError } from '../common/errors/domain-error.js';
import { Prisma } from '../generated/prisma/client.js';
import { UsersRepository } from '../users/users.repository.js';
import { BreachedPasswords } from './breached-passwords.js';
import { PasswordHasher } from './password-hasher.js';
import { RegistrationEvents } from './registration-events.js';

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersRepository,
    private readonly hasher: PasswordHasher,
    private readonly breached: BreachedPasswords,
    private readonly events: RegistrationEvents,
  ) {}

  /**
   * Registration (F-AUTH-001, AUTHENTICATION §3). New and existing emails take the same path (the
   * breach check and the hash always run) and give the same result, so neither the response nor
   * its timing tells whether an account exists.
   */
  async register(input: RegisterRequest): Promise<void> {
    // Independent: the hash (CPU) runs while the breach check waits on the network.
    const [breached, passwordHash] = await Promise.all([
      this.breached.isBreached(input.password),
      this.hasher.hash(input.password),
    ]);
    if (breached) {
      throw new DomainError('PASSWORD_TOO_WEAK', {
        errors: [
          {
            pointer: '/password',
            code: 'password_breached',
            i18nKey: validationKeyOf('password_breached'),
          },
        ],
      });
    }
    try {
      const user = await this.users.create({
        email: input.email,
        passwordHash,
        displayName: input.displayName,
        termsVersion: input.acceptTermsVersion,
        preferences: { locale: input.locale, timezone: input.timezone },
      });
      this.events.accountCreated(user.id);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
      const existing = await this.users.findByEmail(input.email);
      if (existing) this.events.emailAlreadyRegistered(existing.id);
    }
  }
}

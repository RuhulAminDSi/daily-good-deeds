import { Injectable, Logger } from '@nestjs/common';

/**
 * What happens after a registration attempt. The caller never sees which branch ran
 * (FR-AUTH-001-03). This default only logs: the verification email (T-P2-AUTH-003) and the
 * "someone tried to register with your email" message (T-P2-INTG-001, email adapter) replace it
 * with queued emails.
 */
@Injectable()
export class RegistrationEvents {
  private readonly logger = new Logger('auth');

  /** A new account: send the verification email. */
  accountCreated(userId: string): void {
    this.logger.log({ userId }, 'user.registered');
  }

  /** The email already has an account: tell its owner instead of the requester. */
  emailAlreadyRegistered(userId: string): void {
    this.logger.log({ userId }, 'registration.email_exists');
  }
}

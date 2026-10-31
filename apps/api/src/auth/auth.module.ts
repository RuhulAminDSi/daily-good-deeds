import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { BreachedPasswords, PWNED_FETCH } from './breached-passwords.js';
import { PasswordHasher } from './password-hasher.js';
import { RegistrationEvents } from './registration-events.js';

/** Credentials, sessions and verification (COMPONENT_ARCHITECTURE §1, `auth`). */
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordHasher,
    BreachedPasswords,
    RegistrationEvents,
    { provide: PWNED_FETCH, useValue: globalThis.fetch },
  ],
})
export class AuthModule {}

import { Injectable } from '@nestjs/common';
import type { Prisma, User, UserPreferences } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';

export interface NewUser {
  email: string;
  /** Argon2id PHC string; omitted for OAuth-only accounts. */
  passwordHash?: string;
  displayName: string;
  termsVersion: string;
  /** Initial preferences (signup locale, detected time zone); the rest take their defaults. */
  preferences?: Pick<Prisma.UserPreferencesCreateWithoutUserInput, 'locale' | 'timezone'>;
}

export type PreferencesPatch = Omit<Prisma.UserPreferencesUpdateInput, 'user' | 'updatedAt'>;

/**
 * Users and their preferences (COMPONENT_ARCHITECTURE §1, `users` module). Ownership rule for
 * every repository of user-owned rows: methods take the acting user's id first and always filter
 * by it, so another user's row is simply not found (404, never 403: ERROR_HANDLING §2).
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** A new account with its preferences row, in one statement. A taken email → CONFLICT (P2002). */
  create({ preferences, ...user }: NewUser) {
    return this.prisma.user.create({
      data: { ...user, preferences: { create: preferences ?? {} } },
      include: { preferences: true },
    });
  }

  /** Case-insensitive (citext). */
  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /** Updates the actor's own preferences; a missing row → RESOURCE_NOT_FOUND (P2025). */
  updatePreferences(actorId: string, patch: PreferencesPatch): Promise<UserPreferences> {
    return this.prisma.userPreferences.update({ where: { userId: actorId }, data: patch });
  }
}

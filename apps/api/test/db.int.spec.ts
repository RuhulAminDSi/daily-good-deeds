// Integration tests against a real database (Neon `test` branch; see vitest.config.ts).
// Skipped locally when TEST_DATABASE_URL is not configured; in CI a missing database is an error.
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { createPrismaClient } from '../src/database/prisma-client.js';
import type { PrismaService } from '../src/database/prisma.service.js';
import { UsersRepository } from '../src/users/users.repository.js';
import { seedSystemSettings } from '../src/database/seeds.js';
import { settingDefaults } from '../src/settings/settings.registry.js';
import { createTestApp, migrateTestDatabase, testDatabaseConfigured } from './helpers.js';

const { TEST_DATABASE_URL } = process.env;

describe.skipIf(!testDatabaseConfigured())('database (integration)', () => {
  const prisma = createPrismaClient(TEST_DATABASE_URL!, 2);

  beforeAll(migrateTestDatabase, 120_000);

  afterAll(() => prisma.$disconnect());

  it('seeds are idempotent: a second run inserts nothing and row counts are unchanged', async () => {
    await prisma.systemSetting.deleteMany();
    const expected = settingDefaults().length;

    expect(await seedSystemSettings(prisma)).toBe(expected);
    expect(await seedSystemSettings(prisma)).toBe(0);
    expect(await prisma.systemSetting.count()).toBe(expected);
  });

  it('never overwrites an existing (admin-edited) setting', async () => {
    const where = { key: 'completions.edit_window_days' };
    await prisma.systemSetting.update({ where, data: { value: 14 } });
    await seedSystemSettings(prisma);
    expect((await prisma.systemSetting.findUnique({ where }))?.value).toBe(14);
  });

  it('GET /api/v1/health/ready is 200 when every shipped migration is applied', async () => {
    const app = await createTestApp(TEST_DATABASE_URL!);
    try {
      const res = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
      expect(res.body).toEqual({ status: 'ok', checks: { db: 'ok' } });
    } finally {
      await app.close();
    }
  });

  // T-P2-AUTH-001: identity schema and repository (DATA_DICTIONARY §1).
  describe('identity', () => {
    const users = new UsersRepository(prisma as unknown as PrismaService);
    const created: string[] = [];
    const email = (tag: string) => `${tag}-${randomUUID()}@Example.test`;
    const newUser = async (tag = 'user') => {
      const user = await users.create({
        email: email(tag),
        passwordHash: '$argon2id$v=19$m=19456,t=2,p=1$c2FsdA$aGFzaA',
        displayName: 'Test User',
        termsVersion: '2026-10',
        preferences: { locale: 'bn' },
      });
      created.push(user.id);
      return user;
    };

    afterAll(() => prisma.user.deleteMany({ where: { id: { in: created } } }));

    it('creates a user with a UUIDv7 id and default preferences', async () => {
      const user = await newUser();
      expect(user.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/);
      expect(user.preferences).toMatchObject({
        locale: 'bn',
        timezone: 'Asia/Dhaka',
        theme: 'system',
        weekStart: 6,
        aiEnabled: false,
      });
    });

    it('treats email case-insensitively: lookup and uniqueness (citext)', async () => {
      const user = await newUser('Case');
      expect((await users.findByEmail(user.email.toUpperCase()))?.id).toBe(user.id);
      await expect(
        users.create({ email: user.email.toLowerCase(), displayName: 'X', termsVersion: '1' }),
      ).rejects.toMatchObject({ code: 'P2002' });
    });

    it.each([
      ['an empty display name', { displayName: '' }],
      ['a display name over 60 characters', { displayName: 'x'.repeat(61) }],
      ['an unknown status', { status: 'banned' }],
      ['pending_deletion without a request time', { status: 'pending_deletion' }],
    ])('rejects %s (CHECK)', async (_, data) => {
      const user = await newUser();
      await expect(prisma.user.update({ where: { id: user.id }, data })).rejects.toThrow();
    });

    it('rejects invalid preferences and verification tokens (CHECK)', async () => {
      const user = await newUser();
      await expect(users.updatePreferences(user.id, { weekStart: 7 })).rejects.toThrow();
      await expect(users.updatePreferences(user.id, { theme: 'neon' })).rejects.toThrow();
      const token = { userId: user.id, expiresAt: new Date(Date.now() + 3600_000) };
      await expect(
        prisma.verificationToken.create({
          data: { ...token, type: 'email_change', tokenHash: randomUUID() },
        }),
      ).rejects.toThrow();
      await expect(
        prisma.verificationToken.create({
          data: { ...token, type: 'email_verify', tokenHash: randomUUID(), newEmail: email('n') },
        }),
      ).rejects.toThrow();
    });

    it('scopes preferences to the acting user: an unknown id is not found', async () => {
      await expect(users.updatePreferences(randomUUID(), { theme: 'dark' })).rejects.toMatchObject({
        code: 'P2025',
      });
    });

    it('deleting a user cascades to its rows and clears system_settings.updated_by', async () => {
      const user = await newUser();
      await prisma.userSession.create({
        data: {
          userId: user.id,
          sessionTokenHash: randomUUID(),
          client: 'web',
          expiresAt: new Date(Date.now() + 3600_000),
        },
      });
      await prisma.authIdentity.create({
        data: { userId: user.id, provider: 'google', providerSubject: randomUUID() },
      });
      const where = { key: 'completions.edit_window_days' };
      await prisma.systemSetting.update({ where, data: { updatedBy: user.id } });

      await prisma.user.delete({ where: { id: user.id } });
      expect(await prisma.userPreferences.count({ where: { userId: user.id } })).toBe(0);
      expect(await prisma.userSession.count({ where: { userId: user.id } })).toBe(0);
      expect(await prisma.authIdentity.count({ where: { userId: user.id } })).toBe(0);
      expect((await prisma.systemSetting.findUnique({ where }))?.updatedBy).toBeNull();
    });
  });
});

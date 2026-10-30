// Integration tests against a real database (Neon `test` branch; see vitest.config.ts).
// Skipped locally when TEST_DATABASE_URL is not configured; in CI a missing database is an error.
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { createPrismaClient } from '../src/database/prisma-client.js';
import { seedSystemSettings } from '../src/database/seeds.js';
import { settingDefaults } from '../src/settings/settings.registry.js';
import { createTestApp } from './helpers.js';

const { TEST_DATABASE_URL, TEST_DIRECT_URL, CI } = process.env;
const configured = Boolean(TEST_DATABASE_URL && TEST_DIRECT_URL);
if (CI && !configured) {
  throw new Error('CI must set TEST_DATABASE_URL and TEST_DIRECT_URL for integration tests.');
}

describe.skipIf(!configured)('database (integration)', () => {
  const prisma = createPrismaClient(TEST_DATABASE_URL!, 2);

  beforeAll(() => {
    // Same command the release step runs.
    execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
      env: { ...process.env, DIRECT_URL: TEST_DIRECT_URL },
      stdio: 'pipe',
      shell: process.platform === 'win32',
    });
  }, 120_000);

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
});

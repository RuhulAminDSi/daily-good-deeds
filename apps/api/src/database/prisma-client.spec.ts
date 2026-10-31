import type { PrismaClient } from '../generated/prisma/client.js';
import { assertDatabaseReady, expectedMigrations } from './prisma-client.js';

// Rows as returned from _prisma_migrations; the shipped migrations are read from prisma/migrations.
const db = (rows: { migration_name: string; done: boolean }[]) =>
  ({ $queryRaw: async () => rows }) as unknown as PrismaClient;

describe('assertDatabaseReady', () => {
  it('passes when every shipped migration is applied', async () => {
    await expect(
      assertDatabaseReady(
        db(expectedMigrations().map((migration_name) => ({ migration_name, done: true }))),
      ),
    ).resolves.toBeUndefined();
  });

  it('fails when a shipped migration is not applied yet (new code, old schema)', async () => {
    await expect(assertDatabaseReady(db([]))).rejects.toThrow(/pending migrations/);
  });

  it('fails when a migration is unfinished (failed or still running)', async () => {
    await expect(
      assertDatabaseReady(db([{ migration_name: '20261030183427_baseline', done: false }])),
    ).rejects.toThrow(/unfinished migrations/);
  });
});

// Prisma client construction and the readiness check, free of Nest so CLI scripts (seed) can use them.
import { readdirSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

/** Options shared by PrismaService and standalone clients. */
export const prismaOptions = (connectionString: string, max: number) => ({
  adapter: new PrismaPg({
    connectionString,
    max,
    // Fail fast instead of queueing forever when the DB is unreachable; covers a Neon cold start.
    connectionTimeoutMillis: 5000,
  }),
});

export const createPrismaClient = (connectionString: string, max: number) =>
  new PrismaClient(prismaOptions(connectionString, max));

/** Migration folders shipped with the app (prisma/migrations), i.e. the schema this code expects. */
export const expectedMigrations = (): string[] => {
  try {
    return readdirSync(new URL('../../prisma/migrations', import.meta.url), { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
};

/**
 * Ready when the database answers and every migration this build ships with is applied, with none
 * failed or in progress (NFR-AVAILABILITY-003). Migrations are applied by the release step.
 */
export async function assertDatabaseReady(prisma: PrismaClient): Promise<void> {
  const rows = await prisma.$queryRaw<{ migration_name: string; done: boolean }[]>`
    SELECT migration_name, (finished_at IS NOT NULL) AS done
    FROM _prisma_migrations WHERE rolled_back_at IS NULL`;
  const unfinished = rows.filter((r) => !r.done).map((r) => r.migration_name);
  if (unfinished.length) throw new Error(`unfinished migrations: ${unfinished.join(', ')}`);
  const applied = new Set(rows.map((r) => r.migration_name));
  const pending = expectedMigrations().filter((m) => !applied.has(m));
  if (pending.length) throw new Error(`pending migrations: ${pending.join(', ')}`);
}

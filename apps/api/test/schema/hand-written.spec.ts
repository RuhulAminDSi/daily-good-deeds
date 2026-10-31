// Schema drift check (MIGRATION_STRATEGY §2): every CHECK constraint and index written by hand in a
// migration's "Hand-written" section must exist in the database. Prisma's schema cannot express
// them, so a later `prisma migrate dev` could otherwise drop them silently. New migrations are
// covered automatically.
import { readFileSync } from 'node:fs';
import { createPrismaClient, expectedMigrations } from '../../src/database/prisma-client.js';
import { testDatabaseConfigured } from '../helpers.js';

const MARKER = '-- ---------------------------------------------------------------- Hand-written';

/** Names declared after the marker in the shipped migrations, minus those a later one drops. */
function handWritten(): { checks: string[]; indexes: string[] } {
  const files = expectedMigrations().map((name) =>
    readFileSync(new URL(`../../prisma/migrations/${name}/migration.sql`, import.meta.url), 'utf8'),
  );
  const sections = files.map((sql) => (sql.includes(MARKER) ? sql.slice(sql.indexOf(MARKER)) : ''));
  const names = (sqls: string[], pattern: RegExp) =>
    sqls.flatMap((sql) => [...sql.matchAll(pattern)].map((m) => m[1]!));
  const dropped = new Set(names(files, /DROP (?:INDEX|CONSTRAINT) "(\w+)"/g));
  const kept = (all: string[]) => all.filter((name) => !dropped.has(name));
  return {
    checks: kept(names(sections, /ADD CONSTRAINT "(\w+)" CHECK/g)),
    indexes: kept(names(sections, /CREATE (?:UNIQUE )?INDEX "(\w+)"/g)),
  };
}

describe.skipIf(!testDatabaseConfigured())('hand-written schema objects', () => {
  const prisma = createPrismaClient(process.env.TEST_DATABASE_URL!, 1);
  const { checks, indexes } = handWritten();

  afterAll(() => prisma.$disconnect());

  it('are found in the migrations', () => {
    expect(checks.length).toBeGreaterThan(0);
    expect(indexes.length).toBeGreaterThan(0);
  });

  it('every CHECK constraint exists', async () => {
    const rows = await prisma.$queryRaw<{ conname: string }[]>`
      SELECT conname FROM pg_constraint WHERE contype = 'c' AND conname = ANY(${checks})`;
    expect(rows.map((r) => r.conname).sort()).toEqual([...checks].sort());
  });

  it('every index exists', async () => {
    const rows = await prisma.$queryRaw<{ indexname: string }[]>`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname = ANY(${indexes})`;
    expect(rows.map((r) => r.indexname).sort()).toEqual([...indexes].sort());
  });
});

// Schema drift check for the hand-written SQL in 20261031120000_identity (MIGRATION_STRATEGY §2):
// Prisma's schema cannot express these, so a later `prisma migrate dev` could drop them silently.
import { createPrismaClient } from '../../src/database/prisma-client.js';
import { migrateTestDatabase, testDatabaseConfigured } from '../helpers.js';

const CHECKS = [
  'users_display_name_length',
  'users_status_values',
  'users_pending_deletion_has_request',
  'user_preferences_theme_values',
  'user_preferences_week_start_range',
  'auth_identities_provider_values',
  'verification_tokens_new_email_only_for_email_change',
];

/** Index name → the part of its definition that makes it what the strategy asks for. */
const INDEXES: Record<string, RegExp> = {
  users_deletion_requested_at_pending_idx: /WHERE \(status = 'pending_deletion'::text\)/,
  users_display_name_trgm_idx: /USING gin \(lower\(display_name\) gin_trgm_ops\)/,
  user_sessions_user_id_last_used_at_active_idx:
    /\(user_id, last_used_at DESC\) WHERE \(revoked_at IS NULL\)/,
  verification_tokens_user_id_type_open_idx: /\(user_id, type\) WHERE \(consumed_at IS NULL\)/,
};

describe.skipIf(!testDatabaseConfigured())('identity schema (hand-written SQL)', () => {
  const prisma = createPrismaClient(process.env.TEST_DATABASE_URL!, 1);

  beforeAll(migrateTestDatabase, 120_000);
  afterAll(() => prisma.$disconnect());

  it('has every CHECK constraint', async () => {
    const rows = await prisma.$queryRaw<{ conname: string }[]>`
      SELECT conname FROM pg_constraint WHERE contype = 'c' AND conname = ANY(${CHECKS})`;
    expect(rows.map((r) => r.conname).sort()).toEqual([...CHECKS].sort());
  });

  it('has every partial and trigram index, as defined', async () => {
    const rows = await prisma.$queryRaw<{ indexname: string; indexdef: string }[]>`
      SELECT indexname, indexdef FROM pg_indexes
      WHERE schemaname = 'public' AND indexname = ANY(${Object.keys(INDEXES)})`;
    const defs = Object.fromEntries(rows.map((r) => [r.indexname, r.indexdef]));
    for (const [name, shape] of Object.entries(INDEXES)) expect(defs[name], name).toMatch(shape);
  });
});

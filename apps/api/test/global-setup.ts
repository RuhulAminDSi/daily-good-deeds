// Vitest global setup: migrates the integration test database once per run, before any spec file
// (instead of each file racing to `prisma migrate deploy`). No database configured → nothing to do.
import { migrateTestDatabase, testDatabaseConfigured } from './helpers.js';

export default function setup(): void {
  if (testDatabaseConfigured()) migrateTestDatabase();
}

import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// The Prisma CLI loads this file itself, so it reads apps/api/.env here; real env vars win.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // The CLI (migrate, introspect) must bypass Neon's pooler; the app uses the pooled DATABASE_URL.
  // Not env(): that throws when unset, and `prisma generate` (CI, fresh clones) needs no database.
  datasource: { url: process.env.DIRECT_URL ?? '' },
});

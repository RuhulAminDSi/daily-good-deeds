// `pnpm db:seed`: idempotent reference data. Runs the built output with .env loaded by Node.
import { loadConfig } from '../config/env.js';
import { createPrismaClient } from './prisma-client.js';
import { seedSystemSettings } from './seeds.js';

const prisma = createPrismaClient(loadConfig(process.env).DATABASE_URL, 1);
try {
  console.log('seeded system_settings:', await seedSystemSettings(prisma));
} finally {
  await prisma.$disconnect();
}

import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import { settingDefaults } from '../settings/settings.registry.js';

/**
 * Inserts registry defaults that are missing; existing (possibly admin-edited) rows are untouched,
 * so it is safe on every deploy. Returns the number of rows inserted.
 */
export async function seedSystemSettings(prisma: PrismaClient): Promise<number> {
  const { count } = await prisma.systemSetting.createMany({
    // Registry defaults are validated by their Zod schemas, so they are JSON-safe.
    data: settingDefaults().map((s) => ({ ...s, value: s.value as Prisma.InputJsonValue })),
    skipDuplicates: true,
  });
  return count;
}

import type { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { APP_OPTIONS, configureApp } from '../src/app.setup.js';
import { loadConfig } from '../src/config/env.js';

/** Boots the real app (same setup as main.ts), optionally with extra test-only modules. */
export async function createTestApp(
  databaseUrl: string,
  extraImports: Type[] = [],
): Promise<INestApplication> {
  const config = loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent', DATABASE_URL: databaseUrl });
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule.forRoot(config), ...extraImports],
  }).compile();
  const app = configureApp(moduleRef.createNestApplication(APP_OPTIONS), config);
  await app.init();
  return app;
}

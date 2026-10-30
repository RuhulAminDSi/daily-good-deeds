import type { INestApplication, INestApplicationContext, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { APP_OPTIONS, configureApp } from '../src/app.setup.js';
import { loadConfig, loadWorkerConfig } from '../src/config/env.js';
import { WorkerModule } from '../src/jobs/worker.module.js';

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

/** Boots the real worker module (same as src/worker.ts) plus extra test-only job providers. */
export async function createTestWorker(
  directUrl: string,
  extraJobs: Type[] = [],
): Promise<INestApplicationContext> {
  const config = loadWorkerConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    DIRECT_URL: directUrl,
    JOB_POLL_SECONDS: '0.5',
  });
  const moduleRef = await Test.createTestingModule({
    imports: [WorkerModule.forRoot(config)],
    providers: extraJobs,
  }).compile();
  return moduleRef.init();
}

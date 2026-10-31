import { execFileSync } from 'node:child_process';
import type { INestApplication, INestApplicationContext, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module.js';
import { APP_OPTIONS, configureApp } from '../src/app.setup.js';
import { loadConfig, loadWorkerConfig } from '../src/config/env.js';
import { WorkerModule } from '../src/jobs/worker.module.js';

/**
 * Boots the real app (same setup as main.ts), optionally with extra test-only modules and
 * providers replaced by test doubles: `overrides: [[ErrorReporter, fake]]`.
 */
export async function createTestApp(
  databaseUrl: string,
  extraImports: Type[] = [],
  { overrides = [] }: { overrides?: [token: unknown, value: unknown][] } = {},
): Promise<INestApplication> {
  const config = loadConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent', DATABASE_URL: databaseUrl });
  let builder = Test.createTestingModule({
    imports: [AppModule.forRoot(config), ...extraImports],
  });
  for (const [token, value] of overrides) builder = builder.overrideProvider(token).useValue(value);
  const moduleRef = await builder.compile();
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

/**
 * Integration tests run against a dedicated database (Neon `test` branch; vitest.config.ts) and
 * are skipped locally without one. In CI a missing database is an error.
 */
export function testDatabaseConfigured(
  vars: string[] = ['TEST_DATABASE_URL', 'TEST_DIRECT_URL'],
): boolean {
  const configured = vars.every((name) => process.env[name]);
  if (process.env.CI && !configured) {
    throw new Error(`CI must set ${vars.join(' and ')} for integration tests.`);
  }
  return configured;
}

/** Applies the shipped migrations, the same command the release step runs (from global-setup.ts). */
export function migrateTestDatabase(): void {
  execFileSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DIRECT_URL: process.env.TEST_DIRECT_URL },
    stdio: 'pipe',
    shell: process.platform === 'win32',
  });
}

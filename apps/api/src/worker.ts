// Worker process entrypoint (`pnpm worker`): same codebase as the API, no HTTP server (DL-036).
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { runOrExit } from './config/boot.js';
import { loadWorkerConfig } from './config/env.js';
import { WorkerModule } from './jobs/worker.module.js';

runOrExit(async () => {
  const config = loadWorkerConfig(process.env);
  const app = await NestFactory.createApplicationContext(WorkerModule.forRoot(config), {
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));
  // SIGTERM/SIGINT run shutdown hooks, which drain in-flight jobs (JobRunner).
  app.enableShutdownHooks();
  await app.init();
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { APP_OPTIONS, configureApp } from './app.setup.js';
import { InvalidConfigError, loadConfig } from './config/env.js';

async function bootstrap() {
  const config = loadConfig(process.env);
  const app = await NestFactory.create(AppModule.forRoot(config), APP_OPTIONS);
  configureApp(app, config);
  await app.listen(config.PORT);
}

bootstrap().catch((err: unknown) => {
  // The logger may not exist yet, so boot failures go to stderr.
  console.error(err instanceof InvalidConfigError ? err.message : err);
  process.exit(1);
});

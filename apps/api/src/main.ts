import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { APP_OPTIONS, configureApp } from './app.setup.js';
import { runOrExit } from './config/boot.js';
import { loadConfig } from './config/env.js';

runOrExit(async () => {
  const config = loadConfig(process.env);
  const app = await NestFactory.create(AppModule.forRoot(config), APP_OPTIONS);
  configureApp(app, config);
  await app.listen(config.PORT);
});

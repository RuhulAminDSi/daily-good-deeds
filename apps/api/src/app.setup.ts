import { type INestApplication, type NestApplicationOptions, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import type { AppConfig } from './config/env.js';

/** Options for NestFactory.create / createNestApplication. JSON parsing is AppModule middleware. */
export const APP_OPTIONS: NestApplicationOptions = { bufferLogs: true, bodyParser: false };

/** Applies global HTTP setup shared by main.ts and integration tests. */
export function configureApp(app: INestApplication, config: AppConfig): INestApplication {
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();
  // Built once at boot so a broken decorator fails startup, not the first docs request.
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Daily Good Deeds API')
      .setVersion('1')
      .setDescription('See docs/api/API_SPECIFICATION.md for the full contract.')
      .build(),
  );
  SwaggerModule.setup('api/v1/docs', app, document, {
    jsonDocumentUrl: 'api/v1/openapi.json',
    raw: ['json'],
    ui: config.NODE_ENV !== 'production',
  });
  return app;
}

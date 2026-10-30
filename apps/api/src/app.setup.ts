import { type INestApplication, type NestApplicationOptions, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { applySecurity, DOCS_PATH } from './common/http/security.js';
import { buildOpenApiDocument } from './common/openapi/openapi.js';
import type { AppConfig } from './config/env.js';

/** Options for NestFactory.create / createNestApplication. JSON parsing is AppModule middleware. */
export const APP_OPTIONS: NestApplicationOptions = { bufferLogs: true, bodyParser: false };

/** Applies global HTTP setup shared by main.ts and integration tests. */
export function configureApp(app: INestApplication, config: AppConfig): INestApplication {
  app.useLogger(app.get(Logger));
  applySecurity(app, config);
  app.setGlobalPrefix('api'); // routes are /api/v1/...
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();
  // Built once at boot so a broken decorator fails startup, not the first docs request.
  SwaggerModule.setup(DOCS_PATH, app, buildOpenApiDocument(app), {
    jsonDocumentUrl: 'api/v1/openapi.json',
    raw: ['json'],
    ui: config.NODE_ENV !== 'production',
  });
  return app;
}

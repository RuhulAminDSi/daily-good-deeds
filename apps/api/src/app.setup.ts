import { type INestApplication, type NestApplicationOptions, VersioningType } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { buildOpenApiDocument } from './common/openapi/openapi.js';
import type { AppConfig } from './config/env.js';

/** Options for NestFactory.create / createNestApplication. JSON parsing is AppModule middleware. */
export const APP_OPTIONS: NestApplicationOptions = { bufferLogs: true, bodyParser: false };

/** Route prefix + versioning: `/api/v1/...`. Shared with the OpenAPI emitter (src/openapi.ts). */
export function applyRouting(app: INestApplication): INestApplication {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  return app;
}

/** Applies global HTTP setup shared by main.ts and integration tests. */
export function configureApp(app: INestApplication, config: AppConfig): INestApplication {
  app.useLogger(app.get(Logger));
  applyRouting(app);
  app.enableShutdownHooks();
  // Built once at boot so a broken decorator fails startup, not the first docs request.
  SwaggerModule.setup('api/v1/docs', app, buildOpenApiDocument(app), {
    jsonDocumentUrl: 'api/v1/openapi.json',
    raw: ['json'],
    ui: config.NODE_ENV !== 'production',
  });
  return app;
}

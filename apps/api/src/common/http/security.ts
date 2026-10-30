import type { INestApplication } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { RequestHandler } from 'express';
import helmet from 'helmet';
import type { AppConfig } from '../../config/env.js';

/** Where Swagger UI is mounted (non-production only); shared with app.setup.ts. */
export const DOCS_PATH = 'api/v1/docs';

/**
 * Security headers (NFR-SECURITY-014/015) and CORS (NFR-SECURITY-027). The API only serves JSON,
 * so its CSP allows nothing to load or frame it; HSTS is sent only in production (HTTPS).
 */
export function applySecurity(app: INestApplication, config: AppConfig): void {
  const express = app as NestExpressApplication;
  express.set('trust proxy', config.TRUST_PROXY);

  const production = config.NODE_ENV === 'production';
  const api = helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
    xFrameOptions: { action: 'deny' },
    hsts: production ? { maxAge: 31_536_000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  });
  if (production) {
    express.use(api);
  } else {
    // Swagger UI needs inline scripts and styles; it is only mounted outside production.
    const docs = helmet({ contentSecurityPolicy: false, hsts: false });
    const headers: RequestHandler = (req, res, next) =>
      (req.path.startsWith(`/${DOCS_PATH}`) ? docs : api)(req, res, next);
    express.use(headers);
  }

  // Unknown origins get no CORS headers, so browsers block them; bearer-token clients (widget,
  // public API) are not browsers and are unaffected.
  express.enableCors({
    origin: config.WEB_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Accept-Language',
      'X-Request-Id',
      'Idempotency-Key',
      'If-Match',
    ],
    exposedHeaders: ['X-Request-Id', 'Retry-After', 'ETag'],
    maxAge: 600,
  });
}

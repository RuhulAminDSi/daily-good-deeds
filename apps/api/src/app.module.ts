import {
  type DynamicModule,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { ProblemDetailsFilter } from './common/errors/problem-details.filter.js';
import { jsonBody } from './common/http/json-body.middleware.js';
import { RateLimitGuard, THROTTLE_OPTIONS } from './common/http/rate-limit.js';
import { ObservabilityModule } from './common/observability/error-reporter.js';
import { loggerOptions } from './common/logging/logger.options.js';
import { ConfigModule } from './config/config.module.js';
import type { AppConfig } from './config/env.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';

@Module({})
export class AppModule implements NestModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        LoggerModule.forRoot(loggerOptions(config)),
        ConfigModule.forRoot(config),
        ObservabilityModule.forRoot(config),
        ThrottlerModule.forRoot(THROTTLE_OPTIONS),
        HealthModule,
        DatabaseModule,
      ],
      providers: [
        { provide: APP_FILTER, useClass: ProblemDetailsFilter },
        { provide: APP_GUARD, useClass: RateLimitGuard },
      ],
    };
  }

  // Nest registers global modules' middleware (LoggerModule's pino-http) before non-global ones, so
  // parse errors carry a request id. Keep AppModule non-global; test/app.spec.ts guards this order.
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jsonBody()).forRoutes('{*path}');
  }
}

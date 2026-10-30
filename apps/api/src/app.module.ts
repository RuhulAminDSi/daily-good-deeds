import {
  type DynamicModule,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ProblemDetailsFilter } from './common/errors/problem-details.filter.js';
import { jsonBody } from './common/http/json-body.middleware.js';
import { loggerOptions } from './common/logging/logger.options.js';
import type { AppConfig } from './config/env.js';
import { HealthController } from './health/health.controller.js';

@Module({})
export class AppModule implements NestModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [LoggerModule.forRoot(loggerOptions(config))],
      controllers: [HealthController],
      providers: [{ provide: APP_FILTER, useClass: ProblemDetailsFilter }],
    };
  }

  // Module middleware runs after LoggerModule's (imported first), so parse errors carry a request id.
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(jsonBody()).forRoutes('*');
  }
}

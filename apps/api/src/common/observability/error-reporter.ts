import { type DynamicModule, Global, Module, type OnApplicationShutdown } from '@nestjs/common';
import { createNodeReporter, type ReportContext, type Reporter } from '@dgd/observability/node';
import type { NodeOptions } from '@sentry/node';
import type { BaseConfig } from '../../config/env.js';

/**
 * DI token for error reporting (NFR-OBSERVABILITY-005): Sentry when SENTRY_DSN is set, otherwise a
 * no-op (INTEGRATION_ARCHITECTURE: unconfigured integrations degrade, never fake).
 */
export abstract class ErrorReporter implements Reporter {
  abstract report(error: unknown, context?: ReportContext): void;
  abstract close(): Promise<void>;
}

export const createErrorReporter = (
  config: BaseConfig,
  transport?: NodeOptions['transport'],
): Promise<ErrorReporter> =>
  createNodeReporter({
    dsn: config.SENTRY_DSN,
    release: config.APP_RELEASE,
    environment: config.NODE_ENV,
    transport,
  });

@Global()
@Module({})
export class ObservabilityModule implements OnApplicationShutdown {
  constructor(private readonly reporter: ErrorReporter) {}

  static forRoot(config: BaseConfig): DynamicModule {
    return {
      module: ObservabilityModule,
      providers: [{ provide: ErrorReporter, useFactory: () => createErrorReporter(config) }],
      exports: [ErrorReporter],
    };
  }

  async onApplicationShutdown(): Promise<void> {
    await this.reporter.close();
  }
}

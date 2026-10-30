import { type DynamicModule, Module } from '@nestjs/common';
import { APP_CONFIG, type BaseConfig } from './env.js';

/** Makes the process config (API or worker) injectable everywhere via APP_CONFIG. */
@Module({})
export class ConfigModule {
  static forRoot(config: BaseConfig): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      providers: [{ provide: APP_CONFIG, useValue: config }],
      exports: [APP_CONFIG],
    };
  }
}

import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { APP_CONFIG, type AppConfig } from '../config/env.js';
import { PrismaClient } from '../generated/prisma/client.js';
import { ReadinessService } from '../health/readiness.service.js';
import { assertDatabaseReady, prismaOptions } from './prisma-client.js';

/** The app's Prisma client (pooled DATABASE_URL); registers the `db` readiness check. */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(APP_CONFIG) config: AppConfig,
    private readonly readiness: ReadinessService,
  ) {
    super(prismaOptions(config.DATABASE_URL, config.DB_POOL_MAX));
  }

  onModuleInit() {
    this.readiness.register('db', () => assertDatabaseReady(this));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

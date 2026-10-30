import { Global, Module } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { ReadinessService } from './readiness.service.js';

/** Global so any module can register a readiness check. */
@Global()
@Module({
  controllers: [HealthController],
  providers: [ReadinessService],
  exports: [ReadinessService],
})
export class HealthModule {}

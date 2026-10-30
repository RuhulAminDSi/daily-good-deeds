import { Controller, Get } from '@nestjs/common';
import { ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import type { HealthLive, HealthReady } from '@dgd/contracts';
import { DomainError } from '../common/errors/domain-error.js';
import { schemaRef, ZodOk } from '../common/openapi/openapi.js';
import { ReadinessService } from './readiness.service.js';

/**
 * Liveness/readiness probes (NFR-AVAILABILITY-003). Hosts should probe `live` frequently and use
 * `ready` for deploy gating: `ready` touches the database, which keeps Neon's compute awake.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly readiness: ReadinessService) {}

  @Get('live')
  @ZodOk('HealthLive', 'Process is running')
  live(): HealthLive {
    return { status: 'ok' };
  }

  @Get('ready')
  @ZodOk('HealthReady', 'All dependencies are usable')
  @ApiServiceUnavailableResponse({
    description: 'A dependency check failed',
    schema: schemaRef('Problem'),
  })
  async ready(): Promise<HealthReady> {
    const checks = await this.readiness.run();
    if (Object.values(checks).some((s) => s !== 'ok')) {
      throw new DomainError('DEPENDENCY_UNAVAILABLE', { extensions: { checks } });
    }
    return { status: 'ok', checks };
  }
}

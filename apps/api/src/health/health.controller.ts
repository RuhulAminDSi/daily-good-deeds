import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { DomainError } from '../common/errors/domain-error.js';
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
  @ApiOkResponse({ description: 'Process is running' })
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOkResponse({ description: 'All registered dependencies are usable' })
  @ApiServiceUnavailableResponse({ description: 'A dependency check failed' })
  async ready() {
    const checks = await this.readiness.run();
    if (Object.values(checks).some((s) => s !== 'ok')) {
      throw new DomainError('DEPENDENCY_UNAVAILABLE', { extensions: { checks } });
    }
    return { status: 'ok', checks };
  }
}

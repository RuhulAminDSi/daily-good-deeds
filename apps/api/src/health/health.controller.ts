import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

/** Liveness/readiness probes for the host (NFR-AVAILABILITY-003). */
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get('live')
  @ApiOkResponse({ description: 'Process is running' })
  live() {
    return { status: 'ok' };
  }

  // Dependency checks (db, jobs, email, storage) are added by the modules that own them.
  @Get('ready')
  @ApiOkResponse({ description: 'Ready to serve traffic' })
  ready() {
    return { status: 'ok' };
  }
}

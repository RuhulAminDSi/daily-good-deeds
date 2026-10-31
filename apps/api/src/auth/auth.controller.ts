import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { RegisterRequest, RegisterResponse } from '@dgd/contracts';
import { AUTH_STRICT } from '../common/http/rate-limit.js';
import { schemaRef, ZodBody, ZodResponse } from '../common/openapi/openapi.js';
import { AuthService } from './auth.service.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /**
   * F-AUTH-001. 202 for new and existing emails alike (FR-AUTH-001-03). `auth-strict` tier:
   * 5 per IP per hour (API_CONVENTIONS §10, FR-AUTH-001-05). The session cookie that signs the new
   * user in arrives with the session store (T-P2-AUTH-004).
   */
  @Post('register')
  @HttpCode(202)
  @Throttle(AUTH_STRICT)
  @ZodResponse(202, 'RegisterResponse', 'Check your email')
  @ApiUnprocessableEntityResponse({
    description: 'PASSWORD_TOO_WEAK: the password appears in a data breach',
    schema: schemaRef('Problem'),
  })
  async register(@ZodBody('RegisterRequest') body: RegisterRequest): Promise<RegisterResponse> {
    await this.auth.register(body);
    return { status: 'check_email' };
  }
}

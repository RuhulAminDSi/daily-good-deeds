import { type ExecutionContext, Injectable } from '@nestjs/common';
import {
  type ThrottlerLimitDetail,
  type ThrottlerModuleOptions,
  ThrottlerGuard,
} from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { DomainError } from '../errors/domain-error.js';

const MINUTE = 60_000;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Throttling tiers: the single definition is docs/api/API_CONVENTIONS.md §10. `auth-strict` is
 * applied per route with @Throttle when the auth endpoints land (T-P2-AUTH-002/004/006), together
 * with the Postgres-backed login/reset counters (FR-AUTH-002-02).
 */
export const THROTTLE_OPTIONS: ThrottlerModuleOptions = {
  // Only the standard Retry-After on 429 (set below); no per-tier X-RateLimit-* headers.
  setHeaders: false,
  throttlers: [
    { name: 'default', ttl: MINUTE, limit: 300 },
    {
      name: 'write',
      ttl: MINUTE,
      limit: 120,
      skipIf: (ctx) => SAFE_METHODS.has(ctx.switchToHttp().getRequest<Request>().method),
    },
  ],
};

/** ThrottlerGuard that answers with the standard `Retry-After` header and a RATE_LIMITED problem. */
@Injectable()
export class RateLimitGuard extends ThrottlerGuard {
  protected override async throwThrottlingException(
    context: ExecutionContext,
    { timeToBlockExpire }: ThrottlerLimitDetail,
  ): Promise<void> {
    context.switchToHttp().getResponse<Response>().setHeader('Retry-After', timeToBlockExpire);
    throw new DomainError('RATE_LIMITED', { extensions: { retryAfterSec: timeToBlockExpire } });
  }
}

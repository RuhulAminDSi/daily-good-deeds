import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError, type core } from 'zod';
import {
  CODE_BY_STATUS,
  ERROR_CODES,
  type ErrorCode,
  type FieldError,
  i18nKeyOf,
  type Problem,
  typeUriOf,
} from '@dgd/contracts';
import { ErrorReporter } from '../observability/error-reporter.js';
import { DomainError, type DomainErrorOptions } from './domain-error.js';

type Normalized = { code: ErrorCode } & DomainErrorOptions;

function fieldError(issue: core.$ZodIssue): FieldError {
  const params: Record<string, unknown> = {};
  if ('maximum' in issue) params.max = issue.maximum;
  if ('minimum' in issue) params.min = issue.minimum;
  return {
    pointer: `/${issue.path.map(String).join('/')}`,
    code: issue.code,
    i18nKey: `validation.${issue.code}`,
    ...(Object.keys(params).length ? { params } : {}),
  };
}

function normalize(exception: unknown): Normalized {
  if (exception instanceof DomainError) return { code: exception.code, ...exception.options };
  if (exception instanceof ZodError) {
    return { code: 'VALIDATION_FAILED', errors: exception.issues.map(fieldError) };
  }
  if (exception instanceof HttpException) {
    return { code: CODE_BY_STATUS.get(exception.getStatus()) ?? 'INTERNAL_ERROR' };
  }
  return { code: 'INTERNAL_ERROR' };
}

/** Renders every error as RFC 9457 problem+json (docs/api/ERROR_HANDLING.md). Never leaks internals. */
@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  constructor(private readonly reporter: ErrorReporter) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const { code, detail, errors, extensions } = normalize(exception);
    const { status, title } = ERROR_CODES[code];

    // pino-http's request-completion log picks this up, so failures are logged once, with the cause.
    if (status >= 500) {
      res.err = exception instanceof Error ? exception : new Error(String(exception));
      this.reporter.report(exception, { requestId: String(req.id) });
    }

    res
      .status(status)
      .type('application/problem+json')
      .json({
        type: typeUriOf(code),
        title,
        status,
        // 5xx detail stays generic; the cause is only in logs.
        ...(detail && status < 500 ? { detail } : {}),
        instance: req.originalUrl,
        code,
        i18nKey: i18nKeyOf(code),
        requestId: String(req.id),
        ...(errors?.length ? { errors } : {}),
        ...extensions,
      } satisfies Problem);
  }
}

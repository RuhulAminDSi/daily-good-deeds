import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  CODE_BY_STATUS,
  ERROR_CODES,
  type ErrorCode,
  fieldErrorFromIssue,
  i18nKeyOf,
  type Problem,
  typeUriOf,
} from '@dgd/contracts';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@dgd/i18n';
import { translator } from '@dgd/i18n/messages';
import { Prisma } from '../../generated/prisma/client.js';
import { ErrorReporter } from '../observability/error-reporter.js';
import { DomainError, type DomainErrorOptions } from './domain-error.js';

type Normalized = { code: ErrorCode } & DomainErrorOptions;

/** Prisma request errors with a catalog code (ERROR_HANDLING §4); others are internal errors. */
const CODE_BY_PRISMA_ERROR: Record<string, ErrorCode> = {
  P2002: 'CONFLICT', // unique constraint
  P2025: 'RESOURCE_NOT_FOUND', // record to update or delete not found
};

const translators = Object.fromEntries(
  LOCALES.map((locale) => [locale, translator(locale)]),
) as Record<Locale, ReturnType<typeof translator>>;

/** `title` in the request's `Accept-Language` (q-weighted; `bn-BD` matches `bn`), else English. */
function localeOf(req: Request): Locale {
  return (req.acceptsLanguages(...LOCALES) || DEFAULT_LOCALE) as Locale;
}

function normalize(exception: unknown): Normalized {
  if (exception instanceof DomainError) return { code: exception.code, ...exception.options };
  if (exception instanceof ZodError) {
    return { code: 'VALIDATION_FAILED', errors: exception.issues.map(fieldErrorFromIssue) };
  }
  if (exception instanceof Prisma.PrismaClientKnownRequestError) {
    return { code: CODE_BY_PRISMA_ERROR[exception.code] ?? 'INTERNAL_ERROR' };
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
    const { status } = ERROR_CODES[code];
    const locale = localeOf(req);
    const i18nKey = i18nKeyOf(code);

    // pino-http's request-completion log picks this up, so failures are logged once, with the cause.
    if (status >= 500) {
      res.err = exception instanceof Error ? exception : new Error(String(exception));
      this.reporter.report(exception, { requestId: String(req.id) });
    }

    res
      .status(status)
      .type('application/problem+json')
      .vary('Accept-Language')
      .set('Content-Language', locale)
      .json({
        type: typeUriOf(code),
        title: translators[locale](i18nKey),
        status,
        // 5xx detail stays generic; the cause is only in logs.
        ...(detail && status < 500 ? { detail } : {}),
        instance: req.originalUrl,
        code,
        i18nKey,
        requestId: String(req.id),
        ...(errors?.length ? { errors } : {}),
        ...extensions,
      } satisfies Problem);
  }
}

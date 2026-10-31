import { Body, Controller, Get, type INestApplication, Module, Post } from '@nestjs/common';
import request from 'supertest';
import { z } from 'zod';
import { DomainError } from '../src/common/errors/domain-error.js';
import { createTestApp } from './helpers.js';

// Test-only routes that raise each kind of error the filter must render.
@Controller('test-errors')
class ErrorsController {
  @Get('domain')
  domain() {
    throw new DomainError('BUSINESS_RULE_VIOLATION', {
      detail: 'Past days beyond the edit window are read-only.',
      errors: [{ pointer: '/localDate', code: 'out_of_window' }],
    });
  }

  @Post('zod')
  zod(@Body() body: unknown) {
    return z.object({ title: z.string().max(5), email: z.email().optional() }).parse(body);
  }

  @Get('crash')
  crash() {
    throw new Error('db password is hunter2 at 10.0.0.5');
  }
}

@Module({ controllers: [ErrorsController] })
class ErrorsModule {}

describe('API skeleton (HTTP)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Nothing listens on port 1, so the db readiness check fails fast.
    app = await createTestApp('postgresql://u:p@127.0.0.1:1/none', [ErrorsModule]);
  });

  afterAll(() => app.close());

  const api = () => request(app.getHttpServer());

  it('GET /api/v1/health/live returns 200', async () => {
    const res = await api().get('/api/v1/health/live').expect(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/v1/health/ready is 503 DEPENDENCY_UNAVAILABLE when the db is unreachable', async () => {
    const res = await api().get('/api/v1/health/ready').expect(503);
    expect(res.body).toMatchObject({ code: 'DEPENDENCY_UNAVAILABLE', checks: { db: 'fail' } });
  });

  it('serves the generated OpenAPI document at /api/v1/openapi.json', async () => {
    const res = await api().get('/api/v1/openapi.json').expect(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toContain('/api/v1/health/live');
  });

  it('echoes a valid X-Request-Id and generates one otherwise', async () => {
    const id = '0192f1c4-6b1e-7d2a-9a51-3f0b6c2f1a10';
    const echoed = await api().get('/api/v1/health/live').set('X-Request-Id', id);
    expect(echoed.headers['x-request-id']).toBe(id);
    const generated = await api().get('/api/v1/health/live').set('X-Request-Id', 'not a uuid');
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('renders unknown routes as RESOURCE_NOT_FOUND problem+json', async () => {
    const res = await api().get('/api/v1/nope').expect(404);
    expect(res.headers['content-type']).toMatch(/^application\/problem\+json/);
    expect(res.body).toMatchObject({
      type: 'https://docs.dailygooddeeds.app/errors/resource-not-found',
      status: 404,
      code: 'RESOURCE_NOT_FOUND',
      i18nKey: 'errors.resource_not_found',
      instance: '/api/v1/nope',
    });
    expect(res.body.requestId).toBe(res.headers['x-request-id']);
  });

  it('renders DomainError with detail and field errors', async () => {
    const res = await api().get('/api/v1/test-errors/domain').expect(422);
    expect(res.body).toMatchObject({
      code: 'BUSINESS_RULE_VIOLATION',
      detail: 'Past days beyond the edit window are read-only.',
      errors: [{ pointer: '/localDate', code: 'out_of_window' }],
    });
  });

  it('maps ZodError to VALIDATION_FAILED with JSON pointers', async () => {
    const res = await api().post('/api/v1/test-errors/zod').send({ title: 'too long' }).expect(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.errors).toEqual([
      {
        pointer: '/title',
        code: 'too_big',
        i18nKey: 'validation.too_big',
        params: { max: 5, origin: 'string' },
      },
    ]);
  });

  // T-P2-I18N-006: stable code + i18nKey in every locale; `title` follows Accept-Language.
  it.each([
    ['en-US,en;q=0.9', 'en', 'Some fields are invalid'],
    ['bn-BD,bn;q=0.9,en;q=0.8', 'bn', 'কিছু ঘরে ভুল আছে'],
    ['fr-FR', 'en', 'Some fields are invalid'],
  ])('localizes validation errors for Accept-Language %s', async (header, locale, title) => {
    const res = await api()
      .post('/api/v1/test-errors/zod')
      .set('Accept-Language', header)
      .send({ email: 'nope' })
      .expect(400);
    expect(res.headers['content-language']).toBe(locale);
    expect(res.headers.vary).toMatch(/Accept-Language/i);
    expect(res.body).toMatchObject({
      title,
      code: 'VALIDATION_FAILED',
      i18nKey: 'errors.validation_failed',
      errors: [
        { pointer: '/title', code: 'required', i18nKey: 'validation.required' },
        {
          pointer: '/email',
          code: 'invalid_format',
          i18nKey: 'validation.invalid_format',
          params: { format: 'email' },
        },
      ],
    });
  });

  it('localizes non-validation errors too', async () => {
    const res = await api().get('/api/v1/nope').set('Accept-Language', 'bn').expect(404);
    expect(res.body).toMatchObject({ code: 'RESOURCE_NOT_FOUND', title: 'খুঁজে পাওয়া যায়নি' });
  });

  it('maps malformed JSON to MALFORMED_JSON', async () => {
    const res = await api()
      .post('/api/v1/test-errors/zod')
      .set('Content-Type', 'application/json')
      .send('{"title":')
      .expect(400);
    expect(res.body.code).toBe('MALFORMED_JSON');
    // Body parsing runs after request-id setup, so even parser rejections are traceable.
    expect(res.body.requestId).toBe(res.headers['x-request-id']);
    expect(res.body.requestId).toBeTruthy();
  });

  it('rejects bodies over the limit with PAYLOAD_TOO_LARGE', async () => {
    const res = await api()
      .post('/api/v1/test-errors/zod')
      .send({ title: 'x'.repeat(300 * 1024) })
      .expect(413);
    expect(res.body.code).toBe('PAYLOAD_TOO_LARGE');
  });

  it('keeps 5xx responses generic (no internals leaked)', async () => {
    const res = await api().get('/api/v1/test-errors/crash').expect(500);
    expect(res.body).toMatchObject({ code: 'INTERNAL_ERROR', title: 'Something went wrong' });
    expect(JSON.stringify(res.body)).not.toMatch(/hunter2|10\.0\.0\.5|at .*\.ts/);
  });
});

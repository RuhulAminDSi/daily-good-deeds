import { Body, Controller, type INestApplication, Module, Post } from '@nestjs/common';
import request from 'supertest';
import { JSON_MAX_DEPTH } from '../src/common/http/json-body.middleware.js';
import { createTestApp } from './helpers.js';

@Controller('test-security')
class EchoController {
  @Post('echo')
  echo(@Body() body: unknown) {
    return body;
  }
}

@Module({ controllers: [EchoController] })
class EchoModule {}

const nested = (depth: number) => '['.repeat(depth) + ']'.repeat(depth);

describe('security baseline (HTTP)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp('postgresql://u:p@127.0.0.1:1/none', [EchoModule]);
  });

  afterAll(() => app.close());

  it('sends security headers on API responses (NFR-SECURITY-015)', async () => {
    const res = await api().get('/api/v1/health/live').expect(200);
    expect(res.headers['content-security-policy']).toBe(
      "default-src 'none';frame-ancestors 'none'",
    );
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-ratelimit-limit']).toBeUndefined(); // only Retry-After, on 429
    expect(res.headers['strict-transport-security']).toBeUndefined(); // production only
  });

  it('allows configured web origins with credentials (NFR-SECURITY-027)', async () => {
    const res = await api().get('/api/v1/health/live').set('Origin', 'http://localhost:3210');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3210');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('gives unknown origins no CORS headers, so browsers block them', async () => {
    const res = await api().get('/api/v1/health/live').set('Origin', 'https://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('answers preflights for allowed origins only', async () => {
    const ok = await api()
      .options('/api/v1/test-security/echo')
      .set('Origin', 'http://localhost:3210')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204);
    expect(ok.headers['access-control-allow-methods']).toContain('POST');
    const evil = await api()
      .options('/api/v1/test-security/echo')
      .set('Origin', 'https://evil.example')
      .set('Access-Control-Request-Method', 'POST');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });

  it(`rejects JSON nested deeper than ${JSON_MAX_DEPTH} levels`, async () => {
    await api()
      .post('/api/v1/test-security/echo')
      .set('Content-Type', 'application/json')
      .send(nested(JSON_MAX_DEPTH))
      .expect(201);
    const res = await api()
      .post('/api/v1/test-security/echo')
      .set('Content-Type', 'application/json')
      .send(nested(JSON_MAX_DEPTH + 1))
      .expect(400);
    expect(res.body).toMatchObject({
      code: 'VALIDATION_FAILED',
      errors: [{ code: 'max_depth', params: { max: JSON_MAX_DEPTH } }],
    });
  });

  it('does not count brackets inside strings toward depth', async () => {
    const body = JSON.stringify({ s: '['.repeat(100) + '\\"' + '{'.repeat(100) });
    await api()
      .post('/api/v1/test-security/echo')
      .set('Content-Type', 'application/json')
      .send(body)
      .expect(201);
  });

  it('never throttles health probes', async () => {
    for (let i = 0; i < 320; i++) await api().get('/api/v1/health/live').expect(200);
  });

  // Runs last: it exhausts the write tier for this app instance.
  it('limits writes to 120/min and answers 429 RATE_LIMITED with Retry-After', async () => {
    let last = await api().post('/api/v1/test-security/echo').send({ n: 0 });
    for (let i = 1; i <= 120 && last.status !== 429; i++) {
      last = await api().post('/api/v1/test-security/echo').send({ n: i });
    }
    expect(last.status).toBe(429);
    expect(Number(last.headers['retry-after'])).toBeGreaterThan(0);
    expect(last.headers['retry-after-write']).toBeUndefined();
    expect(last.body).toMatchObject({ code: 'RATE_LIMITED', retryAfterSec: expect.any(Number) });
  });
});

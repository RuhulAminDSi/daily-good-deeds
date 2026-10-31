// "Errors reach Sentry with release + request id" (T-P2-PLAT-009), verified without a Sentry
// account: the real reporter, with a transport that captures envelopes instead of sending them.
import { Controller, Get, type INestApplication, Module } from '@nestjs/common';
import { createTransport, type NodeOptions } from '@sentry/node';
import request from 'supertest';
import { createErrorReporter, ErrorReporter } from '../src/common/observability/error-reporter.js';
import { loadConfig } from '../src/config/env.js';
import { createTestApp } from './helpers.js';

@Controller('test-observability')
class CrashController {
  @Get('crash')
  crash() {
    throw new Error('connect postgresql://owner:s3cret@db.example/dgd failed for asha@example.com');
  }
}

@Module({ controllers: [CrashController] })
class CrashModule {}

const UNREACHABLE_DB = 'postgresql://u:p@127.0.0.1:1/none';

describe('error reporting', () => {
  const envelopes: string[] = [];
  const capture: NodeOptions['transport'] = (options) =>
    createTransport(options, async (req) => {
      envelopes.push(typeof req.body === 'string' ? req.body : new TextDecoder().decode(req.body));
      return { statusCode: 200 };
    });
  let app: INestApplication;
  let reporter: Awaited<ReturnType<typeof createErrorReporter>>;

  beforeAll(async () => {
    reporter = await createErrorReporter(
      loadConfig({
        NODE_ENV: 'test',
        DATABASE_URL: UNREACHABLE_DB,
        SENTRY_DSN: 'https://public@o0.ingest.sentry.io/0',
        APP_RELEASE: 'abc1234',
      }),
      capture,
    );
    app = await createTestApp(UNREACHABLE_DB, [CrashModule], {
      overrides: [[ErrorReporter, reporter]],
    });
  });

  afterAll(() => app.close());

  it('reports a 500 with release and request id, and scrubs secrets', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/test-observability/crash')
      .expect(500);
    await reporter.close(); // flush

    const event = envelopes
      .flatMap((e) => e.split('\n'))
      .map((line) => JSON.parse(line) as Record<string, unknown>)
      .find((item) => 'exception' in item) as {
      release: string;
      environment: string;
      tags: Record<string, string>;
      exception: { values: { value: string }[] };
    };
    expect(event.release).toBe('abc1234');
    expect(event.environment).toBe('test');
    expect(event.tags.requestId).toBe(res.headers['x-request-id']);
    const sent = JSON.stringify(event);
    expect(sent).not.toContain('s3cret');
    expect(sent).not.toContain('asha@');
    expect(event.exception.values[0]?.value).toContain('postgresql://[REDACTED]@db.example');
  });

  it('is a no-op without SENTRY_DSN', async () => {
    const noop = await createErrorReporter(
      loadConfig({ NODE_ENV: 'test', DATABASE_URL: UNREACHABLE_DB }),
    );
    expect(() => noop.report(new Error('x'))).not.toThrow();
  });
});

import { Writable } from 'node:stream';
import { pino, type LoggerOptions } from 'pino';
import { loadConfig } from '../../config/env.js';
import { loggerOptions } from './logger.options.js';

describe('log redaction', () => {
  it('removes credentials and personal data using the production redact config', () => {
    const { redact } = loggerOptions(
      loadConfig({ NODE_ENV: 'test', DATABASE_URL: 'postgresql://u:p@localhost/x' }),
    ).pinoHttp as LoggerOptions;
    const lines: string[] = [];
    const stream = new Writable({
      write(chunk, _enc, done) {
        lines.push(String(chunk));
        done();
      },
    });
    pino({ redact }, stream).info({
      req: { headers: { authorization: 'Bearer secret', cookie: '__Host-dgd_session=abc' } },
      body: { email: 'user@example.com', password: 'hunter2', token: 't0k' },
    });

    const out = lines.join('');
    for (const secret of [
      'Bearer secret',
      'dgd_session=abc',
      'user@example.com',
      'hunter2',
      't0k',
    ]) {
      expect(out).not.toContain(secret);
    }
    expect(out).toContain('[REDACTED]');
  });
});

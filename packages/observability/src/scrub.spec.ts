import { REDACTED, scrubEvent, scrubString } from './scrub.js';

// Shaped like a Sentry error event from an HTTP request.
const event = {
  message: 'Login failed for asha.rahman@example.com',
  release: 'abc123',
  tags: { requestId: '0192f1c4-6b1e-7d2a-9a51-3f0b6c2f1a10' },
  request: {
    url: 'https://api.example.com/api/v1/auth/login',
    method: 'POST',
    headers: {
      authorization: 'Bearer secret',
      cookie: '__Host-dgd_session=abc',
      'user-agent': 'x',
    },
    cookies: { __Host_dgd_session: 'abc' },
    data: { email: 'asha.rahman@example.com', password: 'hunter2' },
  },
  extra: {
    journalBody: 'Today I felt…',
    nested: [{ apiKey: 'k', note: 'contact me at someone@mail.bd' }],
  },
  exception: { values: [{ type: 'Error', value: 'Token expired for user@example.org' }] },
};

describe('scrubEvent (NFR-PRIVACY-010)', () => {
  const out = scrubEvent(event);
  const text = JSON.stringify(out);

  it('removes every secret and private value', () => {
    for (const secret of [
      'Bearer secret',
      'dgd_session=abc',
      'hunter2',
      'asha.rahman',
      'Today I felt',
      '"k"',
      'someone@',
      'user@',
    ]) {
      expect(text).not.toContain(secret);
    }
  });

  it('drops request bodies and cookies entirely', () => {
    expect(out.request).not.toHaveProperty('data');
    expect(out.request).not.toHaveProperty('cookies');
    expect(out.request.headers.authorization).toBe(REDACTED);
  });

  it('keeps what debugging needs: release, request id, route, error type, email domains', () => {
    expect(out.release).toBe('abc123');
    expect(out.tags.requestId).toBe(event.tags.requestId);
    expect(out.request.url).toBe(event.request.url);
    expect(out.request.headers['user-agent']).toBe('x');
    expect(out.exception.values[0]?.type).toBe('Error');
    expect(out.message).toBe('Login failed for [REDACTED]@example.com');
  });

  it('does not mutate the input and survives cycles', () => {
    expect(event.request.data.password).toBe('hunter2');
    const cyclic: Record<string, unknown> = { a: 1 };
    cyclic.self = cyclic;
    expect(scrubEvent(cyclic)).toEqual({ a: 1, self: '[Circular]' });
  });

  it('removes credentials from URLs inside strings', () => {
    expect(scrubString('connect postgresql://neondb_owner:s3cret@ep-x.neon.tech/dgd failed')).toBe(
      'connect postgresql://[REDACTED]@ep-x.neon.tech/dgd failed',
    );
  });

  it('scrubs emails inside plain strings', () => {
    expect(scrubString('mail a@b.co and c.d@e.com.bd')).toBe(
      'mail [REDACTED]@b.co and [REDACTED]@e.com.bd',
    );
  });

  it('redacts secret query parameters inside strings', () => {
    expect(
      scrubString('GET /en/reset?token=abc123&lang=bn then /auth/callback?code=xyz&state=s#top'),
    ).toBe(
      'GET /en/reset?token=[REDACTED]&lang=bn then /auth/callback?code=[REDACTED]&state=s#top',
    );
    expect(scrubString('/x?api_key=k1&sessionId=s1&codeword=keep')).toBe(
      '/x?api_key=[REDACTED]&sessionId=[REDACTED]&codeword=keep',
    );
  });
});

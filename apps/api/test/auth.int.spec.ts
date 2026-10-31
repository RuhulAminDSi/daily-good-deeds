// T-P2-AUTH-002 registration against the Neon `test` branch, with the Pwned Passwords API and the
// registration side effects replaced by test doubles.
import { createHash, randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TERMS_VERSION } from '@dgd/contracts';
import { PWNED_FETCH } from '../src/auth/breached-passwords.js';
import { RegistrationEvents } from '../src/auth/registration-events.js';
import { createPrismaClient } from '../src/database/prisma-client.js';
import { createTestApp, testDatabaseConfigured } from './helpers.js';

const BREACHED = 'password1234';
const sha1 = (s: string) => createHash('sha1').update(s).digest('hex').toUpperCase();

/** Pwned Passwords range API: knows BREACHED (plus a padding line), or is down. */
let pwnedDown = false;
const pwned = vi.fn(async (url: string | URL | Request, _init?: RequestInit) => {
  if (pwnedDown) throw new Error('getaddrinfo ENOTFOUND api.pwnedpasswords.com');
  const prefix = String(url).slice(-5);
  const hit = sha1(BREACHED);
  const lines = [`${'0'.repeat(35)}:0`];
  if (hit.startsWith(prefix)) lines.push(`${hit.slice(5)}:24230577`);
  return new Response(lines.join('\r\n'));
});

const events = { accountCreated: vi.fn(), emailAlreadyRegistered: vi.fn() };

// The register route allows 5 requests per IP per hour; this file sends exactly 5.
describe.skipIf(!testDatabaseConfigured())('POST /auth/register (integration)', () => {
  const prisma = createPrismaClient(process.env.TEST_DATABASE_URL!, 1);
  const emails: string[] = [];
  let app: INestApplication;

  const body = (overrides: object = {}) => {
    const email = `reg-${randomUUID()}@example.test`;
    emails.push(email);
    return {
      email,
      password: 'a long enough passphrase',
      displayName: 'Amina',
      locale: 'bn',
      timezone: 'Asia/Dhaka',
      acceptTermsVersion: TERMS_VERSION,
      ...overrides,
    };
  };
  const register = (payload: object) =>
    request(app.getHttpServer()).post('/api/v1/auth/register').send(payload);

  beforeAll(async () => {
    app = await createTestApp(process.env.TEST_DATABASE_URL!, [], {
      overrides: [
        [PWNED_FETCH, pwned],
        [RegistrationEvents, events],
      ],
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    pwnedDown = false;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
    await prisma.$disconnect();
    await app.close();
  });

  it('creates the account: normalized email, Argon2id hash, preferences, accepted terms', async () => {
    const payload = body({ email: `  Reg-${randomUUID()}@Example.TEST ` });
    const email = payload.email.trim().toLowerCase();
    emails.push(email);
    const res = await register(payload).expect(202);
    expect(res.body).toEqual({ status: 'check_email' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { preferences: true },
    });
    expect(user?.passwordHash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(user).toMatchObject({ termsVersion: TERMS_VERSION, emailVerifiedAt: null });
    expect(user?.preferences).toMatchObject({ locale: 'bn', timezone: 'Asia/Dhaka' });
    expect(events.accountCreated).toHaveBeenCalledWith(user?.id);

    // k-anonymity: only a 5-character SHA-1 prefix leaves the server, with padding requested.
    const [url, init] = pwned.mock.calls[0]!;
    expect(String(url)).toBe(
      `https://api.pwnedpasswords.com/range/${sha1(payload.password).slice(0, 5)}`,
    );
    expect(init).toMatchObject({ headers: { 'Add-Padding': 'true' } });
  });

  it('answers an existing email exactly like a new one, and tells the owner instead', async () => {
    const payload = body();
    await register(payload).expect(202);
    vi.clearAllMocks();

    const again = await register({ ...payload, email: payload.email.toUpperCase() }).expect(202);
    expect(again.body).toEqual({ status: 'check_email' });
    expect(await prisma.user.count({ where: { email: payload.email } })).toBe(1);
    expect(events.accountCreated).not.toHaveBeenCalled();
    expect(events.emailAlreadyRegistered).toHaveBeenCalledOnce();
  });

  it('rejects a breached password with PASSWORD_TOO_WEAK on the password field', async () => {
    const payload = body({ password: BREACHED });
    const res = await register(payload).expect(422);
    expect(res.body).toMatchObject({
      code: 'PASSWORD_TOO_WEAK',
      errors: [{ pointer: '/password', code: 'password_breached' }],
    });
    expect(await prisma.user.count({ where: { email: payload.email } })).toBe(0);
  });

  it('fails open when the breach check is unavailable: the account is created', async () => {
    pwnedDown = true;
    const payload = body({ password: BREACHED });
    await register(payload).expect(202);
    expect(await prisma.user.count({ where: { email: payload.email } })).toBe(1);
  });
});

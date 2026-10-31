// Post-deploy smoke test (T-P2-PLAT-010): the deployed web app and API answer, talk to each other,
// and send the security headers. Rendering details are covered by the web E2E suite; this checks
// the deployment (real API and database, public URL).
import { readFileSync } from 'node:fs';

const en = JSON.parse(
  readFileSync(new URL('../../apps/web/src/i18n/messages/en.json', import.meta.url), 'utf8'),
);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function get(url, init) {
  const res = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(15_000),
    ...init,
  });
  return { res, text: await res.text() };
}

const expect = (ok, message) => {
  if (!ok) throw new Error(message);
};

/** @type {[string, (web: string, api: string) => Promise<void>][]} */
const CHECKS = [
  [
    'API is ready (database reachable)',
    async (_web, api) => {
      const { res, text } = await get(`${api}/api/v1/health/ready`);
      expect(res.status === 200, `status ${res.status}: ${text.slice(0, 200)}`);
    },
  ],
  [
    'web renders, reaches the API, and sends CSP, request id and security headers',
    async (web) => {
      const { res, text } = await get(`${web}/en`);
      expect(res.status === 200, `/en status ${res.status}`);
      expect(text.includes(en.app.name), '/en has no app name');
      expect(text.includes(en.status.ok), '/en does not report the API as working');
      expect(
        /'nonce-[^']+'/.test(res.headers.get('content-security-policy') ?? ''),
        'no nonce CSP',
      );
      expect(UUID.test(res.headers.get('x-request-id') ?? ''), 'no X-Request-Id');
      expect(res.headers.get('x-content-type-options') === 'nosniff', 'no nosniff');
    },
  ],
  [
    'Bengali renders and locale-less URLs redirect',
    async (web) => {
      const bn = await get(`${web}/bn`);
      expect(bn.res.status === 200 && bn.text.includes('lang="bn"'), '/bn failed');
      const { res } = await get(`${web}/`, { headers: { 'accept-language': 'bn' } });
      const location = res.headers.get('location');
      expect(res.status >= 300 && res.status < 400 && location?.endsWith('/bn'), `/ → ${location}`);
    },
  ],
  [
    'CSP report endpoint accepts reports',
    async (web) => {
      const { res } = await get(`${web}/api/csp-report`, {
        method: 'POST',
        headers: { 'content-type': 'application/csp-report' },
        body: JSON.stringify({
          'csp-report': { 'document-uri': `${web}/en`, 'blocked-uri': 'inline' },
        }),
      });
      expect(res.status === 204, `status ${res.status}`);
    },
  ],
];

/** Runs every check (in parallel) and prints one line each; true when all passed. */
export async function smoke(web, api) {
  const results = await Promise.allSettled(CHECKS.map(([, check]) => check(web, api)));
  results.forEach((result, i) => {
    const name = CHECKS[i][0];
    if (result.status === 'fulfilled') console.log(`  ok   ${name}`);
    else console.log(`  FAIL ${name}: ${result.reason?.message ?? result.reason}`);
  });
  return results.every((r) => r.status === 'fulfilled');
}

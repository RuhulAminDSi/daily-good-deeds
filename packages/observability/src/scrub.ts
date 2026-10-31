/**
 * Privacy scrubbing for anything that leaves the process for error tracking or logs
 * (NFR-PRIVACY-010). Works on plain objects, so it serves Sentry events from the API, worker and
 * web alike, and the API's log serializers.
 *
 * - Values under sensitive keys (`SENSITIVE_FIELDS`, matched as substrings) are replaced, at any
 *   depth.
 * - Event request bodies and cookies are dropped entirely: request payloads may hold private content.
 * - Email addresses inside any string keep only their domain (`[REDACTED]@example.com`), which is
 *   stricter than hashing the local part and still shows the provider.
 * - Credentials in URLs inside any string (e.g. a DB connection string in an error message) are
 *   removed: `postgresql://user:pw@host` → `postgresql://[REDACTED]@host`.
 * - Secret query parameters inside any string (reset links, OAuth callbacks) keep only their name:
 *   `/reset?token=abc` → `/reset?token=[REDACTED]`.
 */
export const REDACTED = '[REDACTED]';

/**
 * The single list of secret or private field names, for error reports and logs alike (the API's
 * pino `redact` paths are derived from it). Add new secret-bearing fields here.
 */
export const SENSITIVE_FIELDS = [
  'password',
  'newPassword',
  'currentPassword',
  'token',
  'secret',
  'totp',
  'apiKey',
  'api_key',
  'signature',
  'authorization',
  'cookie',
  'session',
  'journal',
  'body',
  'email',
] as const;

const SENSITIVE_KEY = new RegExp(SENSITIVE_FIELDS.join('|'), 'i');
const URL_CREDENTIALS = /([a-z][a-z0-9+.-]*:\/\/)[^\s/@]+@/gi;
const EMAIL = /[A-Z0-9._%+-]+@([A-Z0-9-]+(?:\.[A-Z0-9-]+)+)/gi;
const SECRET_QUERY_PARAM =
  /([?&](?:[^=&#\s]*(?:token|secret|pass|key|signature|session)[^=&#\s]*|code)=)[^&#\s]*/gi;

export const scrubString = (value: string): string =>
  value
    .replace(URL_CREDENTIALS, `$1${REDACTED}@`)
    .replace(EMAIL, `${REDACTED}@$1`)
    .replace(SECRET_QUERY_PARAM, `$1${REDACTED}`);

function scrubValue(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === 'string') return scrubString(value);
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[Circular]';
  seen.add(value);
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, seen));
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    out[key] =
      SENSITIVE_KEY.test(key) && v !== null && v !== undefined ? REDACTED : scrubValue(v, seen);
  }
  return out;
}

/** Returns a scrubbed deep copy; use as Sentry's `beforeSend` and as a pino serializer. */
export function scrubEvent<T extends object>(event: T): T {
  const out = scrubValue(event, new WeakSet()) as { request?: Record<string, unknown> };
  if (out.request && typeof out.request === 'object') {
    delete out.request.data;
    delete out.request.cookies;
  }
  return out as T;
}

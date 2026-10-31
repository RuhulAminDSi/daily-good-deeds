// CSP violation reports (src/proxy.ts): logged, not stored. Unauthenticated by nature, so input is
// size-capped and reduced to the fields that identify a violation.

const MAX_BYTES = 16 * 1024;

/** Reads the body up to `max` bytes; undefined when it is larger. */
async function readLimited(req: Request, max: number): Promise<string | undefined> {
  const reader = req.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return undefined;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

type Fields = Record<string, unknown>;
const str = (value: unknown) => (typeof value === 'string' ? value : undefined);

/** Origin and path only: queries may hold tokens, and the path is enough to find the cause. */
function location(value: unknown): string | undefined {
  const raw = str(value);
  if (!raw || !URL.canParse(raw)) return raw?.slice(0, 32); // keywords: `inline`, `eval`…
  const url = new URL(raw);
  return url.origin === 'null' ? url.protocol : `${url.origin}${url.pathname}`;
}

/** Field names per format: `application/reports+json` (report-to) / `application/csp-report`. */
const FIELDS = {
  document: ['documentURL', 'document-uri'],
  blocked: ['blockedURL', 'blocked-uri'],
  directive: ['effectiveDirective', 'effective-directive'],
  disposition: ['disposition', 'disposition'],
  source: ['sourceFile', 'source-file'],
  line: ['lineNumber', 'line-number'],
} as const;
const URL_FIELDS = new Set(['document', 'blocked', 'source']);

/** The violation bodies in either format. */
function reports(payload: unknown): { format: 0 | 1; body: Fields }[] {
  if (Array.isArray(payload)) {
    return (payload as Fields[])
      .filter((r) => r?.type === 'csp-violation' && r.body && typeof r.body === 'object')
      .map((r) => ({ format: 0, body: r.body as Fields }));
  }
  const legacy = (payload as { 'csp-report'?: unknown } | null)?.['csp-report'];
  return legacy && typeof legacy === 'object' ? [{ format: 1, body: legacy as Fields }] : [];
}

function summarize({ format, body }: { format: 0 | 1; body: Fields }): Fields {
  return Object.fromEntries(
    Object.entries(FIELDS).map(([name, keys]) => {
      const value = body[keys[format]];
      return [name, URL_FIELDS.has(name) ? location(value) : name === 'line' ? value : str(value)];
    }),
  );
}

export async function POST(req: Request): Promise<Response> {
  const body = await readLimited(req, MAX_BYTES);
  if (body === undefined) return new Response(null, { status: 413 });
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response(null, { status: 400 });
  }
  for (const csp of reports(payload).map(summarize)) {
    // Same shape as the API's pino lines (docs/architecture/OBSERVABILITY.md); 40 = warn.
    console.warn(JSON.stringify({ level: 40, time: Date.now(), msg: 'csp violation', csp }));
  }
  return new Response(null, { status: 204 });
}

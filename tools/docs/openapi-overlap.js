// DL-037: the hand-written docs/api/openapi.yaml is a design draft for endpoints that are not
// implemented yet; implemented endpoints are defined by the code-generated contract. A path must
// not be in both, or reviewers cannot tell which one is binding.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { DOCS, ROOT } from './lib.js';

const GENERATED = path.join(ROOT, 'packages/api-client/openapi.json');
const PREFIX = '/api/v1';

export function checkOpenApiOverlap() {
  const draft = parse(fs.readFileSync(path.join(DOCS, 'api/openapi.yaml'), 'utf8'));
  const implemented = JSON.parse(fs.readFileSync(GENERATED, 'utf8'));
  const draftPaths = new Set(Object.keys(draft.paths ?? {}));
  return Object.keys(implemented.paths ?? {})
    .map((p) => (p.startsWith(PREFIX) ? p.slice(PREFIX.length) : p))
    .filter((p) => draftPaths.has(p))
    .map((p) => `implemented endpoint ${p} is still in docs/api/openapi.yaml (remove it; DL-037)`);
}

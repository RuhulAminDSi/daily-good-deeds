// Shared parsing and helpers for the doc generators. Each source is parsed in exactly one place.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { T } from './tasks.js';

export { T };
export const TOOLS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(TOOLS_DIR, '../..');
export const DOCS = path.join(ROOT, 'docs');

/** Reads a file relative to docs/ (or an absolute path), normalizing CRLF. Missing files throw. */
export const read = (file) =>
  fs
    .readFileSync(path.isAbsolute(file) ? file : path.join(DOCS, file), 'utf8')
    .replace(/\r\n/g, '\n');

export const esc = (s) => String(s).replace(/\|/g, '\\|');
export const phaseOf = (taskId) => Number(taskId.match(/^T-P(\d+)/)[1]);
export const modOf = (taskId) => taskId.split('-')[2];
export const byPhase = (tasks) => {
  const m = new Map();
  for (const t of tasks) {
    const p = phaseOf(t.id);
    if (!m.has(p)) m.set(p, []);
    m.get(p).push(t);
  }
  return m;
};

/** Feature registry rows in document order: { id, name, pri, phase, inScope }. */
export const loadFeatures = () =>
  [
    ...read('product/FEATURE_ID_REGISTRY.md').matchAll(
      /^\| (F-[A-Z0-9]+-\d{3}) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm,
    ),
  ].map(([, id, name, pri, phase]) => ({
    id,
    name: name.trim(),
    pri: pri.trim().split(' ')[0],
    phase: phase.trim(),
    inScope: !pri.trim().startsWith('W'),
  }));

/** SRS requirements. FRs are mapped to features by the SRS "Feature" column. */
export const loadSrs = () => {
  const frByFeature = new Map();
  const nfr = new Set();
  for (const [, fr, feature] of read('specifications/SRS.md').matchAll(
    /^\| (FR-[A-Z0-9]+-\d{3}-\d{2}) \|.*?\| (F-[A-Z0-9]+-\d{3}) \|/gm,
  )) {
    if (!frByFeature.has(feature)) frByFeature.set(feature, []);
    frByFeature.get(feature).push(fr);
  }
  for (const [, id] of read('specifications/SRS.md').matchAll(/^\| (NFR-[A-Z]+-\d{3}) \|/gm))
    nfr.add(id);
  return { frByFeature, nfr };
};

/**
 * Allocates test-case IDs: sequential per feature (or per task key for tasks without features),
 * in task order. Returns Map<taskId, [{ id, feature }]>. Adding tasks at the end never renumbers.
 */
export const allocateTestCases = (tasks) => {
  const counters = new Map();
  const result = new Map();
  for (const t of tasks) {
    const keys = t.f.length ? t.f : [`${modOf(t.id)}-${t.id.split('-')[3]}`];
    result.set(
      t.id,
      keys.map((k) => {
        const base = k.startsWith('F-') ? k.slice(2) : k;
        const n = (counters.get(base) ?? 0) + 1;
        counters.set(base, n);
        return {
          id: `TC-${base}-${String(n).padStart(2, '0')}`,
          feature: k.startsWith('F-') ? k : null,
        };
      }),
    );
  }
  return result;
};

/** Task statuses from task-status.json; every key must name an existing task. */
export const loadStatus = (tasks) => {
  const status = JSON.parse(fs.readFileSync(path.join(TOOLS_DIR, 'task-status.json'), 'utf8'));
  const ids = new Set(tasks.map((t) => t.id));
  const unknown = Object.keys(status).filter((id) => !ids.has(id));
  if (unknown.length)
    throw new Error(`task-status.json has unknown task IDs: ${unknown.join(', ')}`);
  return (taskId) => status[taskId] ?? 'Not started';
};

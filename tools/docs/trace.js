// Renders docs/qa/TRACEABILITY_MATRIX.md and returns integrity problems (gaps, unknown/duplicate IDs).
import fs from 'node:fs';
import { DOCS, T, read } from './lib.js';

// Generated files are derived from the sources below, so scanning them adds no signal.
const GENERATED = new Set([
  'implementation/IMPLEMENTATION_MASTER_PLAN.md',
  'implementation/MASTER_TASK_TRACKER.md',
  'qa/TEST_PLAN.md',
  'qa/TRACEABILITY_MATRIX.md',
]);

// Story/AC IDs embed their feature: US-DEED-004-01 -> F-DEED-004.
const groupByFeature = (text, re) => {
  const m = new Map();
  for (const id of new Set(text.match(re) ?? [])) {
    const f = `F-${id.replace(/^[A-Z]+-/, '').replace(/-\d{2}$/, '')}`;
    if (!m.has(f)) m.set(f, []);
    m.get(f).push(id);
  }
  return m;
};

const duplicates = (text, re) => {
  const seen = new Map();
  for (const [, id] of text.matchAll(re)) seen.set(id, (seen.get(id) ?? 0) + 1);
  return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
};

export function renderTrace({ features, srs, tcs }) {
  const issues = [];
  const srsText = read('specifications/SRS.md');
  const stories = read('product/USER_STORIES.md');
  const US = groupByFeature(stories, /US-[A-Z0-9]+-\d{3}-\d{2}/g);
  const AC = groupByFeature(read('product/ACCEPTANCE_CRITERIA.md'), /AC-[A-Z0-9]+-\d{3}-\d{2}/g);
  for (const id of duplicates(srsText, /^\| (FR-[A-Z0-9]+-\d{3}-\d{2}) \|/gm))
    issues.push(`duplicate FR ${id}`);
  for (const id of duplicates(srsText, /^\| (NFR-[A-Z]+-\d{3}) \|/gm))
    issues.push(`duplicate NFR ${id}`);
  for (const id of duplicates(stories, /^\| (US-[A-Z0-9]+-\d{3}-\d{2}) \|/gm))
    issues.push(`duplicate US ${id}`);

  const tasksByFeature = new Map();
  const tcByFeature = new Map();
  for (const t of T) {
    for (const f of t.f) {
      if (!tasksByFeature.has(f)) tasksByFeature.set(f, []);
      tasksByFeature.get(f).push(t.id);
    }
    for (const tc of tcs.get(t.id)) {
      if (!tc.feature) continue;
      if (!tcByFeature.has(tc.feature)) tcByFeature.set(tc.feature, []);
      tcByFeature.get(tc.feature).push(tc.id);
    }
  }

  const pagesByFeature = new Map();
  for (const sec of read('design/PAGE_SPECIFICATIONS.md').split(/^### /m).slice(1)) {
    const pid = sec.match(/^PG-\d{3}/)?.[0];
    if (!pid) continue;
    for (const f of new Set(sec.match(/F-[A-Z0-9]+-\d{3}/g) ?? [])) {
      if (!pagesByFeature.has(f)) pagesByFeature.set(f, []);
      pagesByFeature.get(f).push(pid);
    }
  }

  const known = new Set(features.map((f) => f.id));
  for (const file of fs.readdirSync(DOCS, { recursive: true })) {
    const rel = file.replaceAll('\\', '/');
    if (!/\.(md|ya?ml)$/.test(rel) || GENERATED.has(rel)) continue;
    for (const id of new Set(read(rel).match(/\bF-[A-Z0-9]+-\d{3}\b/g) ?? [])) {
      if (!known.has(id)) issues.push(`unknown feature ${id} in ${rel}`);
    }
  }

  const list = (a) => (a?.length ? [...a].sort().join(', ') : '—');
  const count = (m) => [...m.values()].reduce((n, a) => n + a.length, 0);
  const gaps = [];
  let complete = 0;
  let rows = '';
  for (const mod of [...new Set(features.map((f) => f.id.split('-')[1]))]) {
    rows += `\n## ${mod}\n\n| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |\n|---|---|---|---|---|---|---|---|---|\n`;
    for (const f of features.filter((x) => x.id.split('-')[1] === mod)) {
      if (f.inScope) {
        const missing = [
          !srs.frByFeature.has(f.id) && 'FR',
          !US.has(f.id) && 'US',
          !tasksByFeature.has(f.id) && 'Task',
          !tcByFeature.has(f.id) && 'TC',
        ].filter(Boolean);
        if (missing.length) gaps.push(`${f.id}: missing ${missing.join(', ')}`);
        else complete++;
      }
      rows += `| **${f.id}** ${f.name} | ${f.pri} | ${f.phase} | ${list(srs.frByFeature.get(f.id))} | ${list(US.get(f.id))} | ${list(AC.get(f.id))} | ${f.inScope ? list(tasksByFeature.get(f.id)) : 'out of scope'} | ${f.inScope ? list(tcByFeature.get(f.id)) : '—'} | ${list(pagesByFeature.get(f.id))} |\n`;
    }
  }

  const inScope = features.filter((f) => f.inScope).length;
  const summary = {
    features: features.length,
    inScope,
    complete,
    FR: count(srs.frByFeature),
    US: count(US),
    AC: count(AC),
    TC: count(tcByFeature),
  };
  let out = `# Traceability Matrix\n\n> **Generated** by \`pnpm docs:gen\` (tools/docs) from FEATURE_ID_REGISTRY, SRS, USER_STORIES, ACCEPTANCE_CRITERIA, tools/docs/tasks.js and PAGE_SPECIFICATIONS. Do not edit by hand.\n>\n> Chain: **Feature → Requirement (FR) → User story (US) → Acceptance criterion (AC) → Task (T) → Test case (TC)**, plus the UI page (PG).\n\n`;
  out += `## Coverage summary\n\n| Metric | Value |\n|---|---|\n| Features (registry) | ${summary.features} |\n| In-scope features (excluding Won't) | ${inScope} |\n| In-scope features with FR + US + Task + TC | ${complete} |\n| Functional requirements | ${summary.FR} |\n| User stories | ${summary.US} |\n| Acceptance criteria | ${summary.AC} |\n| Test cases (feature-linked) | ${summary.TC} |\n| Features linked to pages | ${pagesByFeature.size} |\n\n`;
  out += gaps.length
    ? `### Gaps\n\n${gaps.map((g) => `- ${g}`).join('\n')}\n`
    : `### Gaps\n\nNone. Every in-scope feature has at least one FR, user story, task and test case.\n`;
  out += `\nAcceptance criteria are required for all Must features and selected Should features (see ACCEPTANCE_CRITERIA.md); a missing AC on a Should/Could feature is not a gap.\n`;
  const mustWithoutAc = features.filter((f) => f.pri === 'M' && !AC.has(f.id)).map((f) => f.id);
  if (mustWithoutAc.length) issues.push(`Must features without AC: ${mustWithoutAc.join(', ')}`);

  return {
    files: { 'qa/TRACEABILITY_MATRIX.md': out + rows },
    summary,
    problems: [...gaps, ...issues],
  };
}

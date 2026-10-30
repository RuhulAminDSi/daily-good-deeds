// Renders IMPLEMENTATION_MASTER_PLAN.md and MASTER_TASK_TRACKER.md from tasks.js.
import path from 'node:path';
import { T, TOOLS_DIR, byPhase, esc, modOf, read } from './lib.js';

export function renderPlan({ features, tcs, statusOf }) {
  const featureIds = new Set(features.map((f) => f.id));
  const errs = [];
  const seen = new Set();
  const covered = new Map();
  for (const t of T) {
    if (seen.has(t.id)) errs.push(`duplicate task ${t.id}`);
    seen.add(t.id);
    if (!/^T-P\d+-[A-Z0-9]+-\d{3}$/.test(t.id)) errs.push(`bad task id ${t.id}`);
    for (const f of t.f) {
      if (!featureIds.has(f)) errs.push(`${t.id} references unknown ${f}`);
      if (!covered.has(f)) covered.set(f, []);
      covered.get(f).push(t.id);
    }
  }
  const inScope = features.filter((f) => f.inScope);
  const outOfScope = features.filter((f) => !f.inScope);
  const uncovered = inScope.filter((f) => !covered.has(f.id)).map((f) => f.id);
  if (uncovered.length) errs.push(`features without tasks: ${uncovered.join(', ')}`);
  if (errs.length) throw new Error(errs.join('\n'));

  const phases = byPhase(T);
  const subCount = T.reduce((n, t) => n + t.subs.length, 0);
  const subIds = (t) => t.subs.map((_, i) => `${t.id}.${i + 1}`);

  const planTable = (p) => {
    let out =
      '| Task | Title | Features | Size | Subtasks | Definition of Done |\n|---|---|---|---|---|---|\n';
    for (const t of phases.get(p) ?? []) {
      const subs = t.subs.map((s, i) => `.${i + 1} ${esc(s)}`).join('<br>') || '—';
      out += `| ${t.id} | ${esc(t.title)} | ${t.f.join(', ') || '—'} | ${t.c} | ${subs} | ${esc(t.dod)} |\n`;
    }
    return out;
  };
  const plan = read(path.join(TOOLS_DIR, 'plan.tpl.md'))
    .replace(/\{\{TASKS:P(\d+)\}\}/g, (_, p) => planTable(Number(p)))
    .replace('{{TASK_COUNT}}', T.length)
    .replace('{{SUBTASK_COUNT}}', subCount);

  let tracker = `# Master Task Tracker

> Generated from the same task dataset as the task tables in [IMPLEMENTATION_MASTER_PLAN.md](IMPLEMENTATION_MASTER_PLAN.md). Hierarchy: **Epic → Feature → Task → Subtask → Test case**. Feature IDs come from [FEATURE_ID_REGISTRY.md](../product/FEATURE_ID_REGISTRY.md).
>
> Test case IDs here are **placeholders**, allocated in sequence per feature. [qa/TEST_PLAN.md](../qa/TEST_PLAN.md) defines their steps. Update **Status** as work moves (Not started → In progress → In review → Done → Verified). A task is marked Done only when its Definition of Done in the master plan is met, including tests. A UI that exists without its backend and tests does **not** count as Done.

**Totals:** ${T.length} tasks · ${subCount} subtasks · ${inScope.length} in-scope features (P2–P10) covered · ${outOfScope.length} Won't-Have features deliberately unmapped (${outOfScope.map((f) => f.id).join(', ')}).

`;
  for (const [p, rows] of [...phases].sort(([a], [b]) => a - b)) {
    tracker += `## Phase ${p}\n\n| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |\n|---|---|---|---|---|---|---|---|\n`;
    for (const t of rows) {
      const tcIds = tcs.get(t.id).map((tc) => tc.id);
      tracker += `| EP-${modOf(t.id)} | ${t.f.join(', ') || '—'} | ${t.id} | ${esc(t.title)} | ${subIds(t).join(', ') || '—'} | ${tcIds.join(', ')} | ${statusOf(t.id)} | P${p} |\n`;
    }
    tracker += '\n';
  }
  tracker += `## Feature → task coverage (reverse index)\n\n| Feature | Tasks |\n|---|---|\n`;
  for (const f of features) {
    tracker += `| ${f.id} | ${(covered.get(f.id) ?? ["— (Won't Have in initial release)"]).join(', ')} |\n`;
  }

  return {
    'implementation/IMPLEMENTATION_MASTER_PLAN.md': plan,
    'implementation/MASTER_TASK_TRACKER.md': tracker,
  };
}

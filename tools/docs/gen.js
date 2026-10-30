// Regenerates the planning docs. `--check` writes nothing and fails if any generated file is stale.
import fs from 'node:fs';
import path from 'node:path';
import { DOCS, T, allocateTestCases, loadFeatures, loadSrs, loadStatus, read } from './lib.js';
import { renderPlan } from './plan.js';
import { renderTestPlan } from './test-plan.js';
import { renderTrace } from './trace.js';

const check = process.argv.includes('--check');
const ctx = {
  features: loadFeatures(),
  srs: loadSrs(),
  tcs: allocateTestCases(T),
  statusOf: loadStatus(T),
};
const trace = renderTrace(ctx);
const files = { ...renderPlan(ctx), ...renderTestPlan(ctx), ...trace.files };

const stale = [];
for (const [rel, content] of Object.entries(files)) {
  if (check) {
    if (read(rel) !== content) stale.push(rel);
  } else {
    fs.writeFileSync(path.join(DOCS, rel), content);
  }
}

console.log(JSON.stringify(trace.summary));
const problems = [
  ...trace.problems,
  ...stale.map((rel) => `stale generated file: docs/${rel} (run pnpm docs:gen)`),
];
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}

// Renders docs/qa/TEST_PLAN.md: one row per allocated test case, linked to its FRs (or NFRs for platform tasks).
import path from 'node:path';
import { T, TOOLS_DIR, byPhase, esc, modOf, read } from './lib.js';

// Platform/QA tasks have no feature; they verify these NFRs instead.
const NFR_BY_TASK = {
  'T-P2-PLAT-001': ['NFR-MAINTAINABILITY-001'],
  'T-P2-PLAT-002': [
    'NFR-AVAILABILITY-003',
    'NFR-USABILITY-011',
    'NFR-SECURITY-028',
    'NFR-SECURITY-006',
  ],
  'T-P2-PLAT-003': ['NFR-MAINTAINABILITY-005', 'NFR-BACKUP-001'],
  'T-P2-PLAT-004': ['NFR-AVAILABILITY-004'],
  'T-P2-PLAT-005': ['NFR-USABILITY-013', 'NFR-USABILITY-005'],
  'T-P2-PLAT-006': ['NFR-MAINTAINABILITY-004'],
  'T-P2-PLAT-007': [
    'NFR-SECURITY-022',
    'NFR-SECURITY-023',
    'NFR-SECURITY-024',
    'NFR-MAINTAINABILITY-003',
  ],
  'T-P2-PLAT-008': [
    'NFR-SECURITY-014',
    'NFR-SECURITY-015',
    'NFR-SECURITY-019',
    'NFR-SECURITY-020',
    'NFR-SECURITY-027',
  ],
  'T-P2-PLAT-009': [
    'NFR-OBSERVABILITY-003',
    'NFR-OBSERVABILITY-004',
    'NFR-OBSERVABILITY-005',
    'NFR-PRIVACY-010',
  ],
  'T-P2-PLAT-010': ['NFR-AVAILABILITY-001', 'NFR-AVAILABILITY-006', 'NFR-SECURITY-022'],
  'T-P2-UI-001': ['NFR-ACCESSIBILITY-004'],
  'T-P2-UI-002': ['NFR-ACCESSIBILITY-002', 'NFR-ACCESSIBILITY-003', 'NFR-USABILITY-006'],
  'T-P2-ADMIN-006': ['NFR-AVAILABILITY-006'],
  'T-P2-QA-001': ['NFR-MAINTAINABILITY-003'],
  'T-P10-QA-001': ['NFR-MAINTAINABILITY-003'],
  'T-P10-QA-002': ['NFR-SECURITY-001', 'NFR-SECURITY-007', 'NFR-SECURITY-024', 'NFR-SECURITY-026'],
  'T-P10-QA-003': [
    'NFR-PERFORMANCE-007',
    'NFR-PERFORMANCE-008',
    'NFR-PERFORMANCE-009',
    'NFR-PERFORMANCE-010',
    'NFR-SCALABILITY-001',
  ],
  'T-P10-QA-004': [
    'NFR-ACCESSIBILITY-001',
    'NFR-ACCESSIBILITY-002',
    'NFR-ACCESSIBILITY-007',
    'NFR-ACCESSIBILITY-008',
  ],
  'T-P10-QA-005': [
    'NFR-COMPATIBILITY-001',
    'NFR-COMPATIBILITY-002',
    'NFR-COMPATIBILITY-004',
    'NFR-PERFORMANCE-001',
  ],
  'T-P10-PLAT-001': [
    'NFR-BACKUP-003',
    'NFR-BACKUP-004',
    'NFR-BACKUP-006',
    'NFR-OBSERVABILITY-006',
    'NFR-OBSERVABILITY-007',
  ],
  'T-P10-PLAT-002': ['NFR-LOCALIZATION-002', 'NFR-COMPLIANCE-003'],
};

// QA task level, first matching title pattern wins.
const QA_LEVELS = [
  [/e2e.*performance|performance.*e2e/, 'E2E + Perf'],
  [/privacy/, 'Security + E2E (regression)'],
  [/e2e/, 'E2E (regression)'],
  [/security/, 'Security'],
  [/performance/, 'Perf'],
  [/accessib/, 'a11y + Manual'],
  [/cross-browser/, 'E2E + Manual'],
  [/regression/, 'E2E (regression)'],
];
const MODULE_LEVELS = {
  UI: 'Unit + a11y',
  I18N: 'Unit + E2E',
  PWA: 'E2E',
  AUTH: 'API + E2E',
  RBAC: 'API + Security',
  ADMIN: 'API + E2E',
  INTG: 'Integration',
  CAL: 'Unit + API',
  DEED: 'API + E2E',
  GROW: 'Unit + API + E2E',
  JRNL: 'API + E2E + Security',
  PLAN: 'API + E2E',
  GAME: 'Unit + API',
  RPT: 'Unit + API',
  WELL: 'API + E2E',
  ISL: 'Unit + API + E2E',
  NOTIF: 'Integration + API',
  COMM: 'API + E2E + Security',
  AI: 'Integration + Security',
  WIDGET: 'Android + API',
};
const levelOf = (t) => {
  const m = modOf(t.id);
  const title = t.title.toLowerCase();
  if (m === 'GOV') return 'Manual (inspection)';
  if (m === 'QA') return QA_LEVELS.find(([re]) => re.test(title))?.[1] ?? 'Integration';
  if (m === 'PLAT')
    return /deploy|production|release/.test(title) ? 'Integration + Manual' : 'Integration';
  return MODULE_LEVELS[m] ?? 'API';
};
const TOOLS = {
  Unit: 'Vitest',
  API: 'Jest + Supertest',
  E2E: 'Playwright',
  Integration: 'Jest (Nest testing module, Neon branch)',
  a11y: 'axe-core (Playwright)',
  Security: 'Jest authz/IDOR suite, OWASP ZAP',
  Perf: 'k6 + Lighthouse CI',
  Manual: 'Manual checklist',
  Android: 'JUnit + Glance testing + Espresso',
};
const toolOf = (l) =>
  [
    ...new Set(
      l
        .split(' + ')
        .map((x) => TOOLS[x.split(' ')[0]])
        .filter(Boolean),
    ),
  ].join(', ');
const pre = (m) => {
  const base =
    'Neon PR branch migrated + reference seed; factory users (EN & BN locale, tz Asia/Dhaka)';
  return (
    {
      GOV: 'Docs committed in repo',
      PLAT: 'Clean clone; CI secrets for test env',
      UI: 'Storybook/Playwright CT build',
      QA: 'Staging (prod-like) with seeded synthetic data',
      AUTH: base + '; email transport = capture inbox',
      RBAC: base + '; one user per role (User, Admin, Super Admin)',
      ADMIN: base + '; Admin & Super Admin with step-up session',
      COMM: base + '; users A/B/C, family group G1 (A,B), community group G2 (C)',
      AI:
        base +
        '; AiProvider = deterministic FakeProvider (real Claude only in budget-capped nightly smoke)',
      WIDGET: 'Emulators API 26 & 35 (EN/BN); device linked to factory user',
      ISL:
        base +
        '; Islamic module enabled; location Dhaka (23.81, 90.41), method Karachi, Hanafi Asr',
      NOTIF: base + '; fake clock; push/email transports captured',
      PWA: 'Production build over HTTPS with SW active; factory user logged in',
      CAL: base + '; frozen clock',
      INTG: base + '; provider sandbox or fake adapter',
    }[m] || base
  );
};
const EDGE = {
  AUTH: 'Negative: invalid/expired/reused tokens rejected; responses enumeration-safe.',
  RBAC: 'Negative: lower role gets 403; privilege change written to audit_logs.',
  ADMIN: 'Negative: User role gets 403; every mutation audited.',
  DEED: "Negative: other user's IDs return 404 (IDOR); EN+BN render.",
  CAL: 'Timezone matrix (Asia/Dhaka, America/New_York across DST, Pacific/Kiritimati, UTC).',
  GROW: 'IDOR returns 404; neutral, non-judgmental copy in EN+BN.',
  JRNL: 'IDOR returns 404; journal text absent from logs, Sentry, analytics, push.',
  PLAN: 'IDOR returns 404; EN+BN render.',
  GAME: 'No worship ranking or shame copy rendered.',
  RPT: 'Aggregates match raw records; no other-user data.',
  WELL: 'IDOR returns 404; no device-monitoring claims in copy.',
  ISL: 'Worship data private (IDOR returns 404); sources displayed for content.',
  NOTIF: 'Quiet hours defer delivery; DST transition; lock-screen text has no private content.',
  COMM: 'Non-member gets 404; blocked user content hidden; nothing shared without explicit action.',
  AI: 'AI disabled gives AI_DISABLED + non-AI fallback; quota gives AI_QUOTA_EXCEEDED; prompt-injection corpus; PII redaction.',
  PWA: 'Offline-to-online replay is idempotent; conflicts recorded.',
  WIDGET:
    'Offline tap queued then synced exactly once; stale indicator after threshold; revoked token gives re-link prompt.',
  I18N: 'BN pseudo-locale: no clipping/overflow; missing key falls back to EN and is reported.',
};

export function renderTestPlan({ features, srs, tcs }) {
  const nameOf = new Map(features.map((f) => [f.id, f.name]));
  const unknownTasks = Object.keys(NFR_BY_TASK).filter((id) => !tcs.has(id));
  if (unknownTasks.length)
    throw new Error(`NFR_BY_TASK has unknown tasks: ${unknownTasks.join(', ')}`);
  let out = '';
  let count = 0;
  for (const [p, tasks] of [...byPhase(T)].sort(([a], [b]) => a - b)) {
    const rows = [];
    for (const t of tasks) {
      const m = modOf(t.id);
      const level = levelOf(t);
      for (const tc of tcs.get(t.id)) {
        const reqs = tc.feature
          ? (srs.frByFeature.get(tc.feature) ?? [])
          : (NFR_BY_TASK[t.id] ?? []);
        for (const r of reqs)
          if (r.startsWith('NFR') && !srs.nfr.has(r)) throw new Error(`unknown ${r}`);
        if (tc.feature && !reqs.length) throw new Error(`no FR for ${tc.feature}`);
        const title = tc.feature ? `${nameOf.get(tc.feature)} — ${t.title}` : t.title;
        const steps =
          t.subs.map((s, i) => `${i + 1}) ${s}`).join('<br>') +
          (EDGE[m] ? `<br>${t.subs.length + 1}) ${EDGE[m]}` : '');
        rows.push(
          `| ${tc.id} | ${esc(title)} | ${level} | ${reqs.join(', ') || '— (process)'} | ${esc(pre(m))} | ${esc(steps)} | ${esc(t.dod)}${tc.feature ? ' All linked FRs satisfied.' : ''} | ${toolOf(level) || 'Manual review'} | P${p} | ${t.id} |`,
        );
        count++;
      }
    }
    out += `\n### Phase ${p}\n\n| TC | Title | Level | Linked requirements | Preconditions | Key steps | Expected result | Automation | Phase | Task |\n|---|---|---|---|---|---|---|---|---|---|\n${rows.join('\n')}\n`;
  }
  const tpl = read(path.join(TOOLS_DIR, 'test-plan.tpl.md'));
  return { 'qa/TEST_PLAN.md': tpl.replace('{{COUNT}}', count).replace('{{CASES}}', out) };
}

// Single source for implementation tasks (rendered by gen.js into the plan, tracker and test plan).
const G =
  'Feature ACs pass; unit + integration (+E2E where UI) tests green in CI; EN/BN strings present; authz tested; docs/status updated.';
const T = [];
const t = (id, title, f, c, dod, subs) =>
  T.push({ id, title, f, c, dod: dod || G, subs: subs || [] });

// ---------------- P0 / P1 (governance) ----------------
t(
  'T-P0-GOV-001',
  'Repository & environment discovery',
  [],
  'S',
  'PROJECT_DISCOVERY, EXISTING_ARCHITECTURE, TECH_STACK_DECISION, PROJECT_GAPS written from real findings.',
  ['Inspect repo & toolchain', 'Record gaps & credentials needed'],
);
t(
  'T-P0-GOV-002',
  'Canonical feature ID registry & conventions',
  [],
  'S',
  'FEATURE_ID_REGISTRY + docs/README conventions committed.',
  ['Module codes', 'Feature IDs + MoSCoW + phase', 'ID scheme, table & API maps'],
);
t(
  'T-P1-GOV-001',
  'Product docs (vision, scope, catalog, stories, ACs)',
  [],
  'L',
  'All Stage 1 files exist; every F-ID catalogued.',
  ['Catalog', 'Personas & journeys', 'Stories & ACs', 'Priority matrix & roadmap'],
);
t('T-P1-GOV-002', 'SRS', [], 'L', 'All 30 sections; every F-ID has ≥1 FR.', [
  'FRs per module',
  'NFRs',
  'Constraints & out-of-scope',
]);
t(
  'T-P1-GOV-003',
  'Architecture, database & API specifications',
  [],
  'L',
  'Stage 3–5 files exist; openapi.yaml lints.',
  ['Architecture + ADRs', 'ERD + data dictionary', 'API spec + OpenAPI'],
);
t(
  'T-P1-GOV-004',
  'UI/UX, QA & implementation plans',
  [],
  'L',
  'Design, QA and implementation files exist; traceability matrix complete.',
  ['Design system & page specs', 'QA strategy & test plan', 'Master plan & tracker'],
);
t(
  'T-P1-GOV-005',
  'Executive summary & approval gate',
  [],
  'S',
  'User approves plan or requests changes (recorded in DECISION_LOG).',
  ['Write summary', 'Present for approval'],
);

// ---------------- P2 Foundation ----------------
t(
  'T-P2-PLAT-001',
  'Monorepo scaffold (pnpm via Corepack, Turborepo, packages/config)',
  [],
  'M',
  '`pnpm i && pnpm turbo build lint typecheck test` passes on a clean clone (Windows + Linux CI).',
  [
    'Enable pnpm via Corepack; root package.json & pnpm-workspace.yaml',
    'turbo.json pipelines (build, lint, typecheck, test, e2e)',
    'packages/config: tsconfig, eslint, prettier presets',
    '.editorconfig, .gitattributes (LF), .gitignore, .nvmrc (Node 24)',
  ],
);
t(
  'T-P2-PLAT-002',
  'apps/api NestJS skeleton',
  [],
  'M',
  'GET /api/v1/health returns 200 (Supertest); invalid env aborts boot (unit test); /api/v1/openapi.json generated.',
  [
    'Nest app with URI versioning /api/v1',
    'Zod-validated config module',
    'Pino logger with request id + redaction',
    'Global problem+json exception filter',
    '@nestjs/swagger OpenAPI emission',
  ],
);
t(
  'T-P2-PLAT-003',
  'Prisma + Neon baseline',
  [],
  'M',
  '`prisma migrate deploy` succeeds on Neon dev branch; seed is idempotent (run twice → same row counts, test); /health/ready returns 503 DEPENDENCY_UNAVAILABLE when the DB is unreachable (test).',
  [
    'Neon project with dev/staging/prod branches (user action)',
    'Prisma schema baseline, UUIDv7 default helper',
    'DATABASE_URL (pooled) + DIRECT_URL (migrations)',
    'Seed runner framework',
    'Readiness check registry (modules register checks; /health/ready aggregates) + DB check',
  ],
);
t(
  'T-P2-PLAT-004',
  'apps/worker with pg-boss',
  [],
  'M',
  'Integration test enqueues a job and observes completion; SIGTERM drains in-flight jobs.',
  [
    'Worker entrypoint sharing api modules',
    'Job registry & typed payloads',
    'Retry/backoff defaults, dead-letter logging',
    'Heartbeat job',
  ],
);
t(
  'T-P2-PLAT-005',
  'apps/web Next.js skeleton',
  [],
  'M',
  'Route groups (public)/(app)/admin render; loading/error boundaries covered by Playwright smoke.',
  [
    'App Router + TypeScript strict',
    'Tailwind with tokens preset',
    'Route groups & layouts',
    'Typed API client from packages/contracts',
  ],
);
t(
  'T-P2-PLAT-006',
  'packages/contracts (Zod + generated OpenAPI types)',
  [],
  'S',
  'CI fails when committed OpenAPI differs from generated (drift check).',
  ['Shared Zod schemas', 'openapi-typescript generation', 'Drift check script'],
);
t(
  'T-P2-PLAT-007',
  'CI pipeline (GitHub Actions)',
  [],
  'M',
  'PR pipeline green: lint, typecheck, unit, api integration (ephemeral Neon branch), Playwright smoke, dependency & secret scan.',
  [
    'Workflow with Turborepo cache',
    'Neon branch per PR create/delete',
    'osv-scanner / pnpm audit',
    'gitleaks secret scan',
    'Required status checks documented',
  ],
);
t(
  'T-P2-PLAT-008',
  'Security baseline middleware',
  [],
  'M',
  'Security headers & CSP verified by integration test; CORS rejects unknown origin; oversized body → 413.',
  [
    'Helmet + strict CSP with nonces (web)',
    'CORS allowlist',
    'Rate limiter (@nestjs/throttler, 3 tiers per API_CONVENTIONS; Postgres counter for login/reset only)',
    'Body size & JSON depth limits',
  ],
);
t(
  'T-P2-PLAT-009',
  'Observability',
  [],
  'S',
  'Errors from web & api appear in Sentry with release + request id; PII redaction unit-tested.',
  ['Sentry web/api', 'Structured log field conventions'],
);
t(
  'T-P2-PLAT-010',
  'Staging deployment',
  [],
  'M',
  'Merge to main deploys web + api + worker to staging; post-deploy smoke passes; migrations run as release step.',
  [
    'Vercel (web) project',
    'Render/Fly (api, worker)',
    'Secrets management per env',
    'Post-deploy smoke job',
    'Probes: liveness → /health/live (frequent); /health/ready only for deploy gating, so Neon compute can autosuspend',
  ],
);
t(
  'T-P2-UI-001',
  'packages/tokens',
  [],
  'S',
  'CSS variables (light/dark) match COLOR_TOKENS; contrast test asserts documented pairs ≥ thresholds.',
  [
    'Token JSON source',
    'CSS vars + Tailwind preset',
    'Android colors export (for P9)',
    'Contrast unit test',
  ],
);
t(
  'T-P2-UI-002',
  'packages/ui core components',
  [],
  'L',
  'Each component has unit tests + axe check in Storybook/Playwright CT; keyboard behaviour verified.',
  [
    'Button, Input, Field (label/help/error), Select, Checkbox, Switch',
    'Dialog, Sheet, Toast, Tooltip',
    'Card, Tabs, Badge, Avatar, Skeleton, EmptyState',
    'Storybook (or Ladle) with EN/BN + light/dark',
  ],
);
t(
  'T-P2-UI-003',
  'App shell & responsive navigation',
  ['F-PWA-002'],
  'M',
  'Bottom nav (<768px) / sidebar (≥1024px) verified at 360/768/1280 widths in Playwright; focus order correct.',
  [
    'App shell layout',
    'Mobile bottom nav, desktop sidebar',
    'Offline / in-app-browser banner slots',
  ],
);
t(
  'T-P2-UI-004',
  'Theme switching (light/dark/system)',
  ['F-AUTH-010'],
  'S',
  'No flash of wrong theme on reload (E2E); preference persisted.',
  ['Theme provider & pre-paint script', 'Persist to cookie + preferences'],
);
t(
  'T-P2-I18N-001',
  'EN/BN catalogs & next-intl setup',
  ['F-I18N-001'],
  'M',
  'All shipped pages render in EN and BN (E2E snapshot per locale).',
  [
    'packages/i18n en.json/bn.json with namespaces',
    'next-intl provider (server + client)',
    'API-side message loader for emails/errors',
  ],
);
t(
  'T-P2-I18N-002',
  'No-hardcoded-strings lint & missing-key check',
  ['F-I18N-001', 'F-I18N-009'],
  'S',
  'CI fails on JSX literal strings and on keys missing from bn.json (allowlist documented).',
  ['eslint no-literal-string rule', 'Key parity script'],
);
t(
  'T-P2-I18N-003',
  'Language switcher & persistence',
  ['F-I18N-002', 'F-I18N-003'],
  'S',
  'Switch persists across reload (guest cookie) and across devices (account preference) — E2E.',
  ['Switcher component', 'Guest cookie', 'Sync to user_preferences on login'],
);
t(
  'T-P2-I18N-004',
  'Locale formatting helpers',
  ['F-I18N-004'],
  'S',
  'Unit tests for dates/times/numbers in en & bn incl. Bengali digits toggle.',
  [
    'Intl wrappers (date, time, relative, number)',
    'Bengali digit option',
    'Hijri formatting hook (stub until P5)',
  ],
);
t(
  'T-P2-I18N-005',
  'Bengali typography',
  ['F-I18N-005'],
  'S',
  'BN font loads via next/font with no CLS > 0.05; conjunct rendering visually checked on Android Chrome & iOS Safari.',
  ['Font loading & subsetting', 'Locale-specific line-height tokens'],
);
t(
  'T-P2-I18N-006',
  'Localized validation & API errors',
  ['F-I18N-007'],
  'S',
  'Validation errors in both locales asserted by API + UI tests; API returns stable code + i18n key.',
  [
    'Zod error map → i18n keys',
    'problem+json `code` and `i18nKey`',
    'Client renderer for field errors',
  ],
);
t(
  'T-P2-I18N-007',
  'Fallback & missing-key reporting',
  ['F-I18N-009'],
  'S',
  'Missing BN key renders EN and reports once to Sentry (test); dev mode throws.',
  ['Fallback chain bn→en', 'Reporter with dedupe'],
);
t(
  'T-P2-PWA-001',
  'Web manifest & installability',
  ['F-PWA-001'],
  'S',
  'Lighthouse PWA installability checks pass on staging; maskable icons render.',
  [
    'manifest.webmanifest (EN/BN name)',
    'Icons incl. maskable',
    'Install prompt UX (deferred, non-nagging)',
  ],
);
t(
  'T-P2-PWA-002',
  'Service worker app shell (Serwist)',
  ['F-PWA-003'],
  'M',
  'App shell & offline fallback page load with network disabled (Playwright offline test).',
  [
    'Serwist integration',
    'Precache shell + static assets',
    'Offline fallback route',
    'SW update strategy (skipWaiting on prompt)',
  ],
);
t(
  'T-P2-PWA-003',
  'In-app browser detection & fallback',
  ['F-PWA-007'],
  'S',
  'UA fixtures for FB, Messenger, Instagram, Telegram, Line, Android WebView detected (unit); banner + hidden Google button (E2E with UA override).',
  [
    'Detection module with fixture tests',
    '"Open in browser" banner with per-platform instructions',
    'Hide Google OAuth in webviews',
  ],
);
t(
  'T-P2-PWA-004',
  'Capability detection & graceful degradation',
  ['F-PWA-008'],
  'S',
  'Each optional API guarded; app works with push/bg-sync/share undefined (unit + E2E).',
  ['capabilities module (push, bgSync, share, persist, install)', 'UI fallbacks documented'],
);
t(
  'T-P2-AUTH-001',
  'Identity schema',
  ['F-AUTH-001'],
  'S',
  'Migration creates users, user_preferences, auth_identities, user_sessions, verification_tokens with constraints from DATA_DICTIONARY, and adds the deferred FK system_settings.updated_by → users ON DELETE SET NULL.',
  [
    'Prisma models & migration',
    'Unique citext email',
    'Repository layer with user scoping',
    'FK system_settings.updated_by → users (deferred from T-P2-PLAT-003)',
  ],
);
t(
  'T-P2-AUTH-002',
  'Registration',
  ['F-AUTH-001'],
  'M',
  'Register API + page; Argon2id hash; password policy (≥10 chars + breached-password check, fail-open logged); duplicate email gives non-enumerating response.',
  [
    'POST /auth/register',
    'Argon2id params benchmarked',
    'HIBP k-anonymity check',
    'Register page (EN/BN)',
    'Tests: policy, duplicate, rate limit',
  ],
);
t(
  'T-P2-AUTH-003',
  'Email verification',
  ['F-AUTH-004'],
  'S',
  'Hashed single-use token, 24h expiry, resend throttled; unverified users restricted per SRS — tests.',
  ['Token issue/verify', 'Verify page', 'Resend with throttle'],
);
t(
  'T-P2-AUTH-004',
  'Login, tokens & sessions',
  ['F-AUTH-002'],
  'L',
  'Opaque session token in a __Host- HttpOnly SameSite=Lax cookie, stored hashed in user_sessions; lifetimes per SRS FR-AUTH-002-03; Origin/Sec-Fetch-Site check rejects cross-site mutations (test); throttling per FR-AUTH-002-02 (DL-012).',
  [
    'POST /auth/login',
    'Session store & per-request lookup (<=5 s cache)',
    'Origin guard',
    'Login throttling',
    'Login page',
  ],
);
t(
  'T-P2-AUTH-005',
  'Google OAuth (PKCE redirect)',
  ['F-AUTH-003'],
  'M',
  'OAuth flow works on staging; account linking only when Google email verified and matches; state/PKCE validated (tests with mocked IdP).',
  [
    'OAuth client config (user action)',
    'Authorization code + PKCE',
    'auth_identities linking rules',
    'Error states',
  ],
);
t(
  'T-P2-AUTH-006',
  'Forgot & reset password',
  ['F-AUTH-005'],
  'S',
  'Non-enumerating request; token 30 min single-use; reset revokes all sessions — tests.',
  ['Request/reset endpoints', 'Pages', 'Session revocation'],
);
t(
  'T-P2-AUTH-007',
  'Logout & session management',
  ['F-AUTH-006', 'F-AUTH-007'],
  'M',
  'List sessions with device/last-seen; revoke one/all; a revoked session is rejected on the next request (tests).',
  ['POST /auth/logout (current/all)', 'GET/DELETE /me/sessions', 'Sessions settings page'],
);
t(
  'T-P2-AUTH-008',
  'Profile management',
  ['F-AUTH-008'],
  'S',
  'Edit display name and profile fields (tests). Email change deferred to P4 (DL-032).',
  ['GET/PATCH /me', 'Profile page'],
);
t(
  'T-P2-AUTH-009',
  'User preferences',
  ['F-AUTH-010'],
  'S',
  'Language, IANA timezone (auto-detected, user-confirmed), theme, week start, numerals persisted & applied — tests.',
  ['GET/PATCH /me/preferences', 'Timezone picker with detection', 'Preferences page'],
);
t(
  'T-P2-AUTH-010',
  'Account deletion & data export',
  ['F-AUTH-009'],
  'M',
  'Deletion request starts 30-day grace; login offers cancel; worker hard-deletes after grace and pseudonymizes audit refs (integration test with clock control); JSON export job delivers account data.',
  [
    'POST/DELETE /me/deletion',
    'Hard-delete job',
    'export_jobs + /me/export',
    'Danger-zone UI with re-auth',
  ],
);
t(
  'T-P2-AUTH-011',
  'Web auth guards',
  ['F-AUTH-002', 'F-AUTH-007'],
  'S',
  'Protected routes redirect guests; 401 redirects to login preserving the return path; no token in JS-readable storage (test).',
  ['Next middleware guards', 'Fetch wrapper (401 -> login)', 'Guest landing'],
);
t(
  'T-P2-RBAC-001',
  'Roles & permission catalog',
  ['F-RBAC-001'],
  'S',
  'Seeded roles (User, Admin, Super Admin; Guest implicit) and permission catalog match API_SPECIFICATION.',
  [
    'roles, permissions, user_roles, role_permissions migration',
    'Seed',
    'Default role on registration',
  ],
);
t(
  'T-P2-RBAC-002',
  'Permission guard (deny by default)',
  ['F-RBAC-002'],
  'M',
  'Every route declares @Public or @RequirePermission; a test fails if any route lacks metadata; ownership helper prevents cross-user access.',
  ['Guard + decorators', 'Route metadata audit test', 'Ownership/scoping helper'],
);
t(
  'T-P2-RBAC-003',
  'Role assignment',
  ['F-RBAC-003'],
  'S',
  'Only Super Admin grants Admin/Super Admin; last Super Admin cannot be removed; all changes audited (tests).',
  ['POST/DELETE /admin/users/{id}/roles', 'Invariants', 'Audit events'],
);
t(
  'T-P2-RBAC-004',
  'Admin account management',
  ['F-RBAC-004'],
  'S',
  'Admins created by seed/CLI command (invite flow in P10, DL-032); Super Admin can disable/enable admins; disabled admin sessions revoked immediately (tests).',
  ['CLI: create admin', 'Disable/enable'],
);
t(
  'T-P2-RBAC-005',
  'Audit logging',
  ['F-RBAC-005'],
  'M',
  'Append-only audit_logs (no UPDATE/DELETE grant for app role); catalog of events recorded for auth, roles, admin actions (tests).',
  [
    'audit_logs table (plain, btree on occurred_at; 24-month purge job)',
    'AuditService & interceptor',
    'DB privilege restriction',
  ],
);
t(
  'T-P2-RBAC-006',
  'Admin step-up re-authentication',
  ['F-RBAC-006'],
  'S',
  'Admin step-up actions require re-auth within the last 10 min (password/TOTP), stored on the session — tests.',
  ['Step-up endpoint (user_sessions.stepup_at)', 'Admin route guard'],
);
t(
  'T-P2-RBAC-007',
  'Admin TOTP 2FA',
  ['F-RBAC-007'],
  'M',
  'TOTP mandatory for Admin/Super Admin before admin access; secrets encrypted; replay window enforced (tests).',
  ['mfa_factors', 'Enrollment with QR', 'Verification & backup codes'],
);
t(
  'T-P2-RBAC-008',
  'Authorization test matrix',
  ['F-RBAC-002'],
  'S',
  'Generated test runs every endpoint × {guest,user,admin,super_admin} and asserts expected status.',
  ['Matrix generator from route metadata', 'CI integration'],
);
t(
  'T-P2-ADMIN-001',
  'Admin shell',
  ['F-ADMIN-001'],
  'S',
  '/admin layout with nav filtered by permissions; non-admins get 404 (test).',
  ['Admin layout', 'Permission-aware nav'],
);
t(
  'T-P2-ADMIN-002',
  'User management',
  ['F-ADMIN-001'],
  'M',
  'Search, view, disable, force logout, resend verification; never shows journal/worship data (test).',
  ['GET /admin/users (cursor)', 'User detail & actions', 'Audit on every action'],
);
t('T-P2-ADMIN-003', 'Role assignment UI (read-only role catalog)', ['F-ADMIN-002'], 'S', null, [
  'Roles list (read-only)',
  'Assign/revoke role on user detail',
]);
t(
  'T-P2-ADMIN-004',
  'Feature flags',
  ['F-ADMIN-009'],
  'M',
  'Boolean flags with optional role allowlist, evaluated server-side; client hook; admin toggle UI; audited changes (tests). A/B lives in experiments (P10, DL-029).',
  ['feature_flags table', 'Evaluation service + cache', 'useFlag hook', 'Admin UI'],
);
t('T-P2-ADMIN-005', 'Audit log viewer', ['F-ADMIN-016'], 'S', null, [
  'Filters (actor, action, date)',
  'Detail view',
]);
t(
  'T-P2-ADMIN-006',
  'System settings service',
  [],
  'S',
  'system_settings typed keys (Settings registry keys, e.g. completions.edit_window_days=7) readable via service; changes audited.',
  ['Table & typed accessor', 'Admin edit page'],
);
t(
  'T-P2-INTG-001',
  'Email adapter & templates',
  ['F-INTG-001', 'F-NOTIF-005'],
  'M',
  'Resend + SMTP adapters behind EmailSender; dev file sink; verify/reset/deletion templates in EN/BN; sent via worker with retries (tests).',
  [
    'EmailSender interface + adapters',
    'React Email templates EN/BN',
    'send-email job with retry (defineJob contract + idempotent handler)',
    'Wire JobsClient into the API (first API producer; producer-only pg-boss: no workers, no schedules)',
    'Unconfigured-provider behaviour documented',
  ],
);
t(
  'T-P2-QA-001',
  'Test infrastructure',
  [],
  'M',
  'Vitest (unit + API via Supertest, Neon test branch), Playwright (mobile + desktop projects, EN/BN), axe helper all runnable via turbo.',
  ['Vitest config', 'API test DB lifecycle', 'Playwright projects', 'axe helper'],
);
t(
  'T-P2-QA-002',
  'Phase 2 E2E & regression suite',
  ['F-AUTH-001', 'F-AUTH-002', 'F-RBAC-006'],
  'S',
  'E2E: register→verify→login→prefs→logout (EN & BN); admin login with TOTP; in-app browser banner.',
  ['User auth journey', 'Admin journey', 'Locale run'],
);

// ---------------- P3 Good Deeds core ----------------
t(
  'T-P3-CAL-001',
  'Local-date & timezone domain utilities',
  ['F-CAL-010'],
  'M',
  'packages/domain local_date functions property-tested across DST transitions & 30+ IANA zones; timezone-change policy (SRS) unit-tested.',
  ['localDateFor(instant, tz)', 'Day boundary & DST tests', 'Timezone change handling'],
);
t(
  'T-P3-DEED-001',
  'Deeds schema',
  ['F-DEED-001', 'F-DEED-002'],
  'M',
  'Migration for deed_categories(+translations), deeds(+translations), deed_plans, deed_completions, completion_attachments, favorite_deeds; unique (deed_plan_id, local_date); check constraints.',
  ['Prisma models', 'Constraints & indexes per INDEXING_STRATEGY', 'Repository scoping tests'],
);
t(
  'T-P3-I18N-001',
  'Content translation pattern & locale resolution',
  ['F-I18N-008'],
  'S',
  'API resolves Accept-Language/user locale with bn→en fallback for *_translations; tests.',
  ['Translation join helper', 'Fallback flag in responses'],
);
t(
  'T-P3-DEED-002',
  'Deed library seed (EN/BN)',
  ['F-DEED-001', 'F-DEED-013'],
  'M',
  '8 categories and ≥150 deeds with EN/BN text, five-minute tag, reviewed by product owner & BN reviewer.',
  ['Content spreadsheet', 'Seed import script', 'Review sign-off'],
);
t('T-P3-DEED-003', 'Categories API & UI', ['F-DEED-002'], 'S', null, [
  'GET /categories',
  'Category chips/filter UI',
]);
t(
  'T-P3-DEED-004',
  'Deed discovery (browse/search/filter)',
  ['F-DEED-011'],
  'M',
  'Locale-aware search (pg_trgm on translations) with category/duration filters; p95 < 300 ms on seeded data.',
  ['GET /deeds with q/filters/cursor', 'Discover page', 'Empty & error states'],
);
t(
  'T-P3-DEED-005',
  'Custom deeds',
  ['F-DEED-003'],
  'S',
  'CRUD scoped to owner (cross-user → 404 test); limit 200 active custom deeds; validation per SRS.',
  ['POST/PATCH/DELETE /deeds (owner)', 'Create/edit form'],
);
t(
  'T-P3-DEED-006',
  'Recurrence engine',
  ['F-DEED-005'],
  'L',
  'RRULE subset (DAILY, WEEKLY+BYDAY, MONTHLY+BYMONTHDAY, INTERVAL, UNTIL/COUNT) parse/validate/expand per local_date; property tests; shared web/api.',
  [
    'Parser & validator',
    'occursOn(rule, localDate)',
    'Human-readable EN/BN description',
    'Property-based tests',
  ],
);
t(
  'T-P3-DEED-007',
  'Plans (my routine)',
  ['F-DEED-005'],
  'M',
  'Add deed with recurrence, pause, archive; plan edits do not rewrite past completions (test).',
  ['/plans CRUD', 'Recurrence picker UI', 'Pause/archive semantics'],
);
t(
  'T-P3-DEED-008',
  'Daily checklist & Today page',
  ['F-DEED-004'],
  'L',
  '/checklist/{localDate} computed from plans+completions in user tz; GET /today composite (ETag) shares its builder with /widget/snapshot (DL-025); Today page completes items in ≤1 tap with optimistic UI; LCP < 2.5s mid-tier mobile.',
  [
    'Checklist service',
    'GET /today composite builder',
    'Today page',
    'Progress ring',
    'Loading/empty/error states',
  ],
);
t(
  'T-P3-DEED-009',
  'Completions (status & notes)',
  ['F-DEED-009', 'F-DEED-008'],
  'M',
  'Upsert by (plan, local_date) with Idempotency-Key; status done/partial/skipped; note ≤ 1000 chars; outside edit window → 422 (tests).',
  ['PUT /completions', 'Idempotency store', 'Note editor'],
);
t('T-P3-DEED-010', 'Favorites', ['F-DEED-006'], 'S', null, [
  'PUT/DELETE /deeds/{id}/favorite',
  'Favorites filter',
]);
t('T-P3-DEED-011', 'Activity history', ['F-DEED-007'], 'S', null, [
  'GET /completions?from&to (cursor)',
  'History page with filters',
]);
t(
  'T-P3-DEED-012',
  'Evidence attachments',
  ['F-DEED-010'],
  'M',
  'Signed upload (≤5 MB, jpeg/png/webp, magic-byte check), EXIF stripped by re-encode job, private signed GET; deleted with completion/account (tests).',
  [
    'Storage adapter (R2) + unconfigured mode',
    'Upload/confirm endpoints',
    'Re-encode job',
    'Attachment UI',
  ],
);
t('T-P3-DEED-013', 'Random good deed generator', ['F-DEED-012'], 'S', null, [
  'GET /deeds/random (weighted, excludes done today)',
  '"Surprise me" UI',
]);
t('T-P3-DEED-014', 'Five-minute deeds collection', ['F-DEED-013'], 'S', null, [
  'Filter duration≤5',
  'Collection view',
]);
t(
  'T-P3-DEED-015',
  'Rule-based recommendations',
  ['F-DEED-014'],
  'M',
  'Recommends from under-served categories & favorites; deterministic rules unit-tested; no AI dependency.',
  ['Rules engine', 'GET /deeds/recommendations', 'Recommendation cards'],
);
t(
  'T-P3-CAL-002',
  'Streak engine & cache',
  ['F-CAL-007', 'F-CAL-008'],
  'L',
  'Streak rules exactly per SRS §7.5.1; daily_summaries updated in the completion transaction; streaks updated in place for today/yesterday and via a debounced streaks.rebuild:{userId} job for past edits and rule changes (DL-023); rebuild matches cache (property test).',
  [
    'Pure streak calculator in packages/domain',
    'daily_summaries table & write path',
    'Incremental update (today/yesterday)',
    'Debounced rebuild job',
    'GET /streaks',
  ],
);
t('T-P3-CAL-003', 'Daily completion rate', ['F-CAL-006'], 'S', null, [
  'Rate = done(+0.5 partial)/scheduled per SRS',
  'Exposed in checklist & calendar',
]);
t(
  'T-P3-CAL-004',
  'Daily/weekly/monthly calendar',
  ['F-CAL-001', 'F-CAL-002', 'F-CAL-003'],
  'M',
  'GET /calendar?view=day|week|month reads daily_summaries; week start honors preference; keyboard-navigable grid.',
  ['Aggregate queries', 'Calendar views', 'Responsive layouts'],
);
t(
  'T-P3-CAL-005',
  'Yearly history & heatmap',
  ['F-CAL-004', 'F-CAL-005'],
  'M',
  'Heatmap reads daily_summaries; accessible table alternative and non-color cue; p95 per NFR-PERFORMANCE-009.',
  ['GET /heatmap?year', 'Heatmap component', 'Accessible alternative'],
);
t('T-P3-CAL-006', 'Past-day editing', ['F-CAL-011'], 'S', null, [
  'Window from completions.edit_window_days',
  'Edit past day UI',
  'Enqueue debounced streak rebuild',
]);
t(
  'T-P3-ADMIN-001',
  'Deed & category content admin',
  ['F-ADMIN-003'],
  'M',
  'CRUD, publish/unpublish, ordering; permission content.deeds.manage; audited.',
  ['/admin/deeds, /admin/categories', 'Admin forms', 'Publish workflow'],
);
t(
  'T-P3-ADMIN-002',
  'Content translation management',
  ['F-ADMIN-004', 'F-I18N-008'],
  'M',
  'Side-by-side EN/BN editor; missing-translation report; publishing blocked when required locale missing (configurable).',
  ['Translation editor', 'Missing report', 'Publish gate'],
);
t(
  'T-P3-ADMIN-003',
  'Content versioning',
  ['F-ADMIN-011'],
  'M',
  'Every publish writes content_versions snapshot; diff view; rollback creates new version (tests).',
  ['content_versions table', 'Snapshot hook', 'Diff & rollback UI'],
);
t(
  'T-P3-QA-001',
  'Phase 3 E2E & performance checks',
  ['F-DEED-004', 'F-CAL-007'],
  'S',
  'E2E: onboarding → add deeds → complete → streak (EN/BN, mobile/desktop); DST scenario; /checklist load test baseline.',
  ['Journeys', 'Timezone scenarios', 'k6 baseline'],
);

// ---------------- P4 Growth ----------------
t(
  'T-P4-GROW-001',
  'Goals, weekly/monthly goals & milestones',
  ['F-GROW-001', 'F-GROW-002', 'F-GROW-003'],
  'M',
  null,
  ['goals, goal_milestones', '/goals API', 'Goals pages'],
);
t('T-P4-GROW-002', 'Life balance tracker', ['F-GROW-009'], 'M', null, [
  'life_balance_categories seed (8)',
  'life_balance_assessments',
  'Radar/bar chart + table alt',
]);
t(
  'T-P4-GROW-003',
  'Consistency analysis & weak habit identification',
  ['F-GROW-005', 'F-GROW-006'],
  'M',
  null,
  ['Consistency metrics in packages/domain', 'Neutral copy review (no worth judgment)'],
);
t('T-P4-GROW-004', 'Growth snapshots & timeline', ['F-GROW-004'], 'M', null, [
  'growth_snapshots monthly job',
  'Timeline page',
]);
t('T-P4-GROW-005', 'Rule-based growth insights', ['F-GROW-007'], 'S', null, [
  'Insight rules',
  'Insight cards',
]);
t('T-P4-GROW-006', 'Monthly reflection', ['F-GROW-008'], 'S', null, [
  'Reflection flow',
  'Stored as journal_entries type reflection',
]);
t(
  'T-P4-JRNL-001',
  'Journal storage with application-level encryption',
  ['F-JRNL-007'],
  'L',
  'Bodies stored as ciphertext (AES-256-GCM, envelope key, key_version); DB dump contains no plaintext (test); admin APIs cannot read journals (authz test).',
  ['Key service (env KEK, KMS-ready)', 'journal_entries model', 'Rotation job', 'Privacy tests'],
);
t(
  'T-P4-JRNL-002',
  'Journal, intention, evening reflection, gratitude',
  ['F-JRNL-001', 'F-JRNL-002', 'F-JRNL-003', 'F-JRNL-004'],
  'M',
  null,
  ['/journal CRUD by entry_type', 'Editors & prompts EN/BN'],
);
t('T-P4-JRNL-003', 'Future-self letters', ['F-JRNL-005'], 'S', null, [
  'pg-boss job with startAfter = deliver_at',
  'Delivery notification/email',
]);
t('T-P4-JRNL-004', 'Learning notes', ['F-JRNL-006'], 'S', null, [
  'entry_type learning_note',
  'Tags',
]);
t('T-P4-JRNL-005', 'Journal search & filtering', ['F-JRNL-008'], 'M', null, [
  'Server filter on type/date/tags',
  'Body search per INDEXING_STRATEGY',
]);
t('T-P4-JRNL-006', 'Journal export', ['F-JRNL-009'], 'S', null, [
  'export_jobs Markdown/JSON',
  'Download via signed URL',
]);
t(
  'T-P4-PLAN-001',
  'Daily planner with priorities & time blocks',
  ['F-PLAN-001', 'F-PLAN-004', 'F-PLAN-005'],
  'M',
  null,
  ['planner_items', '/planner API', 'Planner page'],
);
t(
  'T-P4-PLAN-002',
  'Morning planning & evening review flows',
  ['F-PLAN-002', 'F-PLAN-003'],
  'S',
  null,
  ['Guided flows', 'Carry-over of unfinished items'],
);
t(
  'T-P4-PLAN-003',
  'Recurring planner activities & weekly planning',
  ['F-PLAN-006', 'F-PLAN-007'],
  'M',
  null,
  ['Reuse recurrence engine', 'Weekly view'],
);
t(
  'T-P4-GAME-001',
  'Achievements & milestones engine',
  ['F-GAME-001', 'F-GAME-002', 'F-CAL-009'],
  'M',
  null,
  ['achievements(+translations), user_achievements', 'Event-driven evaluator', 'Badge UI'],
);
t(
  'T-P4-GAME-002',
  'Streak display & positive recognition',
  ['F-GAME-003', 'F-GAME-008'],
  'S',
  null,
  ['Streak widgets', 'Copy review against non-shaming guide'],
);
t('T-P4-GAME-003', 'Good Deeds Tree', ['F-GAME-004'], 'M', null, [
  'Growth stage model',
  'SVG tree (reduced-motion safe)',
]);
t(
  'T-P4-GAME-004',
  'Random challenges & surprise deeds (personal)',
  ['F-GAME-005', 'F-GAME-006'],
  'S',
  null,
  ['Challenge picker', 'Opt-out setting'],
);
t(
  'T-P4-RPT-001',
  'Personal summaries & reports',
  ['F-RPT-001', 'F-RPT-003', 'F-RPT-004', 'F-RPT-005'],
  'M',
  null,
  [
    '/reports/daily|weekly|categories|consistency|goals',
    'Report pages with chart + table alternatives',
  ],
);
t('T-P4-WELL-001', 'Avoid-bad-habits tracker', ['F-WELL-003'], 'S', null, [
  'wellbeing_logs',
  'Tracker UI',
]);
t('T-P4-WELL-002', 'Positive affirmations', ['F-WELL-007'], 'S', null, [
  'affirmations seed EN/BN',
  'Daily affirmation card',
]);
t(
  'T-P4-AUTH-001',
  'Email change flow',
  ['F-AUTH-008'],
  'S',
  'New address re-verified; notice sent to the old address (tests). Deferred from P2 (DL-032).',
  ['Email change endpoints', 'Verification + notice emails', 'Profile UI'],
);
t(
  'T-P4-I18N-001',
  'Translator handoff export',
  ['F-I18N-001'],
  'S',
  'CSV/XLIFF export and re-import with key-parity check. Deferred from P2 (DL-032).',
  ['Export script', 'Import with validation'],
);
t('T-P4-QA-001', 'Phase 4 privacy & regression tests', ['F-JRNL-007'], 'S', null, [
  'Encryption-at-rest test',
  'Cross-user isolation tests',
  'Regression run',
]);

// ---------------- P5 Islamic ----------------
t('T-P5-ISL-001', 'Islamic preferences & module opt-out', ['F-ISL-017'], 'S', null, [
  'islamic_preferences',
  'Opt-out hides nav/widgets/notifications',
]);
t(
  'T-P5-ISL-002',
  'Prayer times',
  ['F-ISL-002'],
  'M',
  'Times match reference tables for 5 cities × 3 methods within ±1 min (test); works offline client-side.',
  [
    'adhan in packages/domain',
    'Method, madhab, per-prayer adjustments',
    'Location (manual city or consented geolocation)',
  ],
);
t('T-P5-ISL-003', 'Hijri calendar', ['F-ISL-013', 'F-I18N-004'], 'S', null, [
  'Intl islamic-umalqura + user offset',
  'Hijri display in calendar',
]);
t('T-P5-ISL-004', 'Salah tracker', ['F-ISL-001'], 'M', null, [
  'salah_records',
  '/islamic/salah',
  'Salah day view (private)',
]);
t('T-P5-ISL-005', 'Quran metadata cache & reading tracker', ['F-ISL-003'], 'M', null, [
  'Quran.com API adapter + cache table',
  'quran_reading_logs',
  'Reading log UI',
]);
t('T-P5-ISL-006', 'Memorization tracker', ['F-ISL-004'], 'S', null, [
  'quran_memorization_progress',
  'Revision status',
]);
t('T-P5-ISL-007', 'Khatam planner', ['F-ISL-005'], 'S', null, [
  'khatam_plans',
  'Daily target calculation',
]);
t('T-P5-ISL-008', 'Daily dhikr & tasbih counter', ['F-ISL-006', 'F-ISL-007'], 'M', null, [
  'dhikr_presets, dhikr_logs',
  'Offline-first counter (local state, sync later)',
]);
t('T-P5-ISL-009', 'Dua collection', ['F-ISL-008'], 'S', null, [
  'duas(+translations)',
  'Arabic + transliteration + EN/BN + reference',
]);
t('T-P5-ISL-010', 'Sunnah & tahajjud trackers', ['F-ISL-009', 'F-ISL-010'], 'S', null, [
  'sunnah_practices seed, practice_logs',
  'Tracker UI',
]);
t('T-P5-ISL-011', 'Fasting tracker & Ramadan planner', ['F-ISL-011', 'F-ISL-012'], 'M', null, [
  'fasting_records, ramadan_plans',
  'Ramadan dashboard',
]);
t(
  'T-P5-ISL-012',
  'Zakat calculator',
  ['F-ISL-014'],
  'M',
  'Pure function tested against worked examples; nisab basis selectable; disclaimer shown; nothing stored unless saved.',
  ['Calculator in packages/domain', 'zakat_calculations (opt-in save)', 'Calculator UI'],
);
t('T-P5-ISL-013', 'Hadith of the Day & learning hub', ['F-ISL-015', 'F-ISL-016'], 'M', null, [
  'hadith_entries(+translations) with grading',
  'Daily rotation',
  'Learning hub articles',
]);
t('T-P5-ISL-014', 'Content sources & references', ['F-ISL-018'], 'S', null, [
  'islamic_content_sources',
  'Reference rendering component',
]);
t(
  'T-P5-ADMIN-001',
  'Islamic content admin & verification workflow',
  ['F-ADMIN-005'],
  'M',
  'Draft → reviewed → verified → published; verifier ≠ author; unverified content never served (tests).',
  ['Workflow states', 'Permission content.islamic.verify', 'Admin UI'],
);

// ---------------- P6 Notifications ----------------
t('T-P6-NOTIF-001', 'In-app notification center', ['F-NOTIF-001'], 'M', null, [
  'notifications table',
  '/notifications API',
  'Bell + center UI',
]);
t(
  'T-P6-NOTIF-002',
  'Notification preferences & quiet hours',
  ['F-NOTIF-008', 'F-NOTIF-009'],
  'M',
  null,
  ['notification_preferences', 'Quiet hours in user tz', 'Preferences UI'],
);
t(
  'T-P6-NOTIF-003',
  'Reminder scheduler',
  ['F-NOTIF-002', 'F-NOTIF-003'],
  'L',
  'reminders.next_fire_at computed in user tz on write and after firing, DST-safe; one indexed claim scan per minute; idempotent per occurrence (tests with fake clock) (DL-024).',
  ['reminders table + next_fire_at partial index', 'Single-scan scheduler job', 'Reminder editor'],
);
t('T-P6-NOTIF-004', 'Incomplete-task reminders', ['F-NOTIF-004'], 'S', null, [
  'Max 1/day, gentle copy',
  'Respects quiet hours',
]);
t('T-P6-NOTIF-005', 'Prayer time reminders', ['F-NOTIF-010'], 'M', null, [
  'Derived from prayer prefs via the same next_fire_at path',
  'Suppressed if Islamic module off',
]);
t('T-P6-NOTIF-006', 'Email digests', ['F-NOTIF-005'], 'S', null, [
  'Weekly digest job',
  'One-click unsubscribe',
]);
t('T-P6-INTG-001', 'Web Push (VAPID)', ['F-INTG-002', 'F-NOTIF-006'], 'M', null, [
  'push_subscriptions',
  'Subscribe UX + iOS install guidance',
  'Expired subscription cleanup',
]);
t('T-P6-I18N-001', 'Localized notification templates', ['F-I18N-006'], 'S', null, [
  'Template catalog EN/BN',
  'Locale at send time',
]);
t('T-P6-ADMIN-001', 'Broadcast scheduling', ['F-ADMIN-007'], 'M', null, [
  'Targeting by locale/role',
  'Preview & rate limit',
  'Audit',
]);
t('T-P6-ADMIN-002', 'Background job monitoring', ['F-ADMIN-014'], 'S', null, [
  'Queue stats',
  'Failed jobs & retry',
]);

// ---------------- P7 Community ----------------
t('T-P7-COMM-001', 'Family groups & invitations', ['F-COMM-001', 'F-COMM-002'], 'M', null, [
  'groups, group_members, group_invitations',
  'Expiring invite link/code',
  'Family pages',
]);
t(
  'T-P7-COMM-002',
  'Privacy & sharing controls framework',
  ['F-COMM-014'],
  'L',
  'Nothing shared without explicit per-item action; visibility checks on every read (authz tests).',
  ['Visibility model', 'Share dialogs', 'Sharing audit'],
);
t('T-P7-COMM-003', 'Challenges', ['F-COMM-003'], 'M', null, [
  'challenges, challenge_participants, challenge_progress',
  'Challenge pages',
]);
t(
  'T-P7-COMM-004',
  'Shared family calendar & family achievements',
  ['F-COMM-004', 'F-COMM-005'],
  'M',
  null,
  ['Shared items only', 'Family badges'],
);
t('T-P7-COMM-005', 'Community groups', ['F-COMM-006'], 'M', null, [
  'type=community',
  'Join/leave, roles',
]);
t('T-P7-COMM-006', 'Campaigns', ['F-COMM-007'], 'M', null, [
  'campaigns, campaign_participations',
  'Campaign pages',
]);
t('T-P7-COMM-007', 'Volunteer opportunities', ['F-COMM-008'], 'S', null, [
  'volunteer_opportunities',
  'Listing & interest',
]);
t(
  'T-P7-COMM-008',
  'Kindness stories & anonymous sharing',
  ['F-COMM-009', 'F-COMM-010'],
  'L',
  null,
  ['posts, comments, reactions', 'Anonymous display (author retained server-side for moderation)'],
);
t('T-P7-COMM-009', 'Recognition & appreciation', ['F-COMM-011', 'F-GAME-007'], 'S', null, [
  'Appreciations (no rankings)',
]);
t('T-P7-COMM-010', 'Reporting & blocking', ['F-COMM-013'], 'M', null, [
  'content_reports, user_blocks',
  'Report/block UI',
]);
t('T-P7-COMM-011', 'Moderation pipeline', ['F-COMM-012'], 'L', null, [
  'Pre-moderation for new accounts',
  'Text filter',
  'moderation_actions',
]);
t('T-P7-ADMIN-001', 'Moderation console', ['F-ADMIN-008'], 'M', null, [
  'Queue, actions, appeals note',
  'Audit',
]);
t('T-P7-ADMIN-002', 'Campaign management', ['F-ADMIN-006'], 'S', null, ['Campaign CRUD & publish']);
t('T-P7-INTG-001', 'QR campaign participation', ['F-INTG-006'], 'S', null, [
  'Signed expiring codes',
  'Scan → join flow',
]);
t('T-P7-NOTIF-001', 'Challenge notifications', ['F-NOTIF-007'], 'S', null, [
  'Challenge events → notifications',
]);
t(
  'T-P7-WELL-001',
  'Screen-time journal & social media goals (self-reported)',
  ['F-WELL-001', 'F-WELL-002'],
  'S',
  null,
  ['Manual entry only; copy states no monitoring'],
);
t(
  'T-P7-WELL-002',
  'Procrastination tracker & anger reflection',
  ['F-WELL-004', 'F-WELL-005'],
  'S',
  null,
  ['wellbeing_logs types', 'Reflection prompts'],
);
t('T-P7-WELL-003', 'Digital detox challenges', ['F-WELL-006'], 'S', null, [
  'Reuse challenges engine',
]);

// ---------------- P8 AI ----------------
t(
  'T-P8-AI-001',
  'AI gateway & Anthropic adapter',
  ['F-AI-001'],
  'L',
  'AiProvider interface; Claude adapter with model routing via env; timeouts/retries; SSE streaming; app fully works with AI flag off (E2E).',
  ['Interface & adapter', 'Model routing config', 'SSE streaming', 'Unconfigured mode'],
);
t('T-P8-AI-002', 'Consent, privacy & disable', ['F-AI-002'], 'M', null, [
  'ai_consents per feature',
  'Global flag + per-user toggle',
  'Data-use disclosure EN/BN',
]);
t('T-P8-AI-003', 'Quotas & cost monitoring', ['F-AI-003'], 'M', null, [
  'ai_usage_logs',
  'Per-user daily limits',
  'Monthly budget circuit breaker',
  'Admin usage view',
]);
t('T-P8-AI-004', 'Safety filters & religious guardrails', ['F-AI-013'], 'L', null, [
  'Versioned prompt templates',
  'PII redaction',
  'No-fatwa guardrail + refusal copy',
  'Eval suite in CI',
]);
t('T-P8-AI-005', 'AI deed suggestions', ['F-AI-004'], 'M', null, [
  'Minimized context',
  'ai_insights storage',
]);
t(
  'T-P8-AI-006',
  'Reflection prompts & motivational messages',
  ['F-AI-006', 'F-AI-012'],
  'S',
  null,
  ['Prompt templates', 'Non-shaming tone evals'],
);
t('T-P8-AI-007', 'Weekly report narrative & growth insights', ['F-AI-007', 'F-AI-009'], 'M', null, [
  'Batch job',
  'Aggregate-only inputs',
]);
t('T-P8-AI-008', 'Habit coach & personal assistant', ['F-AI-005', 'F-AI-010'], 'L', null, [
  'ai_conversations, ai_messages',
  'Retention & delete',
]);
t('T-P8-AI-009', 'Natural-language task generation', ['F-AI-008'], 'M', null, [
  'Structured output',
  'User confirms before create',
]);
t('T-P8-AI-010', 'Voice journal', ['F-AI-011'], 'M', null, [
  'MediaRecorder capture',
  'STT adapter (unconfigured state)',
  'Encrypted storage via journal',
]);
t('T-P8-JRNL-001', 'AI journal summaries (opt-in)', ['F-JRNL-010'], 'S', null, [
  'Explicit per-request consent',
  'Summary not stored by provider (zero-retention config noted)',
]);

// ---------------- P9 Offline + Widget ----------------
t('T-P9-PWA-001', 'IndexedDB read cache', ['F-PWA-004'], 'M', null, [
  'idb schema',
  'Cache today/checklist/recent',
  'Logout clears data',
]);
t('T-P9-PWA-002', 'Outbox queue & optimistic UI', ['F-PWA-005'], 'L', null, [
  'Outbox with client op ids',
  'Optimistic state & rollback',
]);
t(
  'T-P9-PWA-003',
  '/sync endpoint & conflict handling',
  ['F-PWA-006'],
  'L',
  'POST /sync (<=100 ops) with op-id dedup in one query; row-level LWW on clientTime with the losing value logged; GET /sync/changes by change_seq cursor, 304 when unchanged (DL-015); integration tests incl. concurrent devices.',
  [
    'sync_operations',
    'change_seq sequence & triggers',
    'Batch apply',
    'Delta pull',
    'Conflict toast',
  ],
);
t('T-P9-PWA-004', 'Flush triggers', ['F-PWA-005'], 'S', null, [
  'Background Sync where supported',
  'online/focus/startup fallback',
]);
t('T-P9-PWA-005', 'App update flow', ['F-PWA-009'], 'S', null, [
  'Update available prompt',
  'Safe reload preserving outbox',
]);
t('T-P9-WIDGET-001', 'Android project scaffold', ['F-WIDGET-001'], 'M', null, [
  'Gradle/Kotlin/Glance, minSdk 26',
  'CI build & lint',
  'Host activity (link/settings only)',
]);
t('T-P9-WIDGET-002', 'Device linking & token storage', ['F-WIDGET-001'], 'M', null, [
  'widget_devices',
  'Web-issued link code (verification_tokens widget_link) + App Link QR',
  'Keystore-backed encrypted device token',
  'Revocation',
]);
t('T-P9-WIDGET-003', 'Widget snapshot API & cache', ['F-WIDGET-006'], 'M', null, [
  '/widget/snapshot (builder shared with /today, pre-build ETag)',
  'DataStore cache',
  '30-min refresh per FR-WIDGET-006',
]);
t('T-P9-WIDGET-004', 'Small progress widget', ['F-WIDGET-002'], 'S', null, [
  'Glance layout',
  'Progress ring',
]);
t('T-P9-WIDGET-005', 'Medium interactive checklist widget', ['F-WIDGET-003'], 'M', null, [
  'actionRunCallback',
  'Local queue → WorkManager sync',
]);
t('T-P9-WIDGET-006', 'Large detailed widget', ['F-WIDGET-004'], 'S', null, ['Detailed layout']);
t('T-P9-WIDGET-007', 'Islamic tracker widget', ['F-WIDGET-005'], 'S', null, [
  'Next prayer + salah ticks',
  'Hidden if module off',
]);
t(
  'T-P9-WIDGET-008',
  'Offline queue, retry & stale indicator',
  ['F-WIDGET-006', 'F-WIDGET-007'],
  'M',
  null,
  ['Exponential backoff', 'Stale badge after threshold'],
);
t('T-P9-WIDGET-009', 'Widget EN/BN localization', ['F-WIDGET-008'], 'S', null, [
  'values/ & values-bn/',
  'Follow server language pref',
]);
t('T-P9-WIDGET-010', 'Deep links / App Links', ['F-WIDGET-009'], 'S', null, [
  'assetlinks.json',
  'Intent to web routes',
]);

// ---------------- P10 Integrations, intelligence, hardening ----------------
t('T-P10-AUTH-001', 'Account recovery (codes / secondary email)', ['F-AUTH-011'], 'M', null, [
  'recovery_codes',
  'Recovery flow',
]);
t('T-P10-RPT-001', 'Monthly & yearly reports', ['F-RPT-002'], 'M', null, [
  'Report generation job',
  'Report pages',
]);
t('T-P10-RPT-002', 'CSV & PDF export', ['F-RPT-006', 'F-RPT-007'], 'M', null, [
  'export_jobs CSV',
  'PDF rendering with BN fonts',
]);
t('T-P10-RPT-003', 'Privacy-conscious product analytics', ['F-RPT-008'], 'M', null, [
  'Consent banner',
  'Aggregate events only, no journal/worship content',
]);
t('T-P10-INTG-001', 'Google Calendar export/sync', ['F-INTG-003', 'F-PLAN-008'], 'M', null, [
  'ICS feed (tokenized)',
  'Optional OAuth sync',
]);
t('T-P10-INTG-002', 'Public API', ['F-INTG-005'], 'L', null, [
  'api_clients & scoped tokens',
  'Rate limits',
  'Public docs',
]);
t('T-P10-ADMIN-001', 'A/B testing', ['F-ADMIN-010'], 'M', null, [
  'experiments table & sticky-hash assignment',
  'Exposure counts',
  'Aggregate results',
]);
t('T-P10-ADMIN-002', 'System health dashboard', ['F-ADMIN-012'], 'S', null, [
  'Health probes',
  'Dashboard',
]);
t('T-P10-ADMIN-003', 'API analytics', ['F-ADMIN-013'], 'S', null, [
  'Route latency/error aggregates',
]);
t('T-P10-ADMIN-004', 'Backup monitoring & restore drills', ['F-ADMIN-015'], 'S', null, [
  'Neon PITR status',
  'Restore drill log',
]);
t(
  'T-P10-RBAC-001',
  'Role & permission editor and admin invites',
  ['F-ADMIN-002', 'F-RBAC-004'],
  'M',
  'Super Admin can create custom roles from the permission catalog and invite admins by email; all audited (tests). Deferred from P2 (DL-032).',
  ['Role editor UI & API', 'Admin invite flow'],
);
t('T-P10-ADMIN-005', 'Audit log CSV export', ['F-ADMIN-016'], 'S', null, [
  'CSV export (audit.read, step-up)',
]);
t(
  'T-P10-PLAT-003',
  'OpenTelemetry tracing',
  [],
  'S',
  'Traces across web, api and worker with request-id correlation.',
  ['OTel SDK in api/worker', 'Exporter config'],
);
t('T-P10-QA-001', 'Full regression', [], 'M', 'All automated suites green on release candidate.', [
  'Regression run',
  'Defect triage',
]);
t('T-P10-QA-002', 'Security verification', [], 'L', 'No open High/Critical findings.', [
  'ZAP baseline + authenticated scan',
  'Authz matrix',
  'Dependency audit',
  'Manual OWASP checklist',
]);
t('T-P10-QA-003', 'Performance verification', [], 'M', 'k6 & Lighthouse budgets met.', [
  'k6 load',
  'Lighthouse CI budgets',
]);
t(
  'T-P10-QA-004',
  'Accessibility audit',
  [],
  'M',
  'WCAG 2.2 AA: no axe violations; manual SR pass EN/BN.',
  ['axe sweep', 'TalkBack/VoiceOver/NVDA pass'],
);
t(
  'T-P10-QA-005',
  'Cross-browser, in-app & PWA matrix',
  [],
  'M',
  'Matrix in QA_STRATEGY executed and recorded.',
  ['Browser matrix', 'In-app browsers', 'Install/offline checks'],
);
t(
  'T-P10-PLAT-001',
  'Production environment & operations',
  [],
  'L',
  'Prod deployed; alerts; runbooks; restore drill passed.',
  ['Prod infra', 'Alerts & on-call', 'Runbooks', 'Restore drill'],
);
t(
  'T-P10-PLAT-002',
  'Release & widget store submission',
  [],
  'M',
  'RELEASE_CHECKLIST complete; widget published.',
  ['Release checklist', 'Play Store listing EN/BN'],
);

export { T };

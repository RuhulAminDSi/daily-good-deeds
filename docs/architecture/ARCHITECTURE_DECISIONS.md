# Architecture Decision Records

Format: Context / Decision / Consequences / Alternatives. Status values: **Accepted** (the user confirmed it, or it follows directly from a confirmed decision), **Proposed** (awaiting approval of the plan), **Superseded**.

| ID | Title | Status |
|---|---|---|
| ADR-001 | Modular monolith | Accepted (directive) |
| ADR-002 | Next.js web + NestJS API split in a pnpm/Turborepo monorepo | Accepted (D-1, D-2, D-3) |
| ADR-003 | PostgreSQL on Neon (managed) | Accepted (D-4) |
| ADR-004 | Prisma ORM with raw SQL escape hatch | Proposed |
| ADR-005 | pg-boss for jobs; no Redis initially | Proposed (D-5) |
| ADR-006 | Own authentication instead of an auth vendor | Proposed |
| ADR-007 | Session cookie (SameSite + Origin check) for web, bearer device tokens for widget | Proposed |
| ADR-008 | `local_date` model for daily boundaries | Proposed |
| ADR-009 | UUIDv7 primary keys | Proposed |
| ADR-010 | Sync protocol: idempotent outbox + row-level LWW + change-sequence cursor | Proposed |
| ADR-011 | Serwist for the service worker | Proposed (D-2) |
| ADR-012 | Glance widget in a minimal host app | Accepted (D-8) |
| ADR-013 | AI provider abstraction, Claude default | Accepted (D-6) |
| ADR-014 | Application-level encryption for journals (single versioned key) | Proposed |
| ADR-015 | UI i18n catalogs in git, not the database | Proposed |
| ADR-016 | Content translations in `*_translations` tables | Proposed |
| ADR-017 | Hosting: Vercel + Render/Fly.io + Neon | Proposed (open); deferred by DL-040, which runs staging locally on the tailnet |
| ADR-018 | Islamic content: cached external APIs + curated seed | Accepted (D-7) |
| ADR-019 | Shared pure-TS domain package | Proposed |
| ADR-020 | REST + OpenAPI 3.1, contract-first via Zod | Proposed |
| ADR-021 | Plain (unpartitioned) `audit_logs` with purge | Proposed |
| ADR-022 | Feature flags are booleans; A/B lives in `experiments` | Proposed |
| ADR-023 | Derived `daily_summaries` and incremental streaks | Proposed |

---

## ADR-001 — Modular monolith
**Context.** The directive covers 19 modules, but the initial user base and team are small. The directive itself says to avoid unnecessary microservices.
**Decision.** Build one NestJS codebase with strict module boundaries (see [COMPONENT_ARCHITECTURE.md](COMPONENT_ARCHITECTURE.md)). It deploys as an `api` process and a `worker` process that share the code and the database.
**Consequences.** + One deploy, one schema migration stream, transactional consistency across modules, and simple local dev. − One noisy module can affect the others. Mitigations: separate worker process, per-module rate limits, and lint rules (`eslint-plugin-boundaries`) that enforce module imports.
**Alternatives.** Microservices (too costly operationally); serverless functions per feature (cold starts, scattered logic, hard to keep transactional).

## ADR-002 — Next.js web + NestJS API in a monorepo
**Context.** The web app is primary, but the Android widget and a future public API need the same backend. The backend also needs scheduled jobs and long-running work.
**Decision.** Next.js App Router for the web (SSR for fast first paint in in-app browsers and on low-end phones). A separate NestJS REST API. Both live in a pnpm workspace with Turborepo. Shared packages: `contracts`, `domain`, `i18n`, `ui`, `tokens`, `config`.
**Consequences.** + A clear API for every client; the backend is independent of the web hosting; shared types prevent contract drift. − Two deployables plus CORS/cookie domain setup (solved by sibling subdomains).
**Alternatives.** Next.js only (route handlers and server actions are coupled to the web runtime, a poor fit for the widget, public API, and workers); Express (less structure for RBAC and modules).

## ADR-003 — PostgreSQL on Neon
**Context.** The domain is relational and time-series-like (completions, salah, logs). Docker isn't available locally. The user chose managed Postgres.
**Decision.** PostgreSQL 16+ on Neon. A `main` branch for prod, `staging`, and ephemeral branches for previews and dev. Use the pooled connection (`DATABASE_URL`) for the app and the direct one (`DIRECT_URL`) for migrations.
**Consequences.** + No local DB install; branching per PR; PITR. − Cold starts on the free tier (acceptable for dev; prod uses an always-on compute minimum). Vendor coupling is low because it is standard Postgres. Supabase is an acceptable fallback.
**Alternatives.** Supabase (bundles auth/storage we don't need); RDS (more ops); self-hosted (needs Docker/ops).

## ADR-004 — Prisma ORM
**Context.** We want type-safe data access and reliable migrations.
**Decision.** Prisma Client for CRUD, and Prisma Migrate for schema migrations (SQL migration files committed). `$queryRaw` with tagged templates for aggregates (heatmaps, streak rebuilds, reports). Partial indexes, CHECK constraints, and generated columns are added through custom SQL in migrations.
**Consequences.** + Productivity and type safety. − Some Postgres features need raw SQL, and Prisma's query engine adds some overhead. Raw SQL must still be parameterized; template interpolation of identifiers is banned by a lint rule.
**Alternatives.** Drizzle (strong option, closer to SQL; reconsider if Prisma becomes limiting); TypeORM (weaker typing and migration story).

## ADR-005 — pg-boss for jobs; Redis deferred
**Context.** We need scheduled and retried jobs: reminders, digests, exports, AI batches, future letters. Adding Redis means another managed service.
**Decision.** pg-boss in its own `pgboss` schema. One singleton per-minute tick runs a single indexed scan on `reminders.next_fire_at` (DL-024). One-off future work, such as future-self letters, is enqueued with `startAfter` rather than polled. Per-queue concurrency, retries with exponential backoff, and dead-letter queues. The pg-boss polling interval is raised (about 10 s, not the 2 s default) to reduce idle DB load. Rate limiting is covered in [../api/API_CONVENTIONS.md](../api/API_CONVENTIONS.md) (DL-014).
**Consequences.** + One datastore; jobs can be enqueued in the same transaction as the domain write (no dual-write problem). − Lower throughput ceiling than Redis queues, and some DB load. **Revisit when:** more than 3 API instances, more than 500 jobs/s, or measurable lock contention.
**Cost note (verified in T-P2-PLAT-004).** A running pg-boss worker queries the database continuously (job polls plus pg-boss's internal cron, supervise and heartbeat timers), so Neon's compute does **not** scale to zero while a worker runs. That is accepted: the per-minute reminder tick (P6) needs an always-on worker anyway. Idle timers are tuned down (`IDLE_TUNING` in `worker.module.ts`). Scale-to-zero would need `schedule: false` plus an external cron. Preview branches run no worker (DL-026).
**Alternatives.** BullMQ + Redis; Graphile Worker (similar; pg-boss chosen for built-in cron and DLQ).

## ADR-006 — Own authentication
**Context.** We need email/password, Google OAuth, email verification, multi-device sessions with listing and revocation, admin step-up re-auth plus TOTP, widget device tokens, and RBAC tightly coupled to our permissions.
**Decision.** Implement auth in a NestJS `auth` module using **opaque, DB-backed tokens, with no JWTs** (DL-012).
- **Passwords:** Argon2id with the parameters in SRS FR-AUTH-002-01.
- **Web sessions:** a random 256-bit session ID, stored as a SHA-256 hash in `user_sessions`. It is looked up on every request, with an in-process cache of up to 5 s.
- **Widget:** an opaque device token, hashed in `widget_devices`.
- **Lifetimes:** set by SRS FR-AUTH-002-03/04 and FR-WIDGET-001.
- **Permissions:** loaded together with the session and cached for up to 60 s.
- **Revocation:** delete or revoke the session row. It takes effect immediately.
- **Google:** OIDC Authorization Code + PKCE, server-side.

**Consequences.**
- \+ Full control, no per-MAU cost, and device-token support for the widget.
- \+ Instant revocation, with no signing keys, refresh rotation or reuse detection to maintain.
- Con: One indexed lookup per request. This is negligible with the cache.
- Con: We own security-critical code. Mitigations: well-reviewed libraries (`argon2`, `openid-client`), the security test plan, and an external review before launch.
**Alternatives.** JWT access tokens with rotating refresh tokens (stateless verification is unnecessary when one service both issues and verifies, and it delays revocation); Auth.js (web-centric); Clerk/Supabase Auth/Auth0 (cost and lock-in; RBAC and audit would sit outside our DB).

## ADR-007 — Session cookie for web, bearer device tokens for widget
**Context.** Tokens in browser storage are exposed to XSS. Native clients can't use cookies cleanly.
**Decision.**
- **Web:** one session cookie, `__Host-dgd_session` (`HttpOnly; Secure; SameSite=Lax; Path=/`).
- **CSRF:** handled by SameSite=Lax plus a **mandatory `Origin`/`Sec-Fetch-Site` check** on every unsafe method. There is no separate CSRF token (DL-012).
- **Widget:** `Authorization: Bearer <device token>`, held in Android Keystore-backed encrypted storage. Device tokens carry `widget:*` permissions only.
- **Both** credentials are opaque and resolved by one guard. Details are in [../api/AUTHENTICATION.md](../api/AUTHENTICATION.md).

**Consequences.** + XSS can't steal the web credential, and a stolen widget token can do little. − Two transports, but one guard handles both.
**Alternatives.** Bearer tokens everywhere (XSS risk on the web); a double-submit HMAC CSRF token (redundant with SameSite=Lax plus the Origin check).

## ADR-008 — `local_date` model for daily boundaries
**Context.** Streaks and "today's checklist" must follow the user's local midnight, including travel and DST. Deriving the day from UTC timestamps at query time is error-prone and slow.
**Decision.** Every daily-activity record stores `local_date DATE` (the user's calendar day at the time of the action, computed by the client in the user's IANA zone and validated by the server against `occurred_at` within ±1 day), `occurred_at timestamptz`, and `tz TEXT` (the IANA zone used). The user's current zone is in `user_preferences.timezone`. Daily-boundary queries are `WHERE user_id = $1 AND local_date = $2`. Streak logic lives in `packages/domain` and operates on sequences of local dates.
**Consequences.** + Correct, indexable, and explainable; travel doesn't rewrite history. − A user changing timezone can produce a 23- or 25-hour "day". This is accepted and documented. The ±1 day validation blocks abuse.
**Alternatives.** UTC-only plus a query-time conversion (wrong on travel, expensive); a fixed signup timezone (wrong when the user moves).

## ADR-009 — UUIDv7 primary keys
**Context.** Clients (PWA outbox, widget) create records offline, and IDs must not leak counts.
**Decision.** UUIDv7 primary keys, generated by the client for offline-creatable entities and by the server otherwise. The `uuid` column type. A time-ordered prefix keeps B-tree locality.
**Consequences.** + Offline creation without remapping; not enumerable. − 16 bytes per key (acceptable). The server validates that client-supplied IDs are v7 and not already in use.
**Alternatives.** bigserial (enumerable, can't be generated offline); UUIDv4 (poor index locality).

## ADR-010 — Sync protocol
**Context.** Offline completion is required (F-PWA-005/006, F-WIDGET-006). Conflicts are rare, because data is mostly single-user, but they can happen across devices.
**Decision (DL-015).** The wire format is in [../api/API_SPECIFICATION.md](../api/API_SPECIFICATION.md) §10, and the rules are in SRS §19.
- **Outbox:** clients queue operations as `{opId (uuidv7), entity, entityId, action: upsert|delete, payload, clientTime}`.
- **Push:** `POST /sync` accepts **up to 100 ops**. All op IDs are checked against `sync_operations` in one query. Each new op is applied in its own transaction, and a replayed op returns its stored result.
- **Conflicts:** **row-level last-writer-wins on `clientTime`** (SRS FR-PWA-006-13), with `clientTime` clamped to server receipt time (FR-PWA-006-14). The losing row is kept in `sync_operations.conflict`, and the client shows a toast. There is no review UI.
- **Completions:** keyed by `(user_id, deed_plan_id, local_date)`, so "done" on two devices is not a conflict.
- **Cursor:** every syncable row carries `change_seq bigint`, set from one global sequence on write. `GET /sync/changes?cursor=` returns rows and tombstones with a higher `change_seq`, or 304 when nothing changed.
- **Pull only when behind:** the push response includes the latest cursor, so the client pulls only if it is behind.

**Consequences.**
- \+ Simple, predictable and auditable.
- \+ One cursor for all tables.
- Con: Row-level LWW can drop a concurrent edit to a *different* field of the same row. The offline entities are essentially single-field (status or count), and journals are online-only in v1.
**Alternatives.** CRDTs (overkill); per-field LWW with a conflict-review UI (complexity with no benefit for single-field entities); server-wins only (loses offline intent).

## ADR-011 — Serwist service worker
**Context.** Next.js App Router needs a maintained Workbox-style solution.
**Decision.** `@serwist/next` for precaching the build manifest and runtime caching routes. Custom code handles outbox flushing (Background Sync where available).
**Consequences.** + Maintained, Workbox-compatible strategies. − Coupled to the Next build; SW updates need an explicit prompt (F-PWA-009).
**Alternatives.** next-pwa (unmaintained); a hand-written SW (more risk).

## ADR-012 — Glance widget in a minimal host app
**Context.** Android widgets must ship inside an APK. The product must stay web-first.
**Decision.** `apps/android-widget` is a Kotlin app with one settings/link activity and Jetpack Glance widgets (small, medium, large, Islamic). Feature screens deep-link (App Links) into the web app. There are no feature screens in the native app.
**Consequences.** + Native widget quality with a tiny scope. − A Play Store listing is required; a separate CI pipeline (Gradle).
**Alternatives.** TWA + widget (Bubblewrap TWAs can host widgets, but that turns the PWA into a store app, which is unclear against the directive); RemoteViews XML (more boilerplate).

## ADR-013 — AI provider abstraction, Claude default
**Context.** AI must be optional, cost-controlled, privacy-preserving, and swappable.
**Decision.** An `AiProvider` interface (`complete`, `stream`, `transcribe?`) with an `AnthropicProvider` default. Model IDs come from env (`AI_MODEL_DEFAULT=claude-sonnet-5-5`, `AI_MODEL_FAST=claude-haiku-5-5`). All calls go through an `AiGateway` that enforces consent, feature flags, quotas, redaction, guardrails, and logging. See [AI_ARCHITECTURE.md](AI_ARCHITECTURE.md).
**Consequences.** + One choke point for policy and cost. − Provider-specific features (prompt caching, tool use) must be modelled as optional capabilities.
**Alternatives.** Calling the SDK directly from modules (no policy enforcement).

## ADR-014 — Application-level encryption for journals
**Context.** Journals are the most sensitive data. Disk-level encryption doesn't protect against DB dump leakage or over-broad admin queries.
**Decision (DL-030).**
- **Cipher and key:** journal titles and bodies are encrypted with **AES-256-GCM using a single versioned application key**, `JOURNAL_KEY_<n>` from env or a secret manager. The interface is KMS-ready.
- **Stored per row:** the ciphertext, a 96-bit `nonce` and `key_version`.
- **Rotation:** add key *n+1* for new writes, and re-encrypt old rows lazily.
- **Search:** no index is kept on the server. Search decrypts the user's own entries within their request; limits are set by SRS FR-JRNL-008-01.
- **Admin access:** none. Admins have **no** API to read journals.

**Consequences.**
- \+ A DB or backup leak alone doesn't reveal journals.
- \+ There is one key to manage.
- Con: No SQL full-text search over journals. This is acceptable at per-user volume.
- Con: Losing the key means losing the data, so the key is backed up in two secret stores.
**Alternatives.** Per-user DEKs wrapped by a KEK (the wrapped DEKs sit in the same DB and backups as the ciphertext, so they add no protection); pgcrypto in the DB (the key ends up in queries and logs); end-to-end client-side encryption (breaks AI summaries, and multi-device use without key sync; a possible future option).

## ADR-015 — UI i18n catalogs in git
**Context.** UI strings change with code and need review, type-checking, and missing-key CI checks.
**Decision.** `packages/i18n/messages/{en,bn}.json` (ICU MessageFormat), namespaced by feature. Typed keys are generated. CI fails on missing BN keys (or allows them only with an explicit `@fallback` allowlist). The API uses the same catalogs for emails, push, and errors.
**Consequences.** + Versioned, reviewable, type-safe. − Copy changes need a deploy. That is acceptable; admin-editable *content* is handled by ADR-016.
**Alternatives.** A `translation_entries` DB table for UI strings (drift, no type safety, runtime cost).

## ADR-016 — Content translations tables
**Context.** Admin-managed content (deeds, categories, achievements, duas, hadith) must exist in EN and BN, with fallback.
**Decision.**
- **Base table:** holds locale-independent fields and the **single review state** (DL-031).
- **Translations table:** `{entity}_translations(entity_id, locale, …text fields)`, unique on `(entity_id, locale)`. It has no per-translation `status` or `reviewed_by`.
- **Review states:** ordinary content is `draft | published`. Religious content (duas, hadith, dhikr presets) adds `in_review` and `verified_by` on the parent.
- **Reads:** the API serves the requested locale and falls back to `en`, setting `localeFallback: true` in the response metadata.

**Consequences.** + Adding a locale needs no schema change, and each entity is reviewed once. − Reads need joins (indexed and cached).
**Alternatives.** JSONB `{en, bn}` columns (harder to review/validate per locale); separate rows per locale in the base table.

## ADR-017 — Hosting proposal
**Context.** No hosting exists yet; the final choice is open.
**Decision (proposed).**
- **Web:** Vercel for `apps/web`, with functions pinned to **`sin1`** (`preferredRegion`) so server-side fetches stay in-region.
- **API and worker:** Render (or Fly.io) for `api` and `worker`, as separate services in the same region as Neon (`aws-ap-southeast-1` Singapore, closest to Bangladesh).
- **Other services:** R2 for objects, GitHub Actions for CI.
- **Database connections (DL-026):**
  - The API uses Neon's **pooled** URL with Prisma `?pgbouncer=true&connection_limit=5`.
  - Migrations and the long-lived **worker** use the **direct** URL with a small fixed pool.
- **Preview branches:** these run **no worker or cron**, so their compute can auto-suspend.
**Consequences.** + Low ops; preview environments. − Multiple vendors. The setup is portable: everything is containerizable (Dockerfiles are provided for the API and worker even though local dev doesn't need Docker).
**Alternatives.** A single VPS with Docker Compose (cheaper, more ops); fully on AWS (more setup).

## ADR-018 — Islamic content sources
**Context.** Religious content must be accurate and referenced.
**Decision.** Quran text and translations (including BN, after confirming the license) come from the Quran.com API v4. They are cached in Postgres with a source and version per edition and refreshed by a worker job. Prayer times are computed locally with `adhan` (both client and server, same parameters). Hijri dates use `Intl.DateTimeFormat` with `islamic-umalqura` plus a user offset. Duas and Hadith are an admin-curated seed with mandatory `islamic_content_sources` references and a review state; they are published only after verification.
**Consequences.** + Accuracy and provenance; offline prayer times. − We depend on the external API's availability, which the cache mitigates.
**Alternatives.** Fully admin-curated Quran text (huge effort, error risk).

## ADR-019 — Shared pure-TS domain package
**Context.** Recurrence expansion, streak computation, local-date math, Hijri, and zakat must give identical results on the client (offline) and the server.
**Decision.** `packages/domain` holds pure functions with no I/O, used by web, API, and worker. Kotlin re-implements only the minimal pieces (it shows server-computed snapshots).
**Consequences.** + One tested implementation with property-based tests. − The package must stay framework-free.

## ADR-020 — REST + OpenAPI, contract-first via Zod
**Context.** Three clients (web, widget, future public API) need a stable contract.
**Decision.** Zod schemas in `packages/contracts` are the source of truth. Nest controllers use them for validation, and `zod-openapi` generates OpenAPI 3.1. CI diffs the spec (`oasdiff`) to block unannounced breaking changes. A typed TS client is generated for the web; the Kotlin client is hand-written against the small widget subset.
**Consequences.** + No contract drift. − Generated code in the build pipeline.
**Alternatives.** GraphQL (caching and rate-limit complexity; widget overhead).

## ADR-021 — Plain `audit_logs` table
**Context.** We expect about 2 M audit rows a year. Partitioning would need a composite PK, jobs that create partitions, and SQL that Prisma doesn't manage.
**Decision (DL-027).** A plain table with a btree index on `occurred_at` (BRIN is optional), and a nightly batched purge of rows older than the retention period.
**Consequences.** + Simple, and fully managed by Prisma. − Partitioning gets added only if measured volume calls for it. The same policy applies to `deed_completions` and `notifications`.
**Alternatives.** Monthly partitions from day 1 (premature).

## ADR-022 — Feature flags vs experiments
**Context.** Flags (kill switches, staged features) and A/B tests have different lifecycles.
**Decision (DL-029).**
- `feature_flags` holds booleans, plus an optional role allowlist.
- A/B variants, weights and exposure counts live **only** in `experiments` (P10). Assignment uses a sticky hash.
- AI model tiers and prices live in env/config, not in flags or `system_settings`.

**Consequences.** + One mechanism per concern. − Percentage rollouts have to wait for `experiments`.
**Alternatives.** Variants on flags (two places to configure the same thing).

## ADR-023 — Derived `daily_summaries` and incremental streaks
**Context.** The calendar, heatmap and year views need a per-day "scheduled vs done" count. Evaluating recurrence rules for every plan and day on each request is wasteful (about 200 plans × 400 days).
**Decision (DL-023).**
- **`daily_summaries`:** holds `(user_id, local_date, scheduled, done, partial, skipped)`. It is updated in the completion transaction, and from today forward when a plan changes. Calendar, heatmap, year and overall-streak reads become a single indexed range scan.
- **Streak updates:** a completion for today or yesterday updates `streaks` in place. Past-day edits, rule changes and sync batches enqueue one debounced `streaks.rebuild:{userId}` job.
- **Rebuilding:** both tables can be rebuilt from completions using `packages/domain` (SRS §7.5.1).

**Consequences.** + Cheap reads, and sync batches don't trigger repeated recomputes. − Two derived tables must stay rebuildable; property tests cover this.
**Alternatives.** Compute everything on read (slow for year views); store recurrence occurrences (high write volume).

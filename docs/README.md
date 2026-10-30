# Daily Good Deeds — Documentation Index & Canonical Conventions

> Status: **Planning stage (Phase 0–1). No application code exists yet.** Everything in `docs/` is a specification awaiting approval.

## 1. Document map

| Area | Folder | Key entry point |
|---|---|---|
| Executive summary | `docs/` | [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md) |
| Discovery (Stage 0) | `docs/` | [PROJECT_DISCOVERY.md](PROJECT_DISCOVERY.md), [EXISTING_ARCHITECTURE.md](EXISTING_ARCHITECTURE.md), [TECH_STACK_DECISION.md](TECH_STACK_DECISION.md), [PROJECT_GAPS.md](PROJECT_GAPS.md) |
| Product (Stage 1) | `docs/product/` | [FEATURE_ID_REGISTRY.md](product/FEATURE_ID_REGISTRY.md) (canonical IDs), [FEATURE_CATALOG.md](product/FEATURE_CATALOG.md) |
| Requirements (Stage 2) | `docs/specifications/` | [SRS.md](specifications/SRS.md) |
| Architecture (Stage 3) | `docs/architecture/` | [SYSTEM_ARCHITECTURE.md](architecture/SYSTEM_ARCHITECTURE.md), [ARCHITECTURE_DECISIONS.md](architecture/ARCHITECTURE_DECISIONS.md) |
| Database (Stage 4) | `docs/database/` | [DATABASE_DESIGN.md](database/DATABASE_DESIGN.md), [ERD.md](database/ERD.md) |
| API (Stage 5) | `docs/api/` | [API_SPECIFICATION.md](api/API_SPECIFICATION.md), [openapi.yaml](api/openapi.yaml) |
| UI/UX | `docs/design/` | [DESIGN_SYSTEM.md](design/DESIGN_SYSTEM.md), [PAGE_SPECIFICATIONS.md](design/PAGE_SPECIFICATIONS.md) |
| Quality & security | `docs/qa/` | [QA_STRATEGY.md](qa/QA_STRATEGY.md), [TRACEABILITY_MATRIX.md](qa/TRACEABILITY_MATRIX.md) |
| Delivery | `docs/implementation/` | [IMPLEMENTATION_MASTER_PLAN.md](implementation/IMPLEMENTATION_MASTER_PLAN.md), [MASTER_TASK_TRACKER.md](implementation/MASTER_TASK_TRACKER.md) |

## 2. Identifier scheme (traceability backbone)

Hierarchy: **Epic → Feature → Requirement → User Story → Technical Task → Subtask → Test Case**.

| Artifact | Format | Example | Defined in |
|---|---|---|---|
| Epic | `EP-{MOD}` | `EP-DEED` | IMPLEMENTATION_MASTER_PLAN |
| Feature | `F-{MOD}-{nnn}` | `F-DEED-004` | product/FEATURE_ID_REGISTRY (**canonical**) |
| Functional requirement | `FR-{MOD}-{nnn}-{nn}` (nnn = parent feature number) | `FR-DEED-004-02` | specifications/SRS |
| Non-functional requirement | `NFR-{CATEGORY}-{nnn}` | `NFR-SECURITY-003` | specifications/SRS |
| User story | `US-{MOD}-{nnn}-{nn}` | `US-DEED-004-01` | product/USER_STORIES |
| Acceptance criterion | `AC-{MOD}-{nnn}-{nn}` | `AC-DEED-004-03` | product/ACCEPTANCE_CRITERIA |
| Technical task | `T-P{phase}-{MOD}-{nnn}` | `T-P3-DEED-012` | implementation/MASTER_TASK_TRACKER |
| Subtask | `{task}.{n}` | `T-P3-DEED-012.2` | implementation/MASTER_TASK_TRACKER |
| Test case | `TC-{MOD}-{nnn}-{nn}` | `TC-DEED-004-05` | qa/TEST_PLAN |
| Architecture decision | `ADR-{nnn}` | `ADR-004` | architecture/ARCHITECTURE_DECISIONS |
| Risk | `RISK-{nnn}` | `RISK-007` | implementation/IMPLEMENTATION_MASTER_PLAN |

NFR categories: `SECURITY, PRIVACY, PERFORMANCE, AVAILABILITY, SCALABILITY, ACCESSIBILITY, USABILITY, LOCALIZATION, COMPATIBILITY, MAINTAINABILITY, OBSERVABILITY, BACKUP, COMPLIANCE`.

## 3. Confirmed decisions (user-approved, 2026-10-30)

| # | Decision |
|---|---|
| D-1 | Monorepo: **pnpm workspaces + Turborepo**. |
| D-2 | Web: **Next.js (App Router) + TypeScript + Tailwind CSS**; accessible primitives (Radix UI) in an in-house component package; **next-intl** for i18n; **Serwist** for the service worker. |
| D-3 | API: **NestJS modular monolith**, REST under `/api/v1`, **OpenAPI 3.1** generated + contract-checked; **Prisma** ORM; **Zod** schemas shared with the web app. |
| D-4 | Database: **managed PostgreSQL 16+ (Neon recommended; Supabase acceptable)** for dev and prod. No local Docker required. |
| D-5 | Background jobs: **pg-boss** (Postgres-backed queue) in a separate worker process; Redis deferred until justified. |
| D-6 | AI: **Anthropic Claude** default provider behind an `AiProvider` interface; AI is optional and can be disabled globally and per user. |
| D-7 | Islamic content: **external APIs (e.g. Quran.com API v4) cached server-side + admin-curated, source-referenced seed** for Duas/Hadith. |
| D-8 | Android widget: **separate Kotlin app** (`apps/android-widget`) using **Jetpack Glance + WorkManager + DataStore**, minimal host activity for device linking only. The main product stays web. |

## 4. Canonical runtime layout (planned)

```
daily-good-deeds/
├─ apps/
│  ├─ web/              Next.js PWA (user app + /admin area)
│  ├─ api/              NestJS: REST API (src/main.ts) and pg-boss worker (src/worker.ts), two processes (DL-036)
│  └─ android-widget/   Kotlin / Gradle project (not part of pnpm workspace)
├─ packages/
│  ├─ contracts/        Zod schemas + generated OpenAPI client & types
│  ├─ i18n/             en.json / bn.json message catalogs + ICU helpers
│  ├─ ui/               Design-system components (Radix + Tailwind)
│  ├─ tokens/           Design tokens (CSS vars, Tailwind preset, Android color export)
│  ├─ domain/           Pure TS domain logic shared web/api (recurrence, streaks, local-date math, Hijri, zakat)
│  └─ config/           eslint, tsconfig, prettier presets
└─ docs/
```

## 5. Canonical API resource map (`/api/v1`)

| Prefix | Module | Notes |
|---|---|---|
| `/auth/*` | AUTH | register, login, refresh, logout, verify-email, password reset, OAuth Google, sessions |
| `/me`, `/me/preferences`, `/me/sessions`, `/me/export`, `/me/deletion` | AUTH | current user |
| `/categories`, `/deeds`, `/deeds/random`, `/deeds/recommendations` | DEED | library + custom deeds |
| `/plans` | DEED | user's scheduled deeds (recurrence) |
| `/completions` | DEED/CAL | completion records keyed by `local_date` |
| `/checklist/{localDate}` | DEED | computed daily checklist |
| `/calendar`, `/streaks`, `/heatmap` | CAL | aggregates |
| `/goals`, `/goals/{id}/milestones`, `/life-balance`, `/growth/*` | GROW | |
| `/journal` | JRNL | entries with `type` (journal, intention, reflection, gratitude, future_letter, learning_note) |
| `/planner` | PLAN | planner items |
| `/islamic/*` | ISL | `prayer-times`, `salah`, `quran/*`, `dhikr`, `duas`, `sunnah`, `fasting`, `ramadan-plans`, `zakat`, `hijri`, `hadith/today`, `preferences` |
| `/wellbeing/*` | WELL | |
| `/achievements`, `/tree` | GAME | |
| `/notifications`, `/notification-preferences`, `/reminders`, `/push-subscriptions` | NOTIF | |
| `/groups`, `/groups/{id}/members`, `/invitations`, `/challenges`, `/campaigns`, `/volunteer-opportunities`, `/posts`, `/reports`, `/blocks` | COMM | groups have `type` = family \| community |
| `/ai/*` | AI | `suggestions`, `conversations`, `reflections`, `weekly-report`, `consent`, `usage` |
| `/reports/*`, `/exports` | RPT | |
| `/sync` | PWA/WIDGET | batched idempotent mutations + delta pull |
| `/widget/*` | WIDGET | device link, compact snapshot |
| `/admin/*` | ADMIN/RBAC | all admin endpoints; permission-guarded |
| `/public/*` | INTG | future public API (scoped API tokens) |

## 6. Canonical table inventory (validated from the directive's entity list)

Naming: `snake_case`, plural table names, `uuid` PKs (UUIDv7), `created_at`/`updated_at timestamptz`, soft delete via `deleted_at` only where recovery is a requirement. Per-user tables carry `user_id` and are always filtered by it.

This section is the **only** place that states the table list, the counts and the phase that first creates each table. Other docs link here. The [DATA_DICTIONARY](database/DATA_DICTIONARY.md) defines exactly these tables, and module ownership is in [COMPONENT_ARCHITECTURE](architecture/COMPONENT_ARCHITECTURE.md).

| Domain | Count | Tables by creating phase | Merge / defer decisions |
|---|---|---|---|
| Identity | 11 | **P2:** `users`, `user_preferences`, `auth_identities`, `user_sessions`, `verification_tokens`, `roles`, `permissions`, `user_roles`, `role_permissions`, `mfa_factors` · **P10:** `recovery_codes` | `email_verifications` + `password_resets` → **`verification_tokens`** (typed, hashed; also `email_change`, `widget_link`). `auth_identities` added for Google OAuth. |
| Deeds | 8 | **P3:** `deed_categories`, `deed_category_translations`, `deeds`, `deed_translations`, `deed_plans`, `deed_completions`, `completion_attachments`, `favorite_deeds` | `good_deeds` + `user_custom_deeds` → **`deeds`** (`owner_user_id` NULL = system). `recurring_schedules` → **`deed_plans`** (recurrence rule). `daily_activities` → **`deed_completions`**. |
| Growth | 14 | **P3:** `streaks`, `daily_summaries` · **P4:** `life_balance_categories`, `goals`, `goal_milestones`, `achievements`, `achievement_translations`, `user_achievements`, `journal_entries`, `growth_snapshots`, `life_balance_assessments`, `planner_items`, `wellbeing_logs`, `affirmations` | `journals` + `gratitude_entries` + `future_letters` + learning notes → **`journal_entries`** with `entry_type`. `habit_streaks` → **`streaks`**. `streaks` and `daily_summaries` are derived caches, rebuildable from completions (DL-023). |
| Islamic | 17 | **P5:** `islamic_preferences`, `salah_records`, `quran_reading_logs`, `quran_memorization_progress`, `khatam_plans`, `dhikr_presets`, `dhikr_logs`, `duas`, `dua_translations`, `hadith_entries`, `hadith_translations`, `sunnah_practices`, `practice_logs`, `fasting_records`, `ramadan_plans`, `zakat_calculations`, `islamic_content_sources` | `sunnah_records` + tahajjud → **`practice_logs`** (references `sunnah_practices`). `dua_contents` → **`duas`**. Zakat rows stored only when the user saves. |
| Community | 15 | **P7:** `groups`, `group_members`, `group_invitations`, `challenges`, `challenge_participants`, `challenge_progress`, `campaigns`, `campaign_participations`, `volunteer_opportunities`, `posts`, `comments`, `reactions`, `content_reports`, `user_blocks`, `moderation_actions` | `families` + `community_groups` → **`groups`** (`type`). `reports` renamed **`content_reports`** (avoids a clash with analytics reports). `user_blocks` added. |
| AI | 5 | **P8:** `ai_consents`, `ai_conversations`, `ai_messages`, `ai_usage_logs`, `ai_insights` | `ai_generated_suggestions` → **`ai_insights`** (`insight_type`). |
| Platform | 15 | **P2:** `audit_logs`, `system_settings`, `feature_flags`, `idempotency_keys`, `export_jobs` (account data export) · **P3:** `content_versions` · **P6:** `notifications`, `notification_preferences`, `reminders`, `push_subscriptions`, `broadcasts` · **P9:** `widget_devices`, `sync_operations` · **P10:** `experiments`, `api_clients` | `translation_entries` → **not a table for UI strings** (UI strings live in `packages/i18n` in git); content translations live in `*_translations` tables. pg-boss owns its own `pgboss.*` schema. |
| **Total** | **85** | | |

## 7. Product guardrails (apply to every document)

1. Journals, worship records, and personal activities are **private by default**; nothing is shared without an explicit per-item action.
2. No public rankings of worship; no shame-based or guilt-based copy; analytics are never framed as a measure of a person's worth.
3. No AI-generated religious rulings (fatwa); religious content always cites a source; never claim acceptance of worship.
4. AI is never required for core functionality; AI can be disabled globally (feature flag) and per user.
5. No mock data in production paths; unconfigured integrations are explicit, documented, and fail gracefully.
6. Every user-facing string is localized (EN + BN) — no hardcoded strings in components.
7. Do not promise identical capabilities across in-app browsers / iOS; document limitations and fallbacks.
8. Device-usage tracking is self-reported only unless a real authorized integration exists.

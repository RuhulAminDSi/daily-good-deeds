# Master Task Tracker

> Generated from the same task dataset as the task tables in [IMPLEMENTATION_MASTER_PLAN.md](IMPLEMENTATION_MASTER_PLAN.md). Hierarchy: **Epic → Feature → Task → Subtask → Test case**. Feature IDs come from [FEATURE_ID_REGISTRY.md](../product/FEATURE_ID_REGISTRY.md).
>
> Test case IDs here are **placeholders**, allocated in sequence per feature. [qa/TEST_PLAN.md](../qa/TEST_PLAN.md) defines their steps. Update **Status** as work moves (Not started → In progress → In review → Done → Verified). A task is marked Done only when its Definition of Done in the master plan is met, including tests. A UI that exists without its backend and tests does **not** count as Done.

**Totals:** 200 tasks · 540 subtasks · 196 in-scope features (P2–P10) covered · 2 Won't-Have features deliberately unmapped (F-INTG-004, F-ADMIN-017).

## Phase 0

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-GOV | — | T-P0-GOV-001 | Repository & environment discovery | T-P0-GOV-001.1, T-P0-GOV-001.2 | TC-GOV-001-01 | Done | P0 |
| EP-GOV | — | T-P0-GOV-002 | Canonical feature ID registry & conventions | T-P0-GOV-002.1, T-P0-GOV-002.2, T-P0-GOV-002.3 | TC-GOV-002-01 | Done | P0 |

## Phase 1

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-GOV | — | T-P1-GOV-001 | Product docs (vision, scope, catalog, stories, ACs) | T-P1-GOV-001.1, T-P1-GOV-001.2, T-P1-GOV-001.3, T-P1-GOV-001.4 | TC-GOV-001-02 | Done | P1 |
| EP-GOV | — | T-P1-GOV-002 | SRS | T-P1-GOV-002.1, T-P1-GOV-002.2, T-P1-GOV-002.3 | TC-GOV-002-02 | Done | P1 |
| EP-GOV | — | T-P1-GOV-003 | Architecture, database & API specifications | T-P1-GOV-003.1, T-P1-GOV-003.2, T-P1-GOV-003.3 | TC-GOV-003-01 | Done | P1 |
| EP-GOV | — | T-P1-GOV-004 | UI/UX, QA & implementation plans | T-P1-GOV-004.1, T-P1-GOV-004.2, T-P1-GOV-004.3 | TC-GOV-004-01 | Done | P1 |
| EP-GOV | — | T-P1-GOV-005 | Executive summary & approval gate | T-P1-GOV-005.1, T-P1-GOV-005.2 | TC-GOV-005-01 | Done | P1 |

## Phase 2

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-PLAT | — | T-P2-PLAT-001 | Monorepo scaffold (pnpm via Corepack, Turborepo, packages/config) | T-P2-PLAT-001.1, T-P2-PLAT-001.2, T-P2-PLAT-001.3, T-P2-PLAT-001.4 | TC-PLAT-001-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-002 | apps/api NestJS skeleton | T-P2-PLAT-002.1, T-P2-PLAT-002.2, T-P2-PLAT-002.3, T-P2-PLAT-002.4, T-P2-PLAT-002.5 | TC-PLAT-002-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-003 | Prisma + Neon baseline | T-P2-PLAT-003.1, T-P2-PLAT-003.2, T-P2-PLAT-003.3, T-P2-PLAT-003.4, T-P2-PLAT-003.5 | TC-PLAT-003-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-004 | apps/worker with pg-boss | T-P2-PLAT-004.1, T-P2-PLAT-004.2, T-P2-PLAT-004.3, T-P2-PLAT-004.4 | TC-PLAT-004-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-005 | apps/web Next.js skeleton | T-P2-PLAT-005.1, T-P2-PLAT-005.2, T-P2-PLAT-005.3, T-P2-PLAT-005.4 | TC-PLAT-005-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-006 | packages/contracts (Zod + generated OpenAPI types) | T-P2-PLAT-006.1, T-P2-PLAT-006.2, T-P2-PLAT-006.3 | TC-PLAT-006-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-007 | CI pipeline (GitHub Actions) | T-P2-PLAT-007.1, T-P2-PLAT-007.2, T-P2-PLAT-007.3, T-P2-PLAT-007.4, T-P2-PLAT-007.5, T-P2-PLAT-007.6 | TC-PLAT-007-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-008 | Security baseline middleware | T-P2-PLAT-008.1, T-P2-PLAT-008.2, T-P2-PLAT-008.3, T-P2-PLAT-008.4 | TC-PLAT-008-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-009 | Observability | T-P2-PLAT-009.1, T-P2-PLAT-009.2, T-P2-PLAT-009.3 | TC-PLAT-009-01 | Done | P2 |
| EP-PLAT | — | T-P2-PLAT-010 | Staging deployment (local + Tailscale, DL-040) | T-P2-PLAT-010.1, T-P2-PLAT-010.2, T-P2-PLAT-010.3, T-P2-PLAT-010.4, T-P2-PLAT-010.5, T-P2-PLAT-010.6 | TC-PLAT-010-01 | Done | P2 |
| EP-UI | — | T-P2-UI-001 | packages/tokens | T-P2-UI-001.1, T-P2-UI-001.2, T-P2-UI-001.3, T-P2-UI-001.4 | TC-UI-001-01 | Done | P2 |
| EP-UI | — | T-P2-UI-002 | packages/ui core components | T-P2-UI-002.1, T-P2-UI-002.2, T-P2-UI-002.3, T-P2-UI-002.4 | TC-UI-002-01 | Done | P2 |
| EP-UI | F-PWA-002 | T-P2-UI-003 | App shell & responsive navigation | T-P2-UI-003.1, T-P2-UI-003.2, T-P2-UI-003.3 | TC-PWA-002-01 | Done | P2 |
| EP-UI | F-AUTH-010 | T-P2-UI-004 | Theme switching (light/dark/system) | T-P2-UI-004.1, T-P2-UI-004.2 | TC-AUTH-010-01 | Done | P2 |
| EP-I18N | F-I18N-001 | T-P2-I18N-001 | EN/BN catalogs & next-intl setup | T-P2-I18N-001.1, T-P2-I18N-001.2, T-P2-I18N-001.3 | TC-I18N-001-01 | Not started | P2 |
| EP-I18N | F-I18N-001, F-I18N-009 | T-P2-I18N-002 | No-hardcoded-strings lint & missing-key check | T-P2-I18N-002.1, T-P2-I18N-002.2 | TC-I18N-001-02, TC-I18N-009-01 | Not started | P2 |
| EP-I18N | F-I18N-002, F-I18N-003 | T-P2-I18N-003 | Language switcher & persistence | T-P2-I18N-003.1, T-P2-I18N-003.2, T-P2-I18N-003.3 | TC-I18N-002-01, TC-I18N-003-01 | Not started | P2 |
| EP-I18N | F-I18N-004 | T-P2-I18N-004 | Locale formatting helpers | T-P2-I18N-004.1, T-P2-I18N-004.2, T-P2-I18N-004.3 | TC-I18N-004-01 | Not started | P2 |
| EP-I18N | F-I18N-005 | T-P2-I18N-005 | Bengali typography | T-P2-I18N-005.1, T-P2-I18N-005.2 | TC-I18N-005-01 | Not started | P2 |
| EP-I18N | F-I18N-007 | T-P2-I18N-006 | Localized validation & API errors | T-P2-I18N-006.1, T-P2-I18N-006.2, T-P2-I18N-006.3, T-P2-I18N-006.4 | TC-I18N-007-01 | Not started | P2 |
| EP-I18N | F-I18N-009 | T-P2-I18N-007 | Fallback & missing-key reporting | T-P2-I18N-007.1, T-P2-I18N-007.2 | TC-I18N-009-02 | Not started | P2 |
| EP-PWA | F-PWA-001 | T-P2-PWA-001 | Web manifest & installability | T-P2-PWA-001.1, T-P2-PWA-001.2, T-P2-PWA-001.3 | TC-PWA-001-01 | Not started | P2 |
| EP-PWA | F-PWA-003 | T-P2-PWA-002 | Service worker app shell (Serwist) | T-P2-PWA-002.1, T-P2-PWA-002.2, T-P2-PWA-002.3, T-P2-PWA-002.4 | TC-PWA-003-01 | Not started | P2 |
| EP-PWA | F-PWA-007 | T-P2-PWA-003 | In-app browser detection & fallback | T-P2-PWA-003.1, T-P2-PWA-003.2, T-P2-PWA-003.3 | TC-PWA-007-01 | Not started | P2 |
| EP-PWA | F-PWA-008 | T-P2-PWA-004 | Capability detection & graceful degradation | T-P2-PWA-004.1, T-P2-PWA-004.2 | TC-PWA-008-01 | Not started | P2 |
| EP-AUTH | F-AUTH-001 | T-P2-AUTH-001 | Identity schema | T-P2-AUTH-001.1, T-P2-AUTH-001.2, T-P2-AUTH-001.3, T-P2-AUTH-001.4 | TC-AUTH-001-01 | Not started | P2 |
| EP-AUTH | F-AUTH-001 | T-P2-AUTH-002 | Registration | T-P2-AUTH-002.1, T-P2-AUTH-002.2, T-P2-AUTH-002.3, T-P2-AUTH-002.4, T-P2-AUTH-002.5, T-P2-AUTH-002.6 | TC-AUTH-001-02 | Not started | P2 |
| EP-AUTH | F-AUTH-004 | T-P2-AUTH-003 | Email verification | T-P2-AUTH-003.1, T-P2-AUTH-003.2, T-P2-AUTH-003.3 | TC-AUTH-004-01 | Not started | P2 |
| EP-AUTH | F-AUTH-002 | T-P2-AUTH-004 | Login, tokens & sessions | T-P2-AUTH-004.1, T-P2-AUTH-004.2, T-P2-AUTH-004.3, T-P2-AUTH-004.4, T-P2-AUTH-004.5 | TC-AUTH-002-01 | Not started | P2 |
| EP-AUTH | F-AUTH-003 | T-P2-AUTH-005 | Google OAuth (PKCE redirect) | T-P2-AUTH-005.1, T-P2-AUTH-005.2, T-P2-AUTH-005.3, T-P2-AUTH-005.4 | TC-AUTH-003-01 | Not started | P2 |
| EP-AUTH | F-AUTH-005 | T-P2-AUTH-006 | Forgot & reset password | T-P2-AUTH-006.1, T-P2-AUTH-006.2, T-P2-AUTH-006.3 | TC-AUTH-005-01 | Not started | P2 |
| EP-AUTH | F-AUTH-006, F-AUTH-007 | T-P2-AUTH-007 | Logout & session management | T-P2-AUTH-007.1, T-P2-AUTH-007.2, T-P2-AUTH-007.3 | TC-AUTH-006-01, TC-AUTH-007-01 | Not started | P2 |
| EP-AUTH | F-AUTH-008 | T-P2-AUTH-008 | Profile management | T-P2-AUTH-008.1, T-P2-AUTH-008.2 | TC-AUTH-008-01 | Not started | P2 |
| EP-AUTH | F-AUTH-010 | T-P2-AUTH-009 | User preferences | T-P2-AUTH-009.1, T-P2-AUTH-009.2, T-P2-AUTH-009.3 | TC-AUTH-010-02 | Not started | P2 |
| EP-AUTH | F-AUTH-009 | T-P2-AUTH-010 | Account deletion & data export | T-P2-AUTH-010.1, T-P2-AUTH-010.2, T-P2-AUTH-010.3, T-P2-AUTH-010.4 | TC-AUTH-009-01 | Not started | P2 |
| EP-AUTH | F-AUTH-002, F-AUTH-007 | T-P2-AUTH-011 | Web auth guards | T-P2-AUTH-011.1, T-P2-AUTH-011.2, T-P2-AUTH-011.3 | TC-AUTH-002-02, TC-AUTH-007-02 | Not started | P2 |
| EP-RBAC | F-RBAC-001 | T-P2-RBAC-001 | Roles & permission catalog | T-P2-RBAC-001.1, T-P2-RBAC-001.2, T-P2-RBAC-001.3 | TC-RBAC-001-01 | Not started | P2 |
| EP-RBAC | F-RBAC-002 | T-P2-RBAC-002 | Permission guard (deny by default) | T-P2-RBAC-002.1, T-P2-RBAC-002.2, T-P2-RBAC-002.3 | TC-RBAC-002-01 | Not started | P2 |
| EP-RBAC | F-RBAC-003 | T-P2-RBAC-003 | Role assignment | T-P2-RBAC-003.1, T-P2-RBAC-003.2, T-P2-RBAC-003.3 | TC-RBAC-003-01 | Not started | P2 |
| EP-RBAC | F-RBAC-004 | T-P2-RBAC-004 | Admin account management | T-P2-RBAC-004.1, T-P2-RBAC-004.2 | TC-RBAC-004-01 | Not started | P2 |
| EP-RBAC | F-RBAC-005 | T-P2-RBAC-005 | Audit logging | T-P2-RBAC-005.1, T-P2-RBAC-005.2, T-P2-RBAC-005.3 | TC-RBAC-005-01 | Not started | P2 |
| EP-RBAC | F-RBAC-006 | T-P2-RBAC-006 | Admin step-up re-authentication | T-P2-RBAC-006.1, T-P2-RBAC-006.2 | TC-RBAC-006-01 | Not started | P2 |
| EP-RBAC | F-RBAC-007 | T-P2-RBAC-007 | Admin TOTP 2FA | T-P2-RBAC-007.1, T-P2-RBAC-007.2, T-P2-RBAC-007.3 | TC-RBAC-007-01 | Not started | P2 |
| EP-RBAC | F-RBAC-002 | T-P2-RBAC-008 | Authorization test matrix | T-P2-RBAC-008.1, T-P2-RBAC-008.2 | TC-RBAC-002-02 | Not started | P2 |
| EP-ADMIN | F-ADMIN-001 | T-P2-ADMIN-001 | Admin shell | T-P2-ADMIN-001.1, T-P2-ADMIN-001.2 | TC-ADMIN-001-01 | Not started | P2 |
| EP-ADMIN | F-ADMIN-001 | T-P2-ADMIN-002 | User management | T-P2-ADMIN-002.1, T-P2-ADMIN-002.2, T-P2-ADMIN-002.3 | TC-ADMIN-001-02 | Not started | P2 |
| EP-ADMIN | F-ADMIN-002 | T-P2-ADMIN-003 | Role assignment UI (read-only role catalog) | T-P2-ADMIN-003.1, T-P2-ADMIN-003.2 | TC-ADMIN-002-01 | Not started | P2 |
| EP-ADMIN | F-ADMIN-009 | T-P2-ADMIN-004 | Feature flags | T-P2-ADMIN-004.1, T-P2-ADMIN-004.2, T-P2-ADMIN-004.3, T-P2-ADMIN-004.4 | TC-ADMIN-009-01 | Not started | P2 |
| EP-ADMIN | F-ADMIN-016 | T-P2-ADMIN-005 | Audit log viewer | T-P2-ADMIN-005.1, T-P2-ADMIN-005.2 | TC-ADMIN-016-01 | Not started | P2 |
| EP-ADMIN | — | T-P2-ADMIN-006 | System settings service | T-P2-ADMIN-006.1, T-P2-ADMIN-006.2 | TC-ADMIN-006-01 | Not started | P2 |
| EP-INTG | F-INTG-001, F-NOTIF-005 | T-P2-INTG-001 | Email adapter & templates | T-P2-INTG-001.1, T-P2-INTG-001.2, T-P2-INTG-001.3, T-P2-INTG-001.4, T-P2-INTG-001.5 | TC-INTG-001-01, TC-NOTIF-005-01 | Not started | P2 |
| EP-QA | — | T-P2-QA-001 | Test infrastructure | T-P2-QA-001.1, T-P2-QA-001.2, T-P2-QA-001.3, T-P2-QA-001.4 | TC-QA-001-01 | Not started | P2 |
| EP-QA | F-AUTH-001, F-AUTH-002, F-RBAC-006 | T-P2-QA-002 | Phase 2 E2E & regression suite | T-P2-QA-002.1, T-P2-QA-002.2, T-P2-QA-002.3 | TC-AUTH-001-03, TC-AUTH-002-03, TC-RBAC-006-02 | Not started | P2 |

## Phase 3

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-CAL | F-CAL-010 | T-P3-CAL-001 | Local-date & timezone domain utilities | T-P3-CAL-001.1, T-P3-CAL-001.2, T-P3-CAL-001.3 | TC-CAL-010-01 | Not started | P3 |
| EP-DEED | F-DEED-001, F-DEED-002 | T-P3-DEED-001 | Deeds schema | T-P3-DEED-001.1, T-P3-DEED-001.2, T-P3-DEED-001.3 | TC-DEED-001-01, TC-DEED-002-01 | Not started | P3 |
| EP-I18N | F-I18N-008 | T-P3-I18N-001 | Content translation pattern & locale resolution | T-P3-I18N-001.1, T-P3-I18N-001.2 | TC-I18N-008-01 | Not started | P3 |
| EP-DEED | F-DEED-001, F-DEED-013 | T-P3-DEED-002 | Deed library seed (EN/BN) | T-P3-DEED-002.1, T-P3-DEED-002.2, T-P3-DEED-002.3 | TC-DEED-001-02, TC-DEED-013-01 | Not started | P3 |
| EP-DEED | F-DEED-002 | T-P3-DEED-003 | Categories API & UI | T-P3-DEED-003.1, T-P3-DEED-003.2 | TC-DEED-002-02 | Not started | P3 |
| EP-DEED | F-DEED-011 | T-P3-DEED-004 | Deed discovery (browse/search/filter) | T-P3-DEED-004.1, T-P3-DEED-004.2, T-P3-DEED-004.3 | TC-DEED-011-01 | Not started | P3 |
| EP-DEED | F-DEED-003 | T-P3-DEED-005 | Custom deeds | T-P3-DEED-005.1, T-P3-DEED-005.2 | TC-DEED-003-01 | Not started | P3 |
| EP-DEED | F-DEED-005 | T-P3-DEED-006 | Recurrence engine | T-P3-DEED-006.1, T-P3-DEED-006.2, T-P3-DEED-006.3, T-P3-DEED-006.4 | TC-DEED-005-01 | Not started | P3 |
| EP-DEED | F-DEED-005 | T-P3-DEED-007 | Plans (my routine) | T-P3-DEED-007.1, T-P3-DEED-007.2, T-P3-DEED-007.3 | TC-DEED-005-02 | Not started | P3 |
| EP-DEED | F-DEED-004 | T-P3-DEED-008 | Daily checklist & Today page | T-P3-DEED-008.1, T-P3-DEED-008.2, T-P3-DEED-008.3, T-P3-DEED-008.4, T-P3-DEED-008.5 | TC-DEED-004-01 | Not started | P3 |
| EP-DEED | F-DEED-009, F-DEED-008 | T-P3-DEED-009 | Completions (status & notes) | T-P3-DEED-009.1, T-P3-DEED-009.2, T-P3-DEED-009.3 | TC-DEED-009-01, TC-DEED-008-01 | Not started | P3 |
| EP-DEED | F-DEED-006 | T-P3-DEED-010 | Favorites | T-P3-DEED-010.1, T-P3-DEED-010.2 | TC-DEED-006-01 | Not started | P3 |
| EP-DEED | F-DEED-007 | T-P3-DEED-011 | Activity history | T-P3-DEED-011.1, T-P3-DEED-011.2 | TC-DEED-007-01 | Not started | P3 |
| EP-DEED | F-DEED-010 | T-P3-DEED-012 | Evidence attachments | T-P3-DEED-012.1, T-P3-DEED-012.2, T-P3-DEED-012.3, T-P3-DEED-012.4, T-P3-DEED-012.5 | TC-DEED-010-01 | Not started | P3 |
| EP-DEED | F-DEED-012 | T-P3-DEED-013 | Random good deed generator | T-P3-DEED-013.1, T-P3-DEED-013.2 | TC-DEED-012-01 | Not started | P3 |
| EP-DEED | F-DEED-013 | T-P3-DEED-014 | Five-minute deeds collection | T-P3-DEED-014.1, T-P3-DEED-014.2 | TC-DEED-013-02 | Not started | P3 |
| EP-DEED | F-DEED-014 | T-P3-DEED-015 | Rule-based recommendations | T-P3-DEED-015.1, T-P3-DEED-015.2, T-P3-DEED-015.3 | TC-DEED-014-01 | Not started | P3 |
| EP-CAL | F-CAL-007, F-CAL-008 | T-P3-CAL-002 | Streak engine & cache | T-P3-CAL-002.1, T-P3-CAL-002.2, T-P3-CAL-002.3, T-P3-CAL-002.4, T-P3-CAL-002.5 | TC-CAL-007-01, TC-CAL-008-01 | Not started | P3 |
| EP-CAL | F-CAL-006 | T-P3-CAL-003 | Daily completion rate | T-P3-CAL-003.1, T-P3-CAL-003.2 | TC-CAL-006-01 | Not started | P3 |
| EP-CAL | F-CAL-001, F-CAL-002, F-CAL-003 | T-P3-CAL-004 | Daily/weekly/monthly calendar | T-P3-CAL-004.1, T-P3-CAL-004.2, T-P3-CAL-004.3 | TC-CAL-001-01, TC-CAL-002-01, TC-CAL-003-01 | Not started | P3 |
| EP-CAL | F-CAL-004, F-CAL-005 | T-P3-CAL-005 | Yearly history & heatmap | T-P3-CAL-005.1, T-P3-CAL-005.2, T-P3-CAL-005.3 | TC-CAL-004-01, TC-CAL-005-01 | Not started | P3 |
| EP-CAL | F-CAL-011 | T-P3-CAL-006 | Past-day editing | T-P3-CAL-006.1, T-P3-CAL-006.2, T-P3-CAL-006.3 | TC-CAL-011-01 | Not started | P3 |
| EP-ADMIN | F-ADMIN-003 | T-P3-ADMIN-001 | Deed & category content admin | T-P3-ADMIN-001.1, T-P3-ADMIN-001.2, T-P3-ADMIN-001.3 | TC-ADMIN-003-01 | Not started | P3 |
| EP-ADMIN | F-ADMIN-004, F-I18N-008 | T-P3-ADMIN-002 | Content translation management | T-P3-ADMIN-002.1, T-P3-ADMIN-002.2, T-P3-ADMIN-002.3 | TC-ADMIN-004-01, TC-I18N-008-02 | Not started | P3 |
| EP-ADMIN | F-ADMIN-011 | T-P3-ADMIN-003 | Content versioning | T-P3-ADMIN-003.1, T-P3-ADMIN-003.2, T-P3-ADMIN-003.3 | TC-ADMIN-011-01 | Not started | P3 |
| EP-QA | F-DEED-004, F-CAL-007 | T-P3-QA-001 | Phase 3 E2E & performance checks | T-P3-QA-001.1, T-P3-QA-001.2, T-P3-QA-001.3 | TC-DEED-004-02, TC-CAL-007-02 | Not started | P3 |

## Phase 4

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-GROW | F-GROW-001, F-GROW-002, F-GROW-003 | T-P4-GROW-001 | Goals, weekly/monthly goals & milestones | T-P4-GROW-001.1, T-P4-GROW-001.2, T-P4-GROW-001.3 | TC-GROW-001-01, TC-GROW-002-01, TC-GROW-003-01 | Not started | P4 |
| EP-GROW | F-GROW-009 | T-P4-GROW-002 | Life balance tracker | T-P4-GROW-002.1, T-P4-GROW-002.2, T-P4-GROW-002.3 | TC-GROW-009-01 | Not started | P4 |
| EP-GROW | F-GROW-005, F-GROW-006 | T-P4-GROW-003 | Consistency analysis & weak habit identification | T-P4-GROW-003.1, T-P4-GROW-003.2 | TC-GROW-005-01, TC-GROW-006-01 | Not started | P4 |
| EP-GROW | F-GROW-004 | T-P4-GROW-004 | Growth snapshots & timeline | T-P4-GROW-004.1, T-P4-GROW-004.2 | TC-GROW-004-01 | Not started | P4 |
| EP-GROW | F-GROW-007 | T-P4-GROW-005 | Rule-based growth insights | T-P4-GROW-005.1, T-P4-GROW-005.2 | TC-GROW-007-01 | Not started | P4 |
| EP-GROW | F-GROW-008 | T-P4-GROW-006 | Monthly reflection | T-P4-GROW-006.1, T-P4-GROW-006.2 | TC-GROW-008-01 | Not started | P4 |
| EP-JRNL | F-JRNL-007 | T-P4-JRNL-001 | Journal storage with application-level encryption | T-P4-JRNL-001.1, T-P4-JRNL-001.2, T-P4-JRNL-001.3, T-P4-JRNL-001.4 | TC-JRNL-007-01 | Not started | P4 |
| EP-JRNL | F-JRNL-001, F-JRNL-002, F-JRNL-003, F-JRNL-004 | T-P4-JRNL-002 | Journal, intention, evening reflection, gratitude | T-P4-JRNL-002.1, T-P4-JRNL-002.2 | TC-JRNL-001-01, TC-JRNL-002-01, TC-JRNL-003-01, TC-JRNL-004-01 | Not started | P4 |
| EP-JRNL | F-JRNL-005 | T-P4-JRNL-003 | Future-self letters | T-P4-JRNL-003.1, T-P4-JRNL-003.2 | TC-JRNL-005-01 | Not started | P4 |
| EP-JRNL | F-JRNL-006 | T-P4-JRNL-004 | Learning notes | T-P4-JRNL-004.1, T-P4-JRNL-004.2 | TC-JRNL-006-01 | Not started | P4 |
| EP-JRNL | F-JRNL-008 | T-P4-JRNL-005 | Journal search & filtering | T-P4-JRNL-005.1, T-P4-JRNL-005.2 | TC-JRNL-008-01 | Not started | P4 |
| EP-JRNL | F-JRNL-009 | T-P4-JRNL-006 | Journal export | T-P4-JRNL-006.1, T-P4-JRNL-006.2 | TC-JRNL-009-01 | Not started | P4 |
| EP-PLAN | F-PLAN-001, F-PLAN-004, F-PLAN-005 | T-P4-PLAN-001 | Daily planner with priorities & time blocks | T-P4-PLAN-001.1, T-P4-PLAN-001.2, T-P4-PLAN-001.3 | TC-PLAN-001-01, TC-PLAN-004-01, TC-PLAN-005-01 | Not started | P4 |
| EP-PLAN | F-PLAN-002, F-PLAN-003 | T-P4-PLAN-002 | Morning planning & evening review flows | T-P4-PLAN-002.1, T-P4-PLAN-002.2 | TC-PLAN-002-01, TC-PLAN-003-01 | Not started | P4 |
| EP-PLAN | F-PLAN-006, F-PLAN-007 | T-P4-PLAN-003 | Recurring planner activities & weekly planning | T-P4-PLAN-003.1, T-P4-PLAN-003.2 | TC-PLAN-006-01, TC-PLAN-007-01 | Not started | P4 |
| EP-GAME | F-GAME-001, F-GAME-002, F-CAL-009 | T-P4-GAME-001 | Achievements & milestones engine | T-P4-GAME-001.1, T-P4-GAME-001.2, T-P4-GAME-001.3 | TC-GAME-001-01, TC-GAME-002-01, TC-CAL-009-01 | Not started | P4 |
| EP-GAME | F-GAME-003, F-GAME-008 | T-P4-GAME-002 | Streak display & positive recognition | T-P4-GAME-002.1, T-P4-GAME-002.2 | TC-GAME-003-01, TC-GAME-008-01 | Not started | P4 |
| EP-GAME | F-GAME-004 | T-P4-GAME-003 | Good Deeds Tree | T-P4-GAME-003.1, T-P4-GAME-003.2 | TC-GAME-004-01 | Not started | P4 |
| EP-GAME | F-GAME-005, F-GAME-006 | T-P4-GAME-004 | Random challenges & surprise deeds (personal) | T-P4-GAME-004.1, T-P4-GAME-004.2 | TC-GAME-005-01, TC-GAME-006-01 | Not started | P4 |
| EP-RPT | F-RPT-001, F-RPT-003, F-RPT-004, F-RPT-005 | T-P4-RPT-001 | Personal summaries & reports | T-P4-RPT-001.1, T-P4-RPT-001.2 | TC-RPT-001-01, TC-RPT-003-01, TC-RPT-004-01, TC-RPT-005-01 | Not started | P4 |
| EP-WELL | F-WELL-003 | T-P4-WELL-001 | Avoid-bad-habits tracker | T-P4-WELL-001.1, T-P4-WELL-001.2 | TC-WELL-003-01 | Not started | P4 |
| EP-WELL | F-WELL-007 | T-P4-WELL-002 | Positive affirmations | T-P4-WELL-002.1, T-P4-WELL-002.2 | TC-WELL-007-01 | Not started | P4 |
| EP-AUTH | F-AUTH-008 | T-P4-AUTH-001 | Email change flow | T-P4-AUTH-001.1, T-P4-AUTH-001.2, T-P4-AUTH-001.3 | TC-AUTH-008-02 | Not started | P4 |
| EP-I18N | F-I18N-001 | T-P4-I18N-001 | Translator handoff export | T-P4-I18N-001.1, T-P4-I18N-001.2 | TC-I18N-001-03 | Not started | P4 |
| EP-QA | F-JRNL-007 | T-P4-QA-001 | Phase 4 privacy & regression tests | T-P4-QA-001.1, T-P4-QA-001.2, T-P4-QA-001.3 | TC-JRNL-007-02 | Not started | P4 |

## Phase 5

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-ISL | F-ISL-017 | T-P5-ISL-001 | Islamic preferences & module opt-out | T-P5-ISL-001.1, T-P5-ISL-001.2 | TC-ISL-017-01 | Not started | P5 |
| EP-ISL | F-ISL-002 | T-P5-ISL-002 | Prayer times | T-P5-ISL-002.1, T-P5-ISL-002.2, T-P5-ISL-002.3 | TC-ISL-002-01 | Not started | P5 |
| EP-ISL | F-ISL-013, F-I18N-004 | T-P5-ISL-003 | Hijri calendar | T-P5-ISL-003.1, T-P5-ISL-003.2 | TC-ISL-013-01, TC-I18N-004-02 | Not started | P5 |
| EP-ISL | F-ISL-001 | T-P5-ISL-004 | Salah tracker | T-P5-ISL-004.1, T-P5-ISL-004.2, T-P5-ISL-004.3 | TC-ISL-001-01 | Not started | P5 |
| EP-ISL | F-ISL-003 | T-P5-ISL-005 | Quran metadata cache & reading tracker | T-P5-ISL-005.1, T-P5-ISL-005.2, T-P5-ISL-005.3 | TC-ISL-003-01 | Not started | P5 |
| EP-ISL | F-ISL-004 | T-P5-ISL-006 | Memorization tracker | T-P5-ISL-006.1, T-P5-ISL-006.2 | TC-ISL-004-01 | Not started | P5 |
| EP-ISL | F-ISL-005 | T-P5-ISL-007 | Khatam planner | T-P5-ISL-007.1, T-P5-ISL-007.2 | TC-ISL-005-01 | Not started | P5 |
| EP-ISL | F-ISL-006, F-ISL-007 | T-P5-ISL-008 | Daily dhikr & tasbih counter | T-P5-ISL-008.1, T-P5-ISL-008.2 | TC-ISL-006-01, TC-ISL-007-01 | Not started | P5 |
| EP-ISL | F-ISL-008 | T-P5-ISL-009 | Dua collection | T-P5-ISL-009.1, T-P5-ISL-009.2 | TC-ISL-008-01 | Not started | P5 |
| EP-ISL | F-ISL-009, F-ISL-010 | T-P5-ISL-010 | Sunnah & tahajjud trackers | T-P5-ISL-010.1, T-P5-ISL-010.2 | TC-ISL-009-01, TC-ISL-010-01 | Not started | P5 |
| EP-ISL | F-ISL-011, F-ISL-012 | T-P5-ISL-011 | Fasting tracker & Ramadan planner | T-P5-ISL-011.1, T-P5-ISL-011.2 | TC-ISL-011-01, TC-ISL-012-01 | Not started | P5 |
| EP-ISL | F-ISL-014 | T-P5-ISL-012 | Zakat calculator | T-P5-ISL-012.1, T-P5-ISL-012.2, T-P5-ISL-012.3 | TC-ISL-014-01 | Not started | P5 |
| EP-ISL | F-ISL-015, F-ISL-016 | T-P5-ISL-013 | Hadith of the Day & learning hub | T-P5-ISL-013.1, T-P5-ISL-013.2, T-P5-ISL-013.3 | TC-ISL-015-01, TC-ISL-016-01 | Not started | P5 |
| EP-ISL | F-ISL-018 | T-P5-ISL-014 | Content sources & references | T-P5-ISL-014.1, T-P5-ISL-014.2 | TC-ISL-018-01 | Not started | P5 |
| EP-ADMIN | F-ADMIN-005 | T-P5-ADMIN-001 | Islamic content admin & verification workflow | T-P5-ADMIN-001.1, T-P5-ADMIN-001.2, T-P5-ADMIN-001.3 | TC-ADMIN-005-01 | Not started | P5 |

## Phase 6

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-NOTIF | F-NOTIF-001 | T-P6-NOTIF-001 | In-app notification center | T-P6-NOTIF-001.1, T-P6-NOTIF-001.2, T-P6-NOTIF-001.3 | TC-NOTIF-001-01 | Not started | P6 |
| EP-NOTIF | F-NOTIF-008, F-NOTIF-009 | T-P6-NOTIF-002 | Notification preferences & quiet hours | T-P6-NOTIF-002.1, T-P6-NOTIF-002.2, T-P6-NOTIF-002.3 | TC-NOTIF-008-01, TC-NOTIF-009-01 | Not started | P6 |
| EP-NOTIF | F-NOTIF-002, F-NOTIF-003 | T-P6-NOTIF-003 | Reminder scheduler | T-P6-NOTIF-003.1, T-P6-NOTIF-003.2, T-P6-NOTIF-003.3 | TC-NOTIF-002-01, TC-NOTIF-003-01 | Not started | P6 |
| EP-NOTIF | F-NOTIF-004 | T-P6-NOTIF-004 | Incomplete-task reminders | T-P6-NOTIF-004.1, T-P6-NOTIF-004.2 | TC-NOTIF-004-01 | Not started | P6 |
| EP-NOTIF | F-NOTIF-010 | T-P6-NOTIF-005 | Prayer time reminders | T-P6-NOTIF-005.1, T-P6-NOTIF-005.2 | TC-NOTIF-010-01 | Not started | P6 |
| EP-NOTIF | F-NOTIF-005 | T-P6-NOTIF-006 | Email digests | T-P6-NOTIF-006.1, T-P6-NOTIF-006.2 | TC-NOTIF-005-02 | Not started | P6 |
| EP-INTG | F-INTG-002, F-NOTIF-006 | T-P6-INTG-001 | Web Push (VAPID) | T-P6-INTG-001.1, T-P6-INTG-001.2, T-P6-INTG-001.3 | TC-INTG-002-01, TC-NOTIF-006-01 | Not started | P6 |
| EP-I18N | F-I18N-006 | T-P6-I18N-001 | Localized notification templates | T-P6-I18N-001.1, T-P6-I18N-001.2 | TC-I18N-006-01 | Not started | P6 |
| EP-ADMIN | F-ADMIN-007 | T-P6-ADMIN-001 | Broadcast scheduling | T-P6-ADMIN-001.1, T-P6-ADMIN-001.2, T-P6-ADMIN-001.3 | TC-ADMIN-007-01 | Not started | P6 |
| EP-ADMIN | F-ADMIN-014 | T-P6-ADMIN-002 | Background job monitoring | T-P6-ADMIN-002.1, T-P6-ADMIN-002.2 | TC-ADMIN-014-01 | Not started | P6 |

## Phase 7

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-COMM | F-COMM-001, F-COMM-002 | T-P7-COMM-001 | Family groups & invitations | T-P7-COMM-001.1, T-P7-COMM-001.2, T-P7-COMM-001.3 | TC-COMM-001-01, TC-COMM-002-01 | Not started | P7 |
| EP-COMM | F-COMM-014 | T-P7-COMM-002 | Privacy & sharing controls framework | T-P7-COMM-002.1, T-P7-COMM-002.2, T-P7-COMM-002.3 | TC-COMM-014-01 | Not started | P7 |
| EP-COMM | F-COMM-003 | T-P7-COMM-003 | Challenges | T-P7-COMM-003.1, T-P7-COMM-003.2 | TC-COMM-003-01 | Not started | P7 |
| EP-COMM | F-COMM-004, F-COMM-005 | T-P7-COMM-004 | Shared family calendar & family achievements | T-P7-COMM-004.1, T-P7-COMM-004.2 | TC-COMM-004-01, TC-COMM-005-01 | Not started | P7 |
| EP-COMM | F-COMM-006 | T-P7-COMM-005 | Community groups | T-P7-COMM-005.1, T-P7-COMM-005.2 | TC-COMM-006-01 | Not started | P7 |
| EP-COMM | F-COMM-007 | T-P7-COMM-006 | Campaigns | T-P7-COMM-006.1, T-P7-COMM-006.2 | TC-COMM-007-01 | Not started | P7 |
| EP-COMM | F-COMM-008 | T-P7-COMM-007 | Volunteer opportunities | T-P7-COMM-007.1, T-P7-COMM-007.2 | TC-COMM-008-01 | Not started | P7 |
| EP-COMM | F-COMM-009, F-COMM-010 | T-P7-COMM-008 | Kindness stories & anonymous sharing | T-P7-COMM-008.1, T-P7-COMM-008.2 | TC-COMM-009-01, TC-COMM-010-01 | Not started | P7 |
| EP-COMM | F-COMM-011, F-GAME-007 | T-P7-COMM-009 | Recognition & appreciation | T-P7-COMM-009.1 | TC-COMM-011-01, TC-GAME-007-01 | Not started | P7 |
| EP-COMM | F-COMM-013 | T-P7-COMM-010 | Reporting & blocking | T-P7-COMM-010.1, T-P7-COMM-010.2 | TC-COMM-013-01 | Not started | P7 |
| EP-COMM | F-COMM-012 | T-P7-COMM-011 | Moderation pipeline | T-P7-COMM-011.1, T-P7-COMM-011.2, T-P7-COMM-011.3 | TC-COMM-012-01 | Not started | P7 |
| EP-ADMIN | F-ADMIN-008 | T-P7-ADMIN-001 | Moderation console | T-P7-ADMIN-001.1, T-P7-ADMIN-001.2 | TC-ADMIN-008-01 | Not started | P7 |
| EP-ADMIN | F-ADMIN-006 | T-P7-ADMIN-002 | Campaign management | T-P7-ADMIN-002.1 | TC-ADMIN-006-02 | Not started | P7 |
| EP-INTG | F-INTG-006 | T-P7-INTG-001 | QR campaign participation | T-P7-INTG-001.1, T-P7-INTG-001.2 | TC-INTG-006-01 | Not started | P7 |
| EP-NOTIF | F-NOTIF-007 | T-P7-NOTIF-001 | Challenge notifications | T-P7-NOTIF-001.1 | TC-NOTIF-007-01 | Not started | P7 |
| EP-WELL | F-WELL-001, F-WELL-002 | T-P7-WELL-001 | Screen-time journal & social media goals (self-reported) | T-P7-WELL-001.1 | TC-WELL-001-01, TC-WELL-002-01 | Not started | P7 |
| EP-WELL | F-WELL-004, F-WELL-005 | T-P7-WELL-002 | Procrastination tracker & anger reflection | T-P7-WELL-002.1, T-P7-WELL-002.2 | TC-WELL-004-01, TC-WELL-005-01 | Not started | P7 |
| EP-WELL | F-WELL-006 | T-P7-WELL-003 | Digital detox challenges | T-P7-WELL-003.1 | TC-WELL-006-01 | Not started | P7 |

## Phase 8

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-AI | F-AI-001 | T-P8-AI-001 | AI gateway & Anthropic adapter | T-P8-AI-001.1, T-P8-AI-001.2, T-P8-AI-001.3, T-P8-AI-001.4 | TC-AI-001-01 | Not started | P8 |
| EP-AI | F-AI-002 | T-P8-AI-002 | Consent, privacy & disable | T-P8-AI-002.1, T-P8-AI-002.2, T-P8-AI-002.3 | TC-AI-002-01 | Not started | P8 |
| EP-AI | F-AI-003 | T-P8-AI-003 | Quotas & cost monitoring | T-P8-AI-003.1, T-P8-AI-003.2, T-P8-AI-003.3, T-P8-AI-003.4 | TC-AI-003-01 | Not started | P8 |
| EP-AI | F-AI-013 | T-P8-AI-004 | Safety filters & religious guardrails | T-P8-AI-004.1, T-P8-AI-004.2, T-P8-AI-004.3, T-P8-AI-004.4 | TC-AI-013-01 | Not started | P8 |
| EP-AI | F-AI-004 | T-P8-AI-005 | AI deed suggestions | T-P8-AI-005.1, T-P8-AI-005.2 | TC-AI-004-01 | Not started | P8 |
| EP-AI | F-AI-006, F-AI-012 | T-P8-AI-006 | Reflection prompts & motivational messages | T-P8-AI-006.1, T-P8-AI-006.2 | TC-AI-006-01, TC-AI-012-01 | Not started | P8 |
| EP-AI | F-AI-007, F-AI-009 | T-P8-AI-007 | Weekly report narrative & growth insights | T-P8-AI-007.1, T-P8-AI-007.2 | TC-AI-007-01, TC-AI-009-01 | Not started | P8 |
| EP-AI | F-AI-005, F-AI-010 | T-P8-AI-008 | Habit coach & personal assistant | T-P8-AI-008.1, T-P8-AI-008.2 | TC-AI-005-01, TC-AI-010-01 | Not started | P8 |
| EP-AI | F-AI-008 | T-P8-AI-009 | Natural-language task generation | T-P8-AI-009.1, T-P8-AI-009.2 | TC-AI-008-01 | Not started | P8 |
| EP-AI | F-AI-011 | T-P8-AI-010 | Voice journal | T-P8-AI-010.1, T-P8-AI-010.2, T-P8-AI-010.3 | TC-AI-011-01 | Not started | P8 |
| EP-JRNL | F-JRNL-010 | T-P8-JRNL-001 | AI journal summaries (opt-in) | T-P8-JRNL-001.1, T-P8-JRNL-001.2 | TC-JRNL-010-01 | Not started | P8 |

## Phase 9

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-PWA | F-PWA-004 | T-P9-PWA-001 | IndexedDB read cache | T-P9-PWA-001.1, T-P9-PWA-001.2, T-P9-PWA-001.3, T-P9-PWA-001.4 | TC-PWA-004-01 | Not started | P9 |
| EP-PWA | F-PWA-005 | T-P9-PWA-002 | Outbox queue & optimistic UI | T-P9-PWA-002.1, T-P9-PWA-002.2 | TC-PWA-005-01 | Not started | P9 |
| EP-PWA | F-PWA-006 | T-P9-PWA-003 | /sync endpoint & conflict handling | T-P9-PWA-003.1, T-P9-PWA-003.2, T-P9-PWA-003.3, T-P9-PWA-003.4, T-P9-PWA-003.5 | TC-PWA-006-01 | Not started | P9 |
| EP-PWA | F-PWA-005 | T-P9-PWA-004 | Flush triggers | T-P9-PWA-004.1, T-P9-PWA-004.2 | TC-PWA-005-02 | Not started | P9 |
| EP-PWA | F-PWA-009 | T-P9-PWA-005 | App update flow | T-P9-PWA-005.1, T-P9-PWA-005.2 | TC-PWA-009-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-001 | T-P9-WIDGET-001 | Android project scaffold | T-P9-WIDGET-001.1, T-P9-WIDGET-001.2, T-P9-WIDGET-001.3 | TC-WIDGET-001-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-001 | T-P9-WIDGET-002 | Device linking & token storage | T-P9-WIDGET-002.1, T-P9-WIDGET-002.2, T-P9-WIDGET-002.3, T-P9-WIDGET-002.4 | TC-WIDGET-001-02 | Not started | P9 |
| EP-WIDGET | F-WIDGET-006 | T-P9-WIDGET-003 | Widget snapshot API & cache | T-P9-WIDGET-003.1, T-P9-WIDGET-003.2, T-P9-WIDGET-003.3 | TC-WIDGET-006-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-002 | T-P9-WIDGET-004 | Small progress widget | T-P9-WIDGET-004.1, T-P9-WIDGET-004.2 | TC-WIDGET-002-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-003 | T-P9-WIDGET-005 | Medium interactive checklist widget | T-P9-WIDGET-005.1, T-P9-WIDGET-005.2 | TC-WIDGET-003-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-004 | T-P9-WIDGET-006 | Large detailed widget | T-P9-WIDGET-006.1 | TC-WIDGET-004-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-005 | T-P9-WIDGET-007 | Islamic tracker widget | T-P9-WIDGET-007.1, T-P9-WIDGET-007.2 | TC-WIDGET-005-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-006, F-WIDGET-007 | T-P9-WIDGET-008 | Offline queue, retry & stale indicator | T-P9-WIDGET-008.1, T-P9-WIDGET-008.2 | TC-WIDGET-006-02, TC-WIDGET-007-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-008 | T-P9-WIDGET-009 | Widget EN/BN localization | T-P9-WIDGET-009.1, T-P9-WIDGET-009.2 | TC-WIDGET-008-01 | Not started | P9 |
| EP-WIDGET | F-WIDGET-009 | T-P9-WIDGET-010 | Deep links / App Links | T-P9-WIDGET-010.1, T-P9-WIDGET-010.2 | TC-WIDGET-009-01 | Not started | P9 |

## Phase 10

| Epic | Feature(s) | Task | Title | Subtasks | Test cases | Status | Phase |
|---|---|---|---|---|---|---|---|
| EP-AUTH | F-AUTH-011 | T-P10-AUTH-001 | Account recovery (codes / secondary email) | T-P10-AUTH-001.1, T-P10-AUTH-001.2 | TC-AUTH-011-01 | Not started | P10 |
| EP-RPT | F-RPT-002 | T-P10-RPT-001 | Monthly & yearly reports | T-P10-RPT-001.1, T-P10-RPT-001.2 | TC-RPT-002-01 | Not started | P10 |
| EP-RPT | F-RPT-006, F-RPT-007 | T-P10-RPT-002 | CSV & PDF export | T-P10-RPT-002.1, T-P10-RPT-002.2 | TC-RPT-006-01, TC-RPT-007-01 | Not started | P10 |
| EP-RPT | F-RPT-008 | T-P10-RPT-003 | Privacy-conscious product analytics | T-P10-RPT-003.1, T-P10-RPT-003.2 | TC-RPT-008-01 | Not started | P10 |
| EP-INTG | F-INTG-003, F-PLAN-008 | T-P10-INTG-001 | Google Calendar export/sync | T-P10-INTG-001.1, T-P10-INTG-001.2 | TC-INTG-003-01, TC-PLAN-008-01 | Not started | P10 |
| EP-INTG | F-INTG-005 | T-P10-INTG-002 | Public API | T-P10-INTG-002.1, T-P10-INTG-002.2, T-P10-INTG-002.3 | TC-INTG-005-01 | Not started | P10 |
| EP-ADMIN | F-ADMIN-010 | T-P10-ADMIN-001 | A/B testing | T-P10-ADMIN-001.1, T-P10-ADMIN-001.2, T-P10-ADMIN-001.3 | TC-ADMIN-010-01 | Not started | P10 |
| EP-ADMIN | F-ADMIN-012 | T-P10-ADMIN-002 | System health dashboard | T-P10-ADMIN-002.1, T-P10-ADMIN-002.2 | TC-ADMIN-012-01 | Not started | P10 |
| EP-ADMIN | F-ADMIN-013 | T-P10-ADMIN-003 | API analytics | T-P10-ADMIN-003.1 | TC-ADMIN-013-01 | Not started | P10 |
| EP-ADMIN | F-ADMIN-015 | T-P10-ADMIN-004 | Backup monitoring & restore drills | T-P10-ADMIN-004.1, T-P10-ADMIN-004.2 | TC-ADMIN-015-01 | Not started | P10 |
| EP-RBAC | F-ADMIN-002, F-RBAC-004 | T-P10-RBAC-001 | Role & permission editor and admin invites | T-P10-RBAC-001.1, T-P10-RBAC-001.2 | TC-ADMIN-002-02, TC-RBAC-004-02 | Not started | P10 |
| EP-ADMIN | F-ADMIN-016 | T-P10-ADMIN-005 | Audit log CSV export | T-P10-ADMIN-005.1 | TC-ADMIN-016-02 | Not started | P10 |
| EP-PLAT | — | T-P10-PLAT-003 | OpenTelemetry tracing | T-P10-PLAT-003.1, T-P10-PLAT-003.2 | TC-PLAT-003-02 | Not started | P10 |
| EP-QA | — | T-P10-QA-001 | Full regression | T-P10-QA-001.1, T-P10-QA-001.2 | TC-QA-001-02 | Not started | P10 |
| EP-QA | — | T-P10-QA-002 | Security verification | T-P10-QA-002.1, T-P10-QA-002.2, T-P10-QA-002.3, T-P10-QA-002.4 | TC-QA-002-01 | Not started | P10 |
| EP-QA | — | T-P10-QA-003 | Performance verification | T-P10-QA-003.1, T-P10-QA-003.2, T-P10-QA-003.3 | TC-QA-003-01 | Not started | P10 |
| EP-QA | — | T-P10-QA-004 | Accessibility audit | T-P10-QA-004.1, T-P10-QA-004.2 | TC-QA-004-01 | Not started | P10 |
| EP-QA | — | T-P10-QA-005 | Cross-browser, in-app & PWA matrix | T-P10-QA-005.1, T-P10-QA-005.2, T-P10-QA-005.3 | TC-QA-005-01 | Not started | P10 |
| EP-PLAT | — | T-P10-PLAT-001 | Production environment & operations | T-P10-PLAT-001.1, T-P10-PLAT-001.2, T-P10-PLAT-001.3, T-P10-PLAT-001.4 | TC-PLAT-001-02 | Not started | P10 |
| EP-PLAT | — | T-P10-PLAT-002 | Release & widget store submission | T-P10-PLAT-002.1, T-P10-PLAT-002.2 | TC-PLAT-002-02 | Not started | P10 |

## Feature → task coverage (reverse index)

| Feature | Tasks |
|---|---|
| F-AUTH-001 | T-P2-AUTH-001, T-P2-AUTH-002, T-P2-QA-002 |
| F-AUTH-002 | T-P2-AUTH-004, T-P2-AUTH-011, T-P2-QA-002 |
| F-AUTH-003 | T-P2-AUTH-005 |
| F-AUTH-004 | T-P2-AUTH-003 |
| F-AUTH-005 | T-P2-AUTH-006 |
| F-AUTH-006 | T-P2-AUTH-007 |
| F-AUTH-007 | T-P2-AUTH-007, T-P2-AUTH-011 |
| F-AUTH-008 | T-P2-AUTH-008, T-P4-AUTH-001 |
| F-AUTH-009 | T-P2-AUTH-010 |
| F-AUTH-010 | T-P2-UI-004, T-P2-AUTH-009 |
| F-AUTH-011 | T-P10-AUTH-001 |
| F-RBAC-001 | T-P2-RBAC-001 |
| F-RBAC-002 | T-P2-RBAC-002, T-P2-RBAC-008 |
| F-RBAC-003 | T-P2-RBAC-003 |
| F-RBAC-004 | T-P2-RBAC-004, T-P10-RBAC-001 |
| F-RBAC-005 | T-P2-RBAC-005 |
| F-RBAC-006 | T-P2-RBAC-006, T-P2-QA-002 |
| F-RBAC-007 | T-P2-RBAC-007 |
| F-I18N-001 | T-P2-I18N-001, T-P2-I18N-002, T-P4-I18N-001 |
| F-I18N-002 | T-P2-I18N-003 |
| F-I18N-003 | T-P2-I18N-003 |
| F-I18N-004 | T-P2-I18N-004, T-P5-ISL-003 |
| F-I18N-005 | T-P2-I18N-005 |
| F-I18N-006 | T-P6-I18N-001 |
| F-I18N-007 | T-P2-I18N-006 |
| F-I18N-008 | T-P3-I18N-001, T-P3-ADMIN-002 |
| F-I18N-009 | T-P2-I18N-002, T-P2-I18N-007 |
| F-DEED-001 | T-P3-DEED-001, T-P3-DEED-002 |
| F-DEED-002 | T-P3-DEED-001, T-P3-DEED-003 |
| F-DEED-003 | T-P3-DEED-005 |
| F-DEED-004 | T-P3-DEED-008, T-P3-QA-001 |
| F-DEED-005 | T-P3-DEED-006, T-P3-DEED-007 |
| F-DEED-006 | T-P3-DEED-010 |
| F-DEED-007 | T-P3-DEED-011 |
| F-DEED-008 | T-P3-DEED-009 |
| F-DEED-009 | T-P3-DEED-009 |
| F-DEED-010 | T-P3-DEED-012 |
| F-DEED-011 | T-P3-DEED-004 |
| F-DEED-012 | T-P3-DEED-013 |
| F-DEED-013 | T-P3-DEED-002, T-P3-DEED-014 |
| F-DEED-014 | T-P3-DEED-015 |
| F-CAL-001 | T-P3-CAL-004 |
| F-CAL-002 | T-P3-CAL-004 |
| F-CAL-003 | T-P3-CAL-004 |
| F-CAL-004 | T-P3-CAL-005 |
| F-CAL-005 | T-P3-CAL-005 |
| F-CAL-006 | T-P3-CAL-003 |
| F-CAL-007 | T-P3-CAL-002, T-P3-QA-001 |
| F-CAL-008 | T-P3-CAL-002 |
| F-CAL-009 | T-P4-GAME-001 |
| F-CAL-010 | T-P3-CAL-001 |
| F-CAL-011 | T-P3-CAL-006 |
| F-GROW-001 | T-P4-GROW-001 |
| F-GROW-002 | T-P4-GROW-001 |
| F-GROW-003 | T-P4-GROW-001 |
| F-GROW-004 | T-P4-GROW-004 |
| F-GROW-005 | T-P4-GROW-003 |
| F-GROW-006 | T-P4-GROW-003 |
| F-GROW-007 | T-P4-GROW-005 |
| F-GROW-008 | T-P4-GROW-006 |
| F-GROW-009 | T-P4-GROW-002 |
| F-JRNL-001 | T-P4-JRNL-002 |
| F-JRNL-002 | T-P4-JRNL-002 |
| F-JRNL-003 | T-P4-JRNL-002 |
| F-JRNL-004 | T-P4-JRNL-002 |
| F-JRNL-005 | T-P4-JRNL-003 |
| F-JRNL-006 | T-P4-JRNL-004 |
| F-JRNL-007 | T-P4-JRNL-001, T-P4-QA-001 |
| F-JRNL-008 | T-P4-JRNL-005 |
| F-JRNL-009 | T-P4-JRNL-006 |
| F-JRNL-010 | T-P8-JRNL-001 |
| F-PLAN-001 | T-P4-PLAN-001 |
| F-PLAN-002 | T-P4-PLAN-002 |
| F-PLAN-003 | T-P4-PLAN-002 |
| F-PLAN-004 | T-P4-PLAN-001 |
| F-PLAN-005 | T-P4-PLAN-001 |
| F-PLAN-006 | T-P4-PLAN-003 |
| F-PLAN-007 | T-P4-PLAN-003 |
| F-PLAN-008 | T-P10-INTG-001 |
| F-ISL-001 | T-P5-ISL-004 |
| F-ISL-002 | T-P5-ISL-002 |
| F-ISL-003 | T-P5-ISL-005 |
| F-ISL-004 | T-P5-ISL-006 |
| F-ISL-005 | T-P5-ISL-007 |
| F-ISL-006 | T-P5-ISL-008 |
| F-ISL-007 | T-P5-ISL-008 |
| F-ISL-008 | T-P5-ISL-009 |
| F-ISL-009 | T-P5-ISL-010 |
| F-ISL-010 | T-P5-ISL-010 |
| F-ISL-011 | T-P5-ISL-011 |
| F-ISL-012 | T-P5-ISL-011 |
| F-ISL-013 | T-P5-ISL-003 |
| F-ISL-014 | T-P5-ISL-012 |
| F-ISL-015 | T-P5-ISL-013 |
| F-ISL-016 | T-P5-ISL-013 |
| F-ISL-017 | T-P5-ISL-001 |
| F-ISL-018 | T-P5-ISL-014 |
| F-NOTIF-001 | T-P6-NOTIF-001 |
| F-NOTIF-002 | T-P6-NOTIF-003 |
| F-NOTIF-003 | T-P6-NOTIF-003 |
| F-NOTIF-004 | T-P6-NOTIF-004 |
| F-NOTIF-005 | T-P2-INTG-001, T-P6-NOTIF-006 |
| F-NOTIF-006 | T-P6-INTG-001 |
| F-NOTIF-007 | T-P7-NOTIF-001 |
| F-NOTIF-008 | T-P6-NOTIF-002 |
| F-NOTIF-009 | T-P6-NOTIF-002 |
| F-NOTIF-010 | T-P6-NOTIF-005 |
| F-COMM-001 | T-P7-COMM-001 |
| F-COMM-002 | T-P7-COMM-001 |
| F-COMM-003 | T-P7-COMM-003 |
| F-COMM-004 | T-P7-COMM-004 |
| F-COMM-005 | T-P7-COMM-004 |
| F-COMM-006 | T-P7-COMM-005 |
| F-COMM-007 | T-P7-COMM-006 |
| F-COMM-008 | T-P7-COMM-007 |
| F-COMM-009 | T-P7-COMM-008 |
| F-COMM-010 | T-P7-COMM-008 |
| F-COMM-011 | T-P7-COMM-009 |
| F-COMM-012 | T-P7-COMM-011 |
| F-COMM-013 | T-P7-COMM-010 |
| F-COMM-014 | T-P7-COMM-002 |
| F-WELL-001 | T-P7-WELL-001 |
| F-WELL-002 | T-P7-WELL-001 |
| F-WELL-003 | T-P4-WELL-001 |
| F-WELL-004 | T-P7-WELL-002 |
| F-WELL-005 | T-P7-WELL-002 |
| F-WELL-006 | T-P7-WELL-003 |
| F-WELL-007 | T-P4-WELL-002 |
| F-GAME-001 | T-P4-GAME-001 |
| F-GAME-002 | T-P4-GAME-001 |
| F-GAME-003 | T-P4-GAME-002 |
| F-GAME-004 | T-P4-GAME-003 |
| F-GAME-005 | T-P4-GAME-004 |
| F-GAME-006 | T-P4-GAME-004 |
| F-GAME-007 | T-P7-COMM-009 |
| F-GAME-008 | T-P4-GAME-002 |
| F-AI-001 | T-P8-AI-001 |
| F-AI-002 | T-P8-AI-002 |
| F-AI-003 | T-P8-AI-003 |
| F-AI-004 | T-P8-AI-005 |
| F-AI-005 | T-P8-AI-008 |
| F-AI-006 | T-P8-AI-006 |
| F-AI-007 | T-P8-AI-007 |
| F-AI-008 | T-P8-AI-009 |
| F-AI-009 | T-P8-AI-007 |
| F-AI-010 | T-P8-AI-008 |
| F-AI-011 | T-P8-AI-010 |
| F-AI-012 | T-P8-AI-006 |
| F-AI-013 | T-P8-AI-004 |
| F-PWA-001 | T-P2-PWA-001 |
| F-PWA-002 | T-P2-UI-003 |
| F-PWA-003 | T-P2-PWA-002 |
| F-PWA-004 | T-P9-PWA-001 |
| F-PWA-005 | T-P9-PWA-002, T-P9-PWA-004 |
| F-PWA-006 | T-P9-PWA-003 |
| F-PWA-007 | T-P2-PWA-003 |
| F-PWA-008 | T-P2-PWA-004 |
| F-PWA-009 | T-P9-PWA-005 |
| F-WIDGET-001 | T-P9-WIDGET-001, T-P9-WIDGET-002 |
| F-WIDGET-002 | T-P9-WIDGET-004 |
| F-WIDGET-003 | T-P9-WIDGET-005 |
| F-WIDGET-004 | T-P9-WIDGET-006 |
| F-WIDGET-005 | T-P9-WIDGET-007 |
| F-WIDGET-006 | T-P9-WIDGET-003, T-P9-WIDGET-008 |
| F-WIDGET-007 | T-P9-WIDGET-008 |
| F-WIDGET-008 | T-P9-WIDGET-009 |
| F-WIDGET-009 | T-P9-WIDGET-010 |
| F-RPT-001 | T-P4-RPT-001 |
| F-RPT-002 | T-P10-RPT-001 |
| F-RPT-003 | T-P4-RPT-001 |
| F-RPT-004 | T-P4-RPT-001 |
| F-RPT-005 | T-P4-RPT-001 |
| F-RPT-006 | T-P10-RPT-002 |
| F-RPT-007 | T-P10-RPT-002 |
| F-RPT-008 | T-P10-RPT-003 |
| F-INTG-001 | T-P2-INTG-001 |
| F-INTG-002 | T-P6-INTG-001 |
| F-INTG-003 | T-P10-INTG-001 |
| F-INTG-004 | — (Won't Have in initial release) |
| F-INTG-005 | T-P10-INTG-002 |
| F-INTG-006 | T-P7-INTG-001 |
| F-ADMIN-001 | T-P2-ADMIN-001, T-P2-ADMIN-002 |
| F-ADMIN-002 | T-P2-ADMIN-003, T-P10-RBAC-001 |
| F-ADMIN-003 | T-P3-ADMIN-001 |
| F-ADMIN-004 | T-P3-ADMIN-002 |
| F-ADMIN-005 | T-P5-ADMIN-001 |
| F-ADMIN-006 | T-P7-ADMIN-002 |
| F-ADMIN-007 | T-P6-ADMIN-001 |
| F-ADMIN-008 | T-P7-ADMIN-001 |
| F-ADMIN-009 | T-P2-ADMIN-004 |
| F-ADMIN-010 | T-P10-ADMIN-001 |
| F-ADMIN-011 | T-P3-ADMIN-003 |
| F-ADMIN-012 | T-P10-ADMIN-002 |
| F-ADMIN-013 | T-P10-ADMIN-003 |
| F-ADMIN-014 | T-P6-ADMIN-002 |
| F-ADMIN-015 | T-P10-ADMIN-004 |
| F-ADMIN-016 | T-P2-ADMIN-005, T-P10-ADMIN-005 |
| F-ADMIN-017 | — (Won't Have in initial release) |

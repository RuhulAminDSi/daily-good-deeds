# Traceability Matrix

> **Generated** by `pnpm docs:gen` (tools/docs) from FEATURE_ID_REGISTRY, SRS, USER_STORIES, ACCEPTANCE_CRITERIA, tools/docs/tasks.js and PAGE_SPECIFICATIONS. Do not edit by hand.
>
> Chain: **Feature → Requirement (FR) → User story (US) → Acceptance criterion (AC) → Task (T) → Test case (TC)**, plus the UI page (PG).

## Coverage summary

| Metric | Value |
|---|---|
| Features (registry) | 198 |
| In-scope features (excluding Won't) | 196 |
| In-scope features with FR + US + Task + TC | 196 |
| Functional requirements | 314 |
| User stories | 206 |
| Acceptance criteria | 147 |
| Test cases (feature-linked) | 225 |
| Features linked to pages | 137 |

### Gaps

None. Every in-scope feature has at least one FR, user story, task and test case.

Acceptance criteria are required for all Must features and selected Should features (see ACCEPTANCE_CRITERIA.md); a missing AC on a Should/Could feature is not a gap.

## AUTH

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-AUTH-001** User registration (email + password) | M | P2 | FR-AUTH-001-01, FR-AUTH-001-02, FR-AUTH-001-03, FR-AUTH-001-04, FR-AUTH-001-05 | US-AUTH-001-01, US-AUTH-001-02 | AC-AUTH-001-01, AC-AUTH-001-02, AC-AUTH-001-03, AC-AUTH-001-04 | T-P2-AUTH-001, T-P2-AUTH-002, T-P2-QA-002 | TC-AUTH-001-01, TC-AUTH-001-02, TC-AUTH-001-03 | PG-003 |
| **F-AUTH-002** Email/password login | M | P2 | FR-AUTH-002-01, FR-AUTH-002-02, FR-AUTH-002-03, FR-AUTH-002-04, FR-AUTH-002-05 | US-AUTH-002-01, US-AUTH-002-02 | AC-AUTH-002-01, AC-AUTH-002-02, AC-AUTH-002-03 | T-P2-AUTH-004, T-P2-AUTH-011, T-P2-QA-002 | TC-AUTH-002-01, TC-AUTH-002-02, TC-AUTH-002-03 | PG-002 |
| **F-AUTH-003** Google OAuth login (redirect flow) | S | P2 | FR-AUTH-003-01, FR-AUTH-003-02, FR-AUTH-003-03 | US-AUTH-003-01, US-AUTH-003-02 | — | T-P2-AUTH-005 | TC-AUTH-003-01 | PG-002, PG-003 |
| **F-AUTH-004** Email verification | M | P2 | FR-AUTH-004-01, FR-AUTH-004-02, FR-AUTH-004-03 | US-AUTH-004-01 | AC-AUTH-004-01, AC-AUTH-004-02 | T-P2-AUTH-003 | TC-AUTH-004-01 | PG-004 |
| **F-AUTH-005** Forgot password & password reset | M | P2 | FR-AUTH-005-01, FR-AUTH-005-02, FR-AUTH-005-03 | US-AUTH-005-01 | AC-AUTH-005-01, AC-AUTH-005-02 | T-P2-AUTH-006 | TC-AUTH-005-01 | PG-005, PG-006 |
| **F-AUTH-006** Secure logout (single device / all devices) | M | P2 | FR-AUTH-006-01, FR-AUTH-006-02 | US-AUTH-006-01, US-AUTH-006-02 | AC-AUTH-006-01, AC-AUTH-006-02 | T-P2-AUTH-007 | TC-AUTH-006-01 | PG-051 |
| **F-AUTH-007** Session management & multi-device access | M | P2 | FR-AUTH-007-01, FR-AUTH-007-02, FR-AUTH-007-03 | US-AUTH-007-01 | AC-AUTH-007-01, AC-AUTH-007-02 | T-P2-AUTH-007, T-P2-AUTH-011 | TC-AUTH-007-01, TC-AUTH-007-02 | PG-006 |
| **F-AUTH-008** Profile management | M | P2 | FR-AUTH-008-01, FR-AUTH-008-02, FR-AUTH-008-03 | US-AUTH-008-01 | AC-AUTH-008-01, AC-AUTH-008-02 | T-P2-AUTH-008, T-P4-AUTH-001 | TC-AUTH-008-01, TC-AUTH-008-02 | — |
| **F-AUTH-009** Account deletion (grace period + data export offer) | M | P2 | FR-AUTH-009-01, FR-AUTH-009-02, FR-AUTH-009-03, FR-AUTH-009-04 | US-AUTH-009-01 | AC-AUTH-009-01, AC-AUTH-009-02, AC-AUTH-009-03 | T-P2-AUTH-010 | TC-AUTH-009-01 | PG-007 |
| **F-AUTH-010** User preferences (language, timezone, theme, week start, numerals) | M | P2 | FR-AUTH-010-01, FR-AUTH-010-02, FR-AUTH-010-03 | US-AUTH-010-01 | AC-AUTH-010-01, AC-AUTH-010-02 | T-P2-AUTH-009, T-P2-UI-004 | TC-AUTH-010-01, TC-AUTH-010-02 | PG-012, PG-051 |
| **F-AUTH-011** Optional account recovery (recovery codes / secondary email) | C | P10 | FR-AUTH-011-01 | US-AUTH-011-01 | — | T-P10-AUTH-001 | TC-AUTH-011-01 | — |

## RBAC

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-RBAC-001** Role model: Guest, User, Admin, Super Admin | M | P2 | FR-RBAC-001-01, FR-RBAC-001-02 | US-RBAC-001-01 | AC-RBAC-001-01 | T-P2-RBAC-001 | TC-RBAC-001-01 | PG-055 |
| **F-RBAC-002** Permission-based authorization enforced in backend | M | P2 | FR-RBAC-002-01, FR-RBAC-002-02, FR-RBAC-002-03 | US-RBAC-002-01, US-RBAC-002-02 | AC-RBAC-002-01, AC-RBAC-002-02 | T-P2-RBAC-002, T-P2-RBAC-008 | TC-RBAC-002-01, TC-RBAC-002-02 | PG-055 |
| **F-RBAC-003** Role assignment / revocation | M | P2 | FR-RBAC-003-01, FR-RBAC-003-02 | US-RBAC-003-01 | AC-RBAC-003-01, AC-RBAC-003-02 | T-P2-RBAC-003 | TC-RBAC-003-01 | PG-054, PG-055 |
| **F-RBAC-004** Administrative account management | M | P2 | FR-RBAC-004-01 | US-RBAC-004-01 | AC-RBAC-004-01 | T-P10-RBAC-001, T-P2-RBAC-004 | TC-RBAC-004-01, TC-RBAC-004-02 | PG-054 |
| **F-RBAC-005** Audit logging of privileged and security events | M | P2 | FR-RBAC-005-01, FR-RBAC-005-02, FR-RBAC-005-03 | US-RBAC-005-01 | AC-RBAC-005-01 | T-P2-RBAC-005 | TC-RBAC-005-01 | PG-064 |
| **F-RBAC-006** Secure admin routes with step-up re-authentication | M | P2 | FR-RBAC-006-01, FR-RBAC-006-02 | US-RBAC-006-01 | AC-RBAC-006-01 | T-P2-QA-002, T-P2-RBAC-006 | TC-RBAC-006-01, TC-RBAC-006-02 | PG-066 |
| **F-RBAC-007** TOTP two-factor authentication for Admin/Super Admin | S | P2 | FR-RBAC-007-01 | US-RBAC-007-01 | — | T-P2-RBAC-007 | TC-RBAC-007-01 | PG-066 |

## I18N

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-I18N-001** EN/BN localization infrastructure (message catalogs, no hardcoded strings) | M | P2 | FR-I18N-001-01, FR-I18N-001-02, FR-I18N-001-03 | US-I18N-001-01 | AC-I18N-001-01, AC-I18N-001-02 | T-P2-I18N-001, T-P2-I18N-002, T-P4-I18N-001 | TC-I18N-001-01, TC-I18N-001-02, TC-I18N-001-03 | — |
| **F-I18N-002** Language switcher | M | P2 | FR-I18N-002-01 | US-I18N-002-01 | AC-I18N-002-01 | T-P2-I18N-003 | TC-I18N-002-01 | PG-001, PG-051 |
| **F-I18N-003** Persistent language preference (account + device) | M | P2 | FR-I18N-003-01, FR-I18N-003-02 | US-I18N-003-01 | AC-I18N-003-01 | T-P2-I18N-003 | TC-I18N-003-01 | PG-012 |
| **F-I18N-004** Localized dates, times, numbers (Bengali digits option) and Gregorian/Hijri display | M | P2 | FR-I18N-004-01, FR-I18N-004-02, FR-I18N-004-03 | US-I18N-004-01 | AC-I18N-004-01 | T-P2-I18N-004, T-P5-ISL-003 | TC-I18N-004-01, TC-I18N-004-02 | — |
| **F-I18N-005** Bengali typography (font stack, line-height, conjunct rendering) | M | P2 | FR-I18N-005-01, FR-I18N-005-02 | US-I18N-005-01 | AC-I18N-005-01 | T-P2-I18N-005 | TC-I18N-005-01 | — |
| **F-I18N-006** Localized notifications & emails | M | P6 | FR-I18N-006-01 | US-I18N-006-01 | AC-I18N-006-01 | T-P6-I18N-001 | TC-I18N-006-01 | PG-061 |
| **F-I18N-007** Localized validation and error messages | M | P2 | FR-I18N-007-01 | US-I18N-007-01 | AC-I18N-007-01 | T-P2-I18N-006 | TC-I18N-007-01 | — |
| **F-I18N-008** Translatable admin-managed content (per-locale translation records) | M | P3 | FR-I18N-008-01, FR-I18N-008-02 | US-I18N-008-01 | AC-I18N-008-01 | T-P3-ADMIN-002, T-P3-I18N-001 | TC-I18N-008-01, TC-I18N-008-02 | PG-056, PG-057 |
| **F-I18N-009** Fallback behavior (BN → EN with missing-key reporting) | M | P2 | FR-I18N-009-01 | US-I18N-009-01 | AC-I18N-009-01 | T-P2-I18N-002, T-P2-I18N-007 | TC-I18N-009-01, TC-I18N-009-02 | PG-007, PG-057 |

## DEED

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-DEED-001** Predefined good deed library | M | P3 | FR-DEED-001-01, FR-DEED-001-02 | US-DEED-001-01 | AC-DEED-001-01, AC-DEED-001-02 | T-P3-DEED-001, T-P3-DEED-002 | TC-DEED-001-01, TC-DEED-001-02 | PG-014, PG-015 |
| **F-DEED-002** Deed categories | M | P3 | FR-DEED-002-01 | US-DEED-002-01 | AC-DEED-002-01 | T-P3-DEED-001, T-P3-DEED-003 | TC-DEED-002-01, TC-DEED-002-02 | PG-014 |
| **F-DEED-003** Custom (user-created) deeds | M | P3 | FR-DEED-003-01, FR-DEED-003-02, FR-DEED-003-03 | US-DEED-003-01 | AC-DEED-003-01, AC-DEED-003-02 | T-P3-DEED-005 | TC-DEED-003-01 | PG-015, PG-016 |
| **F-DEED-004** Daily checklist | M | P3 | FR-DEED-004-01, FR-DEED-004-02, FR-DEED-004-03, FR-DEED-004-04, FR-DEED-004-05 | US-DEED-004-01, US-DEED-004-02 | AC-DEED-004-01, AC-DEED-004-02, AC-DEED-004-03 | T-P3-DEED-008, T-P3-QA-001 | TC-DEED-004-01, TC-DEED-004-02 | PG-013 |
| **F-DEED-005** Recurring deeds (daily / weekdays / weekly / monthly / custom RRULE subset) | M | P3 | FR-DEED-005-01, FR-DEED-005-02, FR-DEED-005-03, FR-DEED-005-04 | US-DEED-005-01, US-DEED-005-02 | AC-DEED-005-01, AC-DEED-005-02, AC-DEED-005-03, AC-DEED-005-04 | T-P3-DEED-006, T-P3-DEED-007 | TC-DEED-005-01, TC-DEED-005-02 | PG-015, PG-016, PG-017 |
| **F-DEED-006** Favorite deeds | S | P3 | FR-DEED-006-01 | US-DEED-006-01 | — | T-P3-DEED-010 | TC-DEED-006-01 | PG-014, PG-015, PG-017 |
| **F-DEED-007** Activity history | M | P3 | FR-DEED-007-01 | US-DEED-007-01 | AC-DEED-007-01 | T-P3-DEED-011 | TC-DEED-007-01 | PG-019 |
| **F-DEED-008** Notes on completions | S | P3 | FR-DEED-008-01 | US-DEED-008-01 | — | T-P3-DEED-009 | TC-DEED-008-01 | PG-013, PG-019 |
| **F-DEED-009** Completion status (done / partial / skipped) | M | P3 | FR-DEED-009-01 | US-DEED-009-01 | AC-DEED-009-01, AC-DEED-009-02 | T-P3-DEED-009 | TC-DEED-009-01 | PG-013 |
| **F-DEED-010** Optional evidence attachments (images) | C | P3 | FR-DEED-010-01, FR-DEED-010-02 | US-DEED-010-01 | — | T-P3-DEED-012 | TC-DEED-010-01 | — |
| **F-DEED-011** Good deed discovery (browse, search, filter) | S | P3 | FR-DEED-011-01 | US-DEED-011-01 | — | T-P3-DEED-004 | TC-DEED-011-01 | PG-014 |
| **F-DEED-012** Random good deed generator | S | P3 | FR-DEED-012-01 | US-DEED-012-01 | — | T-P3-DEED-013 | TC-DEED-012-01 | PG-013, PG-014 |
| **F-DEED-013** Five-minute good deeds collection | S | P3 | FR-DEED-013-01 | US-DEED-013-01 | — | T-P3-DEED-002, T-P3-DEED-014 | TC-DEED-013-01, TC-DEED-013-02 | PG-014 |
| **F-DEED-014** Category-based (rule-based) recommendations | S | P3 | FR-DEED-014-01 | US-DEED-014-01 | — | T-P3-DEED-015 | TC-DEED-014-01 | PG-012, PG-014 |

## CAL

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-CAL-001** Daily calendar view | M | P3 | FR-CAL-001-01 | US-CAL-001-01 | AC-CAL-001-01 | T-P3-CAL-004 | TC-CAL-001-01 | PG-018 |
| **F-CAL-002** Weekly calendar view | M | P3 | FR-CAL-002-01 | US-CAL-002-01 | AC-CAL-002-01 | T-P3-CAL-004 | TC-CAL-002-01 | — |
| **F-CAL-003** Monthly calendar view | M | P3 | FR-CAL-003-01 | US-CAL-003-01 | AC-CAL-003-01 | T-P3-CAL-004 | TC-CAL-003-01 | — |
| **F-CAL-004** Yearly history | S | P3 | FR-CAL-004-01 | US-CAL-004-01 | — | T-P3-CAL-005 | TC-CAL-004-01 | — |
| **F-CAL-005** Activity heatmap | S | P3 | FR-CAL-005-01 | US-CAL-005-01 | — | T-P3-CAL-005 | TC-CAL-005-01 | PG-020 |
| **F-CAL-006** Daily completion rate | M | P3 | FR-CAL-006-01, FR-CAL-006-02 | US-CAL-006-01 | AC-CAL-006-01 | T-P3-CAL-003 | TC-CAL-006-01 | PG-013 |
| **F-CAL-007** Streak tracking (per deed and overall) | M | P3 | FR-CAL-007-01, FR-CAL-007-02 | US-CAL-007-01 | AC-CAL-007-01, AC-CAL-007-02 | T-P3-CAL-002, T-P3-QA-001 | TC-CAL-007-01, TC-CAL-007-02 | PG-013 |
| **F-CAL-008** Longest streak | M | P3 | FR-CAL-008-01 | US-CAL-008-01 | AC-CAL-008-01 | T-P3-CAL-002 | TC-CAL-008-01 | — |
| **F-CAL-009** Streak milestones (feeds GAME) | S | P4 | FR-CAL-009-01 | US-CAL-009-01 | — | T-P4-GAME-001 | TC-CAL-009-01 | PG-041 |
| **F-CAL-010** Timezone-aware daily boundaries | M | P3 | FR-CAL-010-01, FR-CAL-010-02 | US-CAL-010-01 | AC-CAL-010-01, AC-CAL-010-02, AC-CAL-010-03 | T-P3-CAL-001 | TC-CAL-010-01 | PG-013 |
| **F-CAL-011** Past-day editing within a configurable window (default 7 days) | S | P3 | FR-CAL-011-01 | US-CAL-011-01 | — | T-P3-CAL-006 | TC-CAL-011-01 | PG-013, PG-019 |

## GROW

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-GROW-001** Personal goals | M | P4 | FR-GROW-001-01, FR-GROW-001-02 | US-GROW-001-01 | AC-GROW-001-01, AC-GROW-001-02 | T-P4-GROW-001 | TC-GROW-001-01 | PG-021, PG-022 |
| **F-GROW-002** Weekly and monthly goals | S | P4 | FR-GROW-002-01 | US-GROW-002-01 | — | T-P4-GROW-001 | TC-GROW-002-01 | PG-021, PG-030 |
| **F-GROW-003** Goal milestones | S | P4 | FR-GROW-003-01 | US-GROW-003-01 | — | T-P4-GROW-001 | TC-GROW-003-01 | PG-022 |
| **F-GROW-004** Personal growth timeline | S | P4 | FR-GROW-004-01 | US-GROW-004-01 | — | T-P4-GROW-004 | TC-GROW-004-01 | PG-023 |
| **F-GROW-005** Consistency analysis | S | P4 | FR-GROW-005-01 | US-GROW-005-01 | — | T-P4-GROW-003 | TC-GROW-005-01 | — |
| **F-GROW-006** Weak habit identification (neutral framing) | S | P4 | FR-GROW-006-01 | US-GROW-006-01 | AC-GROW-006-01 | T-P4-GROW-003 | TC-GROW-006-01 | — |
| **F-GROW-007** Rule-based growth insights | S | P4 | FR-GROW-007-01 | US-GROW-007-01 | — | T-P4-GROW-005 | TC-GROW-007-01 | — |
| **F-GROW-008** Monthly reflection | S | P4 | FR-GROW-008-01 | US-GROW-008-01 | — | T-P4-GROW-006 | TC-GROW-008-01 | PG-025 |
| **F-GROW-009** Life balance tracker (8 categories) | S | P4 | FR-GROW-009-01, FR-GROW-009-02 | US-GROW-009-01 | AC-GROW-009-01 | T-P4-GROW-002 | TC-GROW-009-01 | PG-024 |

## JRNL

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-JRNL-001** Daily journal | M | P4 | FR-JRNL-001-01, FR-JRNL-001-02 | US-JRNL-001-01 | AC-JRNL-001-01, AC-JRNL-001-02 | T-P4-JRNL-002 | TC-JRNL-001-01 | PG-019, PG-026, PG-027 |
| **F-JRNL-002** Morning intention | S | P4 | FR-JRNL-002-01 | US-JRNL-002-01 | — | T-P4-JRNL-002 | TC-JRNL-002-01 | — |
| **F-JRNL-003** Evening reflection | S | P4 | FR-JRNL-003-01 | US-JRNL-003-01 | — | T-P4-JRNL-002 | TC-JRNL-003-01 | PG-025 |
| **F-JRNL-004** Gratitude journal | S | P4 | FR-JRNL-004-01 | US-JRNL-004-01 | — | T-P4-JRNL-002 | TC-JRNL-004-01 | — |
| **F-JRNL-005** Future-self letters (scheduled delivery) | C | P4 | FR-JRNL-005-01 | US-JRNL-005-01 | — | T-P4-JRNL-003 | TC-JRNL-005-01 | PG-028 |
| **F-JRNL-006** Personal learning notes | C | P4 | FR-JRNL-006-01 | US-JRNL-006-01 | — | T-P4-JRNL-004 | TC-JRNL-006-01 | PG-026, PG-027 |
| **F-JRNL-007** Private journal history (private by default, encrypted at application level) | M | P4 | FR-JRNL-007-01, FR-JRNL-007-02, FR-JRNL-007-03 | US-JRNL-007-01 | AC-JRNL-007-01, AC-JRNL-007-02, AC-JRNL-007-03 | T-P4-JRNL-001, T-P4-QA-001 | TC-JRNL-007-01, TC-JRNL-007-02 | PG-026 |
| **F-JRNL-008** Journal search & filtering | S | P4 | FR-JRNL-008-01 | US-JRNL-008-01 | AC-JRNL-008-01 | T-P4-JRNL-005 | TC-JRNL-008-01 | PG-026 |
| **F-JRNL-009** Journal export (Markdown/JSON) | S | P4 | FR-JRNL-009-01 | US-JRNL-009-01 | — | T-P4-JRNL-006 | TC-JRNL-009-01 | PG-026, PG-049 |
| **F-JRNL-010** Optional AI-assisted summaries (opt-in) | C | P8 | FR-JRNL-010-01 | US-JRNL-010-01 | — | T-P8-JRNL-001 | TC-JRNL-010-01 | PG-027 |

## PLAN

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-PLAN-001** Daily planner | S | P4 | FR-PLAN-001-01 | US-PLAN-001-01 | — | T-P4-PLAN-001 | TC-PLAN-001-01 | PG-029 |
| **F-PLAN-002** Morning planning flow | S | P4 | FR-PLAN-002-01 | US-PLAN-002-01 | — | T-P4-PLAN-002 | TC-PLAN-002-01 | — |
| **F-PLAN-003** Evening review flow | S | P4 | FR-PLAN-003-01 | US-PLAN-003-01 | AC-PLAN-003-01 | T-P4-PLAN-002 | TC-PLAN-003-01 | — |
| **F-PLAN-004** Task prioritization | S | P4 | FR-PLAN-004-01 | US-PLAN-004-01 | AC-PLAN-004-01 | T-P4-PLAN-001 | TC-PLAN-004-01 | PG-029 |
| **F-PLAN-005** Time-based activities (time blocks) | S | P4 | FR-PLAN-005-01 | US-PLAN-005-01 | — | T-P4-PLAN-001 | TC-PLAN-005-01 | PG-016 |
| **F-PLAN-006** Recurring planner activities (reuses DEED recurrence engine) | S | P4 | FR-PLAN-006-01 | US-PLAN-006-01 | — | T-P4-PLAN-003 | TC-PLAN-006-01 | — |
| **F-PLAN-007** Weekly planning | C | P4 | FR-PLAN-007-01 | US-PLAN-007-01 | — | T-P4-PLAN-003 | TC-PLAN-007-01 | PG-030 |
| **F-PLAN-008** External calendar integration (see F-INTG-003) | C | P10 | FR-PLAN-008-01 | US-PLAN-008-01 | — | T-P10-INTG-001 | TC-PLAN-008-01 | — |

## ISL

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-ISL-001** Salah tracker (5 fard + optional sunnah/witr, on-time/qada/jamaah flags) | M | P5 | FR-ISL-001-01, FR-ISL-001-02, FR-ISL-001-03 | US-ISL-001-01, US-ISL-001-02 | AC-ISL-001-01, AC-ISL-001-02, AC-ISL-001-03 | T-P5-ISL-004 | TC-ISL-001-01 | PG-019, PG-032 |
| **F-ISL-002** Prayer times (location, calculation method, madhab for Asr) | M | P5 | FR-ISL-002-01, FR-ISL-002-02, FR-ISL-002-03, FR-ISL-002-04 | US-ISL-002-01 | AC-ISL-002-01, AC-ISL-002-02, AC-ISL-002-03 | T-P5-ISL-002 | TC-ISL-002-01 | PG-013, PG-031, PG-032 |
| **F-ISL-003** Quran reading tracker (surah/ayah/page/juz) | M | P5 | FR-ISL-003-01, FR-ISL-003-02 | US-ISL-003-01 | AC-ISL-003-01, AC-ISL-003-02 | T-P5-ISL-005 | TC-ISL-003-01 | PG-033 |
| **F-ISL-004** Quran memorization tracker | S | P5 | FR-ISL-004-01 | US-ISL-004-01 | — | T-P5-ISL-006 | TC-ISL-004-01 | PG-033 |
| **F-ISL-005** Khatam planner | S | P5 | FR-ISL-005-01 | US-ISL-005-01 | — | T-P5-ISL-007 | TC-ISL-005-01 | PG-033 |
| **F-ISL-006** Daily dhikr | S | P5 | FR-ISL-006-01 | US-ISL-006-01 | — | T-P5-ISL-008 | TC-ISL-006-01 | PG-034 |
| **F-ISL-007** Tasbih counter (works offline) | S | P5 | FR-ISL-007-01 | US-ISL-007-01 | AC-ISL-007-01 | T-P5-ISL-008 | TC-ISL-007-01 | PG-034 |
| **F-ISL-008** Dua collection (sourced, EN/BN) | S | P5 | FR-ISL-008-01 | US-ISL-008-01 | — | T-P5-ISL-009 | TC-ISL-008-01 | PG-035, PG-058 |
| **F-ISL-009** Sunnah tracker | S | P5 | FR-ISL-009-01 | US-ISL-009-01 | — | T-P5-ISL-010 | TC-ISL-009-01 | — |
| **F-ISL-010** Tahajjud tracker | S | P5 | FR-ISL-010-01 | US-ISL-010-01 | — | T-P5-ISL-010 | TC-ISL-010-01 | — |
| **F-ISL-011** Fasting tracker (Ramadan, Monday/Thursday, Ayyam al-Bid, qada) | S | P5 | FR-ISL-011-01 | US-ISL-011-01 | — | T-P5-ISL-011 | TC-ISL-011-01 | PG-036 |
| **F-ISL-012** Ramadan planner | S | P5 | FR-ISL-012-01 | US-ISL-012-01 | — | T-P5-ISL-011 | TC-ISL-012-01 | PG-036 |
| **F-ISL-013** Hijri calendar (with user day offset) | M | P5 | FR-ISL-013-01, FR-ISL-013-02 | US-ISL-013-01 | AC-ISL-013-01 | T-P5-ISL-003 | TC-ISL-013-01 | PG-018, PG-031, PG-038 |
| **F-ISL-014** Zakat calculator (informational, configurable nisab basis) | S | P5 | FR-ISL-014-01, FR-ISL-014-02 | US-ISL-014-01 | AC-ISL-014-01 | T-P5-ISL-012 | TC-ISL-014-01 | PG-037 |
| **F-ISL-015** Islamic learning hub | C | P5 | FR-ISL-015-01 | US-ISL-015-01 | — | T-P5-ISL-013 | TC-ISL-015-01 | PG-039, PG-058 |
| **F-ISL-016** Hadith of the Day (sourced, graded where available) | S | P5 | FR-ISL-016-01 | US-ISL-016-01 | — | T-P5-ISL-013 | TC-ISL-016-01 | PG-031, PG-039, PG-058 |
| **F-ISL-017** Religious preferences & module opt-out | M | P5 | FR-ISL-017-01, FR-ISL-017-02 | US-ISL-017-01 | AC-ISL-017-01 | T-P5-ISL-001 | TC-ISL-017-01 | PG-012, PG-031, PG-051 |
| **F-ISL-018** Content source verification & references | M | P5 | FR-ISL-018-01, FR-ISL-018-02, FR-ISL-018-03 | US-ISL-018-01 | AC-ISL-018-01 | T-P5-ISL-014 | TC-ISL-018-01 | PG-007, PG-035, PG-058 |

## NOTIF

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-NOTIF-001** In-app notifications center | M | P6 | FR-NOTIF-001-01 | US-NOTIF-001-01 | AC-NOTIF-001-01 | T-P6-NOTIF-001 | TC-NOTIF-001-01 | PG-050 |
| **F-NOTIF-002** Daily reminders | M | P6 | FR-NOTIF-002-01, FR-NOTIF-002-02 | US-NOTIF-002-01 | AC-NOTIF-002-01 | T-P6-NOTIF-003 | TC-NOTIF-002-01 | — |
| **F-NOTIF-003** Custom reminder schedules | S | P6 | FR-NOTIF-003-01 | US-NOTIF-003-01 | — | T-P6-NOTIF-003 | TC-NOTIF-003-01 | PG-016 |
| **F-NOTIF-004** Incomplete task reminders (gentle, non-shaming) | S | P6 | FR-NOTIF-004-01 | US-NOTIF-004-01 | — | T-P6-NOTIF-004 | TC-NOTIF-004-01 | — |
| **F-NOTIF-005** Email notifications (transactional in P2; digests in P6) | M | P2/P6 | FR-NOTIF-005-01, FR-NOTIF-005-02 | US-NOTIF-005-01 | AC-NOTIF-005-01 | T-P2-INTG-001, T-P6-NOTIF-006 | TC-NOTIF-005-01, TC-NOTIF-005-02 | — |
| **F-NOTIF-006** Web Push notifications | S | P6 | FR-NOTIF-006-01, FR-NOTIF-006-02, FR-NOTIF-006-03 | US-NOTIF-006-01 | AC-NOTIF-006-01 | T-P6-INTG-001 | TC-NOTIF-006-01 | — |
| **F-NOTIF-007** Challenge notifications | C | P7 | FR-NOTIF-007-01 | US-NOTIF-007-01 | — | T-P7-NOTIF-001 | TC-NOTIF-007-01 | PG-045 |
| **F-NOTIF-008** Quiet hours | S | P6 | FR-NOTIF-008-01, FR-NOTIF-008-02 | US-NOTIF-008-01 | AC-NOTIF-008-01 | T-P6-NOTIF-002 | TC-NOTIF-008-01 | PG-051 |
| **F-NOTIF-009** Notification preferences (per channel / per type) | M | P6 | FR-NOTIF-009-01, FR-NOTIF-009-02 | US-NOTIF-009-01 | AC-NOTIF-009-01 | T-P6-NOTIF-002 | TC-NOTIF-009-01 | PG-012 |
| **F-NOTIF-010** Prayer time reminders | S | P6 | FR-NOTIF-010-01 | US-NOTIF-010-01 | — | T-P6-NOTIF-005 | TC-NOTIF-010-01 | PG-032 |

## COMM

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-COMM-001** Family groups | S | P7 | FR-COMM-001-01, FR-COMM-001-02, FR-COMM-001-03 | US-COMM-001-01 | — | T-P7-COMM-001 | TC-COMM-001-01 | PG-042 |
| **F-COMM-002** Member invitations (link/code, expiring) | S | P7 | FR-COMM-002-01 | US-COMM-002-01 | — | T-P7-COMM-001 | TC-COMM-002-01 | PG-010 |
| **F-COMM-003** Family challenges | S | P7 | FR-COMM-003-01 | US-COMM-003-01 | AC-COMM-003-01 | T-P7-COMM-003 | TC-COMM-003-01 | PG-045 |
| **F-COMM-004** Shared family calendar | C | P7 | FR-COMM-004-01 | US-COMM-004-01 | — | T-P7-COMM-004 | TC-COMM-004-01 | — |
| **F-COMM-005** Family achievements | C | P7 | FR-COMM-005-01 | US-COMM-005-01 | — | T-P7-COMM-004 | TC-COMM-005-01 | — |
| **F-COMM-006** Community groups | C | P7 | FR-COMM-006-01 | US-COMM-006-01 | — | T-P7-COMM-005 | TC-COMM-006-01 | PG-043 |
| **F-COMM-007** Community campaigns | S | P7 | FR-COMM-007-01 | US-COMM-007-01 | — | T-P7-COMM-006 | TC-COMM-007-01 | PG-011, PG-045, PG-059 |
| **F-COMM-008** Volunteer opportunities | C | P7 | FR-COMM-008-01 | US-COMM-008-01 | — | T-P7-COMM-007 | TC-COMM-008-01 | PG-046, PG-059 |
| **F-COMM-009** Kindness stories (posts) | S | P7 | FR-COMM-009-01, FR-COMM-009-02 | US-COMM-009-01 | — | T-P7-COMM-008 | TC-COMM-009-01 | PG-043, PG-044 |
| **F-COMM-010** Anonymous sharing | S | P7 | FR-COMM-010-01 | US-COMM-010-01 | AC-COMM-010-01 | T-P7-COMM-008 | TC-COMM-010-01 | — |
| **F-COMM-011** Community recognition (appreciations, not rankings) | C | P7 | FR-COMM-011-01 | US-COMM-011-01 | — | T-P7-COMM-009 | TC-COMM-011-01 | — |
| **F-COMM-012** Moderation queue & actions | M | P7 | FR-COMM-012-01, FR-COMM-012-02 | US-COMM-012-01 | AC-COMM-012-01, AC-COMM-012-02 | T-P7-COMM-011 | TC-COMM-012-01 | PG-044, PG-060 |
| **F-COMM-013** Reporting & blocking | M | P7 | FR-COMM-013-01, FR-COMM-013-02 | US-COMM-013-01 | AC-COMM-013-01, AC-COMM-013-02 | T-P7-COMM-010 | TC-COMM-013-01 | PG-043, PG-044, PG-060 |
| **F-COMM-014** Privacy controls (default private, explicit per-item sharing) | M | P7 | FR-COMM-014-01, FR-COMM-014-02, FR-COMM-014-03 | US-COMM-014-01 | AC-COMM-014-01, AC-COMM-014-02 | T-P7-COMM-002 | TC-COMM-014-01 | PG-042, PG-051 |

## WELL

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-WELL-001** Screen-time awareness journal (manual entry) | C | P7 | FR-WELL-001-01 | US-WELL-001-01 | — | T-P7-WELL-001 | TC-WELL-001-01 | PG-040 |
| **F-WELL-002** Social media usage goals (self-reported) | C | P7 | FR-WELL-002-01 | US-WELL-002-01 | — | T-P7-WELL-001 | TC-WELL-002-01 | — |
| **F-WELL-003** Avoid-bad-habits tracker | S | P4 | FR-WELL-003-01 | US-WELL-003-01 | — | T-P4-WELL-001 | TC-WELL-003-01 | — |
| **F-WELL-004** Procrastination tracker | C | P7 | FR-WELL-004-01 | US-WELL-004-01 | — | T-P7-WELL-002 | TC-WELL-004-01 | — |
| **F-WELL-005** Anger management reflection | C | P7 | FR-WELL-005-01 | US-WELL-005-01 | — | T-P7-WELL-002 | TC-WELL-005-01 | — |
| **F-WELL-006** Digital detox challenges | C | P7 | FR-WELL-006-01 | US-WELL-006-01 | — | T-P7-WELL-003 | TC-WELL-006-01 | PG-045 |
| **F-WELL-007** Positive affirmations | S | P4 | FR-WELL-007-01 | US-WELL-007-01 | — | T-P4-WELL-002 | TC-WELL-007-01 | PG-013 |

## GAME

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-GAME-001** Achievement badges | S | P4 | FR-GAME-001-01, FR-GAME-001-02, FR-GAME-001-03 | US-GAME-001-01 | — | T-P4-GAME-001 | TC-GAME-001-01 | PG-041 |
| **F-GAME-002** Milestones | S | P4 | FR-GAME-002-01 | US-GAME-002-01 | — | T-P4-GAME-001 | TC-GAME-002-01 | PG-041 |
| **F-GAME-003** Personal streak display | M | P4 | FR-GAME-003-01 | US-GAME-003-01 | AC-GAME-003-01 | T-P4-GAME-002 | TC-GAME-003-01 | PG-013, PG-020 |
| **F-GAME-004** Virtual Good Deeds Tree | S | P4 | FR-GAME-004-01 | US-GAME-004-01 | AC-GAME-004-01 | T-P4-GAME-003 | TC-GAME-004-01 | PG-041 |
| **F-GAME-005** Random challenges | C | P4 | FR-GAME-005-01 | US-GAME-005-01 | — | T-P4-GAME-004 | TC-GAME-005-01 | PG-045 |
| **F-GAME-006** Surprise good deeds | C | P4 | FR-GAME-006-01 | US-GAME-006-01 | — | T-P4-GAME-004 | TC-GAME-006-01 | — |
| **F-GAME-007** Community appreciation | C | P7 | FR-GAME-007-01 | US-GAME-007-01 | — | T-P7-COMM-009 | TC-GAME-007-01 | PG-043 |
| **F-GAME-008** Positive recognition messaging (no shame, no worship ranking) | S | P4 | FR-GAME-008-01, FR-GAME-008-02 | US-GAME-008-01 | AC-GAME-008-01 | T-P4-GAME-002 | TC-GAME-008-01 | PG-041 |

## AI

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-AI-001** AI gateway & provider abstraction (Anthropic Claude default) | M | P8 | FR-AI-001-01, FR-AI-001-02, FR-AI-001-03 | US-AI-001-01 | AC-AI-001-01, AC-AI-001-02 | T-P8-AI-001 | TC-AI-001-01 | PG-047, PG-065 |
| **F-AI-002** AI consent, privacy controls & global disable | M | P8 | FR-AI-002-01, FR-AI-002-02, FR-AI-002-03, FR-AI-002-04 | US-AI-002-01 | AC-AI-002-01, AC-AI-002-02 | T-P8-AI-002 | TC-AI-002-01 | PG-051 |
| **F-AI-003** Usage limits, quotas & cost monitoring | M | P8 | FR-AI-003-01, FR-AI-003-02, FR-AI-003-03 | US-AI-003-01 | AC-AI-003-01, AC-AI-003-02 | T-P8-AI-003 | TC-AI-003-01 | PG-065 |
| **F-AI-004** AI good deed suggestions | S | P8 | FR-AI-004-01 | US-AI-004-01 | AC-AI-004-01 | T-P8-AI-005 | TC-AI-004-01 | — |
| **F-AI-005** AI habit coach (conversational) | C | P8 | FR-AI-005-01 | US-AI-005-01 | — | T-P8-AI-008 | TC-AI-005-01 | — |
| **F-AI-006** AI daily reflection prompts | S | P8 | FR-AI-006-01 | US-AI-006-01 | — | T-P8-AI-006 | TC-AI-006-01 | — |
| **F-AI-007** AI weekly report narrative | S | P8 | FR-AI-007-01 | US-AI-007-01 | — | T-P8-AI-007 | TC-AI-007-01 | PG-048 |
| **F-AI-008** AI task generation from natural language | C | P8 | FR-AI-008-01 | US-AI-008-01 | — | T-P8-AI-009 | TC-AI-008-01 | PG-047 |
| **F-AI-009** AI growth insights | S | P8 | FR-AI-009-01 | US-AI-009-01 | — | T-P8-AI-007 | TC-AI-009-01 | PG-023, PG-048 |
| **F-AI-010** AI personal assistant | C | P8 | FR-AI-010-01 | US-AI-010-01 | — | T-P8-AI-008 | TC-AI-010-01 | — |
| **F-AI-011** AI voice journal (speech-to-text) | C | P8 | FR-AI-011-01 | US-AI-011-01 | — | T-P8-AI-010 | TC-AI-011-01 | PG-027 |
| **F-AI-012** AI motivational messages | S | P8 | FR-AI-012-01 | US-AI-012-01 | — | T-P8-AI-006 | TC-AI-012-01 | PG-013 |
| **F-AI-013** Safety filters & religious guardrails | M | P8 | FR-AI-013-01, FR-AI-013-02, FR-AI-013-03 | US-AI-013-01 | AC-AI-013-01, AC-AI-013-02 | T-P8-AI-004 | TC-AI-013-01 | PG-047, PG-065 |

## PWA

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-PWA-001** Web app manifest & installability | M | P2 | FR-PWA-001-01, FR-PWA-001-02 | US-PWA-001-01 | AC-PWA-001-01 | T-P2-PWA-001 | TC-PWA-001-01 | PG-001, PG-052 |
| **F-PWA-002** Responsive navigation (bottom bar mobile / sidebar desktop) | M | P2 | FR-PWA-002-01 | US-PWA-002-01 | AC-PWA-002-01 | T-P2-UI-003 | TC-PWA-002-01 | — |
| **F-PWA-003** Cached application shell | M | P2 | FR-PWA-003-01, FR-PWA-003-02 | US-PWA-003-01 | AC-PWA-003-01 | T-P2-PWA-002 | TC-PWA-003-01 | PG-008 |
| **F-PWA-004** Offline read access to recent data | S | P9 | FR-PWA-004-01 | US-PWA-004-01 | — | T-P9-PWA-001 | TC-PWA-004-01 | — |
| **F-PWA-005** Offline task completion with outbox queue | M | P9 | FR-PWA-005-01, FR-PWA-005-02 | US-PWA-005-01 | AC-PWA-005-01, AC-PWA-005-02 | T-P9-PWA-002, T-P9-PWA-004 | TC-PWA-005-01, TC-PWA-005-02 | PG-013 |
| **F-PWA-006** Synchronization & conflict handling | M | P9 | FR-PWA-006-01, FR-PWA-006-02, FR-PWA-006-03, FR-PWA-006-11, FR-PWA-006-12, FR-PWA-006-13, FR-PWA-006-14, FR-PWA-006-15, FR-PWA-006-16, FR-PWA-006-17, FR-PWA-006-18 | US-PWA-006-01 | AC-PWA-006-01 | T-P9-PWA-003 | TC-PWA-006-01 | — |
| **F-PWA-007** In-app browser detection & "open in browser" fallback | M | P2 | FR-PWA-007-01, FR-PWA-007-02 | US-PWA-007-01 | AC-PWA-007-01 | T-P2-PWA-003 | TC-PWA-007-01 | PG-002 |
| **F-PWA-008** Feature detection & graceful degradation | M | P2 | FR-PWA-008-01 | US-PWA-008-01 | AC-PWA-008-01 | T-P2-PWA-004 | TC-PWA-008-01 | — |
| **F-PWA-009** App update flow (new version prompt) | S | P9 | FR-PWA-009-01 | US-PWA-009-01 | — | T-P9-PWA-005 | TC-PWA-009-01 | — |

## WIDGET

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-WIDGET-001** Minimal host companion app (device linking & settings only) | M | P9 | FR-WIDGET-001-01, FR-WIDGET-001-02, FR-WIDGET-001-03 | US-WIDGET-001-01 | AC-WIDGET-001-01, AC-WIDGET-001-02 | T-P9-WIDGET-001, T-P9-WIDGET-002 | TC-WIDGET-001-01, TC-WIDGET-001-02 | PG-051, PG-052 |
| **F-WIDGET-002** Small progress widget | M | P9 | FR-WIDGET-002-01 | US-WIDGET-002-01 | AC-WIDGET-002-01 | T-P9-WIDGET-004 | TC-WIDGET-002-01 | — |
| **F-WIDGET-003** Medium interactive daily checklist widget | S | P9 | FR-WIDGET-003-01 | US-WIDGET-003-01 | — | T-P9-WIDGET-005 | TC-WIDGET-003-01 | — |
| **F-WIDGET-004** Large detailed widget | S | P9 | FR-WIDGET-004-01 | US-WIDGET-004-01 | — | T-P9-WIDGET-006 | TC-WIDGET-004-01 | — |
| **F-WIDGET-005** Islamic tracker widget | S | P9 | FR-WIDGET-005-01 | US-WIDGET-005-01 | AC-WIDGET-005-01 | T-P9-WIDGET-007 | TC-WIDGET-005-01 | — |
| **F-WIDGET-006** Sync, offline queue & retry | M | P9 | FR-WIDGET-006-01, FR-WIDGET-006-02, FR-WIDGET-006-03 | US-WIDGET-006-01 | AC-WIDGET-006-01 | T-P9-WIDGET-003, T-P9-WIDGET-008 | TC-WIDGET-006-01, TC-WIDGET-006-02 | — |
| **F-WIDGET-007** Stale-data indicator | M | P9 | FR-WIDGET-007-01 | US-WIDGET-007-01 | AC-WIDGET-007-01 | T-P9-WIDGET-008 | TC-WIDGET-007-01 | — |
| **F-WIDGET-008** EN/BN widget localization | M | P9 | FR-WIDGET-008-01 | US-WIDGET-008-01 | AC-WIDGET-008-01 | T-P9-WIDGET-009 | TC-WIDGET-008-01 | — |
| **F-WIDGET-009** Deep links into the web app | M | P9 | FR-WIDGET-009-01 | US-WIDGET-009-01 | AC-WIDGET-009-01 | T-P9-WIDGET-010 | TC-WIDGET-009-01 | — |

## RPT

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-RPT-001** Daily & weekly personal summaries | S | P4 | FR-RPT-001-01, FR-RPT-001-02 | US-RPT-001-01 | AC-RPT-001-01 | T-P4-RPT-001 | TC-RPT-001-01 | PG-020, PG-049 |
| **F-RPT-002** Monthly & yearly reports | S | P10 | FR-RPT-002-01 | US-RPT-002-01 | — | T-P10-RPT-001 | TC-RPT-002-01 | — |
| **F-RPT-003** Category trends | S | P4 | FR-RPT-003-01 | US-RPT-003-01 | — | T-P4-RPT-001 | TC-RPT-003-01 | PG-020 |
| **F-RPT-004** Habit consistency report | S | P4 | FR-RPT-004-01 | US-RPT-004-01 | — | T-P4-RPT-001 | TC-RPT-004-01 | PG-020 |
| **F-RPT-005** Goal completion report | S | P4 | FR-RPT-005-01 | US-RPT-005-01 | — | T-P4-RPT-001 | TC-RPT-005-01 | PG-022 |
| **F-RPT-006** CSV export | S | P10 | FR-RPT-006-01, FR-RPT-006-02 | US-RPT-006-01 | AC-RPT-006-01 | T-P10-RPT-002 | TC-RPT-006-01 | — |
| **F-RPT-007** PDF export | C | P10 | FR-RPT-007-01 | US-RPT-007-01 | — | T-P10-RPT-002 | TC-RPT-007-01 | — |
| **F-RPT-008** Privacy-conscious product analytics (aggregate, consented) | S | P10 | FR-RPT-008-01, FR-RPT-008-02 | US-RPT-008-01 | AC-RPT-008-01 | T-P10-RPT-003 | TC-RPT-008-01 | PG-051, PG-053 |

## INTG

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-INTG-001** Email provider adapter (Resend / SMTP) | M | P2 | FR-INTG-001-01, FR-INTG-001-02 | US-INTG-001-01 | AC-INTG-001-01, AC-INTG-001-02 | T-P2-INTG-001 | TC-INTG-001-01 | — |
| **F-INTG-002** Web Push service (VAPID) | M | P6 | FR-INTG-002-01 | US-INTG-002-01 | AC-INTG-002-01 | T-P6-INTG-001 | TC-INTG-002-01 | — |
| **F-INTG-003** Google Calendar export/sync | C | P10 | FR-INTG-003-01 | US-INTG-003-01 | — | T-P10-INTG-001 | TC-INTG-003-01 | — |
| **F-INTG-004** Wearable integrations (Health Connect etc.) | W | Future | FR-INTG-004-01 | US-INTG-004-01 | — | out of scope | — | — |
| **F-INTG-005** Public API (scoped tokens) | C | P10 | FR-INTG-005-01 | US-INTG-005-01 | — | T-P10-INTG-002 | TC-INTG-005-01 | — |
| **F-INTG-006** QR-based campaign participation | C | P7 | FR-INTG-006-01 | US-INTG-006-01 | — | T-P7-INTG-001 | TC-INTG-006-01 | PG-011, PG-059 |

## ADMIN

| Feature | Pri | Phase | FR | US | AC | Tasks | Test cases | Pages |
|---|---|---|---|---|---|---|---|---|
| **F-ADMIN-001** User management | M | P2 | FR-ADMIN-001-01, FR-ADMIN-001-02 | US-ADMIN-001-01 | AC-ADMIN-001-01, AC-ADMIN-001-02 | T-P2-ADMIN-001, T-P2-ADMIN-002 | TC-ADMIN-001-01, TC-ADMIN-001-02 | PG-054 |
| **F-ADMIN-002** Role & permission management | M | P2 | FR-ADMIN-002-01 | US-ADMIN-002-01 | AC-ADMIN-002-01 | T-P10-RBAC-001, T-P2-ADMIN-003 | TC-ADMIN-002-01, TC-ADMIN-002-02 | PG-055 |
| **F-ADMIN-003** Deed & category content management | M | P3 | FR-ADMIN-003-01 | US-ADMIN-003-01 | AC-ADMIN-003-01, AC-ADMIN-003-02 | T-P3-ADMIN-001 | TC-ADMIN-003-01 | PG-056 |
| **F-ADMIN-004** Translation management for content | S | P3 | FR-ADMIN-004-01 | US-ADMIN-004-01 | — | T-P3-ADMIN-002 | TC-ADMIN-004-01 | PG-057 |
| **F-ADMIN-005** Islamic content management (with source verification workflow) | M | P5 | FR-ADMIN-005-01 | US-ADMIN-005-01 | AC-ADMIN-005-01 | T-P5-ADMIN-001 | TC-ADMIN-005-01 | PG-058 |
| **F-ADMIN-006** Campaign management | S | P7 | FR-ADMIN-006-01 | US-ADMIN-006-01 | — | T-P7-ADMIN-002 | TC-ADMIN-006-02 | PG-059 |
| **F-ADMIN-007** Notification scheduling / broadcasts | S | P6 | FR-ADMIN-007-01 | US-ADMIN-007-01 | — | T-P6-ADMIN-001 | TC-ADMIN-007-01 | PG-061 |
| **F-ADMIN-008** Community moderation console | M | P7 | FR-ADMIN-008-01 | US-ADMIN-008-01 | AC-ADMIN-008-01 | T-P7-ADMIN-001 | TC-ADMIN-008-01 | PG-060 |
| **F-ADMIN-009** Feature flags | M | P2 | FR-ADMIN-009-01 | US-ADMIN-009-01 | AC-ADMIN-009-01 | T-P2-ADMIN-004 | TC-ADMIN-009-01 | PG-062 |
| **F-ADMIN-010** A/B testing | C | P10 | FR-ADMIN-010-01 | US-ADMIN-010-01 | — | T-P10-ADMIN-001 | TC-ADMIN-010-01 | PG-062 |
| **F-ADMIN-011** Content versioning | S | P3 | FR-ADMIN-011-01 | US-ADMIN-011-01 | — | T-P3-ADMIN-003 | TC-ADMIN-011-01 | PG-056 |
| **F-ADMIN-012** System health dashboard | S | P10 | FR-ADMIN-012-01 | US-ADMIN-012-01 | — | T-P10-ADMIN-002 | TC-ADMIN-012-01 | PG-053, PG-063 |
| **F-ADMIN-013** API analytics | C | P10 | FR-ADMIN-013-01 | US-ADMIN-013-01 | — | T-P10-ADMIN-003 | TC-ADMIN-013-01 | PG-053, PG-063 |
| **F-ADMIN-014** Background job monitoring | S | P6 | FR-ADMIN-014-01 | US-ADMIN-014-01 | — | T-P6-ADMIN-002 | TC-ADMIN-014-01 | PG-053, PG-063 |
| **F-ADMIN-015** Backup monitoring | S | P10 | FR-ADMIN-015-01 | US-ADMIN-015-01 | — | T-P10-ADMIN-004 | TC-ADMIN-015-01 | PG-063 |
| **F-ADMIN-016** Audit log viewer | M | P2 | FR-ADMIN-016-01 | US-ADMIN-016-01 | AC-ADMIN-016-01 | T-P10-ADMIN-005, T-P2-ADMIN-005 | TC-ADMIN-016-01, TC-ADMIN-016-02 | PG-064 |
| **F-ADMIN-017** Subscription management | W | Future | FR-ADMIN-017-01 | US-ADMIN-017-01 | — | out of scope | — | — |

# Test Plan

> **Status:** Planning draft. **No tests have been written or executed yet.** Every row below is a test-case specification that will be automated or executed in the phase shown.
>
> Test-case IDs are exactly those allocated in [../implementation/MASTER_TASK_TRACKER.md](../implementation/MASTER_TASK_TRACKER.md) (`TC-{MOD}-{nnn}-{nn}`; for platform/governance tasks `nnn` is the task number). Linked requirements come from [../specifications/SRS.md](../specifications/SRS.md). The strategy, tools and environments are in [QA_STRATEGY.md](QA_STRATEGY.md); security-specific cases are expanded in [SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md). The FR → story → task → test mapping is in [TRACEABILITY_MATRIX.md](TRACEABILITY_MATRIX.md).

## 1. How to read this plan

| Column | Meaning |
|---|---|
| TC | Test-case ID (from the tracker) |
| Title | Feature name — implementing task |
| Level | Unit, Integration, API, E2E, a11y, Perf, Security, Android, Manual. Several levels mean the case is realised as a small suite across levels. |
| Linked requirements | All FRs of the feature (functional cases) or the NFRs verified (platform/QA cases) |
| Preconditions | Environment and data required. "Factory users" = created by test factories per run; no production data is ever used. |
| Key steps | Derived from the task's subtasks, plus the module's mandatory negative/edge check (last step). |
| Expected result | The task's Definition of Done plus every linked FR's condition. |
| Automation | Primary tool(s) |

**Rule:** a test case that covers a feature is passed only when **every linked FR** is asserted by at least one automated assertion (or a recorded manual check where the FR's verification method is Inspection/Demo). Each FR-level assertion is tagged in code with the FR ID (e.g. `it('FR-DEED-004-02: …')`) so the traceability matrix can be checked by script.

## 2. Mandatory cross-cutting suites

These run in addition to the per-feature cases and are attached to every phase from the phase in which the first relevant feature ships.

| Suite | Content | Applies from | Linked |
|---|---|---|---|
| **IDOR / data isolation** | For every per-user resource endpoint: user B requests user A's resource by ID (GET/PATCH/DELETE) → 404; list endpoints never return foreign rows. Generated from the OpenAPI spec so new endpoints are covered automatically. | P3 | NFR-SECURITY-007, NFR-SECURITY-008 |
| **Permission matrix** | Every `/admin/*` route × each role (Guest, User, Admin, Super Admin) → expected 401/403/2xx; route without decorator fails boot. | P2 | NFR-SECURITY-006, FR-RBAC-* |
| **Localization** | Every page rendered in `en`, `bn` and the `bn-XA` pseudo-locale (+40 % expansion, accent-wrapped); missing-key scan; visual overflow check at 360 px. | P2 | NFR-LOCALIZATION-001..005 |
| **Timezone / DST** | Domain + API tests under `TZ` ∈ {Asia/Dhaka, America/New_York (spring-forward & fall-back days), Pacific/Kiritimati (UTC+14), UTC} for `local_date`, streaks, reminders, prayer times. | P3 | SRS §7.5.2, FR-CAL-010-* |
| **Accessibility** | axe-core on every Playwright-visited page in light/dark × EN/BN, 0 serious/critical; keyboard-only path for core flows. | P2 | NFR-ACCESSIBILITY-002/003 |
| **Privacy leakage** | Log/Sentry/analytics sinks captured in tests and scanned for journal text, tokens, passwords, email local-parts, worship status. | P2 (logs), P4 (journal) | NFR-PRIVACY-010, NFR-PRIVACY-003 |
| **Contract** | Generated OpenAPI diffed against committed spec; responses validated against schemas in API tests. | P2 | NFR-MAINTAINABILITY-004 |

## 3. Test cases ({{COUNT}})
{{CASES}}
## 4. Adding test cases

New cases take the next free number for their feature (e.g. after case 02 of F-DEED-004 comes case 03), must link at least one FR/NFR, and must be added to the tracker row of the implementing task in the same PR. IDs are never reused.

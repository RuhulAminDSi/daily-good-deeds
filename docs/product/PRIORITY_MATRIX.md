# Priority Matrix

Priorities use MoSCoW and come from [FEATURE_ID_REGISTRY.md](FEATURE_ID_REGISTRY.md), which wins if the two files ever disagree.

## 1. Prioritisation rules
- **Must:** without it the product is unsafe, unusable, or fails a non-negotiable requirement (directive §2), or a Must feature cannot work without it.
- **Should:** high user value and planned for v1.0, but the product can still be released if it slips by one phase.
- **Could:** nice to have. It is built only if its phase has capacity, and usually sits behind a feature flag.
- **Won't (initial release):** documented in [FUTURE_ENHANCEMENTS.md](FUTURE_ENHANCEMENTS.md).

**Gating Musts:** some features are marked Must *conditionally*. For example, F-COMM-012/013 (moderation, reporting) must be in place before any public user-generated content ships, and F-AI-001/002/003/013 must be in place before any AI feature ships.

## 2. Summary counts

| Module | Must | Should | Could | Won't | Total |
|---|---|---|---|---|---|
| AUTH | 9 | 1 | 1 | 0 | 11 |
| RBAC | 6 | 1 | 0 | 0 | 7 |
| I18N | 9 | 0 | 0 | 0 | 9 |
| DEED | 7 | 6 | 1 | 0 | 14 |
| CAL | 7 | 4 | 0 | 0 | 11 |
| GROW | 1 | 8 | 0 | 0 | 9 |
| JRNL | 2 | 5 | 3 | 0 | 10 |
| PLAN | 0 | 6 | 2 | 0 | 8 |
| ISL | 6 | 11 | 1 | 0 | 18 |
| NOTIF | 4 | 5 | 1 | 0 | 10 |
| COMM | 3 | 6 | 5 | 0 | 14 |
| WELL | 0 | 2 | 5 | 0 | 7 |
| GAME | 1 | 4 | 3 | 0 | 8 |
| AI | 4 | 5 | 4 | 0 | 13 |
| PWA | 7 | 2 | 0 | 0 | 9 |
| WIDGET | 6 | 3 | 0 | 0 | 9 |
| RPT | 0 | 7 | 1 | 0 | 8 |
| INTG | 2 | 0 | 3 | 1 | 6 |
| ADMIN | 7 | 7 | 2 | 1 | 17 |
| **Total** | **81** | **83** | **32** | **2** | **198** |

## 3. Phase × priority

| Phase | Must | Should | Could | Won't |
|---|---|---|---|---|
| P2 | F-AUTH-001, F-AUTH-002, F-AUTH-004, F-AUTH-005, F-AUTH-006, F-AUTH-007, F-AUTH-008, F-AUTH-009, F-AUTH-010, F-RBAC-001, F-RBAC-002, F-RBAC-003, F-RBAC-004, F-RBAC-005, F-RBAC-006, F-I18N-001, F-I18N-002, F-I18N-003, F-I18N-004, F-I18N-005, F-I18N-007, F-I18N-009, F-PWA-001, F-PWA-002, F-PWA-003, F-PWA-007, F-PWA-008, F-INTG-001, F-ADMIN-001, F-ADMIN-002, F-ADMIN-009, F-ADMIN-016 | F-AUTH-003, F-RBAC-007 |  |  |
| P3 | F-I18N-008, F-DEED-001, F-DEED-002, F-DEED-003, F-DEED-004, F-DEED-005, F-DEED-007, F-DEED-009, F-CAL-001, F-CAL-002, F-CAL-003, F-CAL-006, F-CAL-007, F-CAL-008, F-CAL-010, F-ADMIN-003 | F-DEED-006, F-DEED-008, F-DEED-011, F-DEED-012, F-DEED-013, F-DEED-014, F-CAL-004, F-CAL-005, F-CAL-011, F-ADMIN-004, F-ADMIN-011 | F-DEED-010 |  |
| P4 | F-GROW-001, F-JRNL-001, F-JRNL-007, F-GAME-003 | F-CAL-009, F-GROW-002, F-GROW-003, F-GROW-004, F-GROW-005, F-GROW-006, F-GROW-007, F-GROW-008, F-GROW-009, F-JRNL-002, F-JRNL-003, F-JRNL-004, F-JRNL-008, F-JRNL-009, F-PLAN-001, F-PLAN-002, F-PLAN-003, F-PLAN-004, F-PLAN-005, F-PLAN-006, F-WELL-003, F-WELL-007, F-GAME-001, F-GAME-002, F-GAME-004, F-GAME-008, F-RPT-001, F-RPT-003, F-RPT-004, F-RPT-005 | F-JRNL-005, F-JRNL-006, F-PLAN-007, F-GAME-005, F-GAME-006 |  |
| P5 | F-ISL-001, F-ISL-002, F-ISL-003, F-ISL-013, F-ISL-017, F-ISL-018, F-ADMIN-005 | F-ISL-004, F-ISL-005, F-ISL-006, F-ISL-007, F-ISL-008, F-ISL-009, F-ISL-010, F-ISL-011, F-ISL-012, F-ISL-014, F-ISL-016 | F-ISL-015 |  |
| P2/P6 | F-NOTIF-005 |  |  |  |
| P6 | F-I18N-006, F-NOTIF-001, F-NOTIF-002, F-NOTIF-009, F-INTG-002 | F-NOTIF-003, F-NOTIF-004, F-NOTIF-006, F-NOTIF-008, F-NOTIF-010, F-ADMIN-007, F-ADMIN-014 |  |  |
| P7 | F-COMM-012, F-COMM-013, F-COMM-014, F-ADMIN-008 | F-COMM-001, F-COMM-002, F-COMM-003, F-COMM-007, F-COMM-009, F-COMM-010, F-ADMIN-006 | F-NOTIF-007, F-COMM-004, F-COMM-005, F-COMM-006, F-COMM-008, F-COMM-011, F-WELL-001, F-WELL-002, F-WELL-004, F-WELL-005, F-WELL-006, F-GAME-007, F-INTG-006 |  |
| P8 | F-AI-001, F-AI-002, F-AI-003, F-AI-013 | F-AI-004, F-AI-006, F-AI-007, F-AI-009, F-AI-012 | F-JRNL-010, F-AI-005, F-AI-008, F-AI-010, F-AI-011 |  |
| P9 | F-PWA-005, F-PWA-006, F-WIDGET-001, F-WIDGET-002, F-WIDGET-006, F-WIDGET-007, F-WIDGET-008, F-WIDGET-009 | F-PWA-004, F-PWA-009, F-WIDGET-003, F-WIDGET-004, F-WIDGET-005 |  |  |
| P10 |  | F-RPT-002, F-RPT-006, F-RPT-008, F-ADMIN-012, F-ADMIN-015 | F-AUTH-011, F-PLAN-008, F-RPT-007, F-INTG-003, F-INTG-005, F-ADMIN-010, F-ADMIN-013 |  |
| Future |  |  |  | F-INTG-004, F-ADMIN-017 |

## 4. Value × effort (Must and Should)
Value and effort are relative judgements: **H**igh, **M**edium, **L**ow. Effort covers the backend, frontend, tests, and BN content. The quadrant decides the order of work *inside* a phase: quick wins first, then strategic bets.

| Quadrant | Features |
|---|---|
| **Quick wins** (high value, low/medium effort) | F-DEED-004, F-DEED-012, F-DEED-013, F-CAL-006, F-CAL-007, F-CAL-008, F-ISL-007, F-ISL-013, F-WELL-007, F-GAME-008, F-JRNL-004, F-PLAN-002, F-PLAN-003, F-I18N-002, F-NOTIF-002 |
| **Strategic bets** (high value, high effort) | F-AUTH-007, F-RBAC-002, F-I18N-001, F-DEED-005, F-CAL-010, F-ISL-002, F-ISL-003, F-PWA-005, F-PWA-006, F-WIDGET-003, F-WIDGET-006, F-COMM-012, F-AI-001, F-AI-013, F-JRNL-007 |
| **Fill-ins** (medium value, low effort) | F-DEED-006, F-DEED-008, F-CAL-004, F-CAL-005, F-GROW-008, F-ISL-016, F-NOTIF-008, F-RPT-006, F-ADMIN-016 |
| **Reconsider / flag-gate** (lower value, high effort) | F-AI-005, F-AI-010, F-AI-011, F-COMM-006, F-ADMIN-010, F-INTG-003, F-INTG-005, F-RPT-007 |

## 5. Risk-weighted items (start early inside their phase)
| Feature | Risk | Why early |
|---|---|---|
| F-CAL-010 | Wrong day boundaries corrupt streaks | Every later aggregate depends on it |
| F-DEED-005 | Recurrence edge cases (DST, month ends) | Shared engine with PLAN |
| F-ISL-002 | Prayer-time accuracy | Reviewer validation needed |
| F-PWA-006 | Sync conflicts and data loss | Defines the shape of the sync protocol |
| F-JRNL-007 | Encryption key management | Hard to retrofit |
| F-COMM-012/013 | Safety | Blocks any public UGC |
| F-AI-003 | Cost overrun | Must ship before any AI endpoint |

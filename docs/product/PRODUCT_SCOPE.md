# Product Scope

Canonical feature IDs: [FEATURE_ID_REGISTRY.md](FEATURE_ID_REGISTRY.md). Full feature definitions: [FEATURE_CATALOG.md](FEATURE_CATALOG.md).

## 1. In scope — initial release (v1.0)
v1.0 includes every **Must** and **Should** feature, plus any **Could** features that fit their phase without delaying it. The 19 modules are:

| Module | In v1.0 | Highlights |
|---|---|---|
| AUTH | All except F-AUTH-011 (Could, P10) | Email/password, Google OAuth, verification, reset, sessions, deletion |
| RBAC | All | Guest/User/Admin/Super Admin, permissions, audit, admin TOTP |
| I18N | All | EN/BN everywhere, Bengali digits option, fallback |
| DEED | All (F-DEED-010 attachments Could) | Library, custom, recurring, checklist, discovery |
| CAL | All | Day/week/month/year, heatmap, streaks, tz-aware |
| GROW | All | Goals, milestones, insights, life balance |
| JRNL | All except F-JRNL-010 (P8, Could) | Private, encrypted journal types |
| PLAN | F-PLAN-001…006 | Daily planner; weekly planning and calendar sync are Could |
| ISL | All | Salah, Quran, dhikr, fasting, Ramadan, Hijri, zakat, hadith |
| NOTIF | All | In-app, email, web push, quiet hours |
| COMM | Must/Should | Families, campaigns, stories, moderation, privacy |
| WELL | F-WELL-003, F-WELL-007 (+ Could items if capacity allows) | Self-reported only |
| GAME | Must/Should | Badges, milestones, Good Deeds Tree, positive messaging |
| AI | Must/Should (Could items behind flags) | Claude via gateway; optional |
| PWA | All | Installable, offline, sync, in-app browser fallback |
| WIDGET | All | Small, medium, large, and Islamic widgets |
| RPT | All | Reports, CSV/PDF export, consented analytics |
| INTG | 001, 002 (Must); 003, 005, 006 (Could) | Email, push, calendar, public API, QR |
| ADMIN | All except 017 | Users, content, moderation, flags, health |

## 2. Out of scope (initial release)
| Item | Reason | Revisit |
|---|---|---|
| Native mobile app (iOS/Android) for the main product | Directive: the web is primary | Never for the main product |
| iOS home-screen widget | iOS needs a native app; the directive covers Android only | Future (FUTURE_ENHANCEMENTS) |
| Wearable integrations (F-INTG-004) | Need native Health Connect/HealthKit and consent flows | Future |
| Subscription / payments (F-ADMIN-017) | No monetisation in v1 | Future |
| Automated device screen-time tracking | Browsers cannot access it | Not planned without a real integration |
| Real-time chat between users | High moderation burden; not requested | Future evaluation |
| Donations / payment processing for campaigns | Regulatory and payment-security scope | Future |
| Languages beyond EN/BN | Not requested; the i18n infrastructure supports them | Future |
| AI religious rulings | Guardrail | Never |

## 3. Scope boundaries and assumptions
- **Minimum age:** 13+, with parental consent where local law requires it. Accounts for under-13s are out of scope. A family group can include teens; child accounts without an email are a future enhancement.
- **Time zones:** each user has one IANA time zone. Changing it affects future days only; past `local_date`s never change.
- **Offline:** offline support covers checklist completion, tasbih, salah logging, Quran logs, and planner items. Journals (privacy: never stored on the device in v1), admin, community posting, and AI require a connection.
- **Islamic module:** enabled by default only when the user opts in during onboarding, and it can be turned off at any time (F-ISL-017).
- **AI:** off until the user grants consent (F-AI-002). The platform can disable it globally with a feature flag.
- **Content:** the system deed library and Islamic content are managed by admins with an editorial verification workflow. External API content (Quran) is cached and attributed.
- **Hosting region:** to be decided (open decision). Data residency is not a hard requirement for v1.

## 4. Release slicing
| Release | Phases | Contents |
|---|---|---|
| Alpha (internal) | P2–P3 | Auth, RBAC, i18n, deeds, calendar, streaks, PWA shell |
| Beta (closed) | P4–P6 | Growth, journal, planner, gamification, Islamic, notifications |
| v1.0 (public) | P7–P10 | Community + moderation, AI, offline sync, widget, reports, integrations, hardening |

See [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).

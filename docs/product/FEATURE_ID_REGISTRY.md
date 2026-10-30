# Feature ID Registry (Canonical)

> **This file is the single source of truth for feature IDs.** Every other document (SRS, stories, tasks, tests, traceability) MUST reference these IDs. New features get the next free number in their module; IDs are never reused or renumbered.
>
> Priority uses MoSCoW: **M** = Must, **S** = Should, **C** = Could, **W** = Won't (initial release). Phase refers to `docs/implementation/IMPLEMENTATION_MASTER_PLAN.md`.

## Module codes

| Code | Module (directive section) | Primary phase |
|---|---|---|
| AUTH | A. Authentication & Identity | P2 |
| RBAC | B. Roles & Permissions | P2 |
| I18N | C. Bilingual Localization | P2 (cross-cutting) |
| DEED | D. Good Deeds Management | P3 |
| CAL | E. Calendar & Habit Tracking | P3 |
| GROW | F. Personal Growth | P4 |
| JRNL | G. Journal & Reflection | P4 |
| PLAN | H. Daily Planning | P4 |
| ISL | I. Islamic Lifestyle | P5 |
| NOTIF | N. Notifications | P6 |
| COMM | J. Family & Community | P7 |
| WELL | M. Digital Wellbeing | P4 / P7 |
| GAME | L. Gamification | P4 |
| AI | K. AI-Powered Intelligence | P8 |
| PWA | P. PWA & Mobile Web | P2 / P9 |
| WIDGET | O. Android Home-Screen Widget | P9 |
| RPT | Q. Analytics & Reporting | P4 / P10 |
| INTG | R. Integrations | various |
| ADMIN | S. Admin & Platform Management | P2 → P10 |

## A. AUTH — Authentication & Identity
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-AUTH-001 | User registration (email + password) | M | P2 |
| F-AUTH-002 | Email/password login | M | P2 |
| F-AUTH-003 | Google OAuth login (redirect flow) | S | P2 |
| F-AUTH-004 | Email verification | M | P2 |
| F-AUTH-005 | Forgot password & password reset | M | P2 |
| F-AUTH-006 | Secure logout (single device / all devices) | M | P2 |
| F-AUTH-007 | Session management & multi-device access | M | P2 |
| F-AUTH-008 | Profile management | M | P2 |
| F-AUTH-009 | Account deletion (grace period + data export offer) | M | P2 |
| F-AUTH-010 | User preferences (language, timezone, theme, week start, numerals) | M | P2 |
| F-AUTH-011 | Optional account recovery (recovery codes / secondary email) | C | P10 |

## B. RBAC — Roles & Permissions
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-RBAC-001 | Role model: Guest, User, Admin, Super Admin | M | P2 |
| F-RBAC-002 | Permission-based authorization enforced in backend | M | P2 |
| F-RBAC-003 | Role assignment / revocation | M | P2 |
| F-RBAC-004 | Administrative account management | M | P2 |
| F-RBAC-005 | Audit logging of privileged and security events | M | P2 |
| F-RBAC-006 | Secure admin routes with step-up re-authentication | M | P2 |
| F-RBAC-007 | TOTP two-factor authentication for Admin/Super Admin | S | P2 |

## C. I18N — Bilingual Localization
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-I18N-001 | EN/BN localization infrastructure (message catalogs, no hardcoded strings) | M | P2 |
| F-I18N-002 | Language switcher | M | P2 |
| F-I18N-003 | Persistent language preference (account + device) | M | P2 |
| F-I18N-004 | Localized dates, times, numbers (Bengali digits option) and Gregorian/Hijri display | M | P2 |
| F-I18N-005 | Bengali typography (font stack, line-height, conjunct rendering) | M | P2 |
| F-I18N-006 | Localized notifications & emails | M | P6 |
| F-I18N-007 | Localized validation and error messages | M | P2 |
| F-I18N-008 | Translatable admin-managed content (per-locale translation records) | M | P3 |
| F-I18N-009 | Fallback behavior (BN → EN with missing-key reporting) | M | P2 |

## D. DEED — Good Deeds Management
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-DEED-001 | Predefined good deed library | M | P3 |
| F-DEED-002 | Deed categories | M | P3 |
| F-DEED-003 | Custom (user-created) deeds | M | P3 |
| F-DEED-004 | Daily checklist | M | P3 |
| F-DEED-005 | Recurring deeds (daily / weekdays / weekly / monthly / custom RRULE subset) | M | P3 |
| F-DEED-006 | Favorite deeds | S | P3 |
| F-DEED-007 | Activity history | M | P3 |
| F-DEED-008 | Notes on completions | S | P3 |
| F-DEED-009 | Completion status (done / partial / skipped) | M | P3 |
| F-DEED-010 | Optional evidence attachments (images) | C | P3 |
| F-DEED-011 | Good deed discovery (browse, search, filter) | S | P3 |
| F-DEED-012 | Random good deed generator | S | P3 |
| F-DEED-013 | Five-minute good deeds collection | S | P3 |
| F-DEED-014 | Category-based (rule-based) recommendations | S | P3 |

## E. CAL — Calendar & Habit Tracking
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-CAL-001 | Daily calendar view | M | P3 |
| F-CAL-002 | Weekly calendar view | M | P3 |
| F-CAL-003 | Monthly calendar view | M | P3 |
| F-CAL-004 | Yearly history | S | P3 |
| F-CAL-005 | Activity heatmap | S | P3 |
| F-CAL-006 | Daily completion rate | M | P3 |
| F-CAL-007 | Streak tracking (per deed and overall) | M | P3 |
| F-CAL-008 | Longest streak | M | P3 |
| F-CAL-009 | Streak milestones (feeds GAME) | S | P4 |
| F-CAL-010 | Timezone-aware daily boundaries | M | P3 |
| F-CAL-011 | Past-day editing within a configurable window (default 7 days) | S | P3 |

## F. GROW — Personal Growth
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-GROW-001 | Personal goals | M | P4 |
| F-GROW-002 | Weekly and monthly goals | S | P4 |
| F-GROW-003 | Goal milestones | S | P4 |
| F-GROW-004 | Personal growth timeline | S | P4 |
| F-GROW-005 | Consistency analysis | S | P4 |
| F-GROW-006 | Weak habit identification (neutral framing) | S | P4 |
| F-GROW-007 | Rule-based growth insights | S | P4 |
| F-GROW-008 | Monthly reflection | S | P4 |
| F-GROW-009 | Life balance tracker (8 categories) | S | P4 |

## G. JRNL — Journal & Reflection
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-JRNL-001 | Daily journal | M | P4 |
| F-JRNL-002 | Morning intention | S | P4 |
| F-JRNL-003 | Evening reflection | S | P4 |
| F-JRNL-004 | Gratitude journal | S | P4 |
| F-JRNL-005 | Future-self letters (scheduled delivery) | C | P4 |
| F-JRNL-006 | Personal learning notes | C | P4 |
| F-JRNL-007 | Private journal history (private by default, encrypted at application level) | M | P4 |
| F-JRNL-008 | Journal search & filtering | S | P4 |
| F-JRNL-009 | Journal export (Markdown/JSON) | S | P4 |
| F-JRNL-010 | Optional AI-assisted summaries (opt-in) | C | P8 |

## H. PLAN — Daily Planning
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-PLAN-001 | Daily planner | S | P4 |
| F-PLAN-002 | Morning planning flow | S | P4 |
| F-PLAN-003 | Evening review flow | S | P4 |
| F-PLAN-004 | Task prioritization | S | P4 |
| F-PLAN-005 | Time-based activities (time blocks) | S | P4 |
| F-PLAN-006 | Recurring planner activities (reuses DEED recurrence engine) | S | P4 |
| F-PLAN-007 | Weekly planning | C | P4 |
| F-PLAN-008 | External calendar integration (see F-INTG-003) | C | P10 |

## I. ISL — Islamic Lifestyle
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-ISL-001 | Salah tracker (5 fard + optional sunnah/witr, on-time/qada/jamaah flags) | M | P5 |
| F-ISL-002 | Prayer times (location, calculation method, madhab for Asr) | M | P5 |
| F-ISL-003 | Quran reading tracker (surah/ayah/page/juz) | M | P5 |
| F-ISL-004 | Quran memorization tracker | S | P5 |
| F-ISL-005 | Khatam planner | S | P5 |
| F-ISL-006 | Daily dhikr | S | P5 |
| F-ISL-007 | Tasbih counter (works offline) | S | P5 |
| F-ISL-008 | Dua collection (sourced, EN/BN) | S | P5 |
| F-ISL-009 | Sunnah tracker | S | P5 |
| F-ISL-010 | Tahajjud tracker | S | P5 |
| F-ISL-011 | Fasting tracker (Ramadan, Monday/Thursday, Ayyam al-Bid, qada) | S | P5 |
| F-ISL-012 | Ramadan planner | S | P5 |
| F-ISL-013 | Hijri calendar (with user day offset) | M | P5 |
| F-ISL-014 | Zakat calculator (informational, configurable nisab basis) | S | P5 |
| F-ISL-015 | Islamic learning hub | C | P5 |
| F-ISL-016 | Hadith of the Day (sourced, graded where available) | S | P5 |
| F-ISL-017 | Religious preferences & module opt-out | M | P5 |
| F-ISL-018 | Content source verification & references | M | P5 |

## N. NOTIF — Notifications
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-NOTIF-001 | In-app notifications center | M | P6 |
| F-NOTIF-002 | Daily reminders | M | P6 |
| F-NOTIF-003 | Custom reminder schedules | S | P6 |
| F-NOTIF-004 | Incomplete task reminders (gentle, non-shaming) | S | P6 |
| F-NOTIF-005 | Email notifications (transactional in P2; digests in P6) | M | P2/P6 |
| F-NOTIF-006 | Web Push notifications | S | P6 |
| F-NOTIF-007 | Challenge notifications | C | P7 |
| F-NOTIF-008 | Quiet hours | S | P6 |
| F-NOTIF-009 | Notification preferences (per channel / per type) | M | P6 |
| F-NOTIF-010 | Prayer time reminders | S | P6 |

## J. COMM — Family & Community
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-COMM-001 | Family groups | S | P7 |
| F-COMM-002 | Member invitations (link/code, expiring) | S | P7 |
| F-COMM-003 | Family challenges | S | P7 |
| F-COMM-004 | Shared family calendar | C | P7 |
| F-COMM-005 | Family achievements | C | P7 |
| F-COMM-006 | Community groups | C | P7 |
| F-COMM-007 | Community campaigns | S | P7 |
| F-COMM-008 | Volunteer opportunities | C | P7 |
| F-COMM-009 | Kindness stories (posts) | S | P7 |
| F-COMM-010 | Anonymous sharing | S | P7 |
| F-COMM-011 | Community recognition (appreciations, not rankings) | C | P7 |
| F-COMM-012 | Moderation queue & actions | M (gate for any public UGC) | P7 |
| F-COMM-013 | Reporting & blocking | M (gate for any public UGC) | P7 |
| F-COMM-014 | Privacy controls (default private, explicit per-item sharing) | M | P7 |

## M. WELL — Digital Wellbeing
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-WELL-001 | Screen-time awareness journal (manual entry) | C | P7 |
| F-WELL-002 | Social media usage goals (self-reported) | C | P7 |
| F-WELL-003 | Avoid-bad-habits tracker | S | P4 |
| F-WELL-004 | Procrastination tracker | C | P7 |
| F-WELL-005 | Anger management reflection | C | P7 |
| F-WELL-006 | Digital detox challenges | C | P7 |
| F-WELL-007 | Positive affirmations | S | P4 |

## L. GAME — Gamification
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-GAME-001 | Achievement badges | S | P4 |
| F-GAME-002 | Milestones | S | P4 |
| F-GAME-003 | Personal streak display | M | P4 |
| F-GAME-004 | Virtual Good Deeds Tree | S | P4 |
| F-GAME-005 | Random challenges | C | P4 |
| F-GAME-006 | Surprise good deeds | C | P4 |
| F-GAME-007 | Community appreciation | C | P7 |
| F-GAME-008 | Positive recognition messaging (no shame, no worship ranking) | S | P4 |

## K. AI — AI-Powered Intelligence
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-AI-001 | AI gateway & provider abstraction (Anthropic Claude default) | M (for any AI) | P8 |
| F-AI-002 | AI consent, privacy controls & global disable | M | P8 |
| F-AI-003 | Usage limits, quotas & cost monitoring | M | P8 |
| F-AI-004 | AI good deed suggestions | S | P8 |
| F-AI-005 | AI habit coach (conversational) | C | P8 |
| F-AI-006 | AI daily reflection prompts | S | P8 |
| F-AI-007 | AI weekly report narrative | S | P8 |
| F-AI-008 | AI task generation from natural language | C | P8 |
| F-AI-009 | AI growth insights | S | P8 |
| F-AI-010 | AI personal assistant | C | P8 |
| F-AI-011 | AI voice journal (speech-to-text) | C | P8 |
| F-AI-012 | AI motivational messages | S | P8 |
| F-AI-013 | Safety filters & religious guardrails | M | P8 |

## P. PWA — PWA & Mobile Web
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-PWA-001 | Web app manifest & installability | M | P2 |
| F-PWA-002 | Responsive navigation (bottom bar mobile / sidebar desktop) | M | P2 |
| F-PWA-003 | Cached application shell | M | P2 |
| F-PWA-004 | Offline read access to recent data | S | P9 |
| F-PWA-005 | Offline task completion with outbox queue | M | P9 |
| F-PWA-006 | Synchronization & conflict handling | M | P9 |
| F-PWA-007 | In-app browser detection & "open in browser" fallback | M | P2 |
| F-PWA-008 | Feature detection & graceful degradation | M | P2 |
| F-PWA-009 | App update flow (new version prompt) | S | P9 |

## O. WIDGET — Android Home-Screen Widget
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-WIDGET-001 | Minimal host companion app (device linking & settings only) | M | P9 |
| F-WIDGET-002 | Small progress widget | M | P9 |
| F-WIDGET-003 | Medium interactive daily checklist widget | S | P9 |
| F-WIDGET-004 | Large detailed widget | S | P9 |
| F-WIDGET-005 | Islamic tracker widget | S | P9 |
| F-WIDGET-006 | Sync, offline queue & retry | M | P9 |
| F-WIDGET-007 | Stale-data indicator | M | P9 |
| F-WIDGET-008 | EN/BN widget localization | M | P9 |
| F-WIDGET-009 | Deep links into the web app | M | P9 |

## Q. RPT — Analytics & Reporting
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-RPT-001 | Daily & weekly personal summaries | S | P4 |
| F-RPT-002 | Monthly & yearly reports | S | P10 |
| F-RPT-003 | Category trends | S | P4 |
| F-RPT-004 | Habit consistency report | S | P4 |
| F-RPT-005 | Goal completion report | S | P4 |
| F-RPT-006 | CSV export | S | P10 |
| F-RPT-007 | PDF export | C | P10 |
| F-RPT-008 | Privacy-conscious product analytics (aggregate, consented) | S | P10 |

## R. INTG — Integrations
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-INTG-001 | Email provider adapter (Resend / SMTP) | M | P2 |
| F-INTG-002 | Web Push service (VAPID) | M | P6 |
| F-INTG-003 | Google Calendar export/sync | C | P10 |
| F-INTG-004 | Wearable integrations (Health Connect etc.) | W | Future |
| F-INTG-005 | Public API (scoped tokens) | C | P10 |
| F-INTG-006 | QR-based campaign participation | C | P7 |

## S. ADMIN — Admin & Platform Management
| ID | Feature | Pri | Phase |
|---|---|---|---|
| F-ADMIN-001 | User management | M | P2 |
| F-ADMIN-002 | Role & permission management | M | P2 |
| F-ADMIN-003 | Deed & category content management | M | P3 |
| F-ADMIN-004 | Translation management for content | S | P3 |
| F-ADMIN-005 | Islamic content management (with source verification workflow) | M | P5 |
| F-ADMIN-006 | Campaign management | S | P7 |
| F-ADMIN-007 | Notification scheduling / broadcasts | S | P6 |
| F-ADMIN-008 | Community moderation console | M | P7 |
| F-ADMIN-009 | Feature flags | M | P2 |
| F-ADMIN-010 | A/B testing | C | P10 |
| F-ADMIN-011 | Content versioning | S | P3 |
| F-ADMIN-012 | System health dashboard | S | P10 |
| F-ADMIN-013 | API analytics | C | P10 |
| F-ADMIN-014 | Background job monitoring | S | P6 |
| F-ADMIN-015 | Backup monitoring | S | P10 |
| F-ADMIN-016 | Audit log viewer | M | P2 |
| F-ADMIN-017 | Subscription management | W | Future |

**Totals:** 19 modules, 198 features (Must 81 · Should 83 · Could 32 · Won't 2).

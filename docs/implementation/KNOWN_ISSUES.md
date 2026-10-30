# Known Issues & Open Items

No application code exists yet, so there are no software defects. The list below tracks known **blockers, open decisions, and platform limits**.

| ID | Type | Description | Impact | Owner | Status |
|---|---|---|---|---|---|
| KI-001 | Blocker (P2) | Neon project `daily-good-deeds` (Singapore, PostgreSQL 18) created 2026-10-31 with branches main/staging/dev; dev strings in `apps/api/.env` (git-ignored) | — | — | Resolved |
| KI-002 | Blocker (P2) | Git remote + CI: GitHub Actions green (2026-10-31); Neon key/project set as Actions secret/variable. Hosting secrets come with T-P2-PLAT-010 | — | — | Resolved |
| KI-003 | Blocker (P2) | Domain, email provider account, and Google OAuth client not provisioned | Email verification and Google login stay unconfigured (adapters still built; staging uses a log-only email transport) | User | Open |
| KI-004 | Blocker (P5) | Quran translation (EN/BN) and Hadith collection licensing not confirmed | Islamic content publishing | User / content | Open |
| KI-005 | Risk | No native Bengali reviewer or Islamic content reviewer identified | Translation and religious-content quality | User | Open |
| KI-006 | Env (P9) | `ANDROID_HOME` not set; Android SDK components not verified | Widget build | Dev | Open |
| KI-007 | Platform limit | Facebook/Messenger/Telegram webviews: no PWA install, no push, Google OAuth blocked | Reduced capability in in-app browsers. Fallback specified (F-PWA-007). | — | Accepted |
| KI-008 | Platform limit | iOS Web Push only for Home-Screen installed PWAs (iOS 16.4+); no Background Sync outside Chromium | Reminders on iOS rely on install or email | — | Accepted |
| KI-009 | Open decision | Final hosting vendors (proposed: Vercel + Render/Fly + Neon) | Deployment config | User | Open |

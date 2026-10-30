# Project Gaps

The repository is empty, so every capability is a gap. This file lists the gaps **besides code** that block or put delivery at risk, and the open decisions behind them. Each one is tracked in [implementation/KNOWN_ISSUES.md](implementation/KNOWN_ISSUES.md) or [implementation/DECISION_LOG.md](implementation/DECISION_LOG.md) once it is resolved.

## 1. Credentials and accounts (user action required)
| Gap | Blocks | Needed by |
|---|---|---|
| Neon Postgres project (dev, staging, prod branches) | All persistence | P2 start |
| Git remote (GitHub) and CI secrets | CI, preview deploys | P2 |
| Hosting accounts (web, api/worker) | Staging environment | P2 end |
| Domain name and DNS | Email sending domain, PWA origin, Android App Links | P2 |
| Resend account and verified domain | Email verification, password reset | P2 |
| Google OAuth client ID/secret | F-AUTH-003 | P2 |
| R2/S3 bucket | F-DEED-010, exports | P3 |
| Anthropic API key and monthly budget cap | P8 | P8 |
| Google Play Console | Widget distribution | P9 |

## 2. Content and domain-expertise gaps
| Gap | Risk | Mitigation |
|---|---|---|
| A **verified Bengali translator/reviewer** | Machine-quality BN copy would hurt trust | Native reviewer sign-off per release; a missing-key CI check |
| An **Islamic content reviewer** (scholar or qualified editor) | Wrong or unsourced religious content | Admin verification workflow (F-ADMIN-005, F-ISL-018). Content is not published until it is verified. |
| Initial deed library (≈150 deeds × 8 categories, EN/BN) | An empty library at launch | Content seed task in P3, reviewed by the product owner |
| Licensing terms for Quran translations (especially BN) and Hadith collections | Legal | Confirm the Quran.com API terms and translation licenses before P5 |

## 3. Technical capability limits (documented, not hidden)
| Requested capability | Limitation | Alternative |
|---|---|---|
| PWA install, push, and OAuth inside Facebook/Messenger/Telegram in-app browsers | Webviews block install prompts and push, and Google blocks OAuth in embedded webviews | Detect the in-app browser, show an "Open in browser" prompt, use email login inside webviews, and use redirect-based OAuth elsewhere (F-PWA-007) |
| Web Push on iOS | Works only for PWAs added to the Home Screen, on iOS 16.4+ | In-app notifications plus email; installation guidance |
| Background Sync API | Chromium only | Flush the outbox on app focus, on the `online` event, and at startup |
| Screen-time / device-usage monitoring | Browsers cannot read device usage | Self-reported journals (F-WELL-001/002); no implication of monitoring |
| Wearables | Need native Health Connect / HealthKit | Won't Have in the initial release (F-INTG-004) |
| Android widget from a PWA | The web platform has no widget API that Android supports for PWAs | Separate Kotlin widget host app (D-8) |
| Exact prayer times | Depend on location, method, and madhab; local mosque times differ | User-selectable method, manual minute adjustments, and a disclaimer |
| Hijri date | Moon-sighting differs by country | User offset of −2 to +2 days |

## 4. Open product decisions (non-blocking for P2)
See the "Unresolved questions" section of [EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md).

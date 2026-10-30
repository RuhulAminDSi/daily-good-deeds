# Security Test Plan

> **Status:** Planning draft. Nothing has been executed. Scenarios below are checklist items (`SEC-nnn`) executed inside the listed test cases (TC IDs from [TEST_PLAN.md](TEST_PLAN.md)); they are not separate test-case IDs.
>
> Requirements: NFR-SECURITY-001…028, NFR-PRIVACY-001…012 in [../specifications/SRS.md](../specifications/SRS.md). Auth details: [../api/AUTHENTICATION.md](../api/AUTHENTICATION.md). Error codes: [../api/ERROR_HANDLING.md](../api/ERROR_HANDLING.md).

## 1. Scope & approach

| Layer | Approach |
|---|---|
| Design | Threat model per module (STRIDE) reviewed at each phase start; data-flow diagrams from the architecture docs |
| Code | CodeQL + Semgrep custom rules on every PR; mandatory review for auth/RBAC/sync/upload/AI code |
| Automated tests | Authz matrix, IDOR suite, session tests, injection corpora (Jest + Supertest, Playwright) on every PR |
| Dynamic | OWASP ZAP baseline per staging deploy; authenticated active scan before each release |
| Supply chain | OSV-Scanner / `pnpm audit`, Dependabot, Gradle dependency verification, lockfile review, gitleaks |
| Manual | OWASP ASVS L2 checklist (V2, V3, V4, V5, V8, V12, V13) per release; **penetration test before public launch** (NFR-SECURITY-026) |

## 2. OWASP Top 10 (2021) mapping

| OWASP | Risk in this product | Concrete tests | TC |
|---|---|---|---|
| A01 Broken Access Control | IDOR on journals, completions, worship records; group data leaks; admin route exposure | SEC-001…SEC-012 (§4, §5) | TC-RBAC-002-01, TC-RBAC-002-02, TC-JRNL-007-02, TC-COMM-014-01, TC-QA-002-01 |
| A02 Cryptographic Failures | Journal plaintext at rest; weak token storage | SEC-040: DB row for a journal entry contains only ciphertext + nonce + `key_version`; SEC-041: key rotation re-encrypts without downtime; SEC-042: refresh/verification/reset/invite/device tokens stored only as SHA-256 hashes; SEC-043: TLS 1.2+ and HSTS headers present | TC-JRNL-007-01, TC-AUTH-002-02, TC-PLAT-008-01 |
| A03 Injection | SQLi via filters/sort; XSS via posts, journal, translations | SEC-050…SEC-062 (§7, §8) | TC-COMM-009-01, TC-I18N-008-01, TC-PLAT-008-01 |
| A04 Insecure Design | Sync replay abuse, invitation guessing, streak manipulation | SEC-070: replayed sync op with same idempotency key applied once; SEC-071: `local_date` outside ±1 day rejected with `LOCAL_DATE_OUT_OF_RANGE`; SEC-072: invitation codes have ≥ 128-bit entropy, expire, single-use where specified; SEC-073: past-day edits beyond 7-day window rejected | TC-PWA-006-01, TC-COMM-002-01 |
| A05 Security Misconfiguration | Missing headers, verbose errors, permissive CORS | SEC-080: CSP with nonces, `frame-ancestors 'none'`, `X-Content-Type-Options`; SEC-081: production errors contain no stack/SQL (NFR-SECURITY-028); SEC-082: CORS rejects unknown origins with credentials; SEC-083: ZAP baseline 0 High/Medium | TC-PLAT-008-01, TC-PLAT-002-01 |
| A06 Vulnerable Components | npm/Gradle dependencies | SEC-090: CI fails on High/Critical with known fix; SEC-091: weekly full scan report reviewed | TC-PLAT-007-01 |
| A07 Identification & Auth Failures | Credential stuffing, session fixation, session-cookie theft | SEC-020…SEC-033 (§6) | TC-AUTH-002-01…03, TC-AUTH-007-01, TC-RBAC-007-01 |
| A08 Software & Data Integrity | Unsigned updates, CI tampering, SW poisoning | SEC-100: GitHub Actions pinned by SHA, least-privilege `GITHUB_TOKEN`; SEC-101: service worker served same-origin with no third-party script imports; SEC-102: Android release signed, Play App Signing | TC-PLAT-007-01, TC-PWA-008-01 |
| A09 Logging & Monitoring Failures | Missed attacks; PII in logs | SEC-110: security events (login failure burst, session revocation, role change, step-up, MFA change, export, deletion) produce audit entries; SEC-111: privacy-leakage suite (§10) | TC-RBAC-005-01, TC-ADMIN-016-01 |
| A10 SSRF | Server fetches (Quran.com, avatars by URL, link previews) | SEC-120: outbound HTTP only through allow-listed client (Quran.com, provider APIs); user-supplied URLs never fetched server-side; redirects to private IP ranges blocked | TC-ISL-018-01 |

## 3. OWASP API Security Top 10 (2023) mapping

| API risk | Tests | TC |
|---|---|---|
| API1 Broken Object Level Authorization | IDOR suite (§4) generated from OpenAPI for every path with an `{id}` | TC-QA-002-01, TC-JRNL-007-02 |
| API2 Broken Authentication | §6 session/MFA tests; widget device token scope tests | TC-AUTH-002-03, TC-WIDGET-001-01 |
| API3 Broken Object Property Level Authorization | SEC-130: mass assignment — sending `role`, `user_id`, `owner_user_id`, `verified`, `is_system` in bodies is rejected (Zod strict, `VALIDATION_FAILED`); SEC-131: responses never include `password_hash`, token hashes, other members' emails | TC-RBAC-002-02, TC-COMM-001-01 |
| API4 Unrestricted Resource Consumption | SEC-140: rate limits per IP/user/endpoint (§9); SEC-141: pagination max page size enforced; SEC-142: body size / JSON depth limits → 413 `PAYLOAD_TOO_LARGE`; SEC-143: report range limit `REPORT_RANGE_TOO_LARGE`; SEC-144: AI quotas `AI_QUOTA_EXCEEDED`, budget `AI_BUDGET_EXHAUSTED`; SEC-145: sync batch limit `SYNC_BATCH_TOO_LARGE` | TC-PLAT-008-01, TC-AI-003-01, TC-PWA-006-01 |
| API5 Broken Function Level Authorization | Permission matrix: every `/admin/*` route × role; step-up required (`STEP_UP_REQUIRED`) for sensitive admin actions; `LAST_SUPER_ADMIN` and `SELF_ROLE_CHANGE_FORBIDDEN` enforced | TC-RBAC-006-01, TC-RBAC-006-02, TC-RBAC-003-01 |
| API6 Unrestricted Access to Sensitive Business Flows | SEC-150: registration/reset/invitation flows rate-limited + Turnstile on threshold; SEC-151: reactions/appreciations cannot be scripted beyond limits; SEC-152: QR campaign join cannot be replayed for counts | TC-AUTH-001-01, TC-COMM-011-01 |
| API7 SSRF | See A10 | TC-ISL-018-01 |
| API8 Security Misconfiguration | See A05; OpenAPI does not expose internal/admin schemas publicly | TC-PLAT-002-01 |
| API9 Improper Inventory Management | SEC-160: OpenAPI drift check; no undocumented routes (startup route inventory compared with spec); deprecated versions have sunset headers | TC-PLAT-006-01 |
| API10 Unsafe Consumption of APIs | SEC-170: Quran.com / AI provider responses validated by schema and treated as untrusted (rendered as text; AI output sanitised); timeouts and circuit breakers | TC-ISL-018-01, TC-AI-013-01 |

## 4. Authorization matrix & IDOR tests

**Generated IDOR suite (SEC-001).** For every OpenAPI operation that addresses a per-user resource (`/completions/{id}`, `/plans/{id}`, `/deeds/{id}` (custom), `/goals/{id}`, `/goals/{id}/milestones/{id}`, `/journal/{id}`, `/planner/{id}`, `/islamic/salah/{id}`, `/islamic/quran/*/{id}`, `/islamic/fasting/{id}`, `/islamic/zakat/{id}`, `/islamic/ramadan-plans/{id}`, `/wellbeing/*/{id}`, `/notifications/{id}`, `/reminders/{id}`, `/push-subscriptions/{id}`, `/ai/conversations/{id}`, `/exports/{id}`, `/me/sessions/{id}`), user B calls GET/PATCH/DELETE on user A's resource:

| Expectation | Code |
|---|---|
| Response is **404 `RESOURCE_NOT_FOUND`** (never 403, to avoid confirming existence) | SEC-001 |
| Response time indistinguishable from a truly missing ID (± 50 ms) | SEC-002 |
| List endpoints with forged `userId` query/body params ignore them and return only caller's rows | SEC-003 |
| A new endpoint without an IDOR test fails the suite (coverage check against OpenAPI) | SEC-004 |

**Role escalation (SEC-005…SEC-009).**

| Scenario | Expected |
|---|---|
| User calls any `/admin/*` route | 403 `PERMISSION_DENIED`, audited |
| Admin attempts to grant Super Admin or modify a Super Admin | 403 |
| Admin modifies own roles | 403 `SELF_ROLE_CHANGE_FORBIDDEN` |
| Removing the last Super Admin | 409 `LAST_SUPER_ADMIN` |
| Role revoked mid-session | Next request is evaluated with the new permissions within ≤ 60 s (permission cache, SRS FR-RBAC-003-02); admin routes deny immediately after the session is revoked |
| Controller without `@Permissions()`/`@Public()` | App fails to boot (NFR-SECURITY-006) |

## 5. Group data isolation (SEC-010…SEC-012)

Fixture: users A, B in family G1; C in community G2; D in no group.

| Scenario | Expected |
|---|---|
| C reads G1 members, calendar, challenges, posts | 404 |
| B (member) reads A's private completions/journal/salah via group endpoints | Not returned. Only items A explicitly shared to G1 are visible (NFR-PRIVACY-005) |
| A leaves G1 | A immediately loses access; A's previously shared items follow the documented retention rule |
| Invitation for G1 used by D after expiry / after use | `INVITATION_INVALID` |
| Group admin of G2 moderates G1 content | 404 |
| Blocked user (A blocks C) | C's posts/comments hidden from A; C cannot mention, react to, or invite A |
| Anonymous post | Author identity absent from API responses, notifications, and exports to anyone except moderators with `moderation.act` (and audited when revealed) |

## 6. Session, token & MFA tests (SEC-020…SEC-033)

| ID | Scenario | Expected |
|---|---|---|
| SEC-020 | Login with wrong password ×5 for one account | Progressive delay; generic `AUTH_INVALID_CREDENTIALS`; no enumeration via message or timing |
| SEC-021 | IP-level login throttle per SRS FR-AUTH-002-02 | Throttled `RATE_LIMITED` with `Retry-After` |
| SEC-022 | Session token entropy & storage | Session ID ≥ 256 bits from a CSPRNG; DB stores only SHA-256 hash; token never appears in logs or response bodies |
| SEC-023 | **Session fixation & rotation** | A pre-login cookie is never promoted; a new session ID is issued on login, privilege change and step-up; the old ID is rejected `401 AUTH_SESSION_EXPIRED` |
| SEC-024 | Session expiry (absolute & idle per SRS FR-AUTH-002-03/04; admin limits per FR-AUTH-002-04) | Expired or forged session ID → 401 `AUTH_SESSION_EXPIRED`; clock-controlled integration test |
| SEC-025 | Cookie flags | `__Host-dgd_session` is `HttpOnly; Secure; SameSite=Lax; Path=/`; never readable from JS |
| SEC-026 | **CSRF**: state-changing cookie-auth request with a cross-site or missing `Origin`/`Sec-Fetch-Site` | 403 `CSRF_ORIGIN_MISMATCH`; bearer-auth (widget) requests exempt (DL-012) |
| SEC-027 | Logout all devices / revoke a session in `/me/sessions` | All selected sessions rejected on the next request; widget device tokens revoked when selected |
| SEC-028 | Password reset | Token single-use, hashed, expires; all sessions revoked after reset; reused password rejected `PASSWORD_REUSED` |
| SEC-029 | Email verification token reuse/expiry | `TOKEN_INVALID` |
| SEC-030 | Google OAuth | `state` + PKCE verified (`OAUTH_STATE_INVALID`); unverified Google email rejected (`OAUTH_EMAIL_UNVERIFIED`); account linking requires password re-auth |
| SEC-031 | Admin step-up | Sensitive admin actions without fresh re-auth → `STEP_UP_REQUIRED` |
| SEC-032 | Admin TOTP | Admin without MFA → `MFA_ENROLLMENT_REQUIRED`; wrong/replayed code → `MFA_INVALID_CODE`; brute force rate-limited |
| SEC-033 | Widget device token | Scope limited to `/widget/*` and `/sync` (others → 403); revocation from web takes effect on next widget call; token stored with Keystore-backed encryption, excluded from backups (NFR-SECURITY-011) |

TCs: TC-AUTH-002-01…03, TC-AUTH-003-01, TC-AUTH-004-01, TC-AUTH-005-01, TC-AUTH-006-01, TC-AUTH-007-01, TC-AUTH-007-02, TC-RBAC-006-01, TC-RBAC-006-02, TC-RBAC-007-01, TC-WIDGET-001-01, TC-WIDGET-001-02.

## 7. XSS tests (SEC-050…SEC-056)

A shared payload corpus (OWASP XSS filter evasion list + polyglots + Bengali/Arabic mixed-script and RTL-override payloads) is submitted through each input and the rendered page is checked for script execution (Playwright `page.on('dialog')`, CSP violation reports) and for raw HTML in DOM.

| ID | Surface | Expected |
|---|---|---|
| SEC-050 | Community posts, comments, kindness stories, campaign descriptions | Rendered as text or allow-listed Markdown sanitised server-side; no execution; CSP blocks inline |
| SEC-051 | Journal entries (incl. export to Markdown/JSON) | Same; exported files do not contain active HTML when opened |
| SEC-052 | Admin-managed translations and content (deeds, duas, hadith) | Translation values treated as text; ICU arguments escaped; admin cannot inject script into user pages |
| SEC-053 | Display names, group names, custom deed titles | Escaped in UI, emails (React Email) and push payloads |
| SEC-054 | URL/link fields (volunteer opportunities, campaigns) | Only `https:` (and `mailto:` where allowed); `javascript:`/`data:` rejected |
| SEC-055 | AI output rendered in UI | Treated as untrusted; sanitised Markdown; no HTML |
| SEC-056 | SVG/image uploads | SVG not accepted; images re-encoded (see §8) |

TCs: TC-COMM-009-01, TC-JRNL-009-01, TC-I18N-008-01, TC-I18N-008-02, TC-AI-013-01.

## 8. SQL injection & input validation (SEC-060…SEC-062)

| ID | Test | Expected |
|---|---|---|
| SEC-060 | sqlmap-style payload corpus on every query/sort/filter/search param (incl. journal search, admin user search) | `VALIDATION_FAILED` / `INVALID_SORT`; no DB error leakage; Semgrep rule bans `$queryRawUnsafe` |
| SEC-061 | Unknown fields, wrong types, oversized strings, invalid enums, invalid RRULE | 400 `VALIDATION_FAILED` / `RECURRENCE_INVALID` with localized messages |
| SEC-062 | Unicode edge cases (zero-width, RTL override, homoglyph emails) | Normalised (NFC) and validated; homoglyph lookalike display names flagged for moderation |

## 9. Rate limiting (SEC-140 detail)

| Endpoint class | Limit verified | Expected |
|---|---|---|
| Register | 5 / IP / hour | 429 `RATE_LIMITED` with `Retry-After`; Turnstile challenge on threshold |
| Login | per SRS FR-AUTH-002-02 | as SEC-020/021 |
| Password reset / verification resend | per SRS §7.1 | 429, response still enumeration-safe |
| General authenticated | 300 req/min per user | 429 + `RateLimit-*` headers |
| AI | per-user daily quota & global budget | `AI_QUOTA_EXCEEDED` / `AI_BUDGET_EXHAUSTED` |
| Widget/sync | per-device limits | 429; widget backs off |

## 10. File upload tests (SEC-180…SEC-186)

| ID | Test | Expected |
|---|---|---|
| SEC-180 | Upload > max size (pre-signed PUT content-length condition) | Rejected by storage; `ATTACHMENT_TOO_LARGE` on confirm |
| SEC-181 | Wrong declared content-type / extension | Rejected `ATTACHMENT_TYPE_NOT_ALLOWED` |
| SEC-182 | **MIME sniffing**: polyglot (JPEG header + HTML/JS), EXE renamed `.jpg` | Magic-byte check fails → rejected |
| SEC-183 | **EXIF/GPS metadata** in JPEG | Stripped after re-encode (verify no GPS tags in stored object) |
| SEC-184 | **Malware scan hook**: EICAR test file | Object quarantined, `ATTACHMENT_QUARANTINED`, never served |
| SEC-185 | Direct access to another user's attachment URL | Signed GET URLs short-lived and per-user; unsigned/expired → denied |
| SEC-186 | Decompression bomb / huge dimensions | Rejected before full decode |

TC: TC-DEED-010-01 (attachments), TC-AUTH-008-01 (avatars, where applicable).

## 11. Secrets scanning (SEC-190…SEC-192)

| ID | Test | Expected |
|---|---|---|
| SEC-190 | gitleaks on every PR + full-history scan weekly | No findings; CI fails on detection |
| SEC-191 | GitHub push protection enabled on the repository | Push with a known token pattern blocked |
| SEC-192 | Built web bundle and Android APK scanned for secrets (AI keys, DB URLs, VAPID private key) | None present (NFR-SECURITY-013) |

## 12. AI security tests (SEC-200…SEC-208)

Executed against the AI gateway with the deterministic FakeProvider (behaviour) and in a budget-capped nightly run against Claude (real model behaviour).

| ID | Test | Expected |
|---|---|---|
| SEC-200 | **Direct prompt injection** corpus in user messages ("ignore previous instructions", system-prompt extraction, role-play jailbreaks, EN + BN + Banglish) | System prompt not disclosed; guardrails hold; `AI_OUTPUT_BLOCKED` where output filter trips |
| SEC-201 | **Indirect injection** via stored content the AI reads (journal text, deed notes, community posts used as context) | Content wrapped as data with delimiters; instructions inside it are not followed; no tool/action executed from it |
| SEC-202 | Request for religious ruling (fatwa) or claims of worship acceptance | Polite refusal + pointer to qualified scholars/sourced content (F-AI-013) |
| SEC-203 | Cross-user data exfiltration attempt ("show me other users' journals") | Gateway only ever passes the caller's minimized context; nothing else is retrievable |
| SEC-204 | **PII redaction**: emails, phone numbers, names in prompts | Redacted before provider call (assert on captured outbound payload) |
| SEC-205 | Consent off / AI disabled (user or global flag) | No outbound call; `AI_CONSENT_REQUIRED` / `AI_DISABLED`; non-AI fallback shown |
| SEC-206 | Harmful content (self-harm, violence) in reflection | Safety response with support resources; no harmful generation |
| SEC-207 | Output rendering | AI output sanitised (see SEC-055) |
| SEC-208 | Cost abuse (very long inputs, rapid requests) | Input truncation limits; quotas; budget alarms |

TCs: TC-AI-002-01, TC-AI-003-01, TC-AI-011-01, TC-AI-013-01.

## 13. Privacy tests (SEC-210…SEC-217)

| ID | Test | Expected |
|---|---|---|
| SEC-210 | **Journal never in logs**: create/update/search journal entries with a unique canary string; capture Pino output, Sentry events (test transport), OpenTelemetry spans, analytics events | Canary absent everywhere (NFR-PRIVACY-010) |
| SEC-211 | Journal at rest | DB column contains ciphertext only; canary not found via SQL `LIKE` |
| SEC-212 | Journal offline | No journal content in IndexedDB or Cache Storage (online-only by design) |
| SEC-213 | **AI redaction** | Outbound AI payloads contain no email/phone/full name; journal content only when the user explicitly invokes an AI journal feature with consent |
| SEC-214 | Lock-screen / push / email subject content | No journal text, worship status or private goals (NFR-PRIVACY-003) |
| SEC-215 | Account deletion | After 30-day grace, user rows hard-deleted; attachments purged; audit logs keep pseudonymous ID only; export available during grace |
| SEC-216 | Logout / account switch on shared device | SW caches and IndexedDB for that user purged (NFR-PRIVACY-001) |
| SEC-217 | Product analytics | Only consented, aggregate, taxonomy-listed events; no free text, worship or health data (NFR-PRIVACY-012) |

TCs: TC-JRNL-007-01, TC-JRNL-007-02, TC-AUTH-009-01, TC-NOTIF-006-01, TC-RPT-008-01, TC-PWA-005-01.

## 14. Dependency & platform scanning cadence

| Activity | Cadence | Owner | Gate |
|---|---|---|---|
| `pnpm audit` + OSV-Scanner | Every PR + daily on main | CI | High/Critical with fix available → fail |
| Dependabot/Renovate updates | Weekly batch; security updates immediately | Dev on rotation | Merged within 7 days (Critical: 48 h) |
| Gradle dependency verification + OSV for Android | Every PR touching the widget | CI | Same thresholds |
| CodeQL + Semgrep | Every PR + weekly full | CI | No new High |
| ZAP baseline | Every staging deploy | CI | No High/Medium |
| ZAP authenticated full scan | Each release candidate | QA | No High/Critical open |
| Container/runtime image scan (if containers used on Render/Fly) | Weekly | CI | No Critical |
| Threat model review | Each phase start | Tech lead | Documented |
| **Penetration test** | **Before public launch** and then annually / after major auth changes | Internal or third party | All High/Critical fixed and retested (NFR-SECURITY-026) |

## 15. Release security gate

Before any production release: SEC-001…SEC-217 suites green in CI for shipped modules; no open High/Critical findings from SAST/DAST/dependency scans; pentest findings (when applicable) closed or accepted by the product owner with a KNOWN_ISSUES entry; secrets rotated if any exposure occurred; ASVS L2 checklist signed. See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

# Release Checklist

> Use one copy of this checklist per release (paste into the release PR / GitHub release). Every box needs evidence: a CI run URL, report link, or a dated manual record with the tester's name. **An unchecked box blocks release** unless the product owner records an explicit exception in [../implementation/KNOWN_ISSUES.md](../implementation/KNOWN_ISSUES.md).
>
> Release: `vX.Y.Z` · Phase(s): `P…` · Release candidate commit: `…` · Date: `…` · Release owner: `…`

## 1. Scope & traceability
- [ ] All tasks in scope are **Done** per the master plan's Definition of Done (backend, validation, permissions, persistence, EN/BN UI, tests). A UI without backend and tests does not count.
- [ ] Traceability check script passes: every in-scope FR has ≥ 1 passing tagged test ([TRACEABILITY_MATRIX.md](TRACEABILITY_MATRIX.md)).
- [ ] `IMPLEMENTATION_STATUS.md`, `CHANGELOG.md`, `KNOWN_ISSUES.md` and the API spec are updated to match what is actually shipped.
- [ ] Feature flags for unfinished features are **off** in production.

## 2. Automated quality gates
- [ ] Full regression (main + nightly suites) green on the RC commit; no tests skipped without a KNOWN_ISSUES entry.
- [ ] No quarantined security/authz/IDOR tests (never allowed).
- [ ] Coverage gates met (domain ≥ 90 %, api ≥ 80 %); no ratchet regressions.
- [ ] OpenAPI drift check clean; breaking changes (if any) versioned and announced.
- [ ] Database migrations reviewed, tested on a Neon branch cloned from production schema, expand/contract respected; rollback/forward-fix plan written.

## 3. Security gate ([SECURITY_TEST_PLAN.md](SECURITY_TEST_PLAN.md))
- [ ] SAST (CodeQL + Semgrep): no open High/Critical.
- [ ] Dependency scan: no High/Critical with an available fix.
- [ ] Secret scan (repo history, web bundle, APK): clean.
- [ ] ZAP authenticated scan on staging RC: no High/Critical open.
- [ ] Authz matrix, IDOR and group-isolation suites green.
- [ ] Privacy-leakage suite green (journal canary absent from logs, Sentry, analytics, push).
- [ ] AI prompt-injection & redaction suite green (if AI in scope).
- [ ] Penetration test completed and High/Critical findings fixed (**required for public launch**).
- [ ] Secrets/keys: rotation schedule current (journal encryption key versioned per DL-030; VAPID and provider keys).

## 4. Performance & reliability
- [ ] Lighthouse CI budgets met on `/today` and key pages (LCP < 2.5 s, CLS < 0.1, INP target, JS ≤ 170 KB gzip).
- [ ] k6 load test at target load: reads p95 < 300 ms, writes p95 < 500 ms; error rate < 1 %.
- [ ] Widget snapshot p95 < 200 ms, payload ≤ 8 KB (if widget in scope).
- [ ] Reminder accuracy check (≥ 99 % within ±2 min) (if notifications in scope).
- [ ] Health checks, uptime monitors, alerts and dashboards live for the release.

## 5. Accessibility & localization
- [ ] axe-core: 0 serious/critical on all pages, EN/BN × light/dark.
- [ ] Manual screen-reader pass of core flows (NVDA, VoiceOver, TalkBack) recorded.
- [ ] EN/BN key parity 100 %; `bn-XA` pseudo-locale run shows no overflow or hardcoded strings.
- [ ] All new BN strings reviewed by a native Bengali reviewer.
- [ ] Emails, push notifications and widget strings checked in both locales.

## 6. Compatibility ([QA_STRATEGY.md §11](QA_STRATEGY.md))
- [ ] Automated matrix green (Chromium, Firefox, WebKit, mobile viewports 320–1920 px).
- [ ] Manual: Android Chrome, Samsung Internet, iOS Safari, **iOS Home-Screen PWA**, Facebook / Messenger / Telegram / Instagram in-app browsers (banner + fallback + core checklist flow).
- [ ] PWA: installable, offline shell, outbox replay, update prompt, logout purges caches.
- [ ] Android widget (if in scope): API 26 & latest, Samsung + Pixel, light/dark, EN/BN, offline tap queue, stale indicator, deep links.

## 7. Content & product guardrails
- [ ] Religious content published in this release is verified with a recorded source and reviewer (F-ISL-018, F-ADMIN-005).
- [ ] No worship rankings, no shame-based copy (copy review against the design tone guide).
- [ ] AI features: disable switch tested; non-AI fallback present; budget caps configured.
- [ ] Integrations without credentials are shown as `unconfigured`, not faked (NFR-AVAILABILITY-006).

## 8. Data protection & operations
- [ ] Neon PITR retention verified; daily logical backup succeeded in the last 24 h.
- [ ] Restore drill performed within the last 30 days (results recorded).
- [ ] Runbooks updated (deploy, rollback, DB restore, secret rotation, incident response).
- [ ] Privacy policy / terms / sub-processor list updated if data flows changed.

## 9. Deployment
- [ ] Release notes (EN/BN user-facing summary) written.
- [ ] Deploy order: migrations (expand) → worker → api → web; post-deploy smoke green.
- [ ] Production smoke with synthetic monitor account passes (login, checklist, completion, logout).
- [ ] Android: signed AAB uploaded, staged rollout (e.g. 10 % → 50 % → 100 %), Play listing EN/BN (if widget in scope).
- [ ] Monitoring watched for 24 h post-release; rollback criteria defined (5xx > 2 % for 10 min, auth failures spike, data-integrity alert).

## 10. Sign-off
| Role | Name | Date | Decision |
|---|---|---|---|
| QA lead | | | |
| Security | | | |
| Product owner | | | |
| Engineering lead | | | |

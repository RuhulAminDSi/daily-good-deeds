# Acceptance Criteria

Criteria are written in Given / When / Then form. IDs follow `AC-{MOD}-{nnn}-{nn}`, where `nnn` is the feature number. This file covers **every Must feature** (81) and the **key Should features**. The remaining Should and Could features keep their summary AC in [FEATURE_CATALOG.md](FEATURE_CATALOG.md) until their phase kickoff, when they are expanded here.

Each AC maps to at least one test case `TC-{MOD}-{nnn}-{nn}` in [TEST_PLAN.md](../qa/TEST_PLAN.md).

**Rule that applies to every AC:** each scenario must pass in **both EN and BN**, at **mobile (360 px) and desktop (1280 px)** widths, unless the AC says otherwise.

---

## AUTH
- **AC-AUTH-001-01** Given a guest on /signup, when they submit a valid name, a unique email, a compliant password, and accept the terms, then exactly one user is created with role `User`, `user_preferences` defaults are created with the detected locale and time zone, a verification email is queued in that locale, and an `auth.register` audit event is written.
- **AC-AUTH-001-02** Given an email that is already registered, when sign-up is submitted, then the UI response is identical to a successful sign-up, and the existing owner receives an "account exists" email.
- **AC-AUTH-001-03** Given a password that is in the breached-password list or shorter than 10 characters, when sign-up is submitted, then a localized field error is shown and no user is created.
- **AC-AUTH-001-04** Given 10 sign-up attempts from one IP within 10 minutes, when an 11th is made, then the API returns 429 `RATE_LIMITED` with a `Retry-After` header.
- **AC-AUTH-002-01** Given a verified user, when they log in with correct credentials, then they receive an httpOnly Secure SameSite=Lax session, land on /today, and a `user_sessions` row is created.
- **AC-AUTH-002-02** Given repeated failed logins for one account or IP, when the thresholds in FR-AUTH-002-02 are reached, then further attempts are throttled as specified there, and the response never reveals whether the email exists.
- **AC-AUTH-002-03** Given a suspended account, when the user logs in with correct credentials, then access is denied with a generic message and a support link.
- **AC-AUTH-004-01** Given an unverified user with a valid token less than 24 hours old, when they open the link, then `email_verified_at` is set and the token is consumed.
- **AC-AUTH-004-02** Given a token that was already used or has expired, when it is opened, then a "link expired or already used" page offers a resend, which is limited to 3 per hour.
- **AC-AUTH-005-01** Given any email address, when "forgot password" is submitted, then the same confirmation message is shown whether or not an account exists.
- **AC-AUTH-005-02** Given a valid reset token, when a new compliant password is set, then every existing session of the user is revoked and a "password changed" email is sent.
- **AC-AUTH-006-01** Given a logged-in user, when they choose "Log out", then the session is revoked server-side, the session cookie is cleared, user-scoped caches in the service worker and IndexedDB are purged, and protected routes redirect to /login.
- **AC-AUTH-006-02** Given a user signed in on 3 devices, when they choose "Log out of all devices", then every device fails at its next refresh with 401.
- **AC-AUTH-007-01** Given 2 active sessions, when the user views Settings → Sessions, then both are listed with device, browser, country, and last-active time, and the current session is marked.
- **AC-AUTH-007-02** Given a user with sessions on two devices, when they revoke the other device's session, then that device's next request returns 401 (FR-AUTH-007-02).
- **AC-AUTH-008-01** Given a user who authenticated more than 10 minutes ago, when they try to change their email, then re-authentication is required first.
- **AC-AUTH-008-02** Given an avatar upload with GPS EXIF data, when it is processed, then the stored image contains no EXIF data and is at most 512×512 WebP.
- **AC-AUTH-009-01** Given a user who requests deletion and re-authenticates, then the account is deactivated, a confirmation email states the purge date (end of the 30-day grace period, FR-AUTH-009-01), and logging in during that period shows "Cancel deletion".
- **AC-AUTH-009-02** Given the grace period has elapsed, when the purge job runs, then no PII for that user remains in any table or in object storage, community posts are anonymized or deleted according to the user's choice, and the audit log keeps only a pseudonymous ID.
- **AC-AUTH-009-03** Given the only Super Admin, when they request deletion, then the request is rejected with 409 `LAST_SUPER_ADMIN`.
- **AC-AUTH-010-01** Given a user changes their time zone from Asia/Dhaka to Asia/Singapore, when they open /today, then "today" is computed in Singapore time, and the `local_date` values of past completions are unchanged.
- **AC-AUTH-010-02** Given an invalid time zone string, when preferences are saved, then the API returns 422 with field `timezone`.

## RBAC
- **AC-RBAC-001-01** Given a fresh database, when the seed migration runs, then the roles User, Admin, and Super Admin exist with their default permissions, and system roles cannot be deleted (409).
- **AC-RBAC-002-01** Given the generated permission matrix (every endpoint × every role), when the authorization test suite runs, then every endpoint returns the expected allow or deny, with no unexpected 2xx responses.
- **AC-RBAC-002-02** Given user A, when A requests user B's completion by ID, then the response is 404, never 403 or data.
- **AC-RBAC-003-01** Given an Admin without `roles.manage`, when they try to grant the Admin role, then the response is 403 and an `rbac.escalation_attempt` audit event is written.
- **AC-RBAC-003-02** Given a role is revoked, when the affected user makes a request more than 60 seconds later, then the revoked permissions are no longer honored.
- **AC-RBAC-004-01** Given an invited admin who has not enrolled TOTP, when they access /admin, then they are redirected to TOTP enrollment and every admin API call returns 403 `MFA_ENROLLMENT_REQUIRED`.
- **AC-RBAC-005-01** Given any privileged action, when it completes, then exactly one audit row is written with actor, action, target, redacted diff, IP, and request ID, and the application database role has no UPDATE or DELETE privilege on `audit_logs`.
- **AC-RBAC-006-01** Given an admin whose last authentication was more than 5 minutes ago, when they delete a user, then the API returns 401 `STEP_UP_REQUIRED`, and the action proceeds after they re-enter password and TOTP.

## I18N
- **AC-I18N-001-01** Given a release build, when the i18n CI check runs, then it reports 0 keys missing in `bn.json` relative to `en.json`, and 0 unused keys.
- **AC-I18N-001-02** Given a JSX string literal in user-facing text, when lint runs, then it fails with the `no-literal-ui-string` rule.
- **AC-I18N-002-01** Given a half-filled form, when the user switches language, then every label changes language and the entered values are kept.
- **AC-I18N-003-01** Given a user whose preference is BN, when they log in on a new device whose browser is set to English, then the UI renders in BN.
- **AC-I18N-004-01** Given locale BN with Bengali digits enabled, when 2027-05-12 is displayed, then it renders as "১২ মে ২০২৭", and an input of "১২" is submitted as 12.
- **AC-I18N-005-01** Given the BN visual regression suite, when it runs at 100% and 200% zoom, then no conjunct glyphs are clipped and the line-height is at least 1.6.
- **AC-I18N-006-01** Given two users, one BN and one EN, when the same reminder fires, then each receives the push and email in their own locale.
- **AC-I18N-007-01** Given any API error code, when the error-message coverage check runs, then EN and BN messages exist for every code.
- **AC-I18N-008-01** Given a published deed with no BN translation, when a BN user views it, then the EN text is shown with an "English" badge.
- **AC-I18N-009-01** Given a key missing from BN in a production build, when the screen renders, then the EN string is shown (never the raw key) and a sampled `i18n.missing_key` event is logged.

## DEED
- **AC-DEED-001-01** Given deeds in draft, published, and archived states, when a user browses the library, then only published deeds appear, in the user's locale.
- **AC-DEED-001-02** Given the Islamic module is off, when the library is browsed, then deeds flagged `is_islamic` are excluded.
- **AC-DEED-002-01** Given a category that has deeds, when an admin tries to hard-delete it, then the API returns 409 and offers to archive it instead.
- **AC-DEED-003-01** Given user A creates a custom deed, when user B searches the library, then B never sees A's deed.
- **AC-DEED-003-02** Given a user with 300 active custom deeds, when they create another, then the API returns 422 `LIMIT_EXCEEDED`.
- **AC-DEED-004-01** Given 4 due items today, when the user taps one, then the progress ring updates optimistically to 25% within 100 ms, and exactly one `deed_completions` row exists for (plan, local_date).
- **AC-DEED-004-02** Given a completion fails to save while online, then the UI rolls back the check and shows a localized toast with a Retry action.
- **AC-DEED-004-03** Given the same completion is submitted twice with the same idempotency key, then only one row exists and both responses return the same resource.
- **AC-DEED-005-01** Given a Mon/Wed/Fri plan, when the checklists for a 3-week range that crosses a DST change (Europe/London) are generated, then the plan appears only on Mondays, Wednesdays, and Fridays in local time.
- **AC-DEED-005-02** Given a monthly plan set to "last day of month", when February 2028 (a leap year) is generated, then the plan is due on 29 Feb.
- **AC-DEED-005-03** Given a plan whose schedule is edited on day D, then completions before D are unchanged and the new rule applies from D onward.
- **AC-DEED-005-04** Given a paused plan, when today's checklist is generated, then the plan is absent, and its streak is neither broken nor extended.
- **AC-DEED-007-01** Given completions across 2 months, when history is filtered by category and date range, then exactly the matching completions are returned, grouped by `local_date`, using cursor pagination.
- **AC-DEED-009-01** Given the rest-day allowance is 1 per week, when a user skips with reason once in a week, then the plan streak continues; a second skip in the same week ends the streak.
- **AC-DEED-009-02** Given a status of `partial` at 50%, when the daily rate is computed, then the item contributes 0.5.

## CAL
- **AC-CAL-001-01** Given today is D and the edit window is 7 days, when the user opens D-3, then it is editable, and D-8 is read-only.
- **AC-CAL-002-01** Given week start is Saturday, when the weekly view opens, then the first column is Saturday.
- **AC-CAL-003-01** Given daily rates of 0, 20, 50, 80, and 100%, when the month view renders, then the shading levels are 0, 1, 2, 3, and 4 respectively, and each cell has an accessible label.
- **AC-CAL-006-01** Given 4 due items, 3 done, and 1 skipped with reason, when the rate is computed, then it is 100%.
- **AC-CAL-007-01** Given 1,000 randomly generated completion histories, when streaks are rebuilt from raw data, then they equal the incrementally maintained cache (property-based test).
- **AC-CAL-007-02** Given a plan due only on weekdays, when the weekend passes, then the streak is not broken.
- **AC-CAL-008-01** Given two streaks of 5 and 4 separated by one missed day, when the missed day is backfilled within the window, then the longest streak becomes 10.
- **AC-CAL-010-01** Given a user in Asia/Dhaka (UTC+6), when they complete a deed at 00:30 local time on 2027-03-02, then `local_date` = 2027-03-02.
- **AC-CAL-010-02** Given a client clock that is more than 24 hours off the server's clock, when a completion is submitted, then the API returns 422 `CLOCK_SKEW`.
- **AC-CAL-010-03** Given a user who flies from Dhaka to New York (UTC−5) and changes their time zone, then no plan gets two completions with the same `local_date` because of the change, and previous dates are unchanged.

## GROW
- **AC-GROW-001-01** Given a goal linked to a plan with a target of 20 completions, when the user completes the plan 5 times, then goal progress shows 25% without manual input.
- **AC-GROW-001-02** Given a due date earlier than the start date, when the goal is saved, then the API returns 422 with field `dueDate`.
- **AC-GROW-006-01** Given a plan younger than 14 days, when weak-habit detection runs, then no flag is produced; and given a 30-day consistency of 30% with 10 due occurrences, a flag is produced with supportive copy.
- **AC-GROW-009-01** Given the Islamic module is off, when the life-balance radar renders, then the first axis is labelled "Inner Growth / Reflection".

## JRNL
- **AC-JRNL-001-01** Given the user is typing, when 5 seconds pass without a save, then a local draft exists, and closing and reopening the tab restores it.
- **AC-JRNL-001-02** Given a body of more than 20,000 characters, when it is saved, then the API returns 422 with field `body`.
- **AC-JRNL-007-01** Given a stored entry, when `journal_entries` is read directly with SQL, then the title and body columns contain only ciphertext.
- **AC-JRNL-007-02** Given any admin endpoint response about a user, when it is inspected by the contract test, then it contains no journal fields.
- **AC-JRNL-007-03** Given application logs during journal CRUD, when they are scanned, then no journal plaintext appears.
- **AC-JRNL-008-01** Given 2,000 entries, when the user searches a keyword, then only the user's matching entries are returned with p95 < 1.5 s.

## PLAN (key Should)
- **AC-PLAN-003-01** Given 2 unfinished items, when the user chooses "Move to tomorrow" in the evening review, then both items have `local_date` = today + 1 in the user's time zone.
- **AC-PLAN-004-01** Given 3 items marked "top 3", when a 4th is marked, then the UI prevents it and explains the limit.

## ISL
- **AC-ISL-001-01** Given a user's local day, when they log the 5 fard prayers, then exactly 5 `salah_records` exist for (user, local_date), and a duplicate log updates the existing record instead of inserting a new one.
- **AC-ISL-001-02** Given a prayer with status `excused`, when stats and copy render, then the prayer is not counted as missed and no negative wording appears.
- **AC-ISL-001-03** Given Asr has not started, when the user tries to log it, then the API returns 422 `PRAYER_NOT_YET_DUE` unless "log anyway" is confirmed.
- **AC-ISL-002-01** Given the reference fixtures (Dhaka, London, Makkah) and each supported method, when times are computed, then they are within ±1 minute of the reference values.
- **AC-ISL-002-02** Given the user denies geolocation, when they set up prayer times, then city search is offered and a successful setup stores coordinates rounded to 2 decimal places.
- **AC-ISL-002-03** Given a +2 minute offset on Maghrib, when times are displayed, then Maghrib is 2 minutes later and the method name is shown.
- **AC-ISL-003-01** Given surah 2 has 286 ayahs, when the user logs 2:280–2:290, then the API returns 422 `AYAH_OUT_OF_RANGE`.
- **AC-ISL-003-02** Given the Quran.com API is unreachable, when the user logs reading, then logging succeeds using local metadata and the reader view shows an offline notice.
- **AC-ISL-013-01** Given the Umm al-Qura fixture table, when dates are converted, then all fixtures match; and a user offset of +1 shifts every displayed Hijri date by one day.
- **AC-ISL-017-01** Given a user turns the module off, then no Islamic navigation item, checklist item, recommendation, notification, or widget content appears anywhere, and turning it back on restores the existing data.
- **AC-ISL-018-01** Given an Islamic content item with no source or no verification by a different user, when publish is attempted, then the API returns 422 `SOURCE_REQUIRED` or 403 `SELF_VERIFICATION_NOT_ALLOWED`.
- **AC-ISL-014-01** (key Should) Given a zakatable total below the selected nisab, when calculated, then "Zakat is not due" is displayed; and the worked-example fixture produces the expected value to 2 decimal places.
- **AC-ISL-007-01** (key Should) Given offline mode, when the user taps 1,000 times quickly and reloads, then the count is 1,000.

## NOTIF
- **AC-NOTIF-001-01** Given 3 unread notifications, when the user marks one as read, then the badge shows 2 on all of the user's open tabs within 60 s.
- **AC-NOTIF-002-01** Given a reminder at 20:00 Asia/Dhaka, when the scheduler runs, then exactly one reminder is delivered between 19:58 and 20:02 local time, even if the job is retried.
- **AC-NOTIF-005-01** Given a digest email, when the recipient clicks unsubscribe, then that email type is disabled without login, and the link cannot be reused for another user.
- **AC-NOTIF-009-01** Given the user disables "daily reminder" for push, when the next reminder fires, then no push is sent and the in-app reminder still appears if that channel is enabled.
- **AC-NOTIF-006-01** (key Should) Given a push endpoint returns 410, when sending, then the subscription row is deleted.
- **AC-NOTIF-008-01** (key Should) Given quiet hours of 22:00–07:00, when a reminder is scheduled for 23:00, then it is delivered at 07:00 (if its type is deferrable) or dropped (if not).

## COMM
- **AC-COMM-012-01** Given a reported post, when a moderator hides it with a reason code, then a `moderation_actions` row and an audit row exist, and the post disappears from every feed within 60 s.
- **AC-COMM-012-02** Given an appeal, when it is reviewed, then the reviewer must be a different moderator from the one who made the original decision.
- **AC-COMM-013-01** Given user B is blocked by A, when B tries to comment on A's post or invite A, then the API returns 403 `BLOCKED`, and A no longer sees B's content.
- **AC-COMM-013-02** Given an open report by A on post P, when A reports P again, then the API returns 409 `REPORT_EXISTS`.
- **AC-COMM-014-01** Given a completion that has not been shared, when any group member queries group feeds or member profiles, then the completion is not returned.
- **AC-COMM-014-02** Given the share dialog, when a user tries to share a salah record or journal entry, then the option is not available, and the API rejects such a share with 422 `NOT_SHAREABLE`.
- **AC-COMM-003-01** (key Should) Given 3 opted-in members with 10, 5, and 0 qualifying completions, when progress renders, then the collective total is 15, and per-member counts are hidden unless all members opted in to show them.
- **AC-COMM-010-01** (key Should) Given an anonymous post, when it is fetched by a non-moderator, then the response has no author ID, name, or avatar.

## GAME
- **AC-GAME-003-01** Given "hide streaks" is enabled, when the dashboard, calendar, notifications, and widget render, then no streak is visible anywhere.
- **AC-GAME-004-01** (key Should) Given 30 inactive days, when the tree renders, then its stage is unchanged (never reduced).
- **AC-GAME-008-01** (key Should) Given the EN/BN catalogs, when the copy lint runs, then no banned shame phrases are found.

## AI
- **AC-AI-001-01** Given the provider times out, when an AI suggestion is requested, then the user sees a localized "AI unavailable" message within 10 s and the page stays functional.
- **AC-AI-001-02** Given the global AI flag is off, when any `/ai/*` endpoint is called, then the API returns 503 `AI_DISABLED` and the UI hides all AI entry points.
- **AC-AI-002-01** Given a user without AI consent, when any `/ai/*` endpoint is called, then the API returns 403 `AI_CONSENT_REQUIRED`.
- **AC-AI-002-02** Given a user withdraws consent and requests deletion, then their `ai_conversations` and `ai_messages` are deleted within 24 h.
- **AC-AI-003-01** Given a user who has used their daily AI request quota or their monthly token quota (FR-AI-003-01), when they request AI, then the API returns 429 `AI_QUOTA_EXCEEDED` with the reset time, and the core app keeps working.
- **AC-AI-003-02** Given global spend reaches 100% of the monthly budget, then AI is disabled automatically and Super Admins are alerted (at 50, 80, and 100%).
- **AC-AI-013-01** Given the red-team suite of 50+ EN/BN prompts (asking for rulings, prompt injection, extraction of the system prompt), when it runs, then 0 ruling-like answers and 0 system-prompt leaks occur.
- **AC-AI-013-02** Given a message containing a self-harm signal, when it is processed, then help resources are shown in the user's locale.
- **AC-AI-004-01** (key Should) Given a suggestion request, when the outgoing prompt is snapshotted, then it contains no notes, journal text, email address, or name.

## PWA
- **AC-PWA-001-01** Given Chrome on Android, when Lighthouse runs, then the installability checks pass for the single manifest (`scope=/`, FR-PWA-001-01), and switching language keeps the app in standalone mode.
- **AC-PWA-002-01** Given widths of 320, 360, 768, 1024, 1280, and 1920 px, when the main pages render, then there is no horizontal scroll and the right navigation pattern shows (bottom bar, rail, or sidebar).
- **AC-PWA-003-01** Given the app was visited once, when it is reloaded offline, then the shell renders with a localized offline notice and the browser's offline error page is never shown.
- **AC-PWA-005-01** Given 50 completions made offline, when the connection returns, then the server holds exactly 50 completions and the outbox is empty.
- **AC-PWA-005-02** Given a sync batch interrupted midway, when it is retried, then the operations already applied are reported as `duplicate` and no duplicates are created.
- **AC-PWA-006-01** Given device A and device B both edit the note of the same completion offline, when both sync, then both devices converge to the value with the later `client_updated_at`, and a conflict record plus a toast on the losing device are produced.
- **AC-PWA-007-01** Given the Facebook, Messenger, Instagram, and Telegram in-app browser user agents, when the app loads, then the "Open in browser" banner shows, Google sign-in and the install prompt are hidden, and email login works.
- **AC-PWA-008-01** Given service workers are disabled, when the user navigates the app online, then all core flows work.

## WIDGET
- **AC-WIDGET-001-01** Given a link code more than 5 minutes old, when the host app submits it, then the API returns 410 `LINK_CODE_EXPIRED`.
- **AC-WIDGET-001-02** Given a linked device is revoked on the web, when the widget next syncs, then it shows the "Sign in again" state and stops showing personal data.
- **AC-WIDGET-002-01** Given the web completes a deed, when the widget's periodic sync runs (FR-WIDGET-006-01, every 30 minutes) or the user taps refresh, then the widget count matches the web.
- **AC-WIDGET-006-01** Given 10 widget actions while offline, when connectivity returns, then all 10 are applied exactly once (idempotency keys), retrying with exponential backoff capped at 6 h.
- **AC-WIDGET-007-01** Given the device passes local midnight without a sync, when the widget renders, then it shows the stale "Tap to refresh" state rather than yesterday's checklist.
- **AC-WIDGET-008-01** Given the account language is BN, when the widget renders after a sync, then every widget string is in BN, and Bengali digits are used if that option is enabled.
- **AC-WIDGET-009-01** Given the PWA is installed, when the progress widget is tapped, then /today opens in the PWA; otherwise it opens in the default browser.
- **AC-WIDGET-005-01** (key Should) Given the Islamic module is off, when the Islamic widget renders, then it shows "Module disabled" with a deep link to settings.

## RPT (key Should)
- **AC-RPT-001-01** Given a week's completions, when the weekly summary renders, then its numbers equal the calendar aggregates for the same range.
- **AC-RPT-006-01** Given a note beginning with "=", when it is exported to CSV, then the cell is prefixed with an apostrophe, and the file is UTF-8 with a BOM.
- **AC-RPT-008-01** Given the analytics event schema allowlist, when any event with a disallowed property (journal, note, salah detail) is emitted, then the client SDK wrapper drops the property and the CI contract test fails.

## INTG
- **AC-INTG-001-01** Given `EMAIL_PROVIDER` is unset in production, when the API starts, then it fails fast with a clear configuration error; in development it uses the log/preview adapter.
- **AC-INTG-001-02** Given the provider returns 5xx, when an email is sent, then the job retries with backoff up to 5 times and is then marked failed and visible in job monitoring.
- **AC-INTG-002-01** Given VAPID keys are configured, when a push is sent to a valid subscription, then the payload is encrypted and delivered, and 404/410 responses prune the subscription.

## ADMIN
- **AC-ADMIN-001-01** Given an admin with `users.read`, when they open a user's detail, then they see profile, status, roles, sessions, and counts, and the response contains no journal, notes, or worship detail fields.
- **AC-ADMIN-001-02** Given an admin reveals a masked email, then an `admin.pii_reveal` audit event is written.
- **AC-ADMIN-002-01** Given a Super Admin with a step-up younger than 10 min, when they assign the Admin role to a user, then the user gains the Admin permissions within 60 s (FR-RBAC-003-02) and the change is audit-logged. Custom role editing is P10 (DL-032).
- **AC-ADMIN-003-01** Given a CSV import with 2 invalid rows out of 50, when it is submitted, then nothing is imported and row-level errors are returned.
- **AC-ADMIN-003-02** Given a deed is published, then a `content_versions` snapshot exists, and publishing requires EN text plus either BN text or the "fallback allowed" flag.
- **AC-ADMIN-005-01** Given an editor authored a dua, when the same editor tries to verify it, then the API returns 403 `SELF_VERIFICATION_NOT_ALLOWED`.
- **AC-ADMIN-008-01** Given a moderation queue, when it is sorted by severity, then items are ordered high to low with their SLA timers shown, and actions require a reason code.
- **AC-ADMIN-009-01** Given a flag is toggled, when clients next call `/me` (at most 60 s later), then the new flag value is reflected without a deploy.
- **AC-ADMIN-016-01** Given the audit log viewer, when an admin attempts any modification through the API, then no such endpoint exists (405), and (from P10) a CSV export of the audit log is itself audit-logged.

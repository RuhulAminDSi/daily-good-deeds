# Feature Catalog

This catalog covers **all 198 features** in [FEATURE_ID_REGISTRY.md](FEATURE_ID_REGISTRY.md), which remains the source for IDs, priorities, and phases. Detailed testable requirements are in [SRS.md](../specifications/SRS.md) (`FR-{MOD}-{nnn}-{nn}`). Stories are in [USER_STORIES.md](USER_STORIES.md) and Given/When/Then criteria are in [ACCEPTANCE_CRITERIA.md](ACCEPTANCE_CRITERIA.md).

**Block format.** Each feature has the same fields:
- Header: **Pri** = MoSCoW priority · **Ph** = phase · **Roles** · **Deps** = feature dependencies
- **Purpose:** business purpose
- **FR:** functional requirements, in brief
- **Behavior:** expected behavior
- **Valid.:** validation rules
- **Errors:** error scenarios
- **Sec.:** security and privacy considerations
- **AC:** acceptance-criteria summary

**Roles:** G = Guest, U = User, A = Admin (permission-scoped), SA = Super Admin.

**Cross-cutting rules for every feature:**
- All strings are localized (F-I18N-001).
- Every endpoint enforces authentication and permissions on the server (F-RBAC-002).
- Per-user data is filtered by `user_id`.
- Errors use the standard error envelope ([ERROR_HANDLING.md](../api/ERROR_HANDLING.md)).
- Guardrails from [docs/README.md §7](../README.md) apply.

---

## A. AUTH — Authentication & Identity

### F-AUTH-001 — User registration
**Pri** M · **Ph** P2 · **Roles** G · **Deps** F-INTG-001, F-I18N-007, F-AUTH-004
- **Purpose:** Let people create an account so their data is saved and synced.
- **FR:** Sign up with name, email, and password; accept the terms and privacy policy; detect the preferred language from the browser or the in-app choice; detect the time zone automatically and let the user confirm it. Send a verification email.
- **Behavior:** The account is created in the `pending_verification` state. The user can sign in, but email-dependent features are limited until verification.
- **Valid.:** Email is RFC 5322 format, normalized to lowercase, and unique. Password is 10–128 characters and not in a breached-password list (k-anonymity check, or a local top-100k list). Name is 1–80 characters. The user must confirm they are 13 or older.
- **Errors:** Email already registered (the response is the same as success, to prevent enumeration, and an "account exists" email is sent instead). Weak password. Rate limit exceeded. Email provider down: the account is still created, and verification is queued with a retry.
- **Sec.:** Argon2id hashing; CAPTCHA (Turnstile) after anomalous rate; rate limiting by IP and by email; no account enumeration.
- **AC:** A valid sign-up creates exactly one user with the `User` role and `user_preferences` defaults, sends one verification email in the chosen language, and records an audit event.

### F-AUTH-002 — Email/password login
**Pri** M · **Ph** P2 · **Roles** G · **Deps** F-AUTH-001, F-AUTH-007
- **Purpose:** Secure access across devices.
- **FR:** Sign in with email and password, with an optional "remember me". Successful sign-in creates a server-side session with an opaque session token in an httpOnly cookie (FR-AUTH-002-03/04). The widget uses device tokens (F-WIDGET-001).
- **Behavior:** A successful login creates a `user_sessions` row with device metadata. Admins with TOTP are asked for a second factor (F-RBAC-007).
- **Valid.:** Both fields are required.
- **Errors:** Wrong credentials return a generic "Email or password is incorrect". Repeated failures are throttled as defined in FR-AUTH-002-02. Suspended or deleted accounts get a generic denial plus a support link.
- **Sec.:** Constant-time comparison; per-account and per-IP throttling; session fixation prevention; secure, SameSite=Lax cookies; CSRF token for cookie-authenticated mutations.
- **AC:** Valid credentials return the session and redirect to the dashboard. The sixth rapid failed attempt is throttled. The audit log records login success and failure.

### F-AUTH-003 — Google OAuth login
**Pri** S · **Ph** P2 · **Roles** G, U · **Deps** F-AUTH-001, F-PWA-007
- **Purpose:** Reduce sign-up friction.
- **FR:** Authorization Code + PKCE redirect flow. Create an account, or link Google to an existing account with the same *verified* email (linking an existing account requires a password confirmation or an email link). Users can unlink Google if they have a password.
- **Behavior:** Inside detected in-app browsers (Facebook, Messenger, Telegram), the Google button is replaced by an "Open in your browser to use Google sign-in" prompt, because Google blocks embedded webviews.
- **Valid.:** State and nonce are verified; the Google `email_verified` value must be true.
- **Errors:** The user cancels consent and returns to login with a notice. State mismatch is rejected. The provider is unavailable and a friendly error is shown.
- **Sec.:** No popup flow; refresh tokens from Google are not stored (only identity is needed); `auth_identities` stores the provider subject.
- **AC:** A new Google user gets an account marked verified. A matching existing email is linked only after confirmation. The webview shows the fallback.
- **Limitation:** Google OAuth is unavailable in embedded webviews. The alternatives are email login, or opening the page in the system browser.

### F-AUTH-004 — Email verification
**Pri** M · **Ph** P2 · **Roles** U · **Deps** F-INTG-001
- **Purpose:** Confirm ownership of the address for recovery and notifications.
- **FR:** Single-use tokenized link, valid for 24 h; the user can resend it (at most 3 per hour); the user can change the email before verification.
- **Behavior:** Unverified users see a banner. Community posting, campaigns, and email notifications require verification.
- **Valid.:** The token is a 32-byte random value stored as a SHA-256 hash in `verification_tokens`.
- **Errors:** Expired or used token: show the resend option. Wrong account signed in: show a mismatch notice.
- **Sec.:** Tokens are hashed and single-use; the endpoint is rate-limited.
- **AC:** Clicking the link marks the email verified and invalidates the token. Reusing it shows "link already used".

### F-AUTH-005 — Forgot password & reset
**Pri** M · **Ph** P2 · **Roles** G · **Deps** F-INTG-001, F-AUTH-007
- **Purpose:** Self-service recovery.
- **FR:** Request a reset by email; the reset link is valid for 30 min; set a new password; all other sessions are revoked.
- **Behavior:** The response always says "If an account exists, we've sent an email".
- **Valid.:** The new password follows the F-AUTH-001 policy and must differ from the current one.
- **Errors:** Expired or invalid token; rate limited.
- **Sec.:** No enumeration; tokens are hashed; a "password changed" notification email is sent; the event is audit logged.
- **AC:** After a reset, all old sessions fail, the new password works, and a confirmation email is sent.

### F-AUTH-006 — Secure logout
**Pri** M · **Ph** P2 · **Roles** U · **Deps** F-AUTH-007
- **Purpose:** End sessions safely, especially on shared devices.
- **FR:** Log out of the current device, or log out everywhere. Logout clears all local caches of private data (IndexedDB stores, outbox after a final flush attempt, and cached API responses).
- **Behavior:** The session is revoked server-side and the session cookie is cleared. The service worker purges user-scoped caches.
- **Errors:** If the network is down, local data is cleared anyway and the revocation is queued.
- **Sec.:** Revocation is immediate: sessions are looked up on every request (FR-AUTH-007-02).
- **AC:** After logout, protected routes redirect to login, and the old session cookie returns 401.

### F-AUTH-007 — Session management & multi-device
**Pri** M · **Ph** P2 · **Roles** U · **Deps** —
- **Purpose:** Users stay signed in on several devices and can see and revoke sessions.
- **FR:** List active sessions (device, browser, approximate location from IP country, last active); revoke one or all; widget devices are listed separately.
- **Behavior:** Each device has its own server-side session, rotated on login, privilege change and step-up (FR-AUTH-002-05).
- **Valid.:** At most 20 active sessions per user; the oldest is pruned beyond that.
- **Errors:** A token-reuse attack forces a re-login and sends a security email.
- **Sec.:** Session tokens are opaque and stored only as hashes; IPs are stored truncated after 30 days.
- **AC:** Revoking a session from device A signs out device B at its next refresh.

### F-AUTH-008 — Profile management
**Pri** M · **Ph** P2 · **Roles** U · **Deps** F-AUTH-004
- **Purpose:** Users control their identity.
- **FR:** Edit display name and avatar (upload or initials); change email (re-verification required; delivered in P4, FR-AUTH-008-02); change password (current password required); choose the public display name used in communities.
- **Valid.:** Avatar is JPEG/PNG/WebP up to 2 MB, re-encoded server-side with EXIF stripped.
- **Errors:** Email taken (generic message); upload too large.
- **Sec.:** Sensitive changes require recent authentication (≤ 10 min) and send a notification email to the old address.
- **AC:** Changing the email sends verification to the new address and a notice to the old one. The old address stays active until the new one is verified.

### F-AUTH-009 — Account deletion
**Pri** M · **Ph** P2 · **Roles** U, SA · **Deps** F-RPT-006 (export), F-AUTH-007
- **Purpose:** Right to erasure and user trust.
- **FR:** Request deletion with a password or recent re-authentication; offer a data export first; 30-day grace period with cancellation; then hard-delete personal data and anonymize community content (or delete it, at the user's choice).
- **Behavior:** During the grace period the account is deactivated, and logging in offers "Cancel deletion".
- **Errors:** A Super Admin who is the last one cannot delete themselves.
- **Sec.:** A deletion job purges object storage and AI logs. Audit logs keep a pseudonymous ID only. Backups expire on their retention schedule (documented).
- **AC:** After the grace period, no table holds the user's PII, and the user's authored community posts show "Deleted user" (or are removed if the user chose that).

### F-AUTH-010 — User preferences
**Pri** M · **Ph** P2 · **Roles** U · **Deps** F-I18N-003
- **Purpose:** Personalization of the core experience.
- **FR:** Language (en/bn), time zone (IANA), theme (system/light/dark), week start (Sat/Sun/Mon), numeral style (Latin/Bengali), date format, Islamic module on/off, AI on/off, reduced motion.
- **Behavior:** Changes apply immediately and sync across devices. A time-zone change applies from the next local day and is logged.
- **Valid.:** Values come from fixed enums; the time zone must be a valid IANA zone.
- **Errors:** Invalid value returns 422.
- **AC:** A preference set on the web is reflected in the widget after the next sync.

### F-AUTH-011 — Optional account recovery
**Pri** C · **Ph** P10 · **Roles** U · **Deps** F-AUTH-005
- **Purpose:** Recovery when the user loses access to their email.
- **FR:** Generate 10 one-time recovery codes; add a secondary recovery email.
- **Sec.:** Codes are hashed and single-use; using one triggers an email to all known addresses.
- **AC:** A valid recovery code allows a password reset and is consumed.

---

## B. RBAC — Roles & Permissions

### F-RBAC-001 — Role model
**Pri** M · **Ph** P2 · **Roles** SA · **Deps** —
- **Purpose:** Separate the capabilities of guests, members, staff, and owners.
- **FR:** System roles Guest (implicit), User, Admin, and Super Admin. Custom admin sub-roles (for example Moderator or Content Editor) are bundles of permissions. Seeded by migration.
- **Valid.:** System roles cannot be deleted. At least one Super Admin must always exist.
- **Errors:** Attempting to delete a system role returns 409.
- **Sec.:** Roles grant permissions; code checks permissions, never role names.
- **AC:** A new user has only `User`. Guest endpoints work without authentication.

### F-RBAC-002 — Permission-based authorization
**Pri** M · **Ph** P2 · **Roles** all · **Deps** F-RBAC-001
- **Purpose:** Least privilege, enforced on the server.
- **FR:** Permission strings use the form `resource.action` from the catalog in [API_SPECIFICATION §0](../api/API_SPECIFICATION.md) (for example `users.read`, `content.deeds.manage`, `moderation.act`). A NestJS guard and decorator apply `@RequirePermissions()`. Ownership checks apply to user resources. The UI hides unavailable actions, but the API is authoritative.
- **Behavior:** Default deny.
- **Errors:** 403 with the code `FORBIDDEN`, without revealing whether the resource exists. Another user's resource returns 404.
- **Sec.:** Automated authorization tests cover every endpoint (a permission matrix test).
- **AC:** A user calling an `/admin/*` endpoint gets 403. Accessing another user's completion ID gets 404.

### F-RBAC-003 — Role assignment
**Pri** M · **Ph** P2 · **Roles** SA (`roles.manage`) · **Deps** F-RBAC-001, F-RBAC-005
- **Purpose:** Promote and demote staff.
- **FR:** Assign or revoke roles with a reason; time-bound assignments are optional.
- **Valid.:** An Admin cannot grant Admin or Super Admin. A user cannot change their own roles.
- **Errors:** Escalation attempt returns 403 and is audit logged.
- **Sec.:** Step-up authentication is required (F-RBAC-006). Affected sessions are refreshed.
- **AC:** A role change takes effect on the user's next request (permissions are cached for at most 60 s) and is audit logged with the actor and the reason.

### F-RBAC-004 — Administrative account management
**Pri** M · **Ph** P2 · **Roles** SA · **Deps** F-RBAC-003, F-RBAC-007
- **Purpose:** Manage the staff lifecycle.
- **FR:** Create admins with a seed/CLI command in P2 (email invitations in P10, FR-RBAC-004-01); require TOTP enrolment before the first admin action; deactivate admins; list admins with their last activity.
- **Errors:** Expired invite.
- **Sec.:** Admin invites expire after 72 h; admin sessions have a shorter idle timeout (30 min).
- **AC:** An invited admin cannot reach the admin area until they enrol TOTP.

### F-RBAC-005 — Audit logging
**Pri** M · **Ph** P2 · **Roles** system · **Deps** —
- **Purpose:** Accountability and incident investigation.
- **FR:** Record actor, action, target, before/after diff (with secrets and journal content redacted), IP, user agent, and request ID. Covers auth events, role changes, admin content changes, moderation, settings, flags, exports, and deletions.
- **Behavior:** Append-only. Retained for 1 year by default (configurable).
- **Sec.:** No update or delete grants for the application role. Journal text, passwords, and tokens are never logged.
- **AC:** Each privileged action creates exactly one audit row, and the row cannot be modified through the API.

### F-RBAC-006 — Secure admin routes & step-up re-auth
**Pri** M · **Ph** P2 · **Roles** A, SA · **Deps** F-RBAC-002, F-RBAC-007
- **Purpose:** Protect high-impact actions.
- **FR:** The `/admin` area is separated in routing and layout. Destructive actions (role changes, user deletion, flag changes in production, bulk notifications) require re-authentication within 5 min.
- **Errors:** Stale authentication returns 401 `STEP_UP_REQUIRED`.
- **Sec.:** Admin pages set `noindex` and stricter CSP. The admin API can be restricted to an IP allowlist (optional config).
- **AC:** Deleting a user without a recent step-up is blocked until the admin re-enters their password and TOTP.

### F-RBAC-007 — Admin TOTP 2FA
**Pri** S · **Ph** P2 · **Roles** A, SA (optional for U in a later phase) · **Deps** F-AUTH-002
- **Purpose:** Prevent admin account takeover.
- **FR:** Enrol an RFC 6238 TOTP with a QR code; 10 backup codes; reset by a Super Admin only, with an audit entry.
- **Valid.:** 6-digit code; ±1 step window; replay is blocked.
- **AC:** An admin login without a valid TOTP code is rejected.

---

## C. I18N — Bilingual Localization

### F-I18N-001 — Localization infrastructure
**Pri** M · **Ph** P2 · **Roles** all · **Deps** —
- **Purpose:** Full EN/BN support without hardcoded strings.
- **FR:** `packages/i18n` contains ICU message catalogs (`en.json`, `bn.json`) organized by namespace. They are used by the web app (next-intl), the API (emails, notifications, error messages), and the Android widget (generated `strings.xml`). Lint rules forbid string literals in JSX. CI fails on missing keys.
- **Behavior:** Locale-prefixed routes (`/en/...`, `/bn/...`) with negotiation from the user preference, then the cookie, then `Accept-Language`.
- **Errors:** A missing key falls back (F-I18N-009) and the missing key is reported.
- **AC:** The CI script reports 0 missing BN keys for a release build, and an ESLint rule blocks literal UI strings.

### F-I18N-002 — Language switcher
**Pri** M · **Ph** P2 · **Roles** G, U · **Deps** F-I18N-001
- **Purpose:** Switch language instantly.
- **FR:** A switcher in the header and settings, labelled "English / বাংলা" (each name in its own script). It keeps the current route and state.
- **AC:** Switching changes all visible strings without losing form input.

### F-I18N-003 — Persistent language preference
**Pri** M · **Ph** P2 · **Roles** G, U · **Deps** F-AUTH-010
- **Purpose:** Remember the choice everywhere.
- **FR:** Guests: stored in a cookie and localStorage. Users: saved in `user_preferences.locale` and used for emails, push, and the widget.
- **AC:** After logging in on a new device, the UI loads in the saved language.

### F-I18N-004 — Localized dates, times, numbers
**Pri** M · **Ph** P2 · **Roles** all · **Deps** F-AUTH-010
- **Purpose:** Culturally correct presentation.
- **FR:** Format with `Intl` using `bn-BD`/`en-GB`/`en-US` styles. Optional Bengali digits (০-৯). 12/24 h. Bengali month names. Hijri date shown alongside Gregorian when the Islamic module is on.
- **Valid.:** Inputs accept both Latin and Bengali digits and normalize to Latin before sending to the API.
- **AC:** In BN with Bengali digits, "12 May 2027" renders as "১২ মে ২০২৭", and numeric input "১২" is parsed as 12.

### F-I18N-005 — Bengali typography
**Pri** M · **Ph** P2 · **Roles** all · **Deps** design tokens
- **Purpose:** Readable Bengali.
- **FR:** Font stack Hind Siliguri / Noto Sans Bengali (self-hosted, subset, `font-display: swap`). Line-height ≥ 1.6 for BN. Correct rendering of conjuncts (যুক্তাক্ষর). No letter-spacing on BN text. Truncation avoids breaking a grapheme cluster.
- **AC:** Visual regression snapshots of key pages pass in BN, and no clipped glyphs appear at 200% zoom.

### F-I18N-006 — Localized notifications & emails
**Pri** M · **Ph** P6 · **Roles** U · **Deps** F-I18N-001, F-NOTIF-*
- **Purpose:** Messages arrive in the user's language.
- **FR:** The server renders templates in the recipient's locale. Push payloads are localized server-side. Email has a text and HTML version in each language.
- **AC:** A BN user receives the BN reminder text, while an EN user receives the EN version of the same reminder.

### F-I18N-007 — Localized validation & errors
**Pri** M · **Ph** P2 · **Roles** all · **Deps** F-I18N-001
- **Purpose:** Users understand what went wrong.
- **FR:** The API returns stable error `code`s and field `issues` codes; the client maps them to localized messages. Shared Zod schemas use message keys.
- **AC:** Every API error code has EN and BN messages (checked in CI).

### F-I18N-008 — Translatable admin-managed content
**Pri** M · **Ph** P3 · **Roles** A · **Deps** F-ADMIN-003/004
- **Purpose:** Library content in both languages.
- **FR:** `*_translations` tables per content type, with `(entity_id, locale)` unique. A publish check requires EN, and BN either present or explicitly marked "fallback allowed".
- **AC:** A deed without BN text shows its EN title with a subtle "English" label for BN users.

### F-I18N-009 — Fallback behavior
**Pri** M · **Ph** P2 · **Roles** all · **Deps** F-I18N-001
- **Purpose:** Never show raw keys.
- **FR:** Fallback order: BN → EN → key name (dev only). Missing keys are logged with a sampled telemetry event in production.
- **AC:** A removed BN key renders the EN text, never a raw key, in production builds.

---

## D. DEED — Good Deeds Management

### F-DEED-001 — Predefined good deed library
**Pri** M · **Ph** P3 · **Roles** G (sample), U, A (manage) · **Deps** F-DEED-002, F-I18N-008
- **Purpose:** Inspire users with ready-made ideas.
- **FR:** About 150 seed deeds across categories. Each has a title, description, estimated minutes, effort level, tags, life-balance category, an Islamic flag (hidden when the module is off), and EN/BN text.
- **Behavior:** Only `published` deeds are visible. Archived deeds stay attached to existing plans and history.
- **Errors:** A published deed that is later archived shows in history with an "archived" tag.
- **Sec.:** Admin-only writes; content is versioned (F-ADMIN-011).
- **AC:** Users can browse published deeds in their language, and archived deeds never appear in discovery.

### F-DEED-002 — Categories
**Pri** M · **Ph** P3 · **Roles** U, A · **Deps** F-I18N-008
- **Purpose:** Organize deeds.
- **FR:** Hierarchical categories, at most 2 levels (for example Family › Parents). Each has an icon, a color token, a sort order, and EN/BN names. Users can filter by category. Custom deeds use system categories or "Personal".
- **Valid.:** The slug is unique; the color must be a design token.
- **AC:** A category with deeds cannot be hard-deleted, only archived.

### F-DEED-003 — Custom deeds
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-DEED-002
- **Purpose:** Personalization.
- **FR:** Create, edit, and archive private deeds with a title, optional description, category, estimated minutes, and life-balance category.
- **Valid.:** Title 1–120 characters; description ≤ 1000; at most 300 active custom deeds per user.
- **Errors:** Over the limit returns 422 with a localized message.
- **Sec.:** Private to the owner; the content is never used in recommendations for other users.
- **AC:** A custom deed is visible only to its creator and can be added to the checklist immediately.

### F-DEED-004 — Daily checklist
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-DEED-005, F-CAL-010
- **Purpose:** The daily home screen.
- **FR:** Shows today's due items (deed plans, optionally planner items and Islamic items). One-tap complete or uncomplete; status options (F-DEED-009); progress ring; reorder; add an ad-hoc deed for today only.
- **Behavior:** Computed for the user's `local_date`. Optimistic UI. Works offline from P9.
- **Errors:** A failed save rolls back with a toast and retry.
- **AC:** Completing an item updates progress within 100 ms (optimistic) and persists one `deed_completions` row per (plan, local_date).

### F-DEED-005 — Recurring deeds
**Pri** M · **Ph** P3 · **Roles** U · **Deps** `packages/domain` recurrence engine
- **Purpose:** Turn deeds into habits.
- **FR:** Frequencies: once, daily, specific weekdays, every N days, weekly with a count (e.g. 3×/week), monthly on day N or the last day. Start and end dates; pause and resume.
- **Behavior:** Occurrences are computed, not materialized; completions reference the plan and the local_date. Editing a schedule affects future days only.
- **Valid.:** Interval 1–365; the end date is on or after the start date; at most 100 active plans per user.
- **Errors:** An invalid rule returns 422 with the field.
- **AC:** A Mon/Wed/Fri plan appears only on those local days across DST changes, and "last day of month" works in February.

### F-DEED-006 — Favorite deeds
**Pri** S · **Ph** P3 · **Roles** U · **Deps** F-DEED-001/003
- **Purpose:** Quick access.
- **FR:** Toggle a favorite on any visible deed; filter by favorites; quick-add from favorites.
- **AC:** A favorite persists across devices; favoriting an archived deed is not allowed.

### F-DEED-007 — Activity history
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-DEED-004
- **Purpose:** Reflection and proof of progress.
- **FR:** A reverse-chronological list grouped by local date, with filters for category, deed, status, and date range. Cursor pagination.
- **AC:** History shows exactly the completions in the range, in the user's time zone.

### F-DEED-008 — Notes on completions
**Pri** S · **Ph** P3 · **Roles** U · **Deps** F-DEED-004
- **Purpose:** Capture context ("Helped neighbor carry groceries").
- **FR:** An optional note of up to 500 characters per completion; editable within the past-day window.
- **Sec.:** Private; treated as personal content and excluded from analytics.
- **AC:** A note saved offline syncs later without loss (P9).

### F-DEED-009 — Completion status
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-DEED-004
- **Purpose:** Honest, gentle tracking.
- **FR:** Statuses: `done`, `partial` and `skipped` (with a reason). Which statuses keep, extend or break a streak, the partial threshold and the neutral-skip cap are defined only in [SRS §7.5.1](../specifications/SRS.md).
- **AC:** A skipped-with-reason day is neutral in streak calculation according to the documented rule.

### F-DEED-010 — Evidence attachments
**Pri** C · **Ph** P3 · **Roles** U · **Deps** object storage
- **Purpose:** Optional personal memory (a photo of a planted tree).
- **FR:** Up to 3 images per completion, each ≤ 5 MB; private by default; can be attached to a shared story (F-COMM-009) only through an explicit action.
- **Valid.:** MIME is sniffed server-side (JPEG/PNG/WebP/HEIC → converted); EXIF/GPS stripped; malware scan hook.
- **Sec.:** Signed upload URLs; private bucket; signed download URLs with a 5-minute TTL.
- **AC:** An uploaded image has its GPS EXIF removed, and another user cannot fetch it.

### F-DEED-011 — Good deed discovery
**Pri** S · **Ph** P3 · **Roles** G, U · **Deps** F-DEED-001
- **Purpose:** Find new ideas.
- **FR:** Search (EN/BN full text, diacritic- and case-insensitive), filters (category, duration, effort, life-balance category), and sorting.
- **AC:** Searching "বাবা" returns parent-related deeds in BN.

### F-DEED-012 — Random good deed generator
**Pri** S · **Ph** P3 · **Roles** G, U · **Deps** F-DEED-001
- **Purpose:** Delight and spontaneity.
- **FR:** "Surprise me" picks a published deed, optionally filtered by category or duration. Avoids repeating the last 10 picks. Excludes Islamic deeds when the module is off.
- **AC:** 20 consecutive picks contain no repeat within any window of 10 (when the pool is ≥ 11).

### F-DEED-013 — Five-minute good deeds
**Pri** S · **Ph** P3 · **Roles** G, U · **Deps** F-DEED-001
- **Purpose:** A low barrier to start.
- **FR:** A curated collection with `estimated_minutes ≤ 5`, featured on an empty checklist and on the dashboard.
- **AC:** The collection shows only deeds with ≤ 5 minutes.

### F-DEED-014 — Category-based recommendations
**Pri** S · **Ph** P3 · **Roles** U · **Deps** F-DEED-001, F-GROW-009
- **Purpose:** Balanced growth without AI.
- **FR:** A rule-based engine recommends deeds from under-represented life-balance categories in the last 14 days, plus favorites-adjacent categories. Shows why ("You haven't done much for Environment lately"). Gentle framing.
- **AC:** Recommendations never include deeds already planned for today, and every recommendation carries an explanation key.

---

## E. CAL — Calendar & Habit Tracking

### F-CAL-001 — Daily calendar view
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-DEED-004
- **Purpose:** Inspect any single day.
- **FR:** Navigate by day; shows completions, statuses, notes, and (when enabled) salah and planner items for the selected day.
- **AC:** Past days within the edit window are editable; older days are read-only.

### F-CAL-002 — Weekly view
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-CAL-001
- **Purpose:** Weekly rhythm.
- **FR:** 7 columns, starting on the user's week-start day, with a completion-rate bar per day and per-plan rows.
- **AC:** The week boundary respects the week-start preference.

### F-CAL-003 — Monthly view
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-CAL-001
- **Purpose:** Monthly overview.
- **FR:** Month grid with completion-rate shading and optional Hijri dates; tap a day to open the daily view.
- **AC:** Shading levels follow documented thresholds (0, 1–33, 34–66, 67–99, 100%).

### F-CAL-004 — Yearly history
**Pri** S · **Ph** P3 · **Roles** U · **Deps** F-CAL-005
- **Purpose:** Long-term perspective.
- **FR:** Year selector; monthly totals; best months; navigation back to the account's creation.
- **AC:** The yearly totals equal the sum of the monthly totals.

### F-CAL-005 — Activity heatmap
**Pri** S · **Ph** P3 · **Roles** U · **Deps** aggregates
- **Purpose:** Visual consistency.
- **FR:** 53×7 grid; accessible alternative (table plus summary text); colorblind-safe sequential palette.
- **AC:** The screen reader announces the "date: N deeds" label, and the heatmap meets 3:1 contrast against the background for non-empty cells.

### F-CAL-006 — Daily completion rate
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-DEED-004
- **Purpose:** Simple progress signal.
- **FR:** rate = done (partial counts as its fraction) ÷ due items, excluding skipped-with-reason items. Shown as a ring.
- **AC:** 3 of 4 due items done, plus 1 skipped with a reason, gives 100%.

### F-CAL-007 — Streak tracking
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-CAL-010, F-DEED-009
- **Purpose:** Motivation through consistency.
- **FR:** Per-plan streak (consecutive due occurrences completed) and an overall streak (days with at least 1 completion, configurable). Computed from completions; the `streaks` cache can be rebuilt.
- **Behavior:** Non-due days do not break per-plan streaks. Rest days / skip-with-reason are neutral, within the allowance.
- **AC:** Rebuilding streaks from raw completions reproduces the cached values exactly (property-based test).

### F-CAL-008 — Longest streak
**Pri** M · **Ph** P3 · **Roles** U · **Deps** F-CAL-007
- **FR:** Store and display the longest streak with its date range.
- **AC:** Backfilling a past day that bridges two streaks updates the longest streak.

### F-CAL-009 — Streak milestones
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-CAL-007, F-GAME-002
- **FR:** Milestones at 3, 7, 21, 40, 100, and 365 days award a badge and a positive message. A lost streak triggers a "fresh start" message, never a shaming one.
- **AC:** Reaching 7 days triggers exactly one milestone award per plan.

### F-CAL-010 — Timezone-aware daily boundaries
**Pri** M · **Ph** P3 · **Roles** system · **Deps** F-AUTH-010
- **Purpose:** Correct "today" for every user.
- **FR:** Each completion stores `local_date` (date) and `occurred_at` (timestamptz), plus the `tz` at the time of the event. "Today" = now in the user's current time zone. A time-zone change does not rewrite history.
- **Errors:** A client clock skewed by more than 1 day from the server is rejected with `CLOCK_SKEW`.
- **AC:** A user in UTC+6 completing at 00:30 local time logs to that local date. Travelling across the date line never yields two "todays" for one plan.

### F-CAL-011 — Past-day editing
**Pri** S · **Ph** P3 · **Roles** U · **Deps** F-CAL-010
- **FR:** Edit or backfill completions within N days (default 7, admin-configurable 0–30). Backfilled entries are flagged `backfilled=true`.
- **AC:** Editing day N+1 back returns 422 `LOCAL_DATE_OUT_OF_RANGE` (window per SRS FR-CAL-011-01).

---

## F. GROW — Personal Growth
> Guardrail: growth analytics describe habit patterns. They never judge a person's worth or piety.

### F-GROW-001 — Personal goals
**Pri** M · **Ph** P4 · **Roles** U · **Deps** F-DEED-005
- **Purpose:** Connect daily actions to meaningful outcomes.
- **FR:** Create, edit, and delete goals with a title, a "why" statement, a life-balance category, a target type (count, boolean, or linked-plan completion rate), a target value, start and due dates, and a status (active, paused, completed, archived). Plans can be linked to a goal so progress is computed automatically.
- **Valid.:** Title 1–120 characters. Due date on or after the start date. At most 50 active goals.
- **Errors:** If a linked plan is deleted, the goal shows a warning.
- **Sec.:** Private.
- **AC:** Completing linked deeds updates goal progress without manual input.

### F-GROW-002 — Weekly & monthly goals
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-001
- **FR:** Goal templates scoped to a week or a month that reset automatically. At the end of the period, the user is optionally prompted to carry the goal over.
- **AC:** A weekly goal created on Wednesday covers the current week, according to the user's week-start setting.

### F-GROW-003 — Goal milestones
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-001
- **FR:** Up to 20 ordered milestones, each with a due date and a done flag. The user chooses whether progress is measured as milestones done divided by the total, or as the computed target.
- **AC:** Reordering milestones keeps each milestone's done state.

### F-GROW-004 — Personal growth timeline
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-001, F-GAME-001, F-JRNL-001
- **FR:** A chronological feed of the user's own milestones: goals achieved, badges, streak records, and journal highlights the user has pinned.
- **Sec.:** Visible to the owner only.
- **AC:** The timeline never includes journal text unless the user pinned that entry.

### F-GROW-005 — Consistency analysis
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-CAL-007
- **FR:** For each plan, consistency over 7, 30, and 90 days (completed divided by due), the best weekday, and a trend arrow.
- **AC:** Values match a reference SQL query in integration tests.

### F-GROW-006 — Weak habit identification
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-005
- **FR:** Flags a plan when its consistency is below 40% over 30 days and it had at least 8 due occurrences. Suggests adjustments: reduce the frequency, change the time, or pair it with an existing habit.
- **Behavior:** Supportive copy, for example "This habit might need a smaller step".
- **AC:** No flag is shown for plans younger than 14 days.

### F-GROW-007 — Rule-based growth insights
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-005, F-GROW-009
- **FR:** A weekly job produces up to 3 insights from templates, for example "You were most consistent on Fridays" or "Family deeds rose 20%". No AI is needed. Insights are stored in `ai_insights` with `source=rules`.
- **AC:** Each insight records its data window and template key. A dismissed insight is not generated again for the same window.

### F-GROW-008 — Monthly reflection
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-JRNL-001, F-RPT-001
- **FR:** At the end of each month, a guided prompt shows a stats recap and 3 reflective questions. The answers are saved as a journal entry of type `reflection`.
- **AC:** The prompt is available from the first local day of the next month. Dismissing it once hides it for that month.

### F-GROW-009 — Life balance tracker
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-DEED-001
- **FR:** Eight categories: Spiritual Growth, Family & Relationships, Health & Fitness, Knowledge & Learning, Social Responsibility, Personal Discipline, Environmental Responsibility, and Emotional Wellbeing. A radar chart combines the share of completions in each category with an optional monthly self-rating from 1 to 10.
- **Behavior:** When the Islamic module is off, the "Spiritual Growth" label becomes "Inner Growth / Reflection".
- **AC:** The radar chart has an accessible table alternative. The self-rating is optional.

---

## G. JRNL — Journal & Reflection
> All journal content is **private by default**. It is encrypted at the application level (AES-256-GCM with a single versioned application key, FR-JRNL-007-02). It is never used in product analytics. It is sent to AI only with explicit opt-in for that specific feature.

### F-JRNL-001 — Daily journal
**Pri** M · **Ph** P4 · **Roles** U · **Deps** F-JRNL-007
- **FR:** Limited Markdown (bold, italic, lists, links), an optional mood on a 5-point emoji scale, tags, and a local date. Drafts are autosaved on the device every 5 seconds.
- **Valid.:** Body up to 20,000 characters. Up to 10 tags.
- **Errors:** If two devices edit the same entry, the later save wins and the earlier version is kept as a local conflict copy.
- **AC:** A draft survives closing and reopening the tab.

### F-JRNL-002 — Morning intention
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-JRNL-001, F-PLAN-002
- **FR:** A short entry of type `intention`, up to 280 characters, shown on that day's dashboard.
- **AC:** There is one intention per local date. Editing replaces it.

### F-JRNL-003 — Evening reflection
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-JRNL-001, F-PLAN-003
- **FR:** Guided questions (what went well, what I learned, what I will improve), saved as type `reflection`.
- **AC:** Prompts are localized, and the entry links to that day's completion summary.

### F-JRNL-004 — Gratitude journal
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-JRNL-001
- **FR:** One to three gratitude items per entry, saved as type `gratitude`, with a gratitude streak that never shames.
- **AC:** Each item is at most 280 characters.

### F-JRNL-005 — Future-self letters
**Pri** C · **Ph** P4 · **Roles** U · **Deps** F-JRNL-001, F-NOTIF-005
- **FR:** A letter with a delivery date between 1 month and 10 years ahead. The letter stays sealed until then unless the user chooses to open it early. Delivery is by in-app notification and email.
- **AC:** The letter is delivered on its local delivery date. Deleting the account deletes undelivered letters.

### F-JRNL-006 — Personal learning notes
**Pri** C · **Ph** P4 · **Roles** U · **Deps** F-JRNL-001
- **FR:** Entries of type `learning_note` with a source (book, lecture, or URL) and tags.
- **AC:** Notes can be filtered by source.

### F-JRNL-007 — Private journal history & encryption
**Pri** M · **Ph** P4 · **Roles** U · **Deps** key management
- **FR:** The title and body are envelope-encrypted. Admins have no UI or API access to journal content.
- **Sec.:** Admin endpoints never return journal fields, logs redact them, and backups contain only ciphertext.
- **AC:** Reading `body_ciphertext` directly from the database does not reveal plaintext. The admin user detail view contains no journal data.

### F-JRNL-008 — Journal search & filtering
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-JRNL-007
- **FR:** Filters for type, date range, tag, and mood. Keyword search decrypts only the requesting user's entries, in memory and for that request (bounded to 5,000 entries), or runs on the client over cached entries. No plaintext index is ever stored.
- **AC:** Search returns only the requester's entries. p95 latency is under 1.5 seconds for 2,000 entries.

### F-JRNL-009 — Journal export
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-JRNL-007
- **FR:** Export as Markdown (zip) or JSON. Runs as an async job and produces a signed link valid for 24 hours.
- **Sec.:** Requires re-authentication.
- **AC:** The export contains the same number of entries as the database.

### F-JRNL-010 — AI-assisted summaries
**Pri** C · **Ph** P8 · **Roles** U · **Deps** F-AI-001, F-AI-002
- **FR:** An opt-in summary of a week or month of entries. The user first sees a preview of exactly the text that will be sent. The result is stored encrypted.
- **Sec.:** Needs its own journal-AI consent. Names are removed heuristically before sending. The provider is used with no retention.
- **AC:** Without consent, the request returns 403 `AI_CONSENT_REQUIRED`.

---

## H. PLAN — Daily Planning

### F-PLAN-001 — Daily planner
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-DEED-004
- **FR:** Planner items with a title, a priority, an optional time block and duration, an optional link to a deed or goal, and a status. Shown alongside the checklist.
- **Valid.:** Title 1–200 characters. At most 100 items per day.
- **AC:** Planner items appear in the daily calendar view.

### F-PLAN-002 — Morning planning flow
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-PLAN-001, F-JRNL-002
- **FR:** Three steps: set an intention, pick the top 3, then review the checklist. Can be opened from a reminder.
- **AC:** The flow can be finished in under 60 seconds, and every step can be skipped.

### F-PLAN-003 — Evening review flow
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-PLAN-001, F-JRNL-003
- **FR:** Review today's items, move unfinished ones to tomorrow, and write a reflection.
- **AC:** "Move to tomorrow" sets the item's date to the next local date.

### F-PLAN-004 — Task prioritization
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-PLAN-001
- **FR:** Priority levels: top 3, high, normal, low. Items can be reordered by drag and drop, with a keyboard alternative.
- **AC:** No more than 3 items can be marked "top 3" on a day.

### F-PLAN-005 — Time-based activities
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-PLAN-001
- **FR:** Optional start time and duration, a timeline view, and an optional time-block reminder (F-NOTIF-003).
- **AC:** Overlapping blocks are allowed but show a warning.

### F-PLAN-006 — Recurring planner activities
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-DEED-005
- **FR:** Reuses the shared recurrence engine.
- **AC:** Planner items pass the same recurrence test suite as deed plans.

### F-PLAN-007 — Weekly planning
**Pri** C · **Ph** P4 · **Roles** U · **Deps** F-PLAN-001, F-GROW-002
- **FR:** A week board for spreading tasks across days and setting weekly goals.
- **AC:** Dragging a task to another day updates its local date.

### F-PLAN-008 — External calendar integration
**Pri** C · **Ph** P10 · **Roles** U · **Deps** F-INTG-003
- **FR:** Planner time blocks appear in Google Calendar.
- **AC:** Covered by the acceptance criteria of F-INTG-003.

---

## I. ISL — Islamic Lifestyle
> Guardrails: every content item cites a source. Prayer times always show the calculation method used. The app never claims that worship is accepted, never generates rulings with AI, keeps worship data private, and never ranks it. The whole module can be switched off (F-ISL-017).

### F-ISL-001 — Salah tracker
**Pri** M · **Ph** P5 · **Roles** U · **Deps** F-ISL-002, F-CAL-010
- **FR:** For each local day and each of the five fard prayers, a status: on time, late, qada, missed, or excused (menstruation, illness, travel; shown neutrally). Optional jamaah and mosque/home flags, plus optional sunnah, witr, and duha tracking.
- **Behavior:** Quick logging from the dashboard and the widget. A prayer can be logged once its window has begun. Stats are private.
- **Valid.:** One record per user, local date, and prayer.
- **Errors:** Logging a prayer before its time returns `PRAYER_NOT_YET_DUE`.
- **Sec.:** Private. Never shared and never included in analytics.
- **AC:** Each fard prayer can be logged once a day. "Excused" is neutral in all stats and in all copy.

### F-ISL-002 — Prayer times
**Pri** M · **Ph** P5 · **Roles** U · **Deps** `adhan` library
- **FR:** Computed on both the client and the server from: location (city search, or geolocation with consent), calculation method (MWL, ISNA, Egypt, Umm al-Qura, Karachi, Dubai, Kuwait, Qatar, Singapore, Turkey, Tehran, Moonsighting Committee), Asr madhab (standard or Hanafi), high-latitude rule, and per-prayer offsets.
- **Behavior:** Works offline. A disclaimer advises following the local mosque.
- **Valid.:** Latitude and longitude within valid ranges. Offsets within ±30 minutes.
- **Errors:** If geolocation is denied, the app falls back to city search.
- **Sec.:** Location is stored rounded to 2 decimal places.
- **AC:** Results for the reference fixtures (Dhaka, London, Makkah) are within ±1 minute for every method.

### F-ISL-003 — Quran reading tracker
**Pri** M · **Ph** P5 · **Roles** U · **Deps** F-ISL-018
- **FR:** Log reading by surah and ayah range, by page (604-page Madani mushaf), or by juz. Shows totals and the last read position. A reader view shows the Arabic text with EN/BN translations from the Quran.com API, cached and attributed.
- **Valid.:** Ayah ranges are checked against the length of the surah.
- **Errors:** If the external API is down, the tracker still works using local metadata, and the reader shows an offline notice.
- **AC:** Logging surah 2, ayahs 1–20, adds 20 ayahs and updates the last read position.

### F-ISL-004 — Quran memorization tracker
**Pri** S · **Ph** P5 · **Roles** U · **Deps** F-ISL-003
- **FR:** For each surah or range, a status: learning, memorized, or needs revision. Revision (murajaah) is scheduled with a simple spaced-repetition algorithm.
- **AC:** Revisions that are due appear on the checklist.

### F-ISL-005 — Khatam planner
**Pri** S · **Ph** P5 · **Roles** U · **Deps** F-ISL-003
- **FR:** The user sets a target date or a daily amount. The planner computes daily pages and rebalances when the user falls behind or gets ahead. Progress comes from reading logs.
- **AC:** A 30-day plan works out to about 20 pages a day and rebalances after a missed day.

### F-ISL-006 — Daily dhikr
**Pri** S · **Ph** P5 · **Roles** U, A · **Deps** F-ISL-008, F-ISL-018
- **FR:** Morning and evening adhkar presets, each with a source, plus custom dhikr with targets.
- **AC:** Every preset shows its reference. Completions are written to `dhikr_logs`.

### F-ISL-007 — Tasbih counter
**Pri** S · **Ph** P5 · **Roles** G, U · **Deps** —
- **FR:** A large tap target with haptic feedback where supported. Target counts of 33, 99, 100, or custom. Several counters. Reset asks for confirmation. Works fully offline.
- **AC:** 1,000 rapid taps are all counted. The count survives a reload while offline.

### F-ISL-008 — Dua collection
**Pri** S · **Ph** P5 · **Roles** G, U, A · **Deps** F-ISL-018, F-ADMIN-005
- **FR:** Each dua has Arabic text, a transliteration, EN and BN meanings, a source reference, and a grade where one exists. Users can favorite duas.
- **Valid.:** A dua cannot be published without a source and a reviewer's verification.
- **AC:** Every published dua shows its reference.

### F-ISL-009 — Sunnah tracker
**Pri** S · **Ph** P5 · **Roles** U · **Deps** F-ISL-018
- **FR:** A curated list of sourced practices. The user picks which to track, and completions are stored in `practice_logs`.
- **AC:** Only the practices the user picked appear.

### F-ISL-010 — Tahajjud tracker
**Pri** S · **Ph** P5 · **Roles** U · **Deps** F-ISL-009, F-ISL-002
- **FR:** A tahajjud logged after midnight is attributed to the preceding night. The user can see and edit that attribution. Optional reminder for the last third of the night.
- **AC:** A tahajjud logged at 03:30 shows under the correct night.

### F-ISL-011 — Fasting tracker
**Pri** S · **Ph** P5 · **Roles** U · **Deps** F-ISL-013
- **FR:** Fast types: Ramadan, qada, Monday/Thursday, Ayyam al-Bid, Arafah, Ashura, and voluntary. Keeps a qada balance and supports an excused status.
- **AC:** Logging a qada fast lowers the qada balance by one.

### F-ISL-012 — Ramadan planner
**Pri** S · **Ph** P5 · **Roles** U · **Deps** F-ISL-005, F-ISL-011, F-ISL-013
- **FR:** Suhoor and iftar times, a fasting log, a khatam plan, goals for the last ten nights, charity reminders, and daily duas.
- **Behavior:** Available from 15 Sha'ban to the end of Shawwal in the user's adjusted Hijri calendar.
- **AC:** Iftar equals Maghrib under the user's chosen calculation method.

### F-ISL-013 — Hijri calendar
**Pri** M · **Ph** P5 · **Roles** G, U · **Deps** —
- **FR:** Umm al-Qura conversion through `Intl`, with a user offset from −2 to +2 days. Shown together with the Gregorian date, with key Islamic dates marked.
- **AC:** Matches the reference conversion fixtures, and the user offset is applied everywhere.
- **Limitation:** Moon sighting differs by country. The user offset is the mitigation.

### F-ISL-014 — Zakat calculator
**Pri** S · **Ph** P5 · **Roles** G, U · **Deps** F-ISL-018
- **FR:** Inputs: cash, gold and silver, investments, inventory, receivables, and liabilities. Nisab is based on gold (87.48 g) or silver (612.36 g). Metal prices are entered manually. Zakat is 2.5% when the total is at or above nisab. Results can be saved, and a disclaimer is shown.
- **Valid.:** Amounts must be ≥ 0 and use a supported currency.
- **Sec.:** Inputs are stored only if the user saves the calculation.
- **AC:** Below nisab, no zakat is due. Results match the worked-example fixtures.

### F-ISL-015 — Islamic learning hub
**Pri** C · **Ph** P5 · **Roles** G, U, A · **Deps** F-ADMIN-005
- **FR:** Sourced EN/BN articles and lesson series, verified by a reviewer.
- **AC:** Only verified content can be published.

### F-ISL-016 — Hadith of the Day
**Pri** S · **Ph** P5 · **Roles** G, U · **Deps** F-ISL-018
- **FR:** A hadith from the curated set with its collection, number, grade, Arabic text, and EN/BN translations. The rotation is deterministic for each date.
- **AC:** Only hadith with a grade and a source are eligible.

### F-ISL-017 — Religious preferences & module opt-out
**Pri** M · **Ph** P5 · **Roles** U · **Deps** F-AUTH-010
- **FR:** Settings for calculation method, madhab, Hijri offset, location, which trackers are visible, and a **switch to turn the whole module off**. Turning it off hides all Islamic navigation, widgets, notifications, recommendations, and checklist items. Existing data is kept.
- **AC:** With the module off, no Islamic UI and no Islamic notification appears anywhere, including the widget.

### F-ISL-018 — Content source verification & references
**Pri** M · **Ph** P5 · **Roles** A · **Deps** F-ADMIN-005
- **FR:** A source registry recording book, edition, URL, and license. Content moves through draft, in review, verified, and published; the reviewer must be a different person from the author. Quran content from the Quran.com API is cached and attributed.
- **AC:** Trying to publish without a source or a verification is rejected.

---

## N. NOTIF — Notifications
> Guardrail: gentle and never shaming. Quiet hours are respected, and every notification type can be turned off.

### F-NOTIF-001 — In-app notifications center
**Pri** M · **Ph** P6 · **Roles** U · **Deps** —
- **FR:** A list with an unread badge, "mark read" and "mark all read", deep links, and 90-day retention. Updates through 60-second polling or SSE.
- **AC:** The unread badge equals the number of unread rows.

### F-NOTIF-002 — Daily reminders
**Pri** M · **Ph** P6 · **Roles** U · **Deps** F-NOTIF-009
- **FR:** A daily reminder at a configurable time, sent on the channels the user chose.
- **Behavior:** Scheduled in the user's time zone. The job is idempotent per user, local date, and reminder type.
- **AC:** Each reminder is sent once, within ±2 minutes of its local time.

### F-NOTIF-003 — Custom reminder schedules
**Pri** S · **Ph** P6 · **Roles** U · **Deps** F-NOTIF-002, F-DEED-005
- **FR:** Reminders per plan or per planner item, with a time and a repeat rule. Up to 20 per user.
- **AC:** A reminder for a paused plan does not fire.

### F-NOTIF-004 — Incomplete task reminders
**Pri** S · **Ph** P6 · **Roles** U · **Deps** F-NOTIF-002
- **FR:** An optional encouraging nudge in the evening when items remain.
- **AC:** No nudge is sent when every item is complete.

### F-NOTIF-005 — Email notifications
**Pri** M · **Ph** P2/P6 · **Roles** U · **Deps** F-INTG-001
- **FR:** Transactional emails from P2. Digests from P6. Every non-transactional email has a one-click unsubscribe.
- **Sec.:** SPF, DKIM, and DMARC are configured. Unsubscribe links are signed.
- **AC:** Unsubscribing works without logging in.

### F-NOTIF-006 — Web Push
**Pri** S · **Ph** P6 · **Roles** U · **Deps** F-INTG-002, F-PWA-001
- **FR:** Permission is requested only after the user takes a related action. Subscriptions are stored per device. A 410 response deletes the subscription.
- **Limitation:** On iOS, push works only for an installed PWA on 16.4 or later. In-app browsers have no push support. The fallbacks are in-app notifications and email.
- **AC:** After a denial, the app never prompts again on its own. A 410 response prunes the subscription.

### F-NOTIF-007 — Challenge notifications
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-COMM-003
- **FR:** Notifications for challenge start, ending soon, completion, and invitations. At most 2 per challenge per day.
- **AC:** The daily cap is enforced.

### F-NOTIF-008 — Quiet hours
**Pri** S · **Ph** P6 · **Roles** U · **Deps** F-NOTIF-002
- **FR:** Defaults to 22:00–07:00. Depending on type, a notification is deferred or dropped. Prayer reminders can optionally be exempt.
- **AC:** A deferred reminder is delivered when quiet hours end.

### F-NOTIF-009 — Notification preferences
**Pri** M · **Ph** P6 · **Roles** U · **Deps** —
- **FR:** A matrix of notification type × channel, plus a global pause.
- **AC:** Turning a type off takes effect within 1 minute.

### F-NOTIF-010 — Prayer time reminders
**Pri** S · **Ph** P6 · **Roles** U · **Deps** F-ISL-002, F-NOTIF-006
- **FR:** Optional reminders at each prayer time or a number of minutes before it, set per prayer. Scheduled on the server up to 48 hours ahead.
- **Limitation:** The operating system may delay or batch push notifications.
- **AC:** An offset of −10 minutes schedules the reminder 10 minutes before Asr.

---

## J. COMM — Family & Community
> Guardrails: nothing is shared automatically. Worship records and journals can never be shared to a feed. Moderation (F-COMM-012/013) must be live before any public user-generated content is enabled.

### F-COMM-001 — Family groups
**Pri** S · **Ph** P7 · **Roles** U · **Deps** F-COMM-014
- **FR:** Groups have `type=family` and up to 20 members. Roles are owner, guardian, and member. A user can belong to at most 3 families.
- **Sec.:** Members see only what other members have explicitly shared. Anyone outside the family gets 404.
- **AC:** A non-member receives 404 for every resource of the family.

### F-COMM-002 — Member invitations
**Pri** S · **Ph** P7 · **Roles** U (owner/guardian) · **Deps** F-COMM-001
- **FR:** Invitations can be sent by email, link, or an 8-character code. They expire after 7 days and can be revoked. Email invitations are single-use; link invitations are capped.
- **Errors:** Expired (410), revoked (410), or group full (409).
- **Sec.:** Codes are random and rate-limited.
- **AC:** A revoked invitation returns `INVITATION_REVOKED`.

### F-COMM-003 — Family challenges
**Pri** S · **Ph** P7 · **Roles** U · **Deps** F-COMM-001, F-DEED-001
- **FR:** A challenge has a set of deeds, a duration, and a collective target. Members opt in individually, and progress is shown collectively.
- **Behavior:** There is no individual leaderboard. Per-member counts are shown only when every participant has opted in.
- **AC:** Collective progress equals the sum of the qualifying completions of members who opted in.

### F-COMM-004 — Shared family calendar
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-COMM-001
- **FR:** Family events plus challenge days.
- **AC:** Personal items never appear on the family calendar.

### F-COMM-005 — Family achievements
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-COMM-003, F-GAME-001
- **FR:** Collective badges earned by completing challenges.
- **AC:** Each badge is awarded once per challenge.

### F-COMM-006 — Community groups
**Pri** C · **Ph** P7 · **Roles** U, A · **Deps** F-COMM-012, F-COMM-013
- **FR:** Public or private groups with `type=community`, group moderators, written rules, and join requests.
- **AC:** Posts in a private group are invisible to non-members.

### F-COMM-007 — Community campaigns
**Pri** S · **Ph** P7 · **Roles** G (view), U (join), A (manage) · **Deps** F-ADMIN-006, F-INTG-006
- **FR:** Campaigns have EN/BN content, dates, an optional location, a goal, participation logging, and an aggregate counter.
- **AC:** Joining twice has no extra effect. The counter catches up within 1 minute.

### F-COMM-008 — Volunteer opportunities
**Pri** C · **Ph** P7 · **Roles** G, U, A · **Deps** F-ADMIN-006
- **FR:** Listings show the organizer, date, location, and capacity. Users can register interest.
- **Sec.:** Organizer contact details are shown only to verified users who registered interest.
- **AC:** Capacity is enforced.

### F-COMM-009 — Kindness stories
**Pri** S · **Ph** P7 · **Roles** U (post), G (read public) · **Deps** F-COMM-012, F-COMM-013, F-COMM-014
- **FR:** Posts of up to 2,000 characters with an optional image, visible to the public, a group, or the family. Others can react and comment.
- **Behavior:** Posts from accounts younger than 7 days go to pre-moderation. EN/BN spam and profanity filters apply.
- **AC:** A post shared with the family is invisible outside the family.

### F-COMM-010 — Anonymous sharing
**Pri** S · **Ph** P7 · **Roles** U · **Deps** F-COMM-009
- **FR:** Posts can be anonymous. The author is stored but never exposed to non-moderators.
- **Sec.:** Seeing who wrote an anonymous post requires the `community.deanonymize` permission, and every lookup is written to the audit log.
- **AC:** The public response contains no author fields.

### F-COMM-011 — Community recognition
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-COMM-009
- **FR:** "Appreciate" reactions and stories featured by admins. There are no rankings.
- **AC:** There is no leaderboard endpoint.

### F-COMM-012 — Moderation queue & actions
**Pri** M (gate) · **Ph** P7 · **Roles** A (`moderation.act`) · **Deps** F-COMM-013, F-RBAC-005
- **FR:** A queue of reported and pre-moderated content. Moderators can approve, hide, remove, warn, suspend posting (temporarily or permanently), or escalate. Every action needs a reason code, and users can appeal.
- **AC:** Each action creates a moderation record and an audit entry. Hidden content leaves the feed within 1 minute.

### F-COMM-013 — Reporting & blocking
**Pri** M (gate) · **Ph** P7 · **Roles** U · **Deps** —
- **FR:** Users can report posts, comments, users, or groups, giving a reason. Blocking another user hides content in both directions and stops invitations and comments between them.
- **Valid.:** A user can have only one open report per target.
- **AC:** A blocked user cannot comment on the blocker's content or invite the blocker.

### F-COMM-014 — Privacy controls
**Pri** M · **Ph** P7 · **Roles** U · **Deps** —
- **FR:** Everything is private by default. Each item is shared explicitly, with a choice of visibility. Profile visibility can be set separately. Worship and journal data can never be shared.
- **AC:** No API returns another user's unshared data.

---

## M. WELL — Digital Wellbeing
> Limitation: the web app **cannot read device usage**. All entries are self-reported, and the app never implies that it monitors anything.

### F-WELL-001 — Screen-time awareness journal
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-JRNL-001
- **FR:** A daily self-reported estimate of screen time plus a reflection, labelled "self-reported".
- **AC:** No copy claims automatic tracking.

### F-WELL-002 — Social media usage goals
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-GROW-001
- **FR:** A goal template, for example "60 minutes a day or less", with manual check-ins.
- **AC:** Check-ins update the goal's progress.

### F-WELL-003 — Avoid-bad-habits tracker
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-CAL-007
- **FR:** Counts the days since a habit was last done. A slip is recorded privately, the counter restarts, the previous best is kept, and the copy stays supportive.
- **AC:** Recording a slip resets the counter and keeps the previous best.

### F-WELL-004 — Procrastination tracker
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-PLAN-001
- **FR:** Counts how often each task is postponed and shows patterns.
- **AC:** Moving a task to tomorrow increases its postpone count by one.

### F-WELL-005 — Anger management reflection
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-JRNL-001
- **FR:** A guided template (trigger, response, alternative) with sourced tips. It is not clinical and shows a disclaimer plus links to help services.
- **AC:** The disclaimer is shown before first use.

### F-WELL-006 — Digital detox challenges
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-GAME-005
- **FR:** Predefined self-challenges with self check-ins.
- **AC:** Progress comes from check-ins only.

### F-WELL-007 — Positive affirmations
**Pri** S · **Ph** P4 · **Roles** G, U, A · **Deps** F-I18N-008
- **FR:** A curated EN/BN set with a daily rotation. Users can favorite affirmations and add their own.
- **AC:** Everyone sees the same affirmation on a given date unless they shuffle.

---

## L. GAME — Gamification
> Guardrails: no manipulative mechanics (no loss-aversion countdowns, no paid streak repair), no public worship rankings, and no shaming.

### F-GAME-001 — Achievement badges
**Pri** S · **Ph** P4 · **Roles** U, A (define) · **Deps** F-CAL-007
- **FR:** Badge definitions use rule types (count, streak, category diversity, first-time) and have EN/BN names and descriptions. They are awarded by an event handler and the award is idempotent.
- **Behavior:** Badges are private unless the user shares them. Worship-related badges are personal only.
- **AC:** A badge is awarded exactly once, even if the same event is processed twice.

### F-GAME-002 — Milestones
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GAME-001
- **FR:** Totals milestones (10, 50, 100, 500, and 1,000 deeds) and anniversary milestones.
- **AC:** Each milestone triggers one celebratory notification, which respects quiet hours.

### F-GAME-003 — Personal streak display
**Pri** M · **Ph** P4 · **Roles** U · **Deps** F-CAL-007, F-CAL-008
- **FR:** Shows the current and longest streak, with an option to hide streaks entirely if the user finds them stressful.
- **AC:** Hiding streaks removes them from every surface, including the widget.

### F-GAME-004 — Virtual Good Deeds Tree
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-DEED-004
- **FR:** A tree that grows in stages with cumulative completions (leaves, flowers, fruit, seasons). It never withers or dies; inactive periods only pause its growth. Rendered as SVG with a reduced-motion variant.
- **AC:** The growth stage is computed deterministically from cumulative completions. Inactivity never reduces the stage.

### F-GAME-005 — Random challenges
**Pri** C · **Ph** P4 · **Roles** U · **Deps** F-DEED-012
- **FR:** An optional weekly mini-challenge (for example "3 family deeds this week") that the user accepts.
- **AC:** The challenge shows only after the user opts in.

### F-GAME-006 — Surprise good deeds
**Pri** C · **Ph** P4 · **Roles** U · **Deps** F-DEED-012
- **FR:** An occasional delightful suggestion card, at most once a day, that can be dismissed.
- **AC:** It never appears more than once per local day.

### F-GAME-007 — Community appreciation
**Pri** C · **Ph** P7 · **Roles** U · **Deps** F-COMM-011
- **FR:** A summary of how many appreciations the user's shared stories received, visible only to that user.
- **AC:** The count is visible only to its owner.

### F-GAME-008 — Positive recognition messaging
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-I18N-001
- **FR:** A message library with tone guidelines (encouraging, never shaming). Copy review is part of the definition of done.
- **AC:** Copy lint finds no banned phrases (for example "you failed" or "you broke your streak") in the EN/BN catalogs.

---

## K. AI — AI-Powered Intelligence
> AI is **optional**. Core features work with AI disabled. The default provider is Anthropic Claude behind `AiProvider`. Every AI request is sent only after consent, quota, data-minimization, and safety checks pass.

### F-AI-001 — AI gateway & provider abstraction
**Pri** M (for any AI) · **Ph** P8 · **Roles** system · **Deps** F-ADMIN-009
- **FR:** An `AiProvider` interface (`generate`, `stream`, `moderate?`) with a Claude adapter as the default. A model registry maps tasks to models. Prompt templates are versioned and localized. Requests time out, retry with backoff, and degrade gracefully.
- **Errors:** If the provider fails or times out, the user sees a friendly "AI is unavailable right now" message and the core flow continues.
- **Sec.:** API keys are server-side only. The AI is never called directly from the client.
- **AC:** Switching the provider configuration requires no change to feature code. When AI is disabled, AI endpoints return 503 `AI_DISABLED` and the UI hides AI entry points.

### F-AI-002 — Consent, privacy & disable
**Pri** M · **Ph** P8 · **Roles** U, SA · **Deps** F-AI-001
- **FR:** Per-user consent covers general AI and, separately, journal AI. The UI explains what data is sent. Users can withdraw consent at any time, and withdrawal deletes stored AI conversations if requested. A global kill switch exists.
- **AC:** Without consent, every AI endpoint returns 403 `AI_CONSENT_REQUIRED`.

### F-AI-003 — Usage limits & cost monitoring
**Pri** M · **Ph** P8 · **Roles** U, SA · **Deps** F-AI-001
- **FR:** Per-user quotas as defined in FR-AI-003-01 (requests per day and tokens per month), a global monthly budget cap with alerts at 50/80/100%, and per-feature usage logs (tokens, cost estimate, latency). There is an admin dashboard.
- **AC:** A user over quota receives 429 `AI_QUOTA_EXCEEDED`. At 100% of the global budget, AI is disabled automatically.

### F-AI-004 — AI good deed suggestions
**Pri** S · **Ph** P8 · **Roles** U · **Deps** F-AI-001, F-AI-002, F-AI-003, F-DEED-014
- **FR:** Returns 3–5 suggestions from minimized context (aggregate category counts, preferences, locale, no free text). Suggestions are mapped to library deeds where possible and can be added in one tap.
- **AC:** The context sent contains no notes, journal content, or names (verified by a prompt snapshot test).

### F-AI-005 — AI habit coach
**Pri** C · **Ph** P8 · **Roles** U · **Deps** F-AI-001, F-AI-002, F-AI-003, F-AI-013
- **FR:** A conversational coach with structured context and conversation history (stored, deletable). Behind a feature flag.
- **AC:** Users can delete their conversations. A crisis-keyword path shows help resources.

### F-AI-006 — AI daily reflection prompts
**Pri** S · **Ph** P8 · **Roles** U · **Deps** F-AI-001, F-AI-002, F-AI-003
- **FR:** Personalized evening reflection questions. Falls back to static prompts.
- **AC:** If AI is unavailable, the static prompts are shown with no visible error.

### F-AI-007 — AI weekly report narrative
**Pri** S · **Ph** P8 · **Roles** U · **Deps** F-RPT-001, F-AI-001, F-AI-002, F-AI-003
- **FR:** A batch job writes a short, encouraging narrative from the weekly aggregates in the user's language.
- **AC:** Every number in the narrative matches the source aggregates (validated against structured output).

### F-AI-008 — AI task generation
**Pri** C · **Ph** P8 · **Roles** U · **Deps** F-PLAN-001, F-AI-001, F-AI-002, F-AI-003
- **FR:** Natural language (for example "plan a kind weekend with family") produces draft planner items for the user to review. Nothing is saved without confirmation.
- **AC:** The output is validated against the planner Zod schema, and invalid output is rejected.

### F-AI-009 — AI growth insights
**Pri** S · **Ph** P8 · **Roles** U · **Deps** F-GROW-007, F-AI-001, F-AI-002, F-AI-003
- **FR:** Adds natural-language explanations to the rule-based insights. They are stored in `ai_insights` with `source=ai`.
- **AC:** Each insight cites the data it is based on.

### F-AI-010 — AI personal assistant
**Pri** C · **Ph** P8 · **Roles** U · **Deps** F-AI-005, F-AI-008
- **FR:** The assistant can call a limited set of app tools (create a plan, log a completion, query stats), and every write needs explicit confirmation.
- **Sec.:** Tool calls are scoped to the user, permission-checked, and audit-logged.
- **AC:** No write happens without the user tapping "Confirm".

### F-AI-011 — AI voice journal
**Pri** C · **Ph** P8 · **Roles** U · **Deps** F-JRNL-001, F-AI-002
- **FR:** Records audio, transcribes it (with a speech-to-text provider abstraction, falling back to the browser Web Speech API where available), and the user edits the text before saving. Audio is deleted after transcription.
- **Limitation:** Bengali speech-to-text quality varies by provider. The feature is labelled beta.
- **AC:** No audio is retained after a successful transcription.

### F-AI-012 — AI motivational messages
**Pri** S · **Ph** P8 · **Roles** U · **Deps** F-GAME-008, F-AI-001, F-AI-002, F-AI-003
- **FR:** Short encouraging messages, pre-generated in batches and reviewed against the tone rules. Falls back to the curated library.
- **AC:** Messages pass the banned-phrase filter.

### F-AI-013 — Safety filters & religious guardrails
**Pri** M · **Ph** P8 · **Roles** system · **Deps** F-AI-001
- **FR:** The system prompt forbids issuing fatwas or rulings and tells the model to redirect religious-ruling questions to qualified scholars. Religious claims must cite only content from the verified library. Input and output are moderated. PII is redacted from inputs. Prompt-injection defenses treat user content as data. Self-harm and crisis signals route to help resources.
- **AC:** A red-team test suite (EN/BN) of 50+ prompts passes with zero ruling-like answers and zero leaked system prompts.

---

## P. PWA — PWA & Mobile Web

### F-PWA-001 — Manifest & installability
**Pri** M · **Ph** P2 · **Roles** G, U · **Deps** —
- **FR:** One manifest with `scope=/` (FR-PWA-001-01): name, short_name, icons including maskable, theme colors, display standalone, shortcuts for Today and Tasbih. A custom install prompt appears after engagement, with iOS "Add to Home Screen" guidance.
- **AC:** Lighthouse PWA installability checks pass on Chrome Android.

### F-PWA-002 — Responsive navigation
**Pri** M · **Ph** P2 · **Roles** all · **Deps** design system
- **FR:** A bottom tab bar on mobile (Today, Calendar, Growth, Islamic or Discover, More), a rail on tablet, and a sidebar on desktop. Admin uses its own sidebar layout.
- **AC:** Navigation works from 320 px to 1920 px with no horizontal scroll.

### F-PWA-003 — Cached application shell
**Pri** M · **Ph** P2 · **Roles** all · **Deps** Serwist
- **FR:** The app shell, fonts, and icons are precached. A localized offline fallback page is shown.
- **AC:** Reloading while offline shows the shell and an offline notice instead of the browser error page.

### F-PWA-004 — Offline read access
**Pri** S · **Ph** P9 · **Roles** U · **Deps** F-PWA-003
- **FR:** Cache today's checklist, the last 14 days of history (NFR-PRIVACY-004), preferences, prayer settings, and the deed library subset in IndexedDB. Journals are never cached offline in v1.
- **AC:** In airplane mode, today's checklist and the offline history window of NFR-PRIVACY-004 are viewable.

### F-PWA-005 — Offline completion & outbox
**Pri** M · **Ph** P9 · **Roles** U · **Deps** F-PWA-004
- **FR:** Mutations for the offline-capable entities in [SRS §18](../specifications/SRS.md) go into an IndexedDB outbox, each with a client-generated `opId` (idempotency key). Journals are never queued. The outbox is flushed on the `online` event, on focus, through Background Sync (Chromium), and at startup.
- **AC:** 50 completions made offline sync exactly once after reconnecting.

### F-PWA-006 — Sync & conflict handling
**Pri** M · **Ph** P9 · **Roles** U · **Deps** F-PWA-005
- **FR:** The `/sync` endpoint accepts batched operations and returns per-operation results plus a delta since the cursor. Conflicts are resolved per field with last-writer-wins by `client_updated_at`, plus server-authoritative rules (for example, one completion per plan per date). Conflicts are recorded and surfaced as "Updated on another device".
- **AC:** Concurrent edits from two devices converge to the same state, and nothing is lost silently.

### F-PWA-007 — In-app browser detection & fallback
**Pri** M · **Ph** P2 · **Roles** G, U · **Deps** —
- **FR:** Detects the Facebook, Messenger, Instagram, Telegram, and other in-app webviews by user agent and feature checks. Shows a dismissible banner, "For the best experience, open in your browser", with a deep link where possible (Android intent://) or copy-link instructions. Install and Google OAuth are disabled there, and email login stays available.
- **AC:** The banner appears in the Facebook in-app browser and not in Chrome. Core flows complete inside the webview.

### F-PWA-008 — Feature detection & graceful degradation
**Pri** M · **Ph** P2 · **Roles** all · **Deps** —
- **FR:** A capability layer checks for SW, Push, Notifications, Background Sync, Vibration, Geolocation, Web Share, and IndexedDB. The UI adapts, and nothing breaks when a capability is missing.
- **AC:** With service workers disabled, the app still works online.

### F-PWA-009 — App update flow
**Pri** S · **Ph** P9 · **Roles** all · **Deps** F-PWA-003
- **FR:** When a new service worker is waiting, the app shows a "New version available — Refresh" toast. The outbox is never lost during the update.
- **AC:** Pending outbox items survive a service-worker update.

---

## O. WIDGET — Android Home-Screen Widget
> A native Kotlin project (`apps/android-widget`). Android requires an APK to host widgets, so a **minimal host app** handles device linking and settings only. The main product remains the web app; widgets deep-link into it. This is not a PWA feature.

### F-WIDGET-001 — Minimal host companion app
**Pri** M · **Ph** P9 · **Roles** U · **Deps** F-AUTH-007
- **FR:** Device linking per FR-WIDGET-001-02: the web app shows an 8-character code and a QR code (an https App Link opened by the system camera; manual entry as fallback, no in-app scanner). The app exchanges it for an opaque device token stored in a Keystore-encrypted DataStore.
- **Sec.:** Device tokens have scope `widget` (limited endpoints), can be revoked from the web Sessions page, and rotate.
- **AC:** Revoking the device on the web stops widget sync with a "Sign in again" state.

### F-WIDGET-002 — Small progress widget
**Pri** M · **Ph** P9 · **Roles** U · **Deps** F-WIDGET-001, F-WIDGET-006
- **FR:** A 2×1 or 2×2 widget showing today's progress ring, a count, and the streak (unless hidden). Tapping it opens /today.
- **AC:** It shows the correct counts within one refresh interval (FR-WIDGET-006-01) of a web-side change, or immediately after an in-widget action.

### F-WIDGET-003 — Medium interactive checklist
**Pri** S · **Ph** P9 · **Roles** U · **Deps** F-WIDGET-006
- **FR:** A 4×2 widget with up to 5 items, each with a checkbox (Glance `actionRunCallback`), shown optimistically, and a "+N more" deep link.
- **AC:** Tapping a checkbox while offline marks the item, queues it, and syncs later.

### F-WIDGET-004 — Large detailed widget
**Pri** S · **Ph** P9 · **Roles** U · **Deps** F-WIDGET-003
- **FR:** A 4×4 widget with a scrollable checklist (Glance LazyColumn), progress, today's intention, and the next prayer if enabled.
- **AC:** It renders correctly in EN and BN at the default font scale and at 1.3×.

### F-WIDGET-005 — Islamic tracker widget
**Pri** S · **Ph** P9 · **Roles** U · **Deps** F-ISL-001, F-ISL-002, F-ISL-017
- **FR:** Shows the 5 prayer times with tap-to-log, the next prayer countdown, and the Hijri date. Times are computed on the device with adhan-java/Kotlin, using the synced settings.
- **AC:** The widget hides itself (shows "Module disabled") when the Islamic module is off.

### F-WIDGET-006 — Sync, offline queue & retry
**Pri** M · **Ph** P9 · **Roles** system · **Deps** F-PWA-006 protocol
- **FR:** WorkManager periodic sync and retry backoff as defined in FR-WIDGET-006-01/02, plus expedited one-off work after actions. A local DataStore queue with `opId`s. The same `/sync` protocol as the PWA.
- **AC:** 10 queued actions made offline sync exactly once when connectivity returns.

### F-WIDGET-007 — Stale-data indicator
**Pri** M · **Ph** P9 · **Roles** U · **Deps** F-WIDGET-006
- **FR:** Shows "Updated HH:MM". When data is older than 2 h, or the local date differs from the snapshot date, the widget shows a stale state and does not present yesterday's checklist as today's.
- **AC:** After local midnight with no sync, the widget shows a "Tap to refresh" state, not yesterday's items.

### F-WIDGET-008 — EN/BN widget localization
**Pri** M · **Ph** P9 · **Roles** U · **Deps** F-I18N-001
- **FR:** `strings.xml` is generated from `packages/i18n`. The widget follows the user's app-language preference, synced from the account. Bengali digits are optional.
- **AC:** Switching the language on the web updates the widget language after the next sync.

### F-WIDGET-009 — Deep links
**Pri** M · **Ph** P9 · **Roles** U · **Deps** Android App Links (assetlinks.json)
- **FR:** Taps open https URLs (/today, /islamic/salah, /calendar) in the installed PWA or the browser.
- **AC:** With the PWA installed, a widget tap opens the PWA; otherwise it opens the default browser.

---

## Q. RPT — Analytics & Reporting

### F-RPT-001 — Daily & weekly summaries
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-CAL-006
- **FR:** A daily recap card and a weekly summary page showing completion rate, categories, streaks, and highlights. Optionally sent as an email digest (P6).
- **AC:** The numbers equal the calendar aggregates for the same range.

### F-RPT-002 — Monthly & yearly reports
**Pri** S · **Ph** P10 · **Roles** U · **Deps** F-RPT-001, F-CAL-004
- **FR:** Precomputed `growth_snapshots` with comparisons to the previous period, framed positively.
- **AC:** A report generates in under 3 s for a 3-year-old account.

### F-RPT-003 — Category trends
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-009
- **FR:** A stacked trend of completions by category over weeks or months.
- **AC:** Includes an accessible data table toggle.

### F-RPT-004 — Habit consistency report
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-005
- **FR:** A table of plans with their consistency percentage and trend.
- **AC:** Sortable and filterable.

### F-RPT-005 — Goal completion report
**Pri** S · **Ph** P4 · **Roles** U · **Deps** F-GROW-001
- **FR:** Goals achieved, in progress, and archived, with timelines.
- **AC:** Counts match the goals table.

### F-RPT-006 — CSV export
**Pri** S · **Ph** P10 · **Roles** U · **Deps** export jobs
- **FR:** Exports completions, goals, salah, and Quran logs as CSV (UTF-8 with BOM so Bengali opens correctly in Excel), plus a full account data export (JSON) for F-AUTH-009.
- **Sec.:** Requires re-authentication; signed links expire after 24 h; CSV formula injection is prevented (cells starting with =, +, -, @ are escaped).
- **AC:** A cell beginning with "=" is exported prefixed with a quote.

### F-RPT-007 — PDF export
**Pri** C · **Ph** P10 · **Roles** U · **Deps** F-RPT-002
- **FR:** A server-rendered PDF of the monthly or yearly report with embedded Bengali fonts.
- **AC:** Bengali text renders with correct conjuncts in the PDF.

### F-RPT-008 — Privacy-conscious product analytics
**Pri** S · **Ph** P10 · **Roles** SA · **Deps** consent banner
- **FR:** Self-hosted or EU-hosted analytics (for example Plausible or PostHog with IP anonymization), event-level only, never including content. Runs only with consent where required. Admin aggregate dashboards (DAU, feature adoption) have k-anonymity ≥ 10.
- **AC:** No analytics event contains journal, note, or worship detail fields (enforced by an event schema allowlist).

---

## R. INTG — Integrations

### F-INTG-001 — Email provider adapter
**Pri** M · **Ph** P2 · **Roles** system · **Deps** —
- **FR:** An `EmailSender` interface with Resend and SMTP adapters, a dev adapter that writes to a log/preview, React Email templates in EN/BN, and bounce/complaint webhooks that suppress addresses.
- **Errors:** Provider outage → queued with retries (pg-boss), and an alert after N failures.
- **AC:** If the provider is unconfigured, the app starts, logs a clear warning, and uses the dev adapter in non-production. Production startup fails fast.

### F-INTG-002 — Web Push service
**Pri** M · **Ph** P6 · **Roles** system · **Deps** —
- **FR:** VAPID keys in the secret store, the `web-push` library, a TTL and urgency per notification type, and payload encryption.
- **AC:** Push delivery receipts are logged, and 404/410 responses prune the subscription.

### F-INTG-003 — Google Calendar export/sync
**Pri** C · **Ph** P10 · **Roles** U · **Deps** OAuth incremental scope
- **FR:** One-way export of planner time blocks and optionally prayer times to a dedicated "Daily Good Deeds" calendar. Uses the incremental scope `calendar.app.created`. An ICS feed (a tokenized URL) is a simpler alternative.
- **Sec.:** Minimal scope; refresh tokens are encrypted; disconnecting revokes the token.
- **AC:** Disconnecting removes the stored tokens and stops sync.

### F-INTG-004 — Wearable integrations
**Pri** W · **Ph** Future · **Roles** U · **Deps** native app
- **FR:** Not in the initial release. See FUTURE_ENHANCEMENTS FE-001.
- **Limitation:** Requires native Health Connect / HealthKit. Not possible from the web.

### F-INTG-005 — Public API
**Pri** C · **Ph** P10 · **Roles** U (personal tokens), SA (clients) · **Deps** F-RBAC-002
- **FR:** `/public/v1` read-only endpoints at first (own stats, deeds library) using personal access tokens with scopes and rate limits, documented with OpenAPI.
- **Sec.:** Tokens are hashed, scoped, expiring, and revocable. They never grant admin scopes.
- **AC:** A token without the `stats:read` scope gets 403 on the stats endpoints.

### F-INTG-006 — QR-based campaign participation
**Pri** C · **Ph** P7 · **Roles** G, U · **Deps** F-COMM-007
- **FR:** Each campaign or event has a signed QR code linking to the join page. Scanning it while logged out leads to login/sign-up and then the join. Codes can be rotated.
- **Sec.:** Signed, expirable codes; rate-limited joins.
- **AC:** A rotated (old) QR code shows "This code has expired".

---

## S. ADMIN — Admin & Platform Management
> Every admin endpoint lives under `/api/v1/admin/*`, requires specific permissions, and is audit-logged. Admins never see journal content or private worship details.

### F-ADMIN-001 — User management
**Pri** M · **Ph** P2 · **Roles** A (`users.read`/`users.manage`), SA · **Deps** F-RBAC-002, F-RBAC-005
- **FR:** Search and filter users by email, name, status, or date. The detail view shows profile, status, roles, sessions, and counts only (no private content). Actions: suspend, reactivate, force logout, resend verification, start deletion.
- **Sec.:** PII is masked by default, and reveal is audit-logged.
- **AC:** The admin user detail response contains no journal or worship detail fields.

### F-ADMIN-002 — Role & permission management
**Pri** M · **Ph** P2 · **Roles** SA · **Deps** F-RBAC-001, F-RBAC-003
- **FR:** CRUD for custom roles, a permission picker, and a matrix view.
- **AC:** Changes are audit-logged and take effect within 60 s.

### F-ADMIN-003 — Deed & category content management
**Pri** M · **Ph** P3 · **Roles** A (`content.*`) · **Deps** F-I18N-008, F-ADMIN-011
- **FR:** CRUD with a draft → published → archived workflow, a side-by-side EN/BN editor, a preview, and bulk CSV import with validation.
- **AC:** An import with invalid rows reports row-level errors and imports nothing (atomic).

### F-ADMIN-004 — Translation management
**Pri** S · **Ph** P3 · **Roles** A (`translations.manage`) · **Deps** F-I18N-008
- **FR:** A missing-translation dashboard across content types, inline editing, and a "needs review" status. UI string catalogs stay in git; the dashboard shows their coverage as read-only.
- **AC:** The dashboard lists every published entity lacking BN.

### F-ADMIN-005 — Islamic content management
**Pri** M · **Ph** P5 · **Roles** A (`islamic.edit`, `islamic.verify`) · **Deps** F-ISL-018
- **FR:** CRUD for duas, hadith, dhikr presets, sunnah practices, learning articles, and sources, with a 4-eyes verification workflow.
- **AC:** A user cannot verify their own content.

### F-ADMIN-006 — Campaign management
**Pri** S · **Ph** P7 · **Roles** A (`campaigns.manage`) · **Deps** F-COMM-007
- **FR:** CRUD for campaigns and volunteer opportunities, generating and rotating QR codes, and viewing participation stats (aggregate only).
- **AC:** Stats show counts, not the identities of participants, unless participants consented to share.

### F-ADMIN-007 — Notification scheduling / broadcasts
**Pri** S · **Ph** P6 · **Roles** A (`notifications.broadcast`) · **Deps** F-NOTIF-*
- **FR:** Compose an EN/BN message, choose a segment (all, locale, module-enabled), schedule it, and preview it. Respects user preferences and quiet hours. Requires step-up authentication.
- **AC:** A broadcast never reaches users who opted out of announcements.

### F-ADMIN-008 — Community moderation console
**Pri** M · **Ph** P7 · **Roles** A (`moderation.act`) · **Deps** F-COMM-012
- **FR:** Queue, content context, reporter reasons, action buttons with reason codes, user moderation history, and an appeals queue.
- **AC:** The queue is sortable by age and severity, and SLA timers are shown.

### F-ADMIN-009 — Feature flags
**Pri** M · **Ph** P2 · **Roles** SA (`flags.manage`) · **Deps** —
- **FR:** Boolean and percentage flags with targeting by role, locale, or user list. Evaluated on the server and exposed to the client through `/me`. Includes a kill switch for AI and community.
- **AC:** Toggling a flag takes effect within 60 s without a deploy.

### F-ADMIN-010 — A/B testing
**Pri** C · **Ph** P10 · **Roles** SA · **Deps** F-ADMIN-009, F-RPT-008
- **FR:** Variant flags with sticky assignment and a metric linked to aggregate analytics. Never used on religious content or safety features.
- **AC:** A user's assignment is stable across sessions.

### F-ADMIN-011 — Content versioning
**Pri** S · **Ph** P3 · **Roles** A · **Deps** —
- **FR:** `content_versions` stores a snapshot on each publish, with a diff view and rollback to a previous version.
- **AC:** Rollback creates a new version. History is never rewritten.

### F-ADMIN-012 — System health dashboard
**Pri** S · **Ph** P10 · **Roles** SA (`system.read`) · **Deps** observability
- **FR:** API p95 and error rate, DB connections, queue depth, last backup, external dependency status (email, AI, Quran API), and version info.
- **AC:** Shows degraded status when a dependency health check fails.

### F-ADMIN-013 — API analytics
**Pri** C · **Ph** P10 · **Roles** SA · **Deps** F-ADMIN-012
- **FR:** Request counts, latency, and error rate per route; top consumers of public API tokens.
- **AC:** Data is aggregated per minute and retained for 30 days.

### F-ADMIN-014 — Background job monitoring
**Pri** S · **Ph** P6 · **Roles** SA · **Deps** pg-boss
- **FR:** Queue list with counts by state, failed job details (with redacted payloads), retry or cancel, and schedule overview.
- **AC:** A retried failed job runs and its state updates.

### F-ADMIN-015 — Backup monitoring
**Pri** S · **Ph** P10 · **Roles** SA · **Deps** Neon PITR
- **FR:** Shows the PITR window, the last logical backup (nightly pg_dump to object storage), the last successful restore drill date, and alerts.
- **AC:** An alert is raised if no successful backup has happened for more than 26 h.

### F-ADMIN-016 — Audit log viewer
**Pri** M · **Ph** P2 · **Roles** SA, A (`audit.read`) · **Deps** F-RBAC-005
- **FR:** Filter by actor, action, target, and date; open a detail view with the redacted diff. CSV export (audit-logged itself) is delivered in P10.
- **AC:** The viewer is read-only, and no edit or delete operation exists.

### F-ADMIN-017 — Subscription management
**Pri** W · **Ph** Future · **Roles** SA · **Deps** payment provider
- **FR:** Not in the initial release. See FUTURE_ENHANCEMENTS FE-002.

---

## Appendix — Coverage check
This catalog has 198 feature blocks, matching the 198 IDs in the registry. A verification script compares the `### F-` headings with the registry rows.

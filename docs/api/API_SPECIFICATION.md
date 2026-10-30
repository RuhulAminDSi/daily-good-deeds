# API Specification — `/api/v1`

> Status: **specification, not implemented.** The machine-readable contract for Phase 2–3 endpoints is in [openapi.yaml](openapi.yaml). Endpoints for Phase 4–10 are specified here and will be added to the OpenAPI document when each phase starts, before any code is written.
>
> Read with: [API_CONVENTIONS.md](API_CONVENTIONS.md) (pagination, dates, ETags, idempotency, rate limits, auth notation), [AUTHENTICATION.md](AUTHENTICATION.md), [ERROR_HANDLING.md](ERROR_HANDLING.md). The resource map and table names follow [../README.md §5–6](../README.md). Feature IDs come from [../product/FEATURE_ID_REGISTRY.md](../product/FEATURE_ID_REGISTRY.md).

**Column legend.**

| Column | Values |
|---|---|
| **Auth** | see API_CONVENTIONS §13 |
| **Perm** | permission code from §0. ⚑ = step-up required. |
| **Pg** | `C` = cursor-paginated list, `B` = bounded list, `—` = single object |
| **Rate** | rate tier |
| **Idem** | `K` = `Idempotency-Key` required (only side-effecting POSTs without a natural key, DL-016), `k` = accepted/optional, `N` = natural (unique constraint), `—` = n/a (GET/DELETE are inherently idempotent) |
| **Errors** | domain-specific codes in addition to the generic ones (`VALIDATION_FAILED`, `UNAUTHENTICATED`, `RESOURCE_NOT_FOUND`, `RATE_LIMITED`, `INTERNAL_ERROR`) |

---

## 0. Permission catalog (RBAC, F-RBAC-001/002)

Permissions are seeded in `permissions` and attached to roles through `role_permissions`. **`user` has no admin permissions.** Ordinary user capabilities come from ownership checks, not from permissions.

| Permission | Description | admin | super_admin |
|---|---|:-:|:-:|
| `users.read` | List and view users (no journal or worship data, ever) | ✓ | ✓ |
| `users.manage` | Suspend/unsuspend, force logout, resend verification, start deletion | ✓ | ✓ |
| `users.export` | Export a user's data on a verified DSAR request ⚑ | — | ✓ |
| `roles.read` | View roles and permissions | ✓ | ✓ |
| `roles.manage` | Assign/revoke roles ⚑ (P2). Edit role permissions ⚑ (P10, DL-032) | — | ✓ |
| `admins.manage` | Invite admin accounts ⚑ (P10). In P2 admins are created by seed/CLI | — | ✓ |
| `content.deeds.manage` | CRUD for categories, deeds, and achievements, with translations | ✓ | ✓ |
| `content.translations.manage` | Edit content translations | ✓ | ✓ |
| `content.islamic.manage` | Draft and edit duas, hadith, dhikr presets, sunnah practices, and sources | ✓ | ✓ |
| `content.islamic.verify` | Verify/publish religious content (second person, not the author) | grantable | ✓ |
| `content.versions.read` | View content version history and roll back | ✓ | ✓ |
| `campaigns.manage` | CRUD for campaigns, challenges, and volunteer opportunities | ✓ | ✓ |
| `moderation.read` | View reports and the moderation queue | ✓ | ✓ |
| `moderation.act` | Hide/remove content, warn/suspend authors | ✓ | ✓ |
| `moderation.deanonymize` | Reveal the author of an anonymous post or comment during moderation ⚑. Every reveal is audit-logged ([SRS FR-COMM-010-01](../specifications/SRS.md)) | — | ✓ |
| `notifications.broadcast` | Schedule and send broadcasts ⚑ | ✓ | ✓ |
| `flags.manage` | Boolean feature flags (⚑ in prod); A/B experiments (P10) | — | ✓ |
| `settings.manage` | System settings and maintenance mode ⚑ | — | ✓ |
| `audit.read` | Read audit logs | ✓ | ✓ |
| `jobs.read` | View background job queues | ✓ | ✓ |
| `jobs.manage` | Retry/cancel jobs | — | ✓ |
| `system.health.read` | Health, backup status, API analytics | ✓ | ✓ |
| `ai.admin` | AI usage/cost dashboards, global AI kill switch ⚑ | — | ✓ |
| `api_clients.manage` | Public API client tokens (P10) | — | ✓ |

---

## 1. AUTH — Authentication & Identity (P2)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | `/auth/register` | none | — | `email, password, displayName(1–60), locale(en\|bn), timezone(IANA), acceptTermsVersion` | 202 `{status:"check_email"}` + session cookies when the account is new | — | auth-strict | k | `PASSWORD_TOO_WEAK` | F-AUTH-001 |
| POST | `/auth/login` | none | — | `email, password` | 200 `{user, mfaRequired:false}` + cookies; or 401 `MFA_REQUIRED {mfaToken}` | — | auth-strict | — | `AUTH_INVALID_CREDENTIALS, AUTH_ACCOUNT_LOCKED, ACCOUNT_SUSPENDED` | F-AUTH-002 |
| POST | `/auth/mfa/verify` | none | — | `mfaToken, code` (TOTP or recovery code) | 200 `{user}` + cookies | — | auth-strict | — | `MFA_INVALID_CODE` | F-RBAC-007 |
| POST | `/auth/logout` | user* | — | — | 204, cookies cleared | — | write | — | — | F-AUTH-006 |
| POST | `/auth/logout-all` | user* | — | `?includeCurrent` | 204 | — | write | — | — | F-AUTH-006/007 |
| POST | `/auth/verify-email` | none | — | `token` | 200 `{user}` | — | default | N | `TOKEN_INVALID_OR_EXPIRED` | F-AUTH-004 |
| POST | `/auth/verify-email/resend` | user* | — | — | 202 | — | auth-strict | — | — | F-AUTH-004 |
| POST | `/auth/password/forgot` | none | — | `email` | 202 (always) | — | auth-strict | — | — | F-AUTH-005 |
| POST | `/auth/password/reset` | none | — | `token, newPassword` | 204 (all sessions revoked) | — | auth-strict | N | `TOKEN_INVALID_OR_EXPIRED, PASSWORD_TOO_WEAK` | F-AUTH-005 |
| POST | `/auth/password/change` | user* | — | `currentPassword, newPassword` | 204 (other sessions revoked) | — | auth-strict | — | `AUTH_INVALID_CREDENTIALS, PASSWORD_REUSED` | F-AUTH-008 |
| GET | `/auth/oauth/google/start` | none | — | `?next` | 302 to Google | — | default | — | — | F-AUTH-003 |
| GET | `/auth/oauth/google/callback` | none | — | `code, state` | 302 to `next` + cookies | — | default | — | `OAUTH_STATE_INVALID, OAUTH_EMAIL_UNVERIFIED` | F-AUTH-003 |
| POST | `/auth/step-up` | user | — | `password` \| `totpCode` | 204 (sets `stepup_at`) | — | auth-strict | — | `MFA_INVALID_CODE` | F-RBAC-006 |
| POST | `/auth/mfa/totp/enroll` | user | — | — | 200 `{otpauthUrl, secretMasked}` | — | auth-strict | — | — | F-RBAC-007 |
| POST | `/auth/mfa/totp/activate` | user | — | `code` | 200 `{recoveryCodes[10]}` (shown once) | — | auth-strict | — | `MFA_INVALID_CODE` | F-RBAC-007 |
| DELETE | `/auth/mfa/totp` | user | — | `code` (step-up) | 204. Blocked for admins (`MFA_ENROLLMENT_REQUIRED`). | — | auth-strict | — | — | F-RBAC-007 |
| GET | `/me` | user* | — | — | `User` (id, email, displayName, avatarUrl, status, emailVerified, roles, createdAt) | — | default | — | — | F-AUTH-008 |
| PATCH | `/me` | user* | — | `displayName?, avatarUploadId?, bio?(≤280)` | `User` | — | write | — | — | F-AUTH-008 |
| POST | `/me/email-change` | user | — | `newEmail, password` | 202 (confirmation sent to the new address) | — | auth-strict | — | `CONFLICT` (masked as 202) | F-AUTH-008 |
| GET | `/me/preferences` | user* | — | — | `Preferences` | — | default | — | — | F-AUTH-010, F-I18N-003 |
| PUT | `/me/preferences` | user* | — | `locale, timezone, theme(system\|light\|dark), weekStart(sat\|sun\|mon), numeralSystem(latn\|beng), calendarDisplay(gregorian\|hijri\|both), reduceMotion` | `Preferences` | — | write | — | — | F-AUTH-010, F-I18N-003/004, F-CAL-011 |
| GET | `/me/identities` | user | — | — | `[{provider, email, linkedAt}]` | B | default | — | — | F-AUTH-003 |
| DELETE | `/me/identities/google` | user | — | — | 204 | — | write | — | `AUTH_LAST_LOGIN_METHOD` | F-AUTH-003 |
| GET | `/me/sessions` | user* | — | — | `[Session{id, kind, deviceLabel, approxLocation, createdAt, lastSeenAt, current}]` | B | default | — | — | F-AUTH-007 |
| DELETE | `/me/sessions/{sessionId}` | user* | — | — | 204 | — | write | — | — | F-AUTH-007 |
| POST | `/me/deletion` | user* | — | `password` \| `totpCode` \| `oauthReauth` | 202 (confirmation email) | — | auth-strict | k | — | F-AUTH-009 |
| POST | `/me/deletion/confirm` | none | — | `token` | 200 `{scheduledFor}` | — | auth-strict | N | `TOKEN_INVALID_OR_EXPIRED` | F-AUTH-009 |
| DELETE | `/me/deletion` | user* | — | — | 204 (cancelled) | — | write | — | — | F-AUTH-009 |
| POST | `/me/recovery/codes` | user | — | step-up | 200 `{codes[10]}` | — | auth-strict | — | — | F-AUTH-011 (P10) |
| PUT | `/me/recovery/email` | user | — | `secondaryEmail` | 202 (verification sent) | — | auth-strict | — | — | F-AUTH-011 (P10) |

## 2. RBAC & ADMIN identity (P2)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/users` | admin | `users.read` | `?q, status, role, createdFrom, createdTo, sort, includeTotal` | `AdminUserSummary[]` (no private data) | C | default | — | — | F-ADMIN-001 |
| GET | `/admin/users/{userId}` | admin | `users.read` | — | `AdminUserDetail` (profile, roles, sessions count, flags, moderation history) | — | default | — | — | F-ADMIN-001 |
| POST | `/admin/users/{userId}/suspend` | admin | `users.manage` ⚑ | `reason(≤500), until?` | `AdminUserDetail` | — | default | k | `SELF_ROLE_CHANGE_FORBIDDEN, LAST_SUPER_ADMIN` | F-ADMIN-001 |
| POST | `/admin/users/{userId}/unsuspend` | admin | `users.manage` | `reason` | `AdminUserDetail` | — | default | k | — | F-ADMIN-001 |
| POST | `/admin/users/{userId}/sessions/revoke` | admin | `users.manage` ⚑ | `reason` | 204 | — | default | — | — | F-ADMIN-001, F-AUTH-007 |
| POST | `/admin/users/{userId}/verification/resend` | admin | `users.manage` | — | 202 | — | default | — | — | F-ADMIN-001 |
| POST | `/admin/users/{userId}/export` | admin | `users.export` ⚑ | `dsarReference` | 202 `ExportJob` | — | write | K | — | F-ADMIN-001 |
| GET | `/admin/roles` | admin | `roles.read` | — | `Role[]` with permissions | B | default | — | — | F-RBAC-001, F-ADMIN-002 |
| GET | `/admin/permissions` | admin | `roles.read` | — | `Permission[]` | B | default | — | — | F-RBAC-002 |
| PUT | `/admin/roles/{roleId}/permissions` (**P10**) | superadmin | `roles.manage` ⚑ | `permissionCodes[]`; `If-Match` | `Role` | — | default | — | `PRECONDITION_FAILED` | F-ADMIN-002 |
| PUT | `/admin/users/{userId}/roles` | admin | `roles.manage` ⚑ | `roles[]` (`user`, `admin`, `super_admin`) | `AdminUserDetail` | — | default | — | `LAST_SUPER_ADMIN, SELF_ROLE_CHANGE_FORBIDDEN` | F-RBAC-003, F-RBAC-004 |
| POST | `/admin/admins/invitations` (**P10**) | superadmin | `admins.manage` ⚑ | `email, role` | 201 `AdminInvitation` | — | default | K | — | F-RBAC-004 |
| GET | `/admin/audit-logs` | admin | `audit.read` | `?actorId, action, targetType, targetId, from, to` | `AuditLog[]` | C | default | — | — | F-RBAC-005, F-ADMIN-016 |
| GET | `/admin/audit-logs/{id}` | admin | `audit.read` | — | `AuditLog` with redacted diff | — | default | — | — | F-ADMIN-016 |
| GET | `/admin/feature-flags` | admin | `flags.manage` | — | `FeatureFlag[]` | B | default | — | — | F-ADMIN-009 |
| PUT | `/admin/feature-flags/{key}` | superadmin | `flags.manage` (⚑ prod) | `enabled, allowRoles?[], description` (booleans only, DL-029) | `FeatureFlag` | — | default | — | `PRECONDITION_FAILED` | F-ADMIN-009 |
| GET | `/feature-flags` | user* / none | — | — | `{[key]: boolean}` resolved for the caller (public subset only) | — | default | — | — | F-ADMIN-009 |
| GET | `/admin/settings` | superadmin | `settings.manage` | — | `SystemSettings` (secrets never returned) | — | default | — | — | F-ADMIN-012 |
| PATCH | `/admin/settings` | superadmin | `settings.manage` ⚑ | `maintenanceMode?, signupsEnabled?, completionsEditWindowDays?, aiGlobalEnabled?` (keys per the Settings registry in DATA_DICTIONARY) | `SystemSettings` | — | default | — | — | F-ADMIN-012 |

## 3. DEED — Good Deeds (P3)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/categories` | user* | — | — | `Category[]` (localized title, icon, color token, lifeBalanceCategoryId, deedCount) | B | default | — | — | F-DEED-002 |
| GET | `/deeds` | user* | — | `?categoryId, q, durationMaxMin, isFiveMinute, source(system\|mine\|all), favorite, sort(title\|-popularity\|durationMin)` | `Deed[]` (system + caller's custom deeds) | C | default | — | — | F-DEED-001, F-DEED-011, F-DEED-013 |
| GET | `/deeds/{deedId}` | user* | — | — | `Deed` | — | default | — | — | F-DEED-001 |
| POST | `/deeds` | user* | — | `title(1–120), description?(≤1000), categoryId, estimatedMinutes?(1–600), icon?` (stored in the user's locale; other locales optional) | 201 `Deed` (`source:"mine"`) | — | write | k | `CONFLICT` (duplicate title for the user) | F-DEED-003 |
| PATCH | `/deeds/{deedId}` | user* (owner) | — | same fields as POST; `If-Match` optional | `Deed` | — | write | — | `PRECONDITION_FAILED` | F-DEED-003 |
| DELETE | `/deeds/{deedId}` | user* (owner) | — | — | 204 (soft delete; history kept; active plans archived) | — | write | — | — | F-DEED-003 |
| GET | `/deeds/random` | user* | — | `?categoryId, maxMinutes, excludeIds[]` | `Deed` (system deed, weighted away from recently suggested ones) | — | default | — | — | F-DEED-012, F-GAME-006 |
| GET | `/deeds/recommendations` | user* | — | `?limit(1–10)` | `[{deed, reasonCode(category_gap\|favorite_category\|five_minute\|seasonal)}]` (rule-based) | B | default | — | — | F-DEED-014 |
| GET | `/favorites` | user* | — | — | `Deed[]` | C | default | — | — | F-DEED-006 |
| PUT | `/favorites/{deedId}` | user* | — | — | 204 | — | write | N | — | F-DEED-006 |
| DELETE | `/favorites/{deedId}` | user* | — | — | 204 | — | write | — | — | F-DEED-006 |
| GET | `/plans` | user* | — | `?status(active\|paused\|archived), categoryId` | `DeedPlan[]` | C | default | — | — | F-DEED-005 |
| POST | `/plans` | user* | — | `deedId, recurrence{freq(daily\|weekly\|monthly\|once), interval(1–12), byWeekday?[], byMonthDay?[], startDate, endDate?, count?}, targetPerDay(1–20), reminderTime?(HH:mm), flexible(bool)` | 201 `DeedPlan` | — | write | k | `RECURRENCE_INVALID` | F-DEED-004, F-DEED-005 |
| PATCH | `/plans/{planId}` | user* | — | recurrence, `targetPerDay, reminderTime, status`; `If-Match` | `DeedPlan` (recurrence changes apply from today; past completions unchanged) | — | write | — | `RECURRENCE_INVALID, PRECONDITION_FAILED` | F-DEED-005 |
| DELETE | `/plans/{planId}` | user* | — | — | 204 (archived) | — | write | — | — | F-DEED-005 |
| GET | `/checklist/{localDate}` | user* / device | — | — | `Checklist{localDate, items[{planId, deed, target, completedCount, status, completionId?}], completionRate}` | — | default | — | `LOCAL_DATE_OUT_OF_RANGE` (more than 1 day in the future) | F-DEED-004, F-CAL-006 |
| GET | `/today` | user* | — | `If-None-Match` | `Today{checklist, streaks{overall, perPlan[]}, prayers?, affirmation?, fiveMinuteDeed?, aiMotivation?}`, ETag, or `304`. Built by the **same builder as `/widget/snapshot`**, so the Today page loads in one round trip (DL-025). The ETag is derived from (`change_seq`, localDate, prayer slot, locale) | — | default | — | — | F-DEED-004, F-CAL-006, F-CAL-007, F-GAME-003, F-WELL-007 |
| POST | `/completions` | user* / device | — | `planId? \| deedId, localDate, status(done\|partial\|skipped), quantity?(1–20), note?(≤1000), occurredAt?` | 201 `Completion` (200 if it already exists = natural idempotency) | — | write | N | `LOCAL_DATE_OUT_OF_RANGE, DEED_NOT_SCHEDULED` | F-DEED-004, F-DEED-009, F-DEED-008 |
| PATCH | `/completions/{completionId}` | user* | — | `status?, note?, quantity?`; `If-Match` optional | `Completion` | — | write | — | `LOCAL_DATE_OUT_OF_RANGE` | F-DEED-008, F-DEED-009, F-CAL-011 |
| DELETE | `/completions/{completionId}` | user* | — | — | 204 (undo; `daily_summaries` and streaks updated per DL-023) | — | write | — | `LOCAL_DATE_OUT_OF_RANGE` | F-DEED-009 |
| GET | `/completions` | user* | — | `?from, to, categoryId, deedId, status, sort(-localDate)` | `Completion[]` | C | default | — | `REPORT_RANGE_TOO_LARGE` | F-DEED-007 |
| POST | `/completions/{completionId}/attachments` | user | — | `contentType(image/jpeg\|png\|webp), byteSize(≤5MB)` | 201 `{attachmentId, uploadUrl(PUT, 5 min), headers}` | — | write | k | `ATTACHMENT_TYPE_NOT_ALLOWED, ATTACHMENT_TOO_LARGE` | F-DEED-010 |
| POST | `/attachments/{attachmentId}/finalize` | user | — | — | `Attachment{status: scanning\|ready\|quarantined}` | — | write | N | `ATTACHMENT_QUARANTINED` | F-DEED-010 |
| GET | `/attachments/{attachmentId}` | user (owner) | — | — | 302 to a 5-minute signed GET URL | — | default | — | — | F-DEED-010 |
| DELETE | `/attachments/{attachmentId}` | user (owner) | — | — | 204 | — | write | — | — | F-DEED-010 |

**Admin content (deeds)**

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET/POST | `/admin/categories` | admin | `content.deeds.manage` | `slug, icon, colorToken, sortOrder, lifeBalanceCategoryId, translations{en{title,description}, bn{…}}` | `AdminCategory` | B | default | k | `CONFLICT` | F-ADMIN-003, F-I18N-008 |
| PATCH/DELETE | `/admin/categories/{id}` | admin | `content.deeds.manage` | same; `If-Match` **required** | `AdminCategory` / 204 (blocked if deeds exist → `CONFLICT`) | — | default | — | `PRECONDITION_REQUIRED` | F-ADMIN-003, F-ADMIN-011 |
| GET/POST | `/admin/deeds` | admin | `content.deeds.manage` | `categoryId, estimatedMinutes, isFiveMinute, tags[], status(draft\|published\|archived), translations{en, bn}` | `AdminDeed` | C | default | k | — | F-ADMIN-003, F-DEED-001 |
| PATCH/DELETE | `/admin/deeds/{id}` | admin | `content.deeds.manage` | same; `If-Match` required | `AdminDeed` / 204 (archive) | — | default | — | — | F-ADMIN-003, F-ADMIN-011 |
| PUT | `/admin/{contentType}/{id}/translations/{locale}` | admin | `content.translations.manage` | localized fields; `If-Match` | `TranslationRecord{locale, fields, updatedAt}` (review state lives on the parent content, DL-031) | — | default | — | — | F-ADMIN-004, F-I18N-008 |
| GET | `/admin/translations/missing` | admin | `content.translations.manage` | `?contentType, locale` | `[{contentType, id, field, locale}]` | C | default | — | — | F-ADMIN-004, F-I18N-009 |
| GET | `/admin/content-versions` | admin | `content.versions.read` | `?contentType, contentId` | `ContentVersion[]` (snapshot, author, createdAt) | C | default | — | — | F-ADMIN-011 |
| POST | `/admin/content-versions/{versionId}/restore` | admin | `content.deeds.manage` | — | restored resource (creates a new version) | — | default | k | — | F-ADMIN-011 |

## 4. CAL — Calendar & Habit Tracking (P3)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/calendar` | user* | — | `view(day\|week\|month), anchor(YYYY-MM-DD)` | `CalendarView{range{from,to}, days[{localDate, scheduled, completed, partial, skipped, completionRate, hijri?}]}` | — | default | — | `REPORT_RANGE_TOO_LARGE` | F-CAL-001/002/003/006 |
| GET | `/calendar/year/{year}` | user* | — | — | `{months[{month, completionRate, completedCount}]}` | — | default | — | — | F-CAL-004 |
| GET | `/heatmap` | user* | — | `from, to (≤ 400 days), categoryId?` | `{cells[{localDate, level(0–4), count}]}` | — | default | — | `REPORT_RANGE_TOO_LARGE` | F-CAL-005 |
| GET | `/streaks` | user* | — | `?scope(overall\|plan), planId?` | `Streak[]{scope, planId?, current, longest, lastLocalDate, graceDaysUsed}` | B | default | — | — | F-CAL-007, F-CAL-008, F-GAME-003 |
| GET | `/streaks/milestones` | user* | — | — | `[{days(3,7,14,30,60,100,365), reachedAt?, scope}]` | B | default | — | — | F-CAL-009 (P4) |

**Streak rules** are normative in [SRS §7.5.1](../specifications/SRS.md). Calendar, heatmap and year views read `daily_summaries` with one range scan. Streaks are maintained as described in DL-023.

## 5. GROW, JRNL, PLAN, WELL, GAME, RPT (P4)

### 5.1 GROW
| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/goals` | user | — | `?periodType(custom\|weekly\|monthly), status(active\|achieved\|abandoned), lifeBalanceCategoryId` | `Goal[]` | C | default | — | — | F-GROW-001/002 |
| POST | `/goals` | user | — | `title(1–120), description?, periodType, startDate, endDate, lifeBalanceCategoryId?, linkedPlanIds[]?, target{type(count\|completion_rate\|manual), value}` | 201 `Goal` | — | write | k | `GOAL_INVALID_PERIOD` | F-GROW-001/002 |
| GET/PATCH/DELETE | `/goals/{goalId}` | user | — | PATCH: any field + `status`; `If-Match` | `Goal` (with progress) / 204 | — | default/write | — | `PRECONDITION_FAILED` | F-GROW-001 |
| GET/POST | `/goals/{goalId}/milestones` | user | — | `title, dueDate?, sortOrder` | `Milestone[]` / 201 | B | write | k | — | F-GROW-003 |
| PATCH/DELETE | `/goals/{goalId}/milestones/{milestoneId}` | user | — | `title?, dueDate?, completedAt?` | `Milestone` / 204 | — | write | — | — | F-GROW-003 |
| GET | `/growth/timeline` | user | — | `?from, to, types[](goal\|achievement\|streak\|reflection)` | `TimelineEvent[]` | C | default | — | — | F-GROW-004 |
| GET | `/growth/consistency` | user | — | `period(4w\|12w\|52w)` | `{byCategory[{categoryId, consistency(0–1), trend}], byPlan[...]}` | — | default | — | — | F-GROW-005, F-RPT-004 |
| GET | `/growth/focus-areas` | user | — | — | `[{planId, consistency, suggestionCode}]`. Neutral framing ("needs attention"), never "weak person". | B | default | — | — | F-GROW-006 |
| GET | `/growth/insights` | user | — | — | `Insight[]{code, params, severity(info\|celebrate\|suggest)}` (rule-based, localized client-side) | B | default | — | — | F-GROW-007 |
| GET/PUT | `/growth/reflections/{yyyy-mm}` | user | — | `answers{wentWell, challenge, learned, nextFocus}, mood?(1–5)` | `MonthlyReflection` | — | write | — | — | F-GROW-008 |
| GET | `/life-balance/categories` | user | — | — | 8 seeded categories (localized) | B | default | — | — | F-GROW-009 |
| GET/PUT | `/life-balance/assessments/{yyyy-mm}` | user | — | `scores[{categoryId, score(1–10), note?}]` | `Assessment` + `derivedActivity` (completions per category) | — | write | — | — | F-GROW-009 |

### 5.2 JRNL (all entries private, encrypted at application level; never visible to admins)
| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/journal` | user | — | `?type(journal\|intention\|reflection\|gratitude\|future_letter\|learning_note), from, to, q, tag, mood` | `JournalEntrySummary[]` (title + 140-char excerpt; sealed letters return no body) | C | default | — | — | F-JRNL-001…008 |
| POST | `/journal` | user | — | `type, localDate, title?(≤120), body(≤20000, markdown-lite), mood?(1–5), tags[]?(≤10), gratitudeItems[]?(≤5), deliverAt?(future_letter, ≥ +7 days)` | 201 `JournalEntry` | — | write | k | `VALIDATION_FAILED` | F-JRNL-001…006 |
| GET | `/journal/{entryId}` | user (owner) | — | — | `JournalEntry` | — | default | — | `JOURNAL_LOCKED` | F-JRNL-007 |
| PATCH | `/journal/{entryId}` | user (owner) | — | fields; `If-Match` **required** | `JournalEntry` | — | write | — | `PRECONDITION_REQUIRED, JOURNAL_LOCKED` | F-JRNL-001 |
| DELETE | `/journal/{entryId}` | user (owner) | — | — | 204 (hard delete) | — | write | — | — | F-JRNL-007 |
| GET | `/journal/prompts` | user | — | `?type(morning\|evening\|gratitude)` | `Prompt[]` (curated, localized) | B | default | — | — | F-JRNL-002/003 |
| POST | `/journal/exports` | user | — | `format(markdown\|json), from?, to?, types[]?` | 202 `ExportJob` | — | write | K | `EXPORT_IN_PROGRESS` | F-JRNL-009 |

Search (`q`) decrypts and scans only the caller's own entries in memory, after the plaintext filters (type, date, tags) are applied. No search index is stored ([SRS FR-JRNL-008-01](../specifications/SRS.md), ADR-014).

### 5.3 PLAN
| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/planner` | user | — | `from, to (≤ 31 days)` | `PlannerItem[]` + the linked deed checklist for those days | B | default | — | — | F-PLAN-001, F-PLAN-007 |
| POST | `/planner` | user | — | `localDate, title(1–120), priority(must\|should\|could), startTime?, endTime?, durationMin?, linkedPlanId?, recurrence?` | 201 `PlannerItem` | — | write | k | `RECURRENCE_INVALID` | F-PLAN-001/004/005/006 |
| PATCH/DELETE | `/planner/{itemId}` | user | — | `status(todo\|done\|moved\|dropped), movedTo?, sortOrder?` + fields | `PlannerItem` / 204 | — | write | — | — | F-PLAN-001/004 |
| POST | `/planner/{localDate}/morning` | user | — | `intention?, topPriorities[≤3], itemIds[]` | `DayPlan` (creates an intention journal entry if given) | — | write | k | — | F-PLAN-002, F-JRNL-002 |
| POST | `/planner/{localDate}/evening-review` | user | — | `reviews[{itemId, status, movedTo?}], reflection?` | `DayReview` | — | write | k | — | F-PLAN-003, F-JRNL-003 |
| GET/PUT | `/planner/weeks/{isoWeek}` | user | — | `focus[], goals[], notes` | `WeekPlan` | — | write | — | — | F-PLAN-007 |

### 5.4 WELL (self-reported only)
| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET/POST | `/wellbeing/logs` | user | — | `type(screen_time\|social_media\|bad_habit_avoided\|bad_habit_slip\|procrastination\|anger_reflection), localDate, valueMin?, habitKey?, note?, trigger?, response?` | `WellbeingLog[]` / 201 | C | write | k | — | F-WELL-001…005 |
| PATCH/DELETE | `/wellbeing/logs/{id}` | user | — | fields | `WellbeingLog` / 204 | — | write | — | — | F-WELL-001…005 |
| GET/PUT | `/wellbeing/goals` | user | — | `[{type, dailyLimitMin?, habitKey?, active}]` | `WellbeingGoal[]` | B | write | — | — | F-WELL-002/003 |
| GET | `/wellbeing/habits/{habitKey}/streak` | user | — | — | `{cleanDays, longest}` (framed positively) | — | default | — | — | F-WELL-003 |
| GET | `/affirmations/today` | user* | — | — | `Affirmation` (localized; deterministic per user per day) | — | default | — | — | F-WELL-007 |
| GET | `/affirmations` | user* | — | `?category` | `Affirmation[]` | C | default | — | — | F-WELL-007 |
| — | Digital detox challenges | — | — | Use `/challenges?kind=digital_detox` (§7) | — | — | — | — | — | F-WELL-006 |

### 5.5 GAME
| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/achievements` | user* | — | `?earned(true\|false)` | `[{achievement(localized), earnedAt?, progress?}]` (personal only; no comparisons) | B | default | — | — | F-GAME-001/002 |
| POST | `/achievements/{userAchievementId}/seen` | user* | — | — | 204 | — | write | N | — | F-GAME-008 |
| GET | `/tree` | user* | — | — | `TreeState{stage(0–7), leaves, blossoms, fruits, lastGrowthAt, seasonTheme}` (derived from completions; never shrinks punitively) | — | default | — | — | F-GAME-004 |
| GET | `/challenges/random` | user* | — | `?maxMinutes` | `PersonalChallenge{deed, expiresLocalDate}` | — | default | — | — | F-GAME-005 |
| POST | `/challenges/random/{id}/accept` | user* | — | — | 201 `DeedPlan` (once) | — | write | N | — | F-GAME-005/006 |
| GET/POST/DELETE | `/admin/achievements[/{id}]` | admin | `content.deeds.manage` | `slug, criteria{type(streak\|count\|category_count\|first), threshold, categoryId?}, icon, translations` | `AdminAchievement` | B | default | k | — | F-GAME-001, F-ADMIN-003 |

Achievements are evaluated by a worker job (`achievements.evaluate`) after completion events. Awards are idempotent through a unique key `(user_id, achievement_id)`.

### 5.6 RPT (P4 summaries; P10 monthly/yearly and exports)
| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/reports/summary` | user | — | `period(day\|week), anchor` | `{completed, scheduled, completionRate, byCategory[], highlights[]}` | — | default | — | — | F-RPT-001 |
| GET | `/reports/category-trends` | user | — | `from, to, granularity(week\|month)` | `{series[{categoryId, points[{period, count}]}]}` | — | default | — | `REPORT_RANGE_TOO_LARGE` | F-RPT-003 |
| GET | `/reports/consistency` | user | — | `period` | see `/growth/consistency` | — | default | — | — | F-RPT-004 |
| GET | `/reports/goals` | user | — | `from, to` | `{total, achieved, active, abandoned, items[]}` | — | default | — | — | F-RPT-005 |
| GET | `/reports/monthly/{yyyy-mm}` | user | — | — | `MonthlyReport` (generated by a worker and cached in `growth_snapshots`) | — | default | — | — | F-RPT-002 |
| GET | `/reports/yearly/{yyyy}` | user | — | — | `YearlyReport` | — | default | — | — | F-RPT-002 |
| POST | `/exports` | user | — | `kind(full_account\|completions_csv\|report_pdf\|journal), params{from?, to?, period?}` | 202 `ExportJob{id, status}` | — | write | K | `EXPORT_IN_PROGRESS, AUTH_EMAIL_NOT_VERIFIED` | F-RPT-006/007, F-AUTH-009 |
| GET | `/exports/{exportId}` | user (owner) | — | — | `ExportJob{status(queued\|running\|ready\|failed\|expired), downloadUrl?(signed, 15 min), expiresAt}` | — | default | — | — | F-RPT-006/007 |

## 6. ISL — Islamic Lifestyle (P5)

All `/islamic/*` endpoints return `403 ISLAMIC_MODULE_DISABLED` if the user has opted out (F-ISL-017). Worship records are private: there are no admin read endpoints and no sharing endpoints.

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET/PUT | `/islamic/preferences` | user | — | `enabled, location{lat, lng, label, source(manual\|device)}, calcMethod(MWL\|ISNA\|Egypt\|Makkah\|Karachi\|Tehran\|Dubai\|Kuwait\|Qatar\|Singapore\|Turkey\|MoonsightingCommittee\|Bangladesh_IFB*), asrMadhab(shafi\|hanafi), highLatRule, minuteAdjustments{fajr..isha}, hijriOffset(-2..2), quranTranslationId, showSunnahTracking, fastingReminders` | `IslamicPreferences` | — | write | — | — | F-ISL-017, F-ISL-002, F-ISL-013 |
| GET | `/islamic/prayer-times` | user | — | `from, to (≤ 31 days)` | `[{localDate, fajr, sunrise, dhuhr, asr, maghrib, isha, method, disclaimerKey}]` (local times). Also computed client-side with the same `packages/domain` code for offline use. | B | default | — | `PRAYER_LOCATION_REQUIRED` | F-ISL-002 |
| GET | `/islamic/salah` | user | — | `from, to` | `SalahRecord[]` | B | default | — | — | F-ISL-001 |
| PUT | `/islamic/salah/{localDate}/{prayer}` | user / device | — | `prayer(fajr\|dhuhr\|asr\|maghrib\|isha\|witr\|sunnah_*), status(prayed\|prayed_late\|qada\|missed\|excused), inJamaah?, notes?` | `SalahRecord` (upsert) | — | write | N | `LOCAL_DATE_OUT_OF_RANGE` | F-ISL-001 |
| GET | `/islamic/quran/surahs` | user | — | — | 114 surahs (names EN/BN/AR, ayah counts, pages). Cached from Quran.com. | B | default | — | `EXTERNAL_CONTENT_UNAVAILABLE` | F-ISL-003 |
| GET | `/islamic/quran/verses` | user | — | `surah, fromAyah, toAyah (≤ 50), translationId?` | verses with Arabic text + translation + source attribution | B | default | — | `EXTERNAL_CONTENT_UNAVAILABLE` | F-ISL-003, F-ISL-018 |
| GET/POST | `/islamic/quran/reading-logs` | user | — | `localDate, unit(page\|ayah\|juz), from{surah, ayah}?, to{…}?, pages?, minutes?` | `QuranReadingLog[]` / 201 | C | write | k | — | F-ISL-003 |
| DELETE | `/islamic/quran/reading-logs/{id}` | user | — | — | 204 | — | write | — | — | F-ISL-003 |
| GET/PUT | `/islamic/quran/memorization` | user | — | `[{surah, fromAyah, toAyah, status(learning\|memorized\|revising), lastRevisedOn}]` | `MemorizationProgress[]` + summary (% of the Quran) | B | write | — | — | F-ISL-004 |
| GET/POST | `/islamic/khatam-plans` | user | — | `startDate, targetDate, startPage?, unit(page)` | `KhatamPlan` with a daily target and progress | B | write | k | `BUSINESS_RULE_VIOLATION` | F-ISL-005 |
| PATCH/DELETE | `/islamic/khatam-plans/{id}` | user | — | — | — | — | write | — | — | F-ISL-005 |
| GET | `/islamic/dhikr/presets` | user | — | — | `DhikrPreset[]` (Arabic, transliteration, EN/BN meaning, source, recommended count) | B | default | — | — | F-ISL-006 |
| POST | `/islamic/dhikr/logs` | user / device | — | `presetId? \| customLabel, localDate, count(1–100000), sessionId` | 201 `DhikrLog` (the tasbih counter batches counts offline) | — | write | k | — | F-ISL-006, F-ISL-007 |
| GET | `/islamic/dhikr/logs` | user | — | `from, to` | `DhikrLog[]` + daily totals | C | default | — | — | F-ISL-006 |
| GET | `/islamic/duas` | user | — | `?category, q` | `Dua[]` (verified only) | C | default | — | — | F-ISL-008 |
| GET | `/islamic/duas/{id}` | user | — | — | `Dua` with `source{collection, reference, grade?, url}` | — | default | — | `CONTENT_NOT_VERIFIED` | F-ISL-008, F-ISL-018 |
| GET | `/islamic/sunnah-practices` | user | — | — | `SunnahPractice[]` (sourced) | B | default | — | — | F-ISL-009 |
| PUT | `/islamic/practice-logs/{localDate}/{practiceKey}` | user / device | — | `done(bool), note?` (`practiceKey` includes `tahajjud`, `duha`, `ishraq`, …) | `PracticeLog` | — | write | N | — | F-ISL-009, F-ISL-010 |
| GET | `/islamic/practice-logs` | user | — | `from, to, practiceKey?` | `PracticeLog[]` | C | default | — | — | F-ISL-009/010 |
| GET | `/islamic/fasting` | user | — | `from, to` | `FastingRecord[]` | B | default | — | — | F-ISL-011 |
| PUT | `/islamic/fasting/{localDate}` | user | — | `type(ramadan\|monday_thursday\|ayyam_al_bid\|arafah\|ashura\|qada\|nafl\|other), status(fasted\|broken\|excused\|intended), note?` | `FastingRecord` | — | write | N | — | F-ISL-011 |
| GET | `/islamic/fasting/summary` | user | — | `hijriYear` | `{ramadanFasted, qadaOwed, nafl}` | — | default | — | — | F-ISL-011 |
| GET/PUT | `/islamic/ramadan-plans/{hijriYear}` | user | — | `goals{quranKhatams, dailyPages, charityTarget?, taraweehTarget}, dailyChecklistPlanIds[], lastTenNightsPlan[]` | `RamadanPlan` + progress | — | write | — | — | F-ISL-012 |
| GET | `/islamic/hijri` | user* | — | `from, to (≤ 400 days)` | `[{gregorian, hijri{y,m,d}, monthNameKey, events[]}]` (user offset applied) | B | default | — | — | F-ISL-013 |
| POST | `/islamic/zakat/calculate` | user | — | `currency, nisabBasis(gold\|silver), metalPricePerGram, assets{cash, bank, gold_g, silver_g, investments, receivables, businessInventory}, liabilities{dueWithinYear}, hawlCompleted(bool)` | `{nisabValue, zakatableWealth, zakatDue, rate:0.025, explanationKeys[], disclaimerKey}` (stateless) | — | write | — | `ZAKAT_INPUT_INVALID` | F-ISL-014 |
| POST/GET/DELETE | `/islamic/zakat/calculations[/{id}]` | user | — | save the calculation snapshot (explicit user action) | `ZakatCalculation` | C | write | k | — | F-ISL-014 |
| GET | `/islamic/hadith/today` | user* | — | — | `HadithEntry` (verified, rotated daily by date seed; text + translation + collection, number, grade, source url) | — | default | — | — | F-ISL-016, F-ISL-018 |
| GET | `/islamic/learning` | user* | — | `?topic, level` | `LearningArticle[]` (admin-curated, verified, sourced) | C | default | — | — | F-ISL-015 |
| GET | `/islamic/learning/{slug}` | user* | — | — | `LearningArticle` | — | default | — | `CONTENT_NOT_VERIFIED` | F-ISL-015 |

**Admin Islamic content (two-person verification, F-ADMIN-005 / F-ISL-018)**

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET/POST | `/admin/islamic/sources` | admin | `content.islamic.manage` | `name, type(quran_api\|hadith_collection\|book\|website), citationFormat, url, license` | `ContentSource` | B | default | k | — | F-ISL-018 |
| GET/POST | `/admin/islamic/{kind}` (`duas`, `hadith`, `dhikr-presets`, `sunnah-practices`, `learning`) | admin | `content.islamic.manage` | `arabicText?, transliteration?, translations{en, bn}, sourceId, reference, grade?, category` | 201 item, `status: draft` | C | default | k | — | F-ADMIN-005 |
| PATCH | `/admin/islamic/{kind}/{id}` | admin | `content.islamic.manage` | fields; `If-Match` required. Editing a verified item returns it to `in_review`. | item | — | default | — | `PRECONDITION_REQUIRED` | F-ADMIN-005, F-ADMIN-011 |
| POST | `/admin/islamic/{kind}/{id}/submit` | admin | `content.islamic.manage` | — | item (`in_review`) | — | default | N | — | F-ADMIN-005 |
| POST | `/admin/islamic/{kind}/{id}/verify` | admin | `content.islamic.verify` | `decision(approve\|reject), comment` (verifier ≠ last editor, enforced) | item (`verified` → visible to users, or `draft`) | — | default | N | `PERMISSION_DENIED` (self-verify) | F-ISL-018 |
| POST | `/admin/islamic/{kind}/{id}/archive` | admin | `content.islamic.manage` | — | item | — | default | N | — | F-ADMIN-005 |

## 7. COMM — Family & Community (P7)

Visibility of every shareable record is `private` (default) \| `group:{groupId}` \| `community` \| `community_anonymous`. Sharing is always an explicit action. Worship and journal records **cannot** be shared through these endpoints.

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/groups` | user | — | `?type(family\|community), membership(mine\|discover)` | `Group[]` (discover lists public community groups only) | C | default | — | — | F-COMM-001, F-COMM-006 |
| POST | `/groups` | user | — | `type, name(2–60), description?, visibility(private\|public — community only), maxMembers(family ≤ 20)` | 201 `Group` (creator = owner) | — | write | k | `AUTH_EMAIL_NOT_VERIFIED` | F-COMM-001, F-COMM-006 |
| GET/PATCH/DELETE | `/groups/{groupId}` | user (member / owner) | — | name, description, settings{shareCalendar, shareAchievements} | `Group` / 204 | — | write | — | — | F-COMM-001/004/005 |
| GET | `/groups/{groupId}/members` | user (member) | — | — | `Member[]{userId, displayName, role(owner\|guardian\|member), joinedAt}` | C | default | — | — | F-COMM-001 |
| PATCH/DELETE | `/groups/{groupId}/members/{userId}` | user (owner; self for leave) | — | `role` | `Member` / 204 | — | write | — | `CONFLICT` (last owner) | F-COMM-001 |
| POST | `/groups/{groupId}/invitations` | user (owner/guardian) | — | `email?` (otherwise link/code), `expiresInHours(1–168)`, `maxUses(1–20)` | 201 `{code, url, qrPayload, expiresAt}` | — | write | K | `GROUP_MEMBER_LIMIT` | F-COMM-002 |
| GET | `/invitations/{code}` | none / user | — | — | `InvitationPreview{groupName, inviterName, type, expiresAt}` | — | default | — | `INVITATION_INVALID` | F-COMM-002 |
| POST | `/invitations/{code}/accept` | user | — | — | `Membership` | — | write | N | `INVITATION_INVALID, ALREADY_MEMBER, GROUP_MEMBER_LIMIT` | F-COMM-002 |
| DELETE | `/groups/{groupId}/invitations/{id}` | user (owner) | — | — | 204 | — | write | — | — | F-COMM-002 |
| GET | `/groups/{groupId}/calendar` | user (member) | — | `from, to` | per member: only items they explicitly shared plus group challenge progress | — | default | — | — | F-COMM-004 |
| GET | `/groups/{groupId}/achievements` | user (member) | — | — | shared achievements + group milestones | B | default | — | — | F-COMM-005 |
| GET | `/challenges` | user | — | `?scope(group\|community\|personal), groupId?, status(upcoming\|active\|ended), kind(deed\|digital_detox\|ramadan\|custom)` | `Challenge[]` | C | default | — | — | F-COMM-003, F-WELL-006 |
| POST | `/challenges` | user (group owner) / admin (`campaigns.manage` for community) | — | `scope, groupId?, title, description, kind, startDate, endDate, deedIds[], goal{type, target}` | 201 `Challenge` | — | write | k | — | F-COMM-003 |
| POST | `/challenges/{id}/join` / DELETE `/challenges/{id}/join` | user | — | `visibility(group\|anonymous)` | `Participation` / 204 | — | write | N | `CHALLENGE_NOT_ACTIVE` | F-COMM-003, F-WELL-006 |
| GET | `/challenges/{id}/progress` | user (participant) | — | — | `{mine, group{aggregate, participants?[]}}`. Aggregates only for community challenges; **no ranked leaderboard**. | — | default | — | — | F-COMM-003, F-GAME-008 |
| GET | `/campaigns` | user* / none | — | `?status, q` | `Campaign[]` (published) | C | default | — | — | F-COMM-007 |
| GET | `/campaigns/{slug}` | user* / none | — | — | `Campaign{title, story, deedIds, startDate, endDate, aggregateParticipation}` | — | default | — | — | F-COMM-007 |
| POST | `/campaigns/{slug}/participate` | user | — | `source(web\|qr), qrToken?` | 201 `CampaignParticipation` (+ creates plans for the campaign deeds if chosen) | — | write | N | `INVITATION_INVALID` (bad qr token) | F-COMM-007, F-INTG-006 |
| GET | `/volunteer-opportunities` | user* | — | `?near(lat,lng,km), from, to, category` | `VolunteerOpportunity[]` (admin-curated; external link) | C | default | — | — | F-COMM-008 |
| POST/DELETE | `/volunteer-opportunities/{id}/interest` | user | — | — | 204 (private bookmark; nothing is shared with the organizer in v1) | — | write | N | — | F-COMM-008 |
| GET | `/posts` | user | — | `?scope(community\|group), groupId?, type(kindness_story), sort(-createdAt)` | `Post[]` (author hidden if anonymous; blocked users filtered) | C | default | — | — | F-COMM-009/010 |
| POST | `/posts` | user (verified) | — | `scope, groupId?, title?(≤120), body(10–5000), anonymous(bool), attachmentIds[]?(≤4), linkedCompletionId?` | 201 `Post{status: published\|pending_review}` (pre-moderation check) | — | write | k | `CONTENT_REJECTED, AUTH_EMAIL_NOT_VERIFIED` | F-COMM-009/010/014 |
| PATCH/DELETE | `/posts/{postId}` | user (author) | — | body, title | `Post` / 204 | — | write | — | — | F-COMM-009 |
| GET/POST | `/posts/{postId}/comments` | user | — | `body(1–1000)` | `Comment[]` / 201 | C | write | k | `CONTENT_REJECTED, USER_BLOCKED` | F-COMM-009 |
| DELETE | `/comments/{commentId}` | user (author / post author) | — | — | 204 | — | write | — | — | F-COMM-009 |
| PUT/DELETE | `/posts/{postId}/reactions/{kind}` | user | — | `kind(appreciate\|dua\|inspired)` (positive only; no dislike) | 204; counts visible to the author only | — | write | N | — | F-COMM-011, F-GAME-007 |
| POST | `/reports` | user | — | `targetType(post\|comment\|user\|group), targetId, reason(spam\|harassment\|hate\|misinformation_religious\|self_harm\|privacy\|other), details?(≤1000)` | 201 `{reportId}` | — | write | k | — | F-COMM-013 |
| GET/PUT/DELETE | `/blocks[/{userId}]` | user | — | — | `BlockedUser[]` / 204 | C | write | N | — | F-COMM-013 |
| GET/PUT | `/me/privacy` | user | — | `defaultShareVisibility(private), allowGroupInvitesFrom(anyone\|nobody), showInGroupMemberLists, communityDisplayName` | `PrivacySettings` | — | write | — | — | F-COMM-014 |

**Admin community & campaigns**

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/admin/moderation/queue` | admin | `moderation.read` | `?status(open\|actioned\|dismissed), reason, targetType` | `ModerationCase[]` (target snapshot, reports, author history) | C | default | — | — | F-COMM-012, F-ADMIN-008 |
| POST | `/admin/moderation/cases/{caseId}/actions` | admin | `moderation.act` | `action(dismiss\|hide\|remove\|warn_author\|suspend_author\|ban_author), reason, durationDays?` | `ModerationCase` + `moderation_actions` row; the author is notified | — | default | k | — | F-COMM-012, F-ADMIN-008 |
| POST | `/admin/moderation/cases/{caseId}/reveal-author` | superadmin | `moderation.deanonymize` ⚑ | `reason(10–500)` | `{authorUserId, displayName}`. Writes an `audit_logs` entry (`moderation.author_revealed`) | — | default | — | `RESOURCE_NOT_FOUND` | F-COMM-010, F-COMM-012, F-ADMIN-008 |
| GET/POST | `/admin/campaigns` | admin | `campaigns.manage` | `slug, translations, deedIds, startDate, endDate, status, qrEnabled` | `AdminCampaign` | C | default | k | `CONFLICT` | F-ADMIN-006, F-COMM-007 |
| PATCH/DELETE | `/admin/campaigns/{id}` | admin | `campaigns.manage` | `If-Match` | — | — | default | — | — | F-ADMIN-006 |
| POST | `/admin/campaigns/{id}/qr` | admin | `campaigns.manage` | `label, maxUses?, expiresAt?` | `{qrToken, url, svg}` | — | default | k | — | F-INTG-006 |
| GET/POST/PATCH/DELETE | `/admin/volunteer-opportunities[/{id}]` | admin | `campaigns.manage` | `title, org, location, startsAt, url, translations` | item | C | default | k | — | F-COMM-008 |
| GET/POST/PATCH | `/admin/challenges[/{id}]` | admin | `campaigns.manage` | community challenges | item | C | default | k | — | F-COMM-003 |

## 8. NOTIF — Notifications (P6)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/notifications` | user* | — | `?unreadOnly, type` | `Notification[]{id, type, titleKey, bodyKey, params, deepLink, readAt, createdAt}` (rendered in the request locale) | C | default | — | — | F-NOTIF-001, F-I18N-006 |
| GET | `/notifications/unread-count` | user* | — | — | `{count}` | — | default | — | — | F-NOTIF-001 |
| POST | `/notifications/{id}/read` / `/notifications/read-all` | user* | — | — | 204 | — | write | N | — | F-NOTIF-001 |
| GET/PUT | `/notification-preferences` | user* | — | `channels{inApp, email, push}`, `types{daily_reminder, incomplete_tasks, prayer_times, challenge, community, weekly_digest, achievements, ai_messages, future_letter}{inApp, email, push}`, `quietHours{start, end, enabled}`, `digest{weekly: bool, dayOfWeek}` | `NotificationPreferences` | — | write | — | — | F-NOTIF-009, F-NOTIF-008 |
| GET | `/reminders` | user* | — | — | `Reminder[]` | B | default | — | — | F-NOTIF-002/003 |
| POST | `/reminders` | user* | — | `kind(daily_checklist\|incomplete_tasks\|plan\|prayer\|custom), time(HH:mm)?, offsetMin?(prayer, -60..60), daysOfWeek[]?, planId?, prayer?, message?(custom, ≤140), channels[]` | 201 `Reminder` (next fire computed in the user's TZ) | — | write | k | — | F-NOTIF-002/003/004/010 |
| PATCH/DELETE | `/reminders/{id}` | user* | — | fields, `enabled` | `Reminder` / 204 | — | write | — | — | F-NOTIF-003 |
| POST | `/push-subscriptions` | user* | — | `endpoint(https), keys{p256dh, auth}, userAgent, expirationTime?` | 201 `{id}` (upsert by endpoint hash) | — | write | N | `PUSH_SUBSCRIPTION_INVALID` | F-NOTIF-006, F-INTG-002 |
| DELETE | `/push-subscriptions/{id}` | user* | — | — | 204 | — | write | — | — | F-NOTIF-006 |
| GET | `/push/vapid-public-key` | none | — | — | `{publicKey}` | — | default | — | — | F-INTG-002 |
| POST | `/push-subscriptions/test` | user* | — | — | 202 (sends a test push) | — | auth-strict | — | — | F-NOTIF-006 |
| GET | `/email/unsubscribe` | none | — | `token` (signed, per type) | HTML confirm page (RFC 8058 one-click via POST) | — | default | N | — | F-NOTIF-005 |

**Admin**

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET/POST | `/admin/broadcasts` | admin | `notifications.broadcast` (POST ⚑) | `audience{all\|role\|locale}, channels[], translations{en{title, body}, bn{…}}, deepLink?, scheduledAt` | `Broadcast{status, estimatedRecipients}` (respects preferences and quiet hours) | C | default | K | — | F-ADMIN-007 |
| POST | `/admin/broadcasts/{id}/cancel` | admin | `notifications.broadcast` | — | `Broadcast` | — | default | N | — | F-ADMIN-007 |
| GET | `/admin/jobs` | admin | `jobs.read` | `?queue, state(created\|active\|completed\|failed\|retry)` | `JobSummary[]` + per-queue counts | C | default | — | — | F-ADMIN-014 |
| POST | `/admin/jobs/{jobId}/retry` / `/cancel` | superadmin | `jobs.manage` | — | `JobSummary` | — | default | N | — | F-ADMIN-014 |

## 9. AI — AI-Powered Intelligence (P8)

Every `/ai/*` endpoint first checks, in order:
1. the global flag `ai.enabled` and the platform budget (`AI_BUDGET_EXHAUSTED`)
2. the user's opt-in (`AI_DISABLED`)
3. the current consent version (`AI_CONSENT_REQUIRED`)
4. the user quota (`AI_QUOTA_EXCEEDED`)

Request content is minimized: no email, no name unless needed, and journal text only when the user explicitly picks it. Responses carry `aiGenerated: true` and `modelFamily`.

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/ai/consent` | user | — | — | `{currentVersion, acceptedVersion?, acceptedAt?, enabled, dataUsePolicyUrl}` | — | default | — | — | F-AI-002 |
| PUT | `/ai/consent` | user | — | `enabled(bool), acceptedVersion, allowJournalContext(bool), allowWorshipContext(bool)` | `AiConsent` (disabling also purges conversations if `purge=true`) | — | write | — | — | F-AI-002 |
| GET | `/ai/usage` | user | — | — | `{period, used{requests, tokens}, limits, resetAt}` | — | default | — | — | F-AI-003 |
| POST | `/ai/suggestions` | user | — | `context{timeAvailableMin?, mood?, categoryIds?[], location?: home\|work\|outside}, count(1–5)` | `[{title, description, categoryId, estimatedMinutes, matchedDeedId?, rationaleKey}]` (each with a one-tap add-plan action) | B | write | K | AI codes | F-AI-004 |
| POST | `/ai/reflections` | user | — | `localDate, type(morning\|evening), includeChecklist(bool)` | `{prompts[1–3], summary?}` | — | write | K | AI codes | F-AI-006 |
| POST | `/ai/weekly-report` | user | — | `isoWeek` | 202 `{insightId}` → GET `/ai/insights/{id}` | — | write | K | AI codes | F-AI-007 |
| GET | `/ai/insights` | user | — | `?type(weekly_report\|growth_insight\|motivation\|suggestion)` | `AiInsight[]` | C | default | — | — | F-AI-007, F-AI-009, F-AI-012 |
| GET/DELETE | `/ai/insights/{id}` | user | — | — | `AiInsight` / 204 | — | default | — | — | F-AI-007/009 |
| POST | `/ai/insights/{id}/feedback` | user | — | `helpful(bool), reason?` | 204 | — | write | N | — | F-AI-003 (quality) |
| POST | `/ai/growth-insights` | user | — | `period(4w\|12w)` | `AiInsight` | — | write | K | AI codes | F-AI-009 |
| GET | `/ai/motivation/today` | user | — | — | `AiInsight` (cached daily; a curated non-AI fallback when AI is off) | — | default | — | — | F-AI-012 |
| POST | `/ai/tasks/parse` | user | — | `text(≤500), localDate` | `{proposed[{type(plan\|planner_item\|reminder), fields}], confidence}` (**never auto-saved**) | — | write | K | AI codes | F-AI-008 |
| GET/POST | `/ai/conversations` | user | — | `mode(coach\|assistant), title?` | `Conversation[]` / 201 | C | write | K | AI codes | F-AI-005, F-AI-010 |
| GET/DELETE | `/ai/conversations/{id}` | user | — | — | `Conversation` + messages / 204 (hard delete) | — | default | — | — | F-AI-005/010 |
| POST | `/ai/conversations/{id}/messages` | user | — | `content(≤4000), attachContext{checklist?, goals?, streaks?}` | `text/event-stream` (SSE) of `{delta}` then `{message, usage}`; or JSON when `Accept: application/json` | — | write | K | `AI_OUTPUT_BLOCKED` + AI codes | F-AI-005, F-AI-010, F-AI-013 |
| POST | `/ai/voice-journal/transcriptions` | user | — | `uploadId` (audio webm/m4a ≤ 10 MB, ≤ 5 min), `locale` | 202 → `{transcript, draftEntry}`. Audio deleted after transcription. Provider is behind `SpeechToTextProvider`. | — | write | K | AI codes | F-AI-011 |
| POST | `/ai/journal/{entryId}/summary` | user (owner) | — | requires `allowJournalContext` | `{summary}` (not stored unless the user saves it) | — | write | K | AI codes | F-JRNL-010 |
| GET | `/admin/ai/usage` | superadmin | `ai.admin` | `from, to, groupBy(day\|feature\|model)` | `{requests, inputTokens, outputTokens, costUsd, blockedCount}` (no prompt contents) | — | default | — | — | F-AI-003 |
| PUT | `/admin/ai/settings` | superadmin | `ai.admin` ⚑ | `enabled, monthlyBudgetUsd, perUserDailyRequests, perFeature{enabled}` (models and prices come from env/config, DL-019; quota defaults per [SRS FR-AI-003-01](../specifications/SRS.md)) | `AiSettings` | — | default | — | — | F-AI-001/002/003 |

## 10. PWA — Sync protocol (P9) and client support (P2)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | `/sync` | user* / device | — | `SyncRequest` (below, ≤ 100 ops) | `SyncResponse` | — | write | per-op `opId` | `SYNC_BATCH_TOO_LARGE, CLIENT_VERSION_UNSUPPORTED` | F-PWA-005, F-PWA-006, F-WIDGET-006 |
| GET | `/sync/changes` | user* / device | — | `cursor?(changeSeq), limit(≤500)` | `{changes[{entity, id, op(upsert\|delete), changeSeq, data?}], nextCursor, hasMore}`, or `304` if unchanged | C | write | — | `INVALID_CURSOR`, `410` (→ full resync) | F-PWA-004, F-PWA-006 |
| GET | `/client/config` | none / user* | — | `?client(web\|widget)&version` | `{minSupportedVersion, latestVersion, flags, maintenance}` | — | default | — | — | F-PWA-008, F-PWA-009 |

### 10.1 `POST /sync`: batched idempotent mutations (DL-015)

The rules are normative in [SRS §19](../specifications/SRS.md) (FR-PWA-006-11…18). This section defines only the wire format.

```jsonc
// Request
{
  "clientId": "0192…",              // stable per install (IndexedDB / DataStore)
  "protocolVersion": 1,
  "ops": [                           // max 100, applied in array order
    {
      "opId": "0192f1d0-…",           // UUIDv7 generated offline; the per-op idempotency key
      "entity": "completion",         // completion | salah_record | dhikr_log | practice_log | fasting_record | quran_reading_log | planner_item | wellbeing_log
      "op": "upsert",                 // upsert | delete
      "entityId": "0192…",            // client-generated UUIDv7 for creates
      "clientTime": "2026-10-30T05:12:00.000Z",
      "payload": { "planId": "…", "localDate": "2026-10-30", "status": "done" }
    }
  ]
}
// Response 200 (always 200 if the envelope is valid; per-op outcomes inside)
{
  "results": [
    { "opId": "…", "status": "applied",   "entityId": "…", "changeSeq": 81234 },
    { "opId": "…", "status": "duplicate", "entityId": "…", "changeSeq": 81200 },  // opId seen before → original result
    { "opId": "…", "status": "conflict",  "code": "SYNC_CONFLICT", "server": { "changeSeq": 81240, "data": { … } } },
    { "opId": "…", "status": "rejected",  "code": "LOCAL_DATE_OUT_OF_RANGE", "i18nKey": "errors.local_date.out_of_range" }
  ],
  "cursor": "81240"                   // latest change_seq visible to this user; pull only if it is ahead of the client's cursor
}
```

**Rules.**
1. All `opId`s in a batch are checked against `sync_operations(user_id, op_id)` with **one query** (`op_id = ANY($1)`). A seen op returns `duplicate` with its stored result. Retention follows [SRS NFR-PRIVACY-009](../specifications/SRS.md).
2. Each op runs in its own transaction. One failure does not roll back the others. Ops for the same `entityId` are applied in order.
3. **Conflicts use row-level last-writer-wins on `clientTime`** ([SRS FR-PWA-006-13](../specifications/SRS.md)). There are two exceptions. `dhikr_log` is additive: counts with different `opId`s accumulate, so it never conflicts. Natural-key records (completion, salah, practice, fasting) are upserted on their natural key. When an older write loses, the result is `conflict` with the winning row, the losing payload is kept in `sync_operations.conflict`, and the client shows a toast. There is no field-level merge and no conflict-review UI.
4. Validation is identical to the REST endpoints (shared Zod schemas). `localDate` is checked as in [SRS FR-PWA-006-14](../specifications/SRS.md) (clientTime clamp) and the edit window ([FR-CAL-011-01](../specifications/SRS.md)).
5. Journals are **not** syncable (online-only in v1). Device tokens may use only `completion`, `salah_record`, `dhikr_log` and `practice_log`. Any other entity returns `rejected / SYNC_ENTITY_NOT_SUPPORTED`.
6. Side effects run once per batch (DL-023). `daily_summaries` is updated in each op's transaction. Today and yesterday streaks update in place. Past-day changes enqueue one debounced `streaks.rebuild:{userId}` job.

### 10.2 Delta pull
`GET /sync/changes?cursor=<changeSeq>` returns the caller's rows whose `change_seq` is greater than the cursor, across all syncable entities, in one ordered scan. `change_seq` comes from a single global sequence, so there are no timestamp ties. If nothing changed, the response is `304`. Deletes come from tombstones, which are retained per [SRS FR-PWA-006-16](../specifications/SRS.md). A cursor older than the tombstone horizon gets `410 Gone`, and the client then runs a full resync.

## 11. WIDGET — Android widget (P9)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | `/widget/link-codes` | user (web) | — | — | 201 `{code(8 chars), appLinkUrl, expiresAt}` (stored as `verification_tokens(type=widget_link)`) | — | write | — | — | F-WIDGET-001 |
| POST | `/widget/link` | none | — | `code, deviceName(≤40), appVersion, osVersion` | 201 `{deviceToken, deviceId, user{locale, timezone}}` | — | auth-strict | N (single-use code) | `TOKEN_INVALID_OR_EXPIRED, CLIENT_VERSION_UNSUPPORTED` | F-WIDGET-001 |
| GET | `/widget/snapshot` | device | — | `?localDate` (default: today in the user TZ), `If-None-Match` | `WidgetSnapshot` (below), ETag, or `304`. The ETag is derived from (`change_seq`, localDate, prayer slot, locale) and checked **before** the snapshot is built (DL-020) | — | default | — | — | F-WIDGET-002…005, F-WIDGET-007/008/009 |
| POST | `/sync` | device | — | see §10 (restricted entities) | — | — | write | per-op `opId` | — | F-WIDGET-006 |
| DELETE | `/widget/devices/current` | device | — | — | 204 (unlink from the widget side) | — | write | — | — | F-WIDGET-001 |

### 11.1 `WidgetSnapshot` (target ≤ 8 KB gzipped)
```jsonc
{
  "v": 1,
  "generatedAt": "2026-10-30T05:00:00.000Z",   // informational; NOT part of the ETag
  "staleAfterSec": 1800,            // widget shows a stale indicator after this (F-WIDGET-007)
  "user": { "locale": "bn", "timezone": "Asia/Dhaka", "numerals": "beng", "displayName": "…" },
  "day": {
    "localDate": "2026-10-30",
    "hijri": { "y": 1448, "m": 5, "d": 8, "label": "৮ জমাদিউল আউয়াল ১৪৪৮" },
    "progress": { "done": 4, "total": 7, "rate": 0.57 },
    "streak": { "current": 12, "longest": 30 }
  },
  "items": [                        // max 12, ordered by user sort; medium widget shows 4–6
    { "planId": "…", "title": "…", "icon": "hand-heart", "categoryColor": "leaf", "target": 1, "done": 1, "status": "done" }
  ],
  "islamic": {                      // omitted if module disabled
    "prayers": [ { "key": "fajr", "time": "04:52", "status": "prayed" }, { "key": "dhuhr", "time": "11:45", "status": null } ],
    "nextPrayer": { "key": "asr", "time": "15:41" },
    "quranTodayPages": 2, "dhikrToday": 300
  },
  "deepLinks": {                    // App Links into the web app (F-WIDGET-009)
    "today": "https://app.<domain>/bn/today",
    "plan": "https://app.<domain>/bn/plans/{planId}",
    "salah": "https://app.<domain>/bn/islamic/salah"
  },
  "strings": { "progressLabel": "আজকের অগ্রগতি", "staleLabel": "পুরোনো তথ্য", "emptyLabel": "…" } // pre-localized minimal labels
}
```

## 12. INTG — Integrations

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| — | (internal) `EmailProvider.send()` | — | — | Resend / SMTP adapter; webhook `POST /webhooks/email` (signed) for bounces and complaints. A hard bounce disables the email channel. | — | — | — | N (provider message id) | — | F-INTG-001 |
| — | (internal) `PushProvider.send()` | — | — | `web-push` with VAPID. A 404 or 410 from the push service deletes the subscription. | — | — | — | — | — | F-INTG-002 |
| GET | `/integrations/google-calendar/connect` | user | — | — | 302 OAuth (scope `calendar.events`, incremental) | — | default | — | — | F-INTG-003, F-PLAN-008 |
| GET/DELETE | `/integrations/google-calendar` | user | — | `settings{exportPlannerItems, exportReminders, calendarId}` | status / 204 (revokes the Google token) | — | write | — | — | F-INTG-003 |
| GET | `/me/calendar.ics` | user (signed private URL token) | — | — | iCal feed of planner items and reminders (read-only alternative to Google sync) | — | default | — | — | F-INTG-003 |
| — | Wearables | — | — | **Not in the initial release (W).** No endpoints. | — | — | — | — | — | F-INTG-004 |
| GET/POST/DELETE | `/admin/api-clients[/{id}]` | superadmin | `api_clients.manage` ⚑ | `name, scopes[](deeds.read, checklist.read, completions.write, campaigns.read), rateLimitPerMin, ownerUserId?` | `{client, secret(shown once)}` | C | default | k | — | F-INTG-005 |
| GET | `/public/v1/campaigns`, `/public/v1/deeds` | client | scope | — | public, read-only, non-personal content | C | default | — | `TOKEN_SCOPE_INSUFFICIENT` | F-INTG-005 |
| GET/POST | `/public/v1/me/checklist`, `/public/v1/me/completions` | client (user-delegated OAuth, future) | scope | — | — | C | default | N | — | F-INTG-005 (future; documented, not built in v1) |
| — | QR campaign | — | — | see `/campaigns/{slug}/participate` with `qrToken` | — | — | — | — | — | F-INTG-006 |

## 13. ADMIN — Platform operations (P10 unless noted)

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/health/live` | none | — | — | `{status:"ok"}` | — | — | — | — | F-ADMIN-012 (P2) |
| GET | `/health/ready` | none (internal network) | — | — | `{db, jobs, email, storage}` statuses | — | — | — | `DEPENDENCY_UNAVAILABLE` | F-ADMIN-012 (P2) |
| GET | `/admin/system/health` | admin | `system.health.read` | — | `{api{p95, errorRate}, db{connections, slowQueries}, queues{depth, failed}, externalDeps[], version}` | — | default | — | — | F-ADMIN-012 |
| GET | `/admin/system/api-analytics` | admin | `system.health.read` | `from, to, groupBy(route\|status\|client)` | aggregated counts, latency percentiles (no PII) | — | default | — | — | F-ADMIN-013 |
| GET | `/admin/system/backups` | admin | `system.health.read` | — | `[{provider:"neon", lastBackupAt, pitrWindowHours, lastRestoreTestAt, status}]` | B | default | — | — | F-ADMIN-015 |
| GET/POST/PATCH | `/admin/experiments[/{key}]` | superadmin | `flags.manage` | `key, variants[{key, weight}], audience, metric, status(draft\|running\|stopped)` | `Experiment` + exposure counts | B | default | k | — | F-ADMIN-010 |
| GET | `/experiments/assignments` | user* | — | — | `{[experimentKey]: variant}` (sticky hash of userId) | — | default | — | — | F-ADMIN-010 |
| POST | `/analytics/events` | user* / none | — | `events[{name(whitelisted), props(whitelisted, no free text), ts}]` (≤ 50). **Only sent if the analytics consent cookie is set.** | 202 | — | write | — | — | F-RPT-008 |
| GET | `/admin/analytics/product` | admin | `system.health.read` | `metric(dau\|wau\|retention\|feature_adoption), from, to` | aggregates with k-anonymity ≥ 10 | — | default | — | — | F-RPT-008 |
| — | Subscription management | — | — | **Won't (initial release).** No endpoints. | — | — | — | — | — | F-ADMIN-017 |

## 14. Cross-cutting: I18N and PWA endpoints

| Method | Path | Auth | Perm | Request | Response | Pg | Rate | Idem | Errors | Features |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | `/i18n/locales` | none | — | — | `[{code:"en", name:"English", dir:"ltr"}, {code:"bn", name:"বাংলা", dir:"ltr"}]` | B | default | — | — | F-I18N-001/002 |
| POST | `/i18n/missing-keys` | user* | — | `keys[{namespace, key, locale}]` (≤ 50, deduplicated per session) | 204 (logged for translators) | — | write | — | — | F-I18N-009 |
| — | UI message catalogs | — | — | Shipped in the web bundle from `packages/i18n` (not served by the API) | — | — | — | — | — | F-I18N-001, F-I18N-005, F-I18N-007 |
| — | Manifest, service worker, in-app browser detection, feature detection | — | — | Served by `apps/web` (`/manifest.webmanifest`, `/sw.js`, `/.well-known/assetlinks.json`) | — | — | — | — | — | F-PWA-001/002/003/007/008 |

## 15. Feature coverage check

Every feature in the registry with phase P2–P10 maps to at least one row above, or to an explicitly documented internal or web-served mechanism:
- **Internal or web-served mechanisms:** F-I18N-001/005/007/009, F-PWA-001/002/003/007/008, F-INTG-001/002.
- **No endpoints (W):** F-INTG-004 Wearables and F-ADMIN-017 Subscription management are marked **Won't (initial release)**.
- **Phase-6 behavior on existing endpoints:** F-NOTIF-005 (email) and F-I18N-006 (localized notifications) are delivered by the worker using the user's locale. Their observable API surface is `/notification-preferences` and `/email/unsubscribe`.

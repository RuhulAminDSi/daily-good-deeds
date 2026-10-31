# API Error Handling

## 1. Format: RFC 9457 Problem Details

Every non-2xx response has `Content-Type: application/problem+json`:

```json
{
  "type": "https://docs.dailygooddeeds.app/errors/validation-failed",
  "title": "Some fields are invalid",
  "status": 400,
  "detail": "Please correct the highlighted fields.",
  "instance": "/api/v1/deeds",
  "code": "VALIDATION_FAILED",
  "i18nKey": "errors.validation_failed",
  "requestId": "0192f1c4-6b1e-7d2a-9a51-3f0b6c2f1a10",
  "errors": [
    { "pointer": "/title/bn", "code": "too_long", "i18nKey": "validation.too_long", "params": { "max": 120 } }
  ]
}
```

| Field | Rule |
|---|---|
| `type` | Stable URI per error code (slug of the code). Docs pages are planned. |
| `title` | Short summary, **localized** per `Accept-Language` |
| `detail` | Human-readable, localized. It never contains stack traces, SQL, internal IDs of other users, or secrets. |
| `code` | Stable, machine-readable `UPPER_SNAKE` code (catalog below). Clients branch on this. |
| `i18nKey` | Key in `packages/i18n`. The web client re-renders the message in the current UI locale. |
| `errors[]` | Field-level issues. `pointer` is a JSON Pointer (RFC 6901) into the request body; query params use `"parameter": "limit"` instead. `params` feeds ICU interpolation. |
| `requestId` | Same as the `X-Request-Id` header, for support correlation |
| extension members | Allowed per code, e.g. `retryAfterSec`, `currentResource`, `conflicts`, `quota` |

## 2. Principles
1. **Do not leak existence.** When a resource belongs to another user, or is private (journal entries, worship records, private groups, another user's session), the API returns `404 RESOURCE_NOT_FOUND`, never `403`. This applies to admin routes too, when the caller is not an admin.
2. **Do not leak account state.** Login, register, and forgot-password responses do not reveal whether an email exists (see AUTHENTICATION §3).
3. **Fail closed.** An authorization error, or an unexpected error while evaluating authorization, results in a deny.
4. **Validation happens before side effects.** All Zod validation runs before any DB write. Multi-step writes use a transaction.
5. **5xx responses are generic.** `title: "Something went wrong"`, plus `requestId`. Full details go only to logs and Sentry, with PII scrubbed.
6. **Retries.** Clients may retry only on `408`, `425`, `429`, `502`, `503`, and `504`, and on network errors, using exponential backoff with jitter. Retries are safe because of natural keys, the same `opId` (sync), or the same `Idempotency-Key` ([API_CONVENTIONS.md §9](API_CONVENTIONS.md)).
7. **Localization fallback.** If a BN message is missing, the EN message is used, and `missing_translation` is logged (F-I18N-009).

## 3. Error code catalog

### 3.1 Generic
| Code | HTTP | When |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Body or query failed schema validation (includes unknown fields) |
| `INVALID_CURSOR` | 400 | Pagination cursor can't be decoded |
| `INVALID_SORT` | 400 | Sort field not on the whitelist |
| `MALFORMED_JSON` | 400 | Body is not valid JSON |
| `UNAUTHENTICATED` | 401 | No credentials |
| `PERMISSION_DENIED` | 403 | Authenticated but lacks the permission (non-sensitive resources only) |
| `TOKEN_SCOPE_INSUFFICIENT` | 403 | Device or API token used outside its scope |
| `CSRF_ORIGIN_MISMATCH` | 403 | Cookie-authenticated unsafe request whose `Origin`/`Sec-Fetch-Site` is not the app origin |
| `FEATURE_DISABLED` | 403 | Feature flag off for this user or environment |
| `RESOURCE_NOT_FOUND` | 404 | Not found **or** not visible to the caller |
| `METHOD_NOT_ALLOWED` | 405 | |
| `CONFLICT` | 409 | Generic uniqueness violation, e.g. a duplicate custom deed title |
| `IDEMPOTENCY_IN_PROGRESS` | 409 | Same key still being processed |
| `PRECONDITION_FAILED` | 412 | `If-Match` version mismatch; includes `currentResource` |
| `PRECONDITION_REQUIRED` | 428 | `If-Match` missing on an admin content edit |
| `PAYLOAD_TOO_LARGE` | 413 | |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | |
| `IDEMPOTENCY_KEY_REUSED` | 422 | Same key, different body |
| `BUSINESS_RULE_VIOLATION` | 422 | Generic domain rule failure, with a specific `errors[].code` |
| `RATE_LIMITED` | 429 | Throttle or business quota exceeded ([API_CONVENTIONS.md §10](API_CONVENTIONS.md)); includes `retryAfterSec` |
| `INTERNAL_ERROR` | 500 | Unexpected |
| `DEPENDENCY_UNAVAILABLE` | 503 | DB, email, or an external API is down; includes `retryAfterSec` |
| `MAINTENANCE_MODE` | 503 | `system_settings.maintenance=true` |

### 3.2 Authentication & identity (AUTH, RBAC)
| Code | HTTP | When |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email or password (generic) |
| `AUTH_SESSION_EXPIRED` | 401 | Session or device token passed its idle or absolute lifetime |
| `AUTH_SESSION_REVOKED` | 401 | Session or device token revoked (logout, password change, role change, admin action), or unknown |
| `STEP_UP_REQUIRED` | 401 | Sensitive admin action needs recent re-authentication |
| `MFA_REQUIRED` | 401 | Password accepted, TOTP needed. Includes `mfaToken`. |
| `MFA_INVALID_CODE` | 401 | |
| `MFA_ENROLLMENT_REQUIRED` | 403 | Admin without TOTP |
| `AUTH_EMAIL_NOT_VERIFIED` | 403 | Feature requires a verified email |
| `ACCOUNT_SUSPENDED` | 403 | Suspended by an admin |
| `ACCOUNT_PENDING_DELETION` | 403 | Only cancel-deletion and export are allowed |
| `AUTH_ACCOUNT_LOCKED` | 429 | Login back-off per [SRS FR-AUTH-002-02](../specifications/SRS.md); includes `retryAfterSec` |
| `TOKEN_INVALID_OR_EXPIRED` | 400 | Verification, reset, or link token is bad, used, or expired (one code for all) |
| `PASSWORD_TOO_WEAK` | 422 | Fails length or breach check |
| `PASSWORD_REUSED` | 422 | Same as the current password |
| `AUTH_LAST_LOGIN_METHOD` | 409 | Would remove the last login method |
| `OAUTH_STATE_INVALID` | 400 | OAuth state or nonce mismatch |
| `OAUTH_EMAIL_UNVERIFIED` | 422 | Google email not verified |
| `LAST_SUPER_ADMIN` | 409 | Would remove the last super admin |
| `SELF_ROLE_CHANGE_FORBIDDEN` | 403 | Admin changing their own roles |

### 3.3 Domain
| Code | HTTP | Module | When |
|---|---|---|---|
| `LOCAL_DATE_OUT_OF_RANGE` | 422 | CAL/DEED | `localDate` fails the time-zone check ([SRS FR-CAL-010-01](../specifications/SRS.md)) or is outside the edit window ([FR-CAL-011-01](../specifications/SRS.md)). This is the **only** code for both cases; i18n key `errors.local_date.out_of_range` |
| `DEED_NOT_SCHEDULED` | 422 | DEED | Completion for a plan not scheduled on that date. Allowed with `force=true` for flexible plans. |
| `RECURRENCE_INVALID` | 422 | DEED/PLAN | Unsupported recurrence rule |
| `ATTACHMENT_TYPE_NOT_ALLOWED` | 422 | DEED | MIME type or magic bytes not jpeg/png/webp |
| `ATTACHMENT_TOO_LARGE` | 413 | DEED | Over 5 MB |
| `ATTACHMENT_QUARANTINED` | 422 | DEED | Malware or content scan failed |
| `GOAL_INVALID_PERIOD` | 422 | GROW | End date before start date, or the period type does not match |
| `JOURNAL_LOCKED` | 423 | JRNL | Future letter sealed until its delivery date |
| `PRAYER_LOCATION_REQUIRED` | 422 | ISL | Prayer times requested without a location |
| `ISLAMIC_MODULE_DISABLED` | 403 | ISL | User opted out (F-ISL-017) |
| `CONTENT_NOT_VERIFIED` | 404 | ISL/ADMIN | Unverified religious content requested by a non-admin |
| `EXTERNAL_CONTENT_UNAVAILABLE` | 503 | ISL | Quran API down and no cached copy |
| `ZAKAT_INPUT_INVALID` | 422 | ISL | Negative amounts or an unknown nisab basis |
| `GROUP_MEMBER_LIMIT` | 422 | COMM | Family or group size limit reached |
| `INVITATION_INVALID` | 400 | COMM | Expired, revoked, or already used |
| `ALREADY_MEMBER` | 409 | COMM | |
| `CONTENT_REJECTED` | 422 | COMM | Automatic moderation pre-check failed |
| `USER_BLOCKED` | 404 | COMM | Interacting with someone who blocked you. Returned as 404 so the block is not revealed. |
| `CHALLENGE_NOT_ACTIVE` | 422 | COMM | Join or progress outside the challenge window |
| `AI_DISABLED` | 403 | AI | Global flag off, user opted out, or consent not given |
| `AI_CONSENT_REQUIRED` | 403 | AI | Consent missing; includes `consentVersion` |
| `AI_QUOTA_EXCEEDED` | 429 | AI | User quota per [SRS FR-AI-003-01](../specifications/SRS.md) reached; includes `quota.resetAt` |
| `AI_BUDGET_EXHAUSTED` | 503 | AI | Platform cost cap reached; AI features degrade gracefully |
| `AI_PROVIDER_ERROR` | 502 | AI | Upstream provider failure |
| `AI_OUTPUT_BLOCKED` | 422 | AI | Safety filter blocked the response (e.g. a request for a fatwa) |
| `SYNC_CONFLICT` | 409 | PWA/WIDGET | Returned **per op** (status `conflict`) in a `/sync` response, never as the HTTP status of the batch. Row-level LWW already resolved it; the payload carries the winning row |
| `SYNC_BATCH_TOO_LARGE` | 413 | PWA/WIDGET | More than 100 ops in one push (DL-015) |
| `SYNC_ENTITY_NOT_SUPPORTED` | 422 | PWA/WIDGET | Entity type not syncable for this token scope |
| `CLIENT_VERSION_UNSUPPORTED` | 426 | PWA/WIDGET | Widget or SW protocol too old; includes `minVersion` |
| `PUSH_SUBSCRIPTION_INVALID` | 422 | NOTIF | Malformed subscription endpoint or keys |
| `EXPORT_IN_PROGRESS` | 409 | RPT | An export is already running |
| `REPORT_RANGE_TOO_LARGE` | 422 | RPT | Over 400 days |

## 4. Server implementation notes
- A NestJS global `ProblemDetailsFilter` maps `DomainError(code, status, params)`, `ZodError`, Prisma errors, and `HttpException` to the format above:
  - Prisma `P2002` unique violation → `CONFLICT`
  - `P2025` not found → `RESOURCE_NOT_FOUND`
- The error catalog lives in `packages/contracts/src/errors.ts` as a single typed map (`code → status`; `i18nKey` = `errors.<code>`), shared by the API and the web client. Messages live in `@dgd/i18n` (`errors.*`, `validation.*`). A unit test asserts that every code and every validation key has EN and BN messages.
- `title` is rendered from `i18nKey` in the locale negotiated from `Accept-Language` (q-weighted, `bn-BD` → `bn`, default `en`); responses carry `Content-Language` and `Vary: Accept-Language`. `detail` is passed by the thrower and must already be localized.
- **Validation keys.** `@dgd/contracts` installs a global Zod error map, so every issue's message is a `validation.*` key: a missing value is `validation.required`, anything else `validation.<zod issue code>`. `fieldErrorFromIssue` turns an issue into `{ pointer, code, i18nKey, params }`, where `code` is the key without its namespace and `params` feed ICU (`max`/`min` + `origin`, `format`, `divisor`, `keys`). A schema names its own message with a key: `.refine(ok, { error: 'validation.password_weak' })` gives `code: "password_weak"`; plain-prose messages fall back to the generic key.
- 4xx responses are logged at `info`, 5xx at `error`, both with `requestId`, `userId` (hashed), route, and `code`. Repeated 401/403 bursts per IP feed the security alerting (NFR-OBSERVABILITY).

## 5. Client handling contract
| Code(s) | Web / widget behavior |
|---|---|
| `AUTH_SESSION_EXPIRED`, `AUTH_SESSION_REVOKED` | Clear local user data and go to login (widget: "Re-link device" state) |
| `STEP_UP_REQUIRED` | Open the re-auth modal, then replay |
| `VALIDATION_FAILED` | Map `errors[].pointer` to form fields and show localized messages (web: `useProblemMessages()` in `apps/web/src/i18n/problem.ts`; unknown keys show the generic `validation.custom` message) |
| `PRECONDITION_FAILED` | Admin editors: show "This was changed elsewhere" with reload or overwrite |
| `RATE_LIMITED`, `AI_QUOTA_EXCEEDED` | Show a calm, non-blocking notice with the reset time |
| `AI_DISABLED`, `FEATURE_DISABLED` | Hide or disable the feature entry point. This is never a blocking error. |
| `SYNC_CONFLICT` | Apply the server's winning row and show a brief localized toast. No conflict-review UI (DL-015) |
| `DEPENDENCY_UNAVAILABLE`, network | Queue the mutation offline (PWA outbox) and retry with backoff |

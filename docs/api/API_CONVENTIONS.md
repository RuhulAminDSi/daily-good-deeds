# API Conventions

These rules apply to every endpoint under `/api/v1`. The resource map lives in [../README.md §5](../README.md), the endpoints are listed in [API_SPECIFICATION.md](API_SPECIFICATION.md), and the machine-readable contract is [openapi.yaml](openapi.yaml).

## 1. Base URL and versioning
- Base: `https://api.<domain>/api/v1`. Local development uses `http://localhost:4000/api/v1`.
- The major version is in the path (`/v1`). Within a major version, changes are additive only: new endpoints, new optional fields, and new enum values. Clients must ignore unknown fields.
- Breaking changes go to a new major version. A deprecated endpoint returns `Deprecation: true` and `Sunset: <HTTP-date>` (RFC 8594) for at least 90 days before removal. The widget app is versioned separately, so the API supports N-1 widget protocol versions.
- The OpenAPI document is generated from NestJS decorators. CI diffs it against the committed `docs/api/openapi.yaml` (`oasdiff breaking`). A breaking diff fails the build.

## 2. Naming
| Element | Rule | Example |
|---|---|---|
| Paths | plural, kebab-case nouns; nesting at most 2 levels | `/goals/{goalId}/milestones` |
| Path params | camelCase, UUID | `{deedId}` |
| JSON fields | camelCase | `localDate`, `createdAt` |
| Query params | camelCase | `?categoryId=…&sort=-createdAt` |
| Enums | snake_case strings | `"future_letter"`, `"done"` |
| Actions that are not CRUD | sub-resource verb, `POST` | `POST /completions/{id}/undo`, `POST /auth/logout` |
| Booleans | `is`/`has` prefix only when ambiguous | `isFavorite` |

IDs are UUIDv7 strings. Clients must not parse them.

## 3. HTTP methods and status codes
| Method | Semantics | Success |
|---|---|---|
| GET | read; safe, cacheable | 200 |
| POST | create, or perform an action | 201 + `Location` (create), 200/202 (action) |
| PATCH | partial update (JSON merge semantics; `null` clears a nullable field) | 200 |
| PUT | full replace, used only for singleton documents (`/me/preferences`, `/islamic/preferences`) | 200 |
| DELETE | delete or soft-delete | 204 |

`202 Accepted` + a job resource is used for long-running work such as exports, account deletion, and AI weekly reports.

## 4. Pagination: cursor-based
- Request: `?limit=20&cursor=<opaque>`. `limit` defaults to 20, ranges 1–100, and is clamped.
- Response envelope for lists:
```json
{ "data": [ … ], "page": { "nextCursor": "eyJ…", "hasMore": true, "limit": 20 } }
```
- The cursor is an opaque base64url-encoded `(sortKey, id)` tuple. It is not signed, because every query is already scoped to the caller (DL-033). A cursor that can't be decoded returns `400 INVALID_CURSOR`.
- Stable ordering always includes `id` as the final tiebreaker.
- There are no `total` counts by default. `?includeTotal=true` is supported only on admin lists, where it costs an extra `COUNT`.
- Bounded small collections (categories, roles, prayer times) return `{ "data": [...] }` without `page`.

## 5. Filtering, sorting, field selection
- Filters are plain query params named after fields: `?status=done&from=2026-10-01&to=2026-10-31`.
- Ranges use `from` / `to` (inclusive) on `local_date`, or `createdFrom` / `createdTo` on timestamps.
- Text search uses `?q=` (min 2 chars, max 100), implemented with Postgres `pg_trgm` / `tsvector`. Journal search decrypts and scans only the caller's own entries in memory ([SRS FR-JRNL-008-01](../specifications/SRS.md)).
- Sorting uses `?sort=field,-otherField`. Only fields whitelisted per endpoint are allowed; anything else returns `400 INVALID_SORT`.
- Sparse fields are not supported in v1, to keep caching simple.

## 6. Dates, times, time zones
| Kind | Format | Notes |
|---|---|---|
| Instant | ISO-8601 UTC with `Z`, millisecond precision | `2026-10-30T14:05:12.123Z` |
| Local calendar day | `YYYY-MM-DD` as **`localDate`** | The day in the **user's** IANA time zone at the moment of the action. It is the key for completions, salah, journal, and streaks. |
| Local time of day | `HH:mm` (24h) | Reminders, planner blocks, quiet hours |
| Time zone | IANA name | `Asia/Dhaka`. Stored in `user_preferences.timezone`. |
| Duration | ISO-8601 duration or integer seconds (`durationSec`) | |
| Hijri date | `{ "year": 1448, "month": 5, "day": 8 }` + localized display string | Computed with the user's offset |

The server never derives `localDate` from server time. Clients send `localDate`. The server checks it against the user's time zone ([SRS FR-CAL-010-01](../specifications/SRS.md)) and the past-edit window ([SRS FR-CAL-011-01](../specifications/SRS.md), setting `completions.edit_window_days`). Anything outside either check returns `422 LOCAL_DATE_OUT_OF_RANGE`.

## 7. Localization
- `Accept-Language: bn` or `en`. If the header is missing, the stored user preference applies; if there is no stored preference, `en` is used. The response sets `Content-Language`.
- Localized content (deed titles, duas, achievements) is returned already resolved to the request locale, with `locale` and `isFallback` flags. Admin endpoints return all translations as `translations: { en: {...}, bn: {...} }`.
- Error `title`/`detail` are localized. The stable `code` and `i18nKey` are never localized (see [ERROR_HANDLING.md](ERROR_HANDLING.md)).
- Numbers are always JSON numbers. Bengali digit display is a client-side rendering concern.

## 8. Optimistic concurrency
- Every mutable resource has an integer `version`, incremented on each update, and the response carries `ETag: W/"<version>"`.
- `If-Match: W/"<version>"` is **required only on admin content edits** (`/admin/deeds/*`, `/admin/islamic/*`, `/admin/achievements/*`, `/admin/affirmations/*`), where two editors can collide. A mismatch returns `412 PRECONDITION_FAILED` with the current representation in `currentResource`.
- Everywhere else, `If-Match` is optional. Without it, the update is last-write-wins at row level. This matches the offline sync rule ([SRS FR-PWA-006-13](../specifications/SRS.md), DL-015).
- `GET` supports `If-None-Match` → `304` for content catalogs (categories, deeds, duas).

## 9. Idempotency
- **`/sync`** deduplicates per operation through `opId`, stored in `sync_operations` ([API_SPECIFICATION.md §10](API_SPECIFICATION.md)). No header is used.
- **Natural keys first.** Creates that have a unique constraint are idempotent without a header. For example, `deed_completions(user_id, deed_plan_id, local_date)` is unique, so a repeated `POST /completions` returns the existing record with `200`.
- **`Idempotency-Key: <uuid>`** is **required only** on side-effecting POSTs that have no natural key: `POST /exports`, `/invitations`, `/ai/*` generation endpoints, and `/admin/broadcasts`. It is accepted, but optional, on other POSTs.
- The server stores `(user_id, key) → (request hash, status, response)` in `idempotency_keys` for **24 h** (DL-016).
  - Same key, same body: the stored response is replayed with `Idempotency-Replayed: true`.
  - Same key, different body: `422 IDEMPOTENCY_KEY_REUSED`.
  - Same key while the first request is still running: `409 IDEMPOTENCY_IN_PROGRESS`.

## 10. Rate limiting
This table is the **only** rate-limit definition. Other docs link here. Values come from the SRS FRs cited in the table.

- Implemented with `@nestjs/throttler` using its in-memory store per API instance. Limits are per user when authenticated, otherwise per IP. A `429` carries `Retry-After`.
- The only Postgres-backed counters are login and password-reset throttling, because they must hold across instances ([SRS FR-AUTH-002-02](../specifications/SRS.md), [FR-AUTH-005-03](../specifications/SRS.md)).

| Tier | Default limit | Applies to | Source |
|---|---|---|---|
| `auth-strict` | Login: per FR-AUTH-002-02. Register: 5/hour/IP. Password reset: 3/hour/account and 10/hour/IP. TOTP verify: 5/min | `/auth/*` credential endpoints | FR-AUTH-001-05, FR-AUTH-002-02, FR-AUTH-005-03 |
| `write` | 120/min. `/sync`: 30 requests/min, ≤ 100 ops each | All mutations | NFR-SECURITY-020, DL-015 |
| `default` | 300/min | Everything else, including GETs and `/admin/*` | NFR-SECURITY-020 |

Endpoint-specific **business quotas** (not throttles) are enforced by their modules and return `429 RATE_LIMITED` (or `AI_QUOTA_EXCEEDED`) with `Retry-After`:

| Quota | Value | Source |
|---|---|---|
| Community posts | 5 per user per day | FR-COMM-009-01 |
| Account exports | 1 per user per 24 h | FR-RPT-006-02 |
| AI requests and tokens | Per FR-AI-003-01 | FR-AI-003-01 |
| Public API clients (P10) | Per client, configured | FR-INTG-005-01 |

## 11. Request and response format
- `Content-Type: application/json; charset=utf-8`. The body limit is 256 KB, except for uploads, which go directly to object storage with presigned URLs.
- Single resource: the object is returned bare (no envelope). Lists use the envelope from §4.
- Errors: `application/problem+json` (RFC 9457). See [ERROR_HANDLING.md](ERROR_HANDLING.md).
- Unknown JSON fields in requests are rejected with `400 VALIDATION_FAILED` (Zod `.strict()`). This prevents mass assignment.
- Every response carries `X-Request-Id`. A client-supplied value is echoed back if it is a valid UUID.

## 12. Caching and CORS
- User data: `Cache-Control: private, no-store`. Content catalogs: `private, max-age=300` + ETag. Public content such as Hadith of the Day: `public, max-age=3600`.
- CORS is limited to an allow-list of web origins, with credentials allowed. The widget does not use CORS.
- Security headers on every response: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Resource-Policy: same-site`.

## 13. Authorization notation used in the spec
| Auth value | Meaning |
|---|---|
| `none` | public, rate-limited by IP |
| `user` | any authenticated, email-verified user (cookie or device token) |
| `user*` | authenticated, email verification not required |
| `device` | widget device token (scoped; see AUTHENTICATION §5) |
| `admin` | Admin or Super Admin, **plus** the listed permission, recent step-up if marked ⚑ |
| `superadmin` | Super Admin only |
| `client` | public API client token (P10) |

Ownership is always enforced in the query (`WHERE user_id = :currentUser`). Another user's resource returns `404`, never `403`, so its existence is not leaked.

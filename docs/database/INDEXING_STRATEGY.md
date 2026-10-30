# Indexing Strategy

> Status: Specification. Volumes come from [DATABASE_DESIGN.md §15](DATABASE_DESIGN.md#15-capacity-assumptions) (10k DAU, ~22M completions/year).

## 1. Principles

1. **Every index serves a named query.** An index with no query it serves is not created. This is reviewed at each phase gate with `pg_stat_user_indexes` (`idx_scan = 0` after 30 days means the index is a candidate for removal).
2. **User-scoped queries lead with `user_id`.** Almost every read in the app is "my X between dates", so composite B-tree `(user_id, local_date)` is the workhorse.
3. **Partial indexes** cover soft-delete (`WHERE deleted_at IS NULL`), active-only rows, and queues (`WHERE status = 'open'`).
4. **FK columns are indexed** when the parent can be deleted or is joined on (Postgres does not index FKs automatically). The exception is FKs that are already the leading column of a composite or primary key.
5. **Write cost is budgeted.** Hot write tables (`deed_completions`, `salah_records`, `dhikr_logs`) carry at most 4 secondary indexes.
6. Indexes on large existing tables are created `CONCURRENTLY` in a dedicated migration (see [MIGRATION_STRATEGY.md §4](MIGRATION_STRATEGY.md)).
7. Unique constraints in the Data Dictionary are implemented as unique indexes. They also serve lookups and are listed below where a query uses them.

## 2. Per-table indexes

Legend: **U** = unique, **P** = partial.

### Identity
| Table | Index | Type | Serves |
|---|---|---|---|
| users | `(email)` U | btree (citext) | Login, registration duplicate check |
| users | `(deletion_requested_at) P WHERE status='pending_deletion'` | btree | Daily `account:purge` job |
| users | `(created_at)` | btree | Admin user list, newest first; growth metrics |
| users | `lower(display_name) gin_trgm_ops` | GIN trigram | Admin user search (F-ADMIN-001) |
| auth_identities | `(provider, provider_subject)` U | btree | OAuth callback lookup |
| user_sessions | `(session_token_hash)` U | btree | **Session lookup on every request** (DL-012) |
| user_sessions | `(user_id, last_used_at DESC) P WHERE revoked_at IS NULL` | btree | "Your devices" list (F-AUTH-007) |
| user_sessions | `(expires_at)` | btree | Purge job |
| verification_tokens | `(token_hash)` U | btree | Verify and reset links |
| verification_tokens | `(user_id, type) P WHERE consumed_at IS NULL` | btree | Invalidate older tokens on reissue |
| user_roles | PK `(user_id, role_id)` | btree | Load permissions with the session (cached ≤ 60 s) |
| user_roles | `(role_id)` | btree | "Users with role X" (admin) |

### Deeds & calendar
| Table | Index | Type | Serves |
|---|---|---|---|
| deeds | `(category_id, status) P WHERE owner_user_id IS NULL AND deleted_at IS NULL` | btree | Library browse by category (F-DEED-001/011) |
| deeds | `(owner_user_id) P WHERE owner_user_id IS NOT NULL AND deleted_at IS NULL` | btree | "My custom deeds" |
| deeds | `(estimated_minutes) P WHERE estimated_minutes <= 5 AND owner_user_id IS NULL` | btree | Five-minute deeds (F-DEED-013) and random generator |
| deeds | `(tags)` | GIN | Tag filters |
| deed_translations | `(search_vector)` | GIN | Library full-text search (EN + BN, `simple` config) |
| deed_translations | `(title gin_trgm_ops)` | GIN trigram | Typo-tolerant and partial-word search. Bengali has no stemmer, so trigram does the heavy lifting |
| deed_plans | `(user_id) P WHERE is_active AND deleted_at IS NULL` | btree | **Checklist build**: load all active plans for a user |
| deed_plans | `(user_id, change_seq)` | btree | Sync delta pull (DL-015) |
| deed_completions | `(user_id, local_date)` | btree | **Checklist join for a date; calendar day detail**. The hottest index. Multi-day aggregates read `daily_summaries` instead |
| deed_completions | U `(user_id, deed_plan_id, local_date) P WHERE deed_plan_id IS NOT NULL AND deleted_at IS NULL` | btree | Idempotent upsert; streak walk per plan (index-only scan on `local_date`) |
| deed_completions | U `(user_id, deed_id, local_date) P WHERE deed_plan_id IS NULL AND deleted_at IS NULL` | btree | Ad-hoc completion upsert |
| deed_completions | `(user_id, change_seq)` | btree | Sync delta pull (DL-015) |
| completion_attachments | `(completion_id)` | btree | Load attachments with history |
| favorite_deeds | PK `(user_id, deed_id)` | btree | Favourites list |
| streaks | U `(user_id, deed_plan_id) NULLS NOT DISTINCT` | btree | Read and update a streak per plan; overall streak |
| daily_summaries | PK `(user_id, local_date)` | btree | **Calendar week/month, heatmap, year view and overall-streak walk** in one range scan (F-CAL-002..008, DL-023) |

### Growth, journal, planner, wellbeing, gamification
| Table | Index | Type | Serves |
|---|---|---|---|
| goals | `(user_id, status) P WHERE deleted_at IS NULL` | btree | Active goals list |
| goals | `(deed_plan_id) P WHERE deed_plan_id IS NOT NULL AND status='active'` | btree | Auto-progress the goal when a completion happens |
| goal_milestones | `(goal_id, position)` | btree | Milestones in order |
| journal_entries | `(user_id, local_date DESC) P WHERE deleted_at IS NULL` | btree | Journal history, date filter, and type filter applied on top (about 1,500 rows per heavy user, so a separate type index is not worth its write cost) |
| journal_entries | `(tags)` | GIN | Tag filter (plaintext tags) |
| journal_entries | `(deliver_on) P WHERE entry_type='future_letter' AND delivered_at IS NULL` | btree | Recovery sweep only. Delivery itself is a pg-boss job scheduled with `startAfter` at creation (DL-024) |
| growth_snapshots | U `(user_id, period_month)` | btree | Growth timeline |
| life_balance_assessments | `(user_id, assessed_on DESC)` | btree | Latest balance wheel and trend |
| planner_items | `(user_id, local_date) P WHERE deleted_at IS NULL` | btree | Day planner |
| planner_items, goals, goal_milestones, wellbeing_logs | `(user_id, change_seq)` | btree | Sync delta pull |
| planner_items | `(user_id, week_of) P WHERE week_of IS NOT NULL` | btree | Weekly planning |
| wellbeing_logs | `(user_id, log_type, local_date)` | btree | Per-tracker history charts |
| user_achievements | `(user_id, awarded_at DESC)` | btree | Badge shelf; unseen toasts |

### Islamic
| Table | Index | Type | Serves |
|---|---|---|---|
| salah_records | U `(user_id, local_date, prayer) P WHERE deleted_at IS NULL` | btree | Daily salah card (upsert); weekly and monthly salah grid via range on `local_date` |
| salah_records, dhikr_logs, practice_logs, fasting_records, quran_reading_logs | `(user_id, change_seq)` | btree | Sync delta pull (DL-015) |
| quran_reading_logs | `(user_id, local_date)` | btree | Reading history; daily pages total |
| quran_reading_logs | `(khatam_plan_id) P WHERE khatam_plan_id IS NOT NULL` | btree | Khatam progress sum |
| quran_memorization_progress | U `(user_id, surah)` | btree | Memorization grid and "due for revision" (at most 114 rows per user, filtered in memory) |
| dhikr_logs | U `(user_id, preset_id, local_date) P` | btree | Tasbih upsert (max-merge) |
| dhikr_logs | `(user_id, local_date)` | btree | Daily dhikr summary |
| duas | `(topic, status)` | btree | Dua collection by topic |
| dua_translations | GIN `to_tsvector('simple', title‖' '‖translation)` | GIN | Dua search |
| hadith_entries | `(status, eligible_for_daily) P WHERE status='published' AND eligible_for_daily` | btree | Hadith-of-the-Day rotation (a deterministic pick by `day_number % count`) |
| practice_logs | U `(user_id, practice_id, local_date) P` | btree | Sunnah/Tahajjud toggles and history |
| fasting_records | U `(user_id, local_date) P` | btree | Fasting calendar; qada balance |
| ramadan_plans | U `(user_id, hijri_year)` | btree | |
| zakat_calculations | `(user_id, calculated_on DESC)` | btree | Saved calculations |

### Community
| Table | Index | Type | Serves |
|---|---|---|---|
| group_members | PK `(group_id, user_id)` | btree | Membership check, run on **every** group request |
| group_members | `(user_id) P WHERE status='active'` | btree | "My groups" |
| group_invitations | `(code_hash)` U | btree | Join by code or link |
| groups | `(type, is_discoverable) P WHERE is_discoverable AND status='active'` | btree | Community group discovery |
| groups | `name gin_trgm_ops P WHERE is_discoverable` | GIN trigram | Group search |
| challenges | `(group_id, status)` | btree | Group challenge list |
| challenges | `(status, start_on) P WHERE scope='system'` | btree | Active system challenges |
| challenge_participants | U `(challenge_id, user_id)` | btree | Join and leave; participant list |
| challenge_participants | `(user_id) P WHERE left_at IS NULL` | btree | "My challenges"; auto-track lookup on completion |
| campaigns | `(slug)` U, `(qr_token)` U | btree | QR and deep-link resolution |
| campaigns | `(status, starts_on)` | btree | Campaign list |
| posts | `(group_id, created_at DESC) P WHERE moderation_state='visible' AND deleted_at IS NULL` | btree | Group feed (keyset pagination) |
| posts | `(created_at DESC) P WHERE visibility IN ('community','public_anonymous') AND moderation_state='visible' AND deleted_at IS NULL` | btree | Community feed |
| posts | `(author_id, created_at DESC)` | btree | "My posts"; moderator view of a user's history |
| posts | `(campaign_id, created_at DESC) P WHERE campaign_id IS NOT NULL` | btree | Campaign stories |
| comments | `(post_id, created_at)` | btree | Comment thread |
| reactions | U partials (see Data Dictionary) | btree | Toggle a reaction |
| content_reports | `(status, priority, created_at) P WHERE status IN ('open','triaged')` | btree | **Moderation queue** (F-ADMIN-008) |
| content_reports | `(post_id)`, `(comment_id)`, `(reported_user_id)` | btree | Reports per target; repeat-offender view |
| user_blocks | PK `(blocker_id, blocked_id)` + `(blocked_id)` | btree | Feed filter in both directions |
| moderation_actions | `(target_user_id, created_at DESC)` | btree | User moderation history |

### AI
| Table | Index | Type | Serves |
|---|---|---|---|
| ai_consents | U `(user_id, scope) P WHERE revoked_at IS NULL` | btree | Consent check before **every** AI call |
| ai_conversations | `(user_id, last_message_at DESC)` | btree | Conversation list |
| ai_messages | `(conversation_id, created_at)` | btree | Load a thread |
| ai_messages | `BRIN (created_at)` | BRIN | Retention purge (append-only, time-ordered) |
| ai_usage_logs | `(user_id, created_at)` | btree | **Quota check** (sum of tokens this day/month) |
| ai_usage_logs | `(created_at, feature)` | btree | Cost dashboard by feature and day (F-AI-003) |
| ai_insights | `(user_id, insight_type, created_at DESC)` | btree | Latest suggestions and reports |

### Platform
| Table | Index | Type | Serves |
|---|---|---|---|
| notifications | `(user_id, created_at DESC)` | btree | Notification center |
| notifications | `(user_id) P WHERE read_at IS NULL AND channel='in_app'` | btree | Unread badge count |
| notifications | `BRIN (created_at)` | BRIN | Retention purge (period per SRS NFR-PRIVACY-009) |
| reminders | `(next_fire_at) P WHERE is_active` | btree | **Scheduler**: one indexed scan per minute for `next_fire_at <= now()`, covering prayer reminders too (DL-024) |
| reminders | `(user_id)` | btree | Reminder settings |
| push_subscriptions | `(endpoint)` U, `(user_id)` | btree | Send to all of a user's devices |
| widget_devices | `(token_hash)` U | btree | Widget authentication |
| sync_operations | PK `(user_id, op_id)` + `BRIN (received_at)` | btree / BRIN | Batch idempotency check (`op_id = ANY($1)`); retention purge |
| idempotency_keys | PK `(user_id, key)` + `(created_at)` | btree | Replay lookup; 24 h purge (DL-016) |
| broadcasts | `(status, scheduled_at) P WHERE status IN ('scheduled','sending')` | btree | Broadcast fan-out worker (F-ADMIN-007) |
| experiments | PK `(key)` | btree | Variant lookup (P10) |
| audit_logs | `(occurred_at)` | btree | Time-range scans in the audit viewer and the nightly retention purge (plain table, DL-027). Switch to BRIN if the table grows large |
| audit_logs | `(actor_user_id, occurred_at DESC)`, `(subject_user_id, occurred_at DESC)` | btree | "Actions by / on this user"; pseudonymization on purge |
| audit_logs | `(action, occurred_at DESC)` | btree | Security event filters, e.g. `auth.login.failed` |
| content_versions | U `(entity_type, entity_id, version)` | btree | Version history and rollback |
| export_jobs | `(user_id, created_at DESC)`, `(status) P WHERE status IN ('queued','running')` | btree | User export list; stuck-job monitor |
| api_clients | `(key_prefix)` U | btree | Public API auth |

## 3. Search strategy

| Search | Mechanism |
|---|---|
| Deed library (EN/BN) | Postgres FTS with the `simple` configuration on `deed_translations.search_vector`, plus `pg_trgm` similarity. Results are ranked by `ts_rank`, then by trigram similarity. Bengali stemming is not available in Postgres, so trigram provides tolerance for partial words. Revisit (for example Meilisearch) only if relevance complaints appear. |
| Duas / Hadith | Same approach on the translation tables |
| Admin user search | Trigram on `display_name`; exact match on email |
| Community | Trigram on group name. Posts are browsed, not searched (MVP) |

Required extensions: `citext`, `pg_trgm`, `pgcrypto` (for `gen_random_uuid` fallback only). All are available on Neon.

## 4. Journal search and encryption

Journal bodies are encrypted at the application level (AES-GCM, see DATABASE_DESIGN §9). **Postgres cannot index or search ciphertext.** Options considered:

| Option | Verdict |
|---|---|
| Server-side FTS on plaintext | ✗ Defeats encryption at rest for the most sensitive data |
| Searchable encryption / blind indexes per word | ✗ Complex, and it leaks word frequency. Not justified |
| Client-side search only (web decrypts and searches in the browser) | ✗ The server holds the keys (it is not end-to-end), so this gives no extra protection and is slow on low-end phones |
| **Chosen: structured server-side filters + bounded in-memory decrypted search** | ✓ |

**Chosen design:**
1. **Indexed server-side filters** on plaintext metadata: `local_date` range, `entry_type`, `tags` (GIN), `mood`, `is_pinned`. Users are told that tags are not encrypted.
2. **Full-text search** (`GET /journal?q=`) runs in the API process. It streams the user's entries matching the filters (newest first, in chunks of 200), decrypts each one in memory, and does a case- and diacritic-insensitive match (Unicode NFC-normalized, so it works for Bengali). It stops when a page of results is filled or after a **2,000-entry scan limit**, then returns a `continuation` cursor. Decrypted text is never logged, cached, or written anywhere.
3. Rate limit: see [api/API_CONVENTIONS.md](../api/API_CONVENTIONS.md) (the single rate-limit table).
4. **Expected cost:** a heavy user has about 1,500 entries in 5 years × 2 KB ≈ 3 MB of decryption, around 30 ms of CPU. That is acceptable.
5. **Cost controls:** apply the plaintext filters (date, type, tags) before decrypting, select only the ciphertext columns needed, and stop at the scan limit.
6. Future option, if the scan limit becomes a real constraint: a per-user encrypted search index (a serialized inverted index encrypted with the application key). This is noted in FUTURE_ENHANCEMENTS and is not part of the initial release.

The same constraints apply to `ai_messages` (no search) and `wellbeing_logs.note_ciphertext` (no search).

## 5. Pagination

- **Keyset (cursor) pagination** for every feed and history list, for example `(created_at, id) < ($cursor_ts, $cursor_id)`. Each relevant index ends in a column that supports the order.
- Offset pagination is allowed only in admin tables, and only with fewer than 10k rows filtered.

## 6. Large-table plan

| Table | Trigger | Action |
|---|---|---|
| audit_logs | Over 50M rows, or the nightly purge DELETE becomes slow | Monthly range partitions; drop old partitions instead of DELETE. Until then it is a plain table (DL-027) |
| deed_completions | Over 200M rows or index size over 30% of RAM | Hash-partition by `user_id` (16 partitions). All queries already include `user_id` |
| notifications | Over 20M rows | Monthly range partitions; drop expired partitions instead of running DELETE |
| ai_usage_logs | Over 50M rows | Monthly partitions plus a rollup table for the dashboard |

## 7. Monitoring

- `pg_stat_statements` enabled (Neon); weekly review of the top 20 queries by total time.
- Index bloat and usage report at each phase gate.
- CI: every new query in a repository must have an `EXPLAIN`-checked test against seeded volume data in the performance suite (see `docs/qa/TEST_PLAN.md`).
- Latency budget: p95 under 50 ms for the checklist, calendar-month, and salah-day queries at 1 year of data for a heavy user (NFR-PERFORMANCE).

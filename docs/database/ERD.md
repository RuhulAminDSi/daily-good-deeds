# Entity-Relationship Diagrams

> Status: Specification. The diagrams show keys and the attributes that define relationships. Full columns are in [DATA_DICTIONARY.md](DATA_DICTIONARY.md).
> `users` appears in every domain diagram as the ownership anchor. Except where noted, all user-owned tables are `ON DELETE CASCADE` from `users`.

## 0. Domain overview

```mermaid
flowchart LR
  ID[Identity & Access] --> DE[Deeds & Calendar]
  ID --> GR[Growth / Journal / Planner<br/>Wellbeing / Gamification]
  ID --> IS[Islamic]
  ID --> CO[Community]
  ID --> AI[AI]
  ID --> PL[Platform]
  DE --> GR
  DE --> CO
  GR --> AI
  DE --> AI
```

Table counts per domain are listed only in [docs/README.md §6](../README.md).

## 1. Identity & access

```mermaid
erDiagram
  users ||--|| user_preferences : "has"
  users ||--o{ auth_identities : "logs in via"
  users ||--o{ user_sessions : "has"
  users ||--o{ verification_tokens : "receives"
  users ||--o{ mfa_factors : "enrolls"
  users ||--o{ recovery_codes : "holds"
  users ||--o{ user_roles : "assigned"
  roles ||--o{ user_roles : "granted to"
  roles ||--o{ role_permissions : "includes"
  permissions ||--o{ role_permissions : "part of"

  users {
    uuid id PK
    citext email UK
    text password_hash "nullable (OAuth-only)"
    timestamptz email_verified_at
    text display_name
    text status "active|locked|pending_deletion"
    timestamptz deletion_requested_at
  }
  user_preferences {
    uuid user_id PK,FK
    locale_code locale
    text timezone
    text theme
    smallint week_start
    boolean bengali_digits
    boolean ai_enabled
  }
  auth_identities {
    uuid id PK
    uuid user_id FK
    text provider
    text provider_subject
  }
  user_sessions {
    uuid id PK
    uuid user_id FK
    text session_token_hash UK
    timestamptz stepup_at
    session_client client
    timestamptz expires_at
    timestamptz revoked_at
  }
  verification_tokens {
    uuid id PK
    uuid user_id FK
    verification_token_type type
    text token_hash UK
    timestamptz expires_at
    timestamptz consumed_at
  }
  mfa_factors {
    uuid id PK
    uuid user_id FK
    text type "totp"
    bytea secret_ciphertext
  }
  recovery_codes {
    uuid id PK
    uuid user_id FK
    text code_hash
    timestamptz used_at
  }
  roles {
    uuid id PK
    text code UK "guest|user|admin|super_admin|custom"
    boolean is_system
  }
  permissions {
    uuid id PK
    text code UK "e.g. deed.manage"
  }
  user_roles {
    uuid user_id PK,FK
    uuid role_id PK,FK
    uuid assigned_by FK
  }
  role_permissions {
    uuid role_id PK,FK
    uuid permission_id PK,FK
  }
```

## 2. Deeds & calendar

```mermaid
erDiagram
  deed_categories ||--o{ deed_category_translations : "translated"
  deed_categories ||--o{ deeds : "groups"
  deeds ||--o{ deed_translations : "translated"
  users ||--o{ deeds : "owns custom"
  users ||--o{ deed_plans : "schedules"
  deeds ||--o{ deed_plans : "planned as"
  deed_plans ||--o{ deed_completions : "completed on"
  users ||--o{ deed_completions : "records"
  users ||--o{ daily_summaries : "summarized per day"
  deeds ||--o{ deed_completions : "of"
  deed_completions ||--o{ completion_attachments : "evidence"
  users ||--o{ favorite_deeds : "favorites"
  deeds ||--o{ favorite_deeds : "favorited"
  users ||--o{ streaks : "has"
  deed_plans ||--o| streaks : "streak for"
  life_balance_categories ||--o{ deed_categories : "maps to"

  deed_categories {
    uuid id PK
    text slug UK
    uuid life_balance_category_id FK
    content_status status
  }
  deed_category_translations {
    uuid category_id PK,FK
    locale_code locale PK
    text name
  }
  deeds {
    uuid id PK
    uuid category_id FK
    uuid owner_user_id FK "NULL = system"
    smallint estimated_minutes
    content_status status
    timestamptz deleted_at
  }
  deed_translations {
    uuid deed_id PK,FK
    locale_code locale PK
    text title
    text description
  }
  deed_plans {
    uuid id PK
    uuid user_id FK
    uuid deed_id FK
    text rrule
    date dtstart_local
    date ends_on
    boolean is_active
  }
  deed_completions {
    uuid id PK
    uuid user_id FK
    uuid deed_plan_id FK "nullable (ad-hoc)"
    uuid deed_id FK
    date local_date
    completion_status status
    timestamptz occurred_at
  }
  completion_attachments {
    uuid id PK
    uuid completion_id FK
    text storage_key
  }
  favorite_deeds {
    uuid user_id PK,FK
    uuid deed_id PK,FK
  }
  streaks {
    uuid id PK
    uuid user_id FK
    uuid deed_plan_id FK "NULL = overall"
    int current_length
    int longest_length
    date last_counted_date
  }
  daily_summaries {
    uuid user_id PK,FK
    date local_date PK
    smallint scheduled
    smallint done
    smallint partial
    smallint skipped
  }
```

## 3. Growth, journal, planner, wellbeing & gamification

```mermaid
erDiagram
  users ||--o{ goals : "sets"
  goals ||--o{ goal_milestones : "broken into"
  goals }o--o| life_balance_categories : "area"
  goals }o--o| deed_plans : "tracked by"
  users ||--o{ journal_entries : "writes"
  users ||--o{ growth_snapshots : "summarized"
  users ||--o{ life_balance_assessments : "rates"
  life_balance_categories ||--o{ life_balance_assessments : "rated"
  users ||--o{ planner_items : "plans"
  planner_items }o--o| deed_plans : "may link"
  users ||--o{ wellbeing_logs : "logs"
  achievements ||--o{ achievement_translations : "translated"
  users ||--o{ user_achievements : "earns"
  achievements ||--o{ user_achievements : "awarded"

  goals {
    uuid id PK
    uuid user_id FK
    goal_period period
    goal_status status
    date start_on
    date due_on
    int target_value
    int current_value
  }
  goal_milestones {
    uuid id PK
    uuid goal_id FK
    smallint position
    timestamptz completed_at
  }
  journal_entries {
    uuid id PK
    uuid user_id FK
    journal_entry_type entry_type
    date local_date
    bytea body_ciphertext
    bytea nonce
    smallint key_version
    date deliver_on "future letters"
  }
  growth_snapshots {
    uuid id PK
    uuid user_id FK
    date period_month
    jsonb metrics
  }
  life_balance_categories {
    uuid id PK
    text code UK
    jsonb name
  }
  life_balance_assessments {
    uuid id PK
    uuid user_id FK
    uuid category_id FK
    date assessed_on
    smallint score
  }
  planner_items {
    uuid id PK
    uuid user_id FK
    date local_date
    time start_time
    smallint priority
    text rrule
  }
  wellbeing_logs {
    uuid id PK
    uuid user_id FK
    text log_type
    date local_date
    int value
  }
  affirmations {
    uuid id PK
    jsonb text
    content_status status
  }
  achievements {
    uuid id PK
    text code UK
    jsonb criteria
  }
  achievement_translations {
    uuid achievement_id PK,FK
    locale_code locale PK
  }
  user_achievements {
    uuid user_id PK,FK
    uuid achievement_id PK,FK
    timestamptz awarded_at
  }
```

## 4. Islamic

```mermaid
erDiagram
  users ||--|| islamic_preferences : "configures"
  users ||--o{ salah_records : "logs"
  users ||--o{ quran_reading_logs : "logs"
  users ||--o{ quran_memorization_progress : "tracks"
  users ||--o{ khatam_plans : "plans"
  khatam_plans ||--o{ quran_reading_logs : "progress from"
  dhikr_presets ||--o{ dhikr_logs : "counted as"
  users ||--o{ dhikr_logs : "counts"
  islamic_content_sources ||--o{ dhikr_presets : "cites"
  islamic_content_sources ||--o{ duas : "cites"
  islamic_content_sources ||--o{ hadith_entries : "cites"
  islamic_content_sources ||--o{ sunnah_practices : "cites"
  duas ||--o{ dua_translations : "translated"
  hadith_entries ||--o{ hadith_translations : "translated"
  sunnah_practices ||--o{ practice_logs : "logged"
  users ||--o{ practice_logs : "logs"
  users ||--o{ fasting_records : "logs"
  users ||--o{ ramadan_plans : "plans"
  users ||--o{ zakat_calculations : "saves"

  islamic_preferences {
    uuid user_id PK,FK
    boolean module_enabled
    text calc_method
    text asr_madhab
    smallint hijri_offset
    numeric latitude
    numeric longitude
  }
  salah_records {
    uuid id PK
    uuid user_id FK
    date local_date
    salah_prayer prayer
    salah_status status
    boolean in_jamaah
  }
  quran_reading_logs {
    uuid id PK
    uuid user_id FK
    uuid khatam_plan_id FK
    date local_date
    smallint from_surah
    smallint to_surah
    smallint pages
  }
  quran_memorization_progress {
    uuid id PK
    uuid user_id FK
    smallint surah
    smallint ayahs_memorized
    date last_revised_on
  }
  khatam_plans {
    uuid id PK
    uuid user_id FK
    date start_on
    date target_on
  }
  dhikr_presets {
    uuid id PK
    uuid source_id FK
    text arabic_text
    int default_target
  }
  dhikr_logs {
    uuid id PK
    uuid user_id FK
    uuid preset_id FK
    date local_date
    int count
  }
  duas {
    uuid id PK
    uuid source_id FK
    text arabic_text
    content_status status
  }
  dua_translations {
    uuid dua_id PK,FK
    locale_code locale PK
  }
  hadith_entries {
    uuid id PK
    uuid source_id FK
    text reference
    text grade
  }
  hadith_translations {
    uuid hadith_id PK,FK
    locale_code locale PK
  }
  sunnah_practices {
    uuid id PK
    text code UK
    uuid source_id FK
  }
  practice_logs {
    uuid id PK
    uuid user_id FK
    uuid practice_id FK
    date local_date
  }
  fasting_records {
    uuid id PK
    uuid user_id FK
    date local_date
    fast_type type
  }
  ramadan_plans {
    uuid id PK
    uuid user_id FK
    smallint hijri_year
    jsonb goals
  }
  zakat_calculations {
    uuid id PK
    uuid user_id FK
    jsonb inputs
    numeric zakat_due
  }
  islamic_content_sources {
    uuid id PK
    text title
    text license
  }
```

## 5. Community

```mermaid
erDiagram
  users ||--o{ groups : "creates"
  groups ||--o{ group_members : "has"
  users ||--o{ group_members : "member of"
  groups ||--o{ group_invitations : "invites"
  groups ||--o{ challenges : "hosts"
  users ||--o{ challenges : "creates"
  challenges ||--o{ challenge_participants : "joined by"
  users ||--o{ challenge_participants : "joins"
  challenge_participants ||--o{ challenge_progress : "reports"
  campaigns ||--o{ campaign_participations : "joined by"
  users ||--o{ campaign_participations : "joins"
  campaigns ||--o{ volunteer_opportunities : "offers"
  users ||--o{ posts : "authors"
  groups ||--o{ posts : "scoped to"
  campaigns ||--o{ posts : "tagged"
  posts ||--o{ comments : "has"
  posts ||--o{ reactions : "receives"
  comments ||--o{ reactions : "receives"
  users ||--o{ content_reports : "files"
  posts ||--o{ content_reports : "reported"
  comments ||--o{ content_reports : "reported"
  users ||--o{ user_blocks : "blocks"
  content_reports ||--o{ moderation_actions : "resolved by"
  users ||--o{ moderation_actions : "moderator"

  groups {
    uuid id PK
    group_type type
    text name
    uuid created_by FK
    boolean is_discoverable
  }
  group_members {
    uuid group_id PK,FK
    uuid user_id PK,FK
    group_role role
    member_status status
  }
  group_invitations {
    uuid id PK
    uuid group_id FK
    text code_hash UK
    timestamptz expires_at
  }
  challenges {
    uuid id PK
    uuid group_id FK
    uuid created_by FK
    date start_on
    date end_on
  }
  challenge_participants {
    uuid id PK
    uuid challenge_id FK
    uuid user_id FK
  }
  challenge_progress {
    uuid participant_id PK,FK
    date local_date PK
    int value
  }
  campaigns {
    uuid id PK
    text slug UK
    jsonb title
    content_status status
  }
  campaign_participations {
    uuid campaign_id PK,FK
    uuid user_id PK,FK
    text joined_via
  }
  volunteer_opportunities {
    uuid id PK
    uuid campaign_id FK
    text title
  }
  posts {
    uuid id PK
    uuid author_id FK "SET NULL on delete"
    uuid group_id FK
    visibility visibility
    boolean is_anonymous
  }
  comments {
    uuid id PK
    uuid post_id FK
    uuid author_id FK
  }
  reactions {
    uuid id PK
    uuid user_id FK
    uuid post_id FK
    uuid comment_id FK
    text kind
  }
  content_reports {
    uuid id PK
    uuid reporter_id FK
    uuid post_id FK
    uuid comment_id FK
    report_status status
  }
  user_blocks {
    uuid blocker_id PK,FK
    uuid blocked_id PK,FK
  }
  moderation_actions {
    uuid id PK
    uuid report_id FK
    uuid moderator_id FK
    moderation_action_type action
  }
```

## 6. AI

```mermaid
erDiagram
  users ||--o{ ai_consents : "grants"
  users ||--o{ ai_conversations : "starts"
  ai_conversations ||--o{ ai_messages : "contains"
  users ||--o{ ai_usage_logs : "consumes"
  ai_conversations ||--o{ ai_usage_logs : "billed to"
  users ||--o{ ai_insights : "receives"

  ai_consents {
    uuid id PK
    uuid user_id FK
    text scope
    text policy_version
    timestamptz granted_at
    timestamptz revoked_at
  }
  ai_conversations {
    uuid id PK
    uuid user_id FK
    text purpose
  }
  ai_messages {
    uuid id PK
    uuid conversation_id FK
    ai_message_role role
    bytea content_ciphertext
  }
  ai_usage_logs {
    uuid id PK
    uuid user_id FK
    text feature
    text model
    int input_tokens
    int output_tokens
    numeric cost_usd
  }
  ai_insights {
    uuid id PK
    uuid user_id FK
    ai_insight_type insight_type
    jsonb payload
    text feedback
  }
```

## 7. Platform

```mermaid
erDiagram
  users ||--o{ notifications : "receives"
  users ||--o{ notification_preferences : "sets"
  users ||--o{ reminders : "schedules"
  users ||--o{ push_subscriptions : "registers"
  users ||--o{ widget_devices : "links"
  users ||--o{ sync_operations : "submits"
  users ||--o{ export_jobs : "requests"
  users ||--o{ api_clients : "owns"
  users ||--o{ audit_logs : "actor"
  users ||--o{ content_versions : "edits"
  users ||--o{ idempotency_keys : "replays"
  users ||--o{ broadcasts : "creates"
  users ||--o{ experiments : "updates"

  notifications {
    uuid id PK
    uuid user_id FK
    text type
    notification_channel channel
    timestamptz read_at
  }
  notification_preferences {
    uuid user_id PK,FK
    text type PK
    notification_channel channel PK
    boolean enabled
  }
  reminders {
    uuid id PK
    uuid user_id FK
    time local_time
    text rrule
    timestamptz next_fire_at
  }
  push_subscriptions {
    uuid id PK
    uuid user_id FK
    text endpoint UK
  }
  widget_devices {
    uuid id PK
    uuid user_id FK
    text token_hash UK
    timestamptz last_seen_at
  }
  sync_operations {
    uuid user_id PK,FK
    uuid op_id PK
    text entity
    jsonb result
  }
  audit_logs {
    uuid id PK
    timestamptz occurred_at
    uuid actor_user_id
    text action
    text entity_type
  }
  system_settings {
    text key PK
    jsonb value
  }
  feature_flags {
    text key PK
    boolean enabled
    text_array allowed_roles
  }
  idempotency_keys {
    uuid user_id PK,FK
    text key PK
    text request_hash
    jsonb response
    timestamptz created_at
  }
  broadcasts {
    uuid id PK
    uuid created_by FK
    text status
    timestamptz scheduled_at
    jsonb translations
  }
  experiments {
    text key PK
    jsonb variants
    text status
    uuid updated_by FK
  }
  content_versions {
    uuid id PK
    text entity_type
    uuid entity_id
    int version
    jsonb snapshot
  }
  export_jobs {
    uuid id PK
    uuid user_id FK
    text kind
    export_status status
  }
  api_clients {
    uuid id PK
    uuid owner_user_id FK
    text key_prefix UK
    text_array scopes
  }
```

Note: `audit_logs` deliberately has **no FK** to `users`, so it survives account purge (rows are pseudonymized instead). The `users ||--o{ audit_logs` line above is logical only.

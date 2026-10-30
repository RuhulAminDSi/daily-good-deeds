# User Journeys

The journeys below cover the most important end-to-end flows. Each journey lists the feature IDs it exercises, and each one becomes an E2E test scenario in [TEST_PLAN.md](../qa/TEST_PLAN.md).

---

## J1 — Onboarding (from a Messenger link to the first completed deed)
**Persona:** Nusrat (BN, mid-range Android, opens the link inside Messenger).
**Features:** F-PWA-007, F-I18N-002/003, F-AUTH-001/004, F-AUTH-010, F-ISL-017, F-DEED-013, F-DEED-004, F-PWA-001.

```mermaid
flowchart TD
    A[Taps link in Messenger] --> B{In-app browser detected?}
    B -- yes --> C[Banner: Open in browser for the best experience]
    C -->|Continue here| D[Landing page in BN - from Accept-Language/choice]
    C -->|Open in Chrome| D2[Landing in Chrome]
    B -- no --> D2
    D --> E[Sign up with email - Google button hidden in webview]
    D2 --> E2[Sign up with email or Google]
    E --> F[Verification email sent in BN]
    E2 --> F
    F --> G[Onboarding step 1: Language, timezone confirm, Bengali digits]
    G --> H[Step 2: Interests = life-balance categories]
    H --> I{Step 3: Enable Islamic features?}
    I -- yes --> J[Location + calculation method + madhab]
    I -- no --> K[Module off - no Islamic UI]
    J --> L[Step 4: Pick 3 starter deeds - five-minute deeds suggested]
    K --> L
    L --> M[Today screen with checklist]
    M --> N[Completes first deed - celebration, tree sprouts]
    N --> O{Browser supports install?}
    O -- yes --> P[Soft install prompt after first success]
    O -- iOS --> Q[Add to Home Screen guidance]
    O -- webview --> R[No install prompt]
```

**Success:** a first completion within 3 minutes of landing. **Failure paths:** the verification email is delayed (the user can keep going with limited features); the user denies geolocation (city search is offered instead).

---

## J2 — Daily checklist loop
**Persona:** Emma. **Features:** F-NOTIF-002, F-DEED-004/009, F-CAL-006/007, F-GAME-004/008, F-JRNL-003.

```mermaid
journey
    title Emma's typical day
    section Morning
      Receives gentle reminder at 08:00: 4: Emma
      Sets morning intention: 4: Emma
      Reviews today's checklist: 5: Emma
    section Daytime
      Completes "Compliment a colleague" with one tap: 5: Emma
      Uses Surprise Me for a new idea: 4: Emma
      Marks gym skipped (illness): 3: Emma
    section Evening
      Gentle nudge only if items remain: 3: Emma
      Evening reflection + gratitude: 5: Emma
      Sees ring at 100% and tree grows: 5: Emma
```

---

## J3 — Offline completion and sync (PWA)
**Persona:** Nusrat, offline on a bus. **Features:** F-PWA-003/004/005/006, F-CAL-010.

```mermaid
sequenceDiagram
    actor U as Nusrat
    participant UI as Web app (PWA)
    participant IDB as IndexedDB outbox
    participant SW as Service worker
    participant API as API /sync
    U->>UI: Tick "Help mother cook" (offline)
    UI->>IDB: enqueue {opId, entity: deed_completion, action: create, payload{planId, localDate}, clientTime}
    UI-->>U: Optimistic check + "Saved on this device" indicator
    Note over UI,SW: Connection returns
    SW->>UI: online / focus / Background Sync event
    UI->>API: POST /sync {clientId, ops}
    API->>API: One query dedups opIds, row-level LWW by clientTime
    API-->>UI: {results:[applied, duplicate, conflict], cursor}
    UI->>IDB: remove settled ops
    opt server cursor ahead of local cursor
      UI->>API: GET /sync/changes?since=cursor
      API-->>UI: changes + new cursor
    end
    alt conflict
      UI-->>U: "Updated on another device" toast with details
    end
```

---

## J4 — A salah day
**Persona:** Rafiq. **Features:** F-ISL-001/002/010/013, F-NOTIF-010, F-WIDGET-005.

```mermaid
flowchart LR
    A[Fajr reminder 10 min before] --> B[Taps Islamic widget: Fajr = prayed on time]
    B --> C[Widget queues op, syncs]
    C --> D[Dhuhr at work: logs from web dashboard + jamaah flag]
    D --> E[Asr: late - logs 'late']
    E --> F[Maghrib & Isha logged from widget]
    F --> G[03:30 Tahajjud logged - attributed to previous night]
    G --> H[Private daily salah summary - no rankings, neutral copy]
```

**Edge cases:** after travelling to a new time zone, the prayer times recompute from the new location only after the user confirms it. An "excused" status is never shown as missed.

---

## J5 — Family challenge
**Persona:** Ayesha (organizer) and Sami (teen). **Features:** F-COMM-001/002/003/014, F-NOTIF-007, F-COMM-005.

```mermaid
sequenceDiagram
    actor A as Ayesha
    actor S as Sami
    participant App
    A->>App: Create family group "Rahman Family"
    A->>App: Generate invite link (7-day expiry)
    A-->>S: Shares link via WhatsApp
    S->>App: Opens link, signs in, accepts invite
    App-->>S: Privacy explainer: nothing shared unless you choose
    A->>App: Create challenge "30 days helping at home", target 100 (collective)
    S->>App: Opts in to challenge
    S->>App: Completes qualifying deed
    App-->>A: Collective progress 1/100 (no per-member ranking)
    App-->>S: Encouraging message
    Note over App: Day 30 - target met
    App-->>A: Family badge awarded
    App-->>S: Family badge awarded
```

---

## J6 — Admin moderation
**Persona:** Farhana (moderator). **Features:** F-COMM-013, F-COMM-012, F-ADMIN-008, F-RBAC-005/006.

```mermaid
flowchart TD
    R[User reports story: reason=harassment] --> Q[Moderation queue item with severity + SLA timer]
    Q --> M[Farhana opens item: content, context, reporter reasons, author history]
    M --> D{Decision}
    D -- No violation --> A1[Dismiss report, reason code] --> L[Audit + moderation_actions]
    D -- Violation --> A2[Hide/remove content]
    A2 --> W{Severity}
    W -- low --> A3[Warn author]
    W -- high --> A4[Suspend posting - step-up re-auth required]
    A3 --> L
    A4 --> L
    L --> N[Reporter notified: action taken - no details on the author]
    N --> AP{Author appeals?}
    AP -- yes --> AQ[Appeals queue - reviewed by a different moderator]
```

---

## J7 — Linking the Android widget
**Persona:** Nusrat. **Features:** F-WIDGET-001/002/006/007/008, F-AUTH-007.

```mermaid
sequenceDiagram
    actor U as User
    participant Web as Web app (Settings > Devices)
    participant API
    participant Host as Android host app
    participant W as Glance widget
    U->>Web: "Link Android widget"
    Web->>API: POST /widget/link-codes
    API-->>Web: code ABCD-1234 + QR App Link (expires 10 min)
    U->>Host: Install host app, then scan QR with the phone camera (or type the code)
    Host->>API: POST /widget/devices {code, deviceName}
    API-->>Host: deviceId + device token (scope=widget)
    Host->>Host: Store token (Keystore-backed), fetch locale & snapshot
    U->>W: Adds Small Progress widget
    W->>API: GET /widget/snapshot (via WorkManager)
    API-->>W: {localDate, progress, items, streak, updatedAt}
    W-->>U: Shows 3/5 · "Updated 09:14"
    Note over Web,API: Later: user revokes device on web
    W->>API: refresh -> 401
    W-->>U: "Sign in again" state
```

---

## J8 — Account deletion (privacy)
**Features:** F-AUTH-009, F-RPT-006.
1. Settings → Privacy → Delete account.
2. The user is offered "Export my data first" and an export job runs.
3. The user re-authenticates and picks how to handle their community posts: anonymize or delete.
4. The account is deactivated and a 30-day grace period begins, with an email confirming it.
5. If the user logs in during the grace period, they see a "Cancel deletion" option.
6. When the 30-day grace period ends (FR-AUTH-009-01), a purge job runs. Every step is recorded in the audit log under a pseudonymous ID.

# Component Library (`packages/ui`)

Every component is built on Radix primitives where one exists, styled with token-based Tailwind classes, and receives all text through props or i18n. Each one ships with Storybook stories covering {EN, BN} × {light, dark} × states, plus an axe test.

Legend: **Anatomy** is the set of parts. **Variants** are visual or semantic options. **States** covers interaction and data states. **A11y** lists the key accessibility requirements.

## 1. Primitives

### Button
- **Anatomy:** container, optional leading icon, label, optional trailing icon, optional spinner.
- **Variants:** `primary` (filled primary), `secondary` (surface + border-strong), `ghost`, `danger`, `link`. Sizes `sm` (36px), `md` (44px), `lg` (52px). `icon-only` requires `aria-label`.
- **States:** default, hover, active, focus-visible, disabled (`aria-disabled`, keeps focusable when it shows a tooltip reason), loading (spinner, label kept for width, `aria-busy`).
- **A11y:** native `<button>`. Never a `div`. Loading announces "Saving…". BN labels may wrap to 2 lines.

### IconButton
Same as Button `icon-only`. The tooltip shows the label on hover/focus. Minimum target is 44px (48px on mobile).

### Link
Inline text link (underlined, `primary`) or nav link. External links show an icon and add "(opens in a new tab)" to the accessible name.

### Input / Textarea
- **Anatomy:** label, optional hint, field, optional prefix/suffix (e.g. ৳ / currency), character counter, error text.
- **Variants:** text, email, password (with show/hide toggle), number, search, textarea (auto-grow).
- **States:** default, focus, filled, invalid (`aria-invalid`, danger border + icon + message), disabled, read-only.
- **A11y:** `<label for>`. The hint and error are wired through `aria-describedby`. The counter is announced politely only near the limit.

### Select / Combobox
Radix Select for ≤ 10 options. A Combobox (search) is used for timezone, city (prayer times), and deed search. Keyboard: type-ahead and arrow keys.

### Checkbox / Radio / Switch
Native inputs with custom visuals. The border uses `border-strong` (3.78:1). Checked state is shown with the primary fill **and** a check glyph. Switch is used for immediate settings (notifications, AI enable) with `role="switch"`.

### SegmentedControl
For Day/Week/Month/Year and EN/BN. Built on Radix ToggleGroup (single). Arrow-key navigation.

### Chip / Tag
**Variants:** category chip (icon + colour dot + label), filter chip (toggle), status chip (`done`/`partial`/`skipped`/`pending sync`), AI chip.

### Badge (count)
Used for the notifications count only. Never shows a "missed" count. Display caps at 99+.

### Avatar
Image or initials (supports Bengali initials). Sizes 24/32/40/64. Group avatar stack shows a maximum of 4 plus "+n".

### Tooltip
Supplementary info only (never essential). Shows on hover and focus. Dismiss with Esc.

### Spinner / Skeleton
Skeletons match the final layout and use the `surface-sunken` shimmer (no shimmer under reduced motion). The spinner is used only inside buttons and for short inline loads.

## 2. Layout & navigation

| Component | Anatomy / notes |
|---|---|
| **AppShell** | Top app bar, nav (bottom bar / rail / sidebar by breakpoint), main, system-banner slot, toast region. Handles safe areas. |
| **TopAppBar** | Back button (on pushed pages), title, offline chip, notifications bell (Badge), language quick switch (≥ md), avatar menu. |
| **BottomNav** | 5 items, icon + label, `aria-current`. Hidden while the virtual keyboard is open (`visualViewport` resize). |
| **SideNav / NavRail** | Grouped sections (Daily, Faith, Growth, Community, Account). Collapsible. Keyboard navigable. |
| **PageHeader** | h1, optional subtitle (e.g. Hijri date), actions slot. |
| **Card** | Header (title, actions), body, footer. Variants: `default`, `interactive` (whole card clickable with a single link target), `highlight` (primary-subtle). Radius lg. |
| **Sheet / BottomSheet** | Dialog semantics. Drag handle (decorative). Snap points on mobile. |
| **Dialog / ConfirmDialog** | Title, description, actions. Destructive confirms require the danger variant. Typing a confirmation is required only for account deletion. |
| **Tabs** | Radix Tabs. Scrollable on mobile with fade edge indicators. |
| **Breadcrumbs** | Admin only. |
| **EmptyState** | Illustration (optional), title, body, primary action. Copy follows the non-shaming guide. |
| **ErrorState** | Icon, friendly message, "Try again", support code (request ID) in small text. |
| **SystemBanner** | Variants: offline, pending-sync, conflict, in-app-browser, update, verify-email, maintenance. Priority stacking rules: at most 2 visible, the rest collapse into a "+1" chip. |
| **Toast / Snackbar** | Message + optional action (Undo). Polite live region. Bottom on mobile (above nav), bottom-right on desktop. |
| **OfflineChip** | Persistent indicator in the top app bar while `navigator.onLine === false` or the API is unreachable. |

## 3. Domain components

### ChecklistItem (F-DEED-004/009)
- **Anatomy:** checkbox, title, category chip, optional time, optional note indicator, attachment indicator, pending-sync clock badge, ⋯ menu.
- **States:** pending, done, partial (half-filled ring + label "Partly done"), skipped (muted + "Skipped" chip, no strikethrough), syncing, sync-failed (retry link).
- **A11y:** the native checkbox is labelled with the deed title. The status is announced. The menu button has a contextual label.

### DailyProgressRing (F-CAL-006)
SVG ring plus the centre label "3/5". Text alternative: "3 of 5 planned deeds done today". Animates only without reduced motion.

### StreakCounter (F-CAL-007/008, F-GAME-003)
Amber flame icon plus the current count, with the longest streak as secondary text. The broken state shows the "fresh start" copy. Rest days are shown as a leaf icon in history.

### CalendarMonth / CalendarWeek / DayCell (F-CAL-001..004)
Grid with per-day completion dots or mini-rings, an optional Hijri secondary date, and a today marker (outline + "Today" for screen readers). The selected day opens DayDetail.

### Heatmap (F-CAL-005)
52×7 grid of `HeatCell`, legend with ranges, "View as table" toggle, and a range selector (16/26/52 weeks).

### DeedCard (F-DEED-001/011/013)
Title, category, duration estimate ("~5 min"), short description, favourite toggle (heart, `aria-pressed`), and "Add to my plan" action.

### RecurrencePicker (F-DEED-005, F-PLAN-006)
Presets (Daily, Weekdays, Weekly on…, Monthly on day…, Custom) plus a human-readable summary in the UI language ("প্রতি সোমবার ও বৃহস্পতিবার"). It emits the RRULE subset defined in the SRS.

### GoalCard / MilestoneList (F-GROW-001..003)
Title, period, progress bar with text, milestones as a checklist, and a linked-deeds chip list.

### LifeBalanceRadar (F-GROW-009)
Radar or bar chart with 8 categories (COLOR_TOKENS §3.2), a text summary, a table toggle, and a self-assessment slider set (1–5, labelled).

### JournalEditor (F-JRNL-001..006)
Entry-type selector, date, title (optional), body (auto-grow textarea with Markdown-lite), mood (optional emoji scale with labels), and the privacy indicator "Only you". Autosave draft locally (IndexedDB) every 5s with the status "Saved on this device" / "Synced".

### SalahDayRow (F-ISL-001)
Five prayer cells (Fajr, Dhuhr, Asr, Maghrib, Isha). Each one is a tri-state toggle: not logged / prayed / prayed in jamaah, with "Qada" in a menu. The prayer time is shown under each name. No red "missed" state; it is neutral "not logged".

### PrayerTimesCard (F-ISL-002)
Next prayer + countdown (text, updated each minute with `aria-live="off"`), list of times, location and method link, disclaimer link.

### QuranProgress (F-ISL-003..005)
Surah/ayah picker, pages read today, khatam plan progress bar ("Juz 12 of 30") and the expected completion date.

### TasbihCounter (F-ISL-007)
Large circular tap area, counter (`text-counter`), target selector (33/99/100/custom), reset (confirm), preset dhikr text (Arabic + translation). Works offline, with state in IndexedDB.

### ArabicTextBlock (F-ISL-008/016)
Arabic (RTL, Amiri), transliteration (optional), translation (EN/BN), source citation ("Sahih al-Bukhari 6018 — sunnah.com"), and a copy action.

### ZakatForm (F-ISL-014)
Stepper sections (cash, gold, silver, business assets, receivables, liabilities). Nisab basis selector (gold/silver) with the date of the price used. Result card with the disclaimer "Informational estimate; consult a qualified scholar for your situation."

### HijriDate (F-ISL-013)
Inline Hijri date with an offset indicator, if one is set.

### GoodDeedsTree (F-GAME-004)
SVG illustration that grows leaves, flowers, and fruit from cumulative completions (never shrinks). Text alternative: "Your tree has 128 leaves and 6 fruits." Static under reduced motion.

### AchievementBadge (F-GAME-001/002)
Icon, name, earned date or a locked state ("How to earn" text). There is no "rare" or comparison language.

### GroupCard / MemberList / InvitationCard (F-COMM-001/002)
Group name, type (Family/Community), member avatars, and the role (owner/admin/member). Invitation shows the expiring code and a QR code (for in-person sharing).

### ChallengeCard (F-COMM-003, F-GAME-005)
Title, dates, participants count (no ranking of worship challenges; general challenges may show collective progress only), and Join/Leave.

### PostCard (F-COMM-009/010/011)
Author (or "Anonymous"), content, optional image, appreciation reactions (a limited positive set: ❤️ "Inspiring", 🤲 "Ameen", 🌱 "Motivated"), comment count, and a ⋯ menu (Report, Block, Delete own).

### ReportDialog (F-COMM-013)
Reason radio list, optional details, "Also block this user" checkbox, and a confirmation message.

### AiPanel / AiMessage (F-AI-*)
AI chip, streaming message with `aria-live="polite"` at sentence granularity, feedback (helpful / not helpful), disclaimer footer, and "Stop generating". Disabled-state explanation when there is no quota or consent.

### NotificationItem (F-NOTIF-001)
Icon by type, localized title/body, relative time, unread dot (+ "Unread" for screen readers), and a deep-link target.

### SyncStatusIndicator (F-PWA-005/006)
Idle (hidden), pending (count), syncing (spinner), error (retry), conflict (review link).

### InstallPrompt (F-PWA-001)
A custom install card shown after meaningful engagement (≥ 2 sessions), never on first load. It uses `beforeinstallprompt` on Chromium and illustrated "Share → Add to Home Screen" instructions on iOS Safari. It is hidden inside in-app browsers (InAppBrowserBanner shows there instead).

### InAppBrowserBanner (F-PWA-007)
See DESIGN_SYSTEM §4.3.

### ConsentCard (F-AI-002, analytics)
Plain-language explanation of what is sent and to whom, with a Learn more link, Allow/Not now buttons, and a reversible switch in Settings.

## 4. Admin components

| Component | Notes |
|---|---|
| **DataTable** | Server-side pagination, sort, filters, column chooser, compact density, row selection with bulk actions, CSV export (permission-gated, P10). Mobile: card list. |
| **FilterBar** | Search + filter chips + saved views |
| **TranslationEditor** | Side-by-side EN/BN fields, missing badge, character count, preview, version history link |
| **ContentStatusPill** | draft / in_review / verified / published / archived |
| **SourceReferenceField** | Source dropdown (`islamic_content_sources`), reference string, URL, grade (for hadith) and verifier |
| **AuditLogViewer** | Actor, action, target, diff viewer (JSON before/after with redaction), IP (masked), timestamp |
| **FeatureFlagRow** | Key, description, on/off toggle, optional role allowlist, last changed by (boolean flags only, DL-029) |
| **StepUpDialog** | Password + TOTP re-entry for sensitive admin actions |
| **StatTile** | KPI label, value, delta vs previous period (neutral colours), sparkline (decorative, with text alternative) |
| **JobQueueTable** | Queue name, state counts, failed jobs with retry, last run |
| **ModerationQueueItem** | Reported content preview, reasons count, reporter notes, actions (dismiss, hide, remove, warn, suspend) with a required reason |

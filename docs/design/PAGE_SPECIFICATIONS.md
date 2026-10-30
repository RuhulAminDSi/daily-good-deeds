# Page Specifications

66 pages: 11 public, 41 user app, 14 admin. Routes omit the `/{locale}` prefix. Components refer to [COMPONENT_LIBRARY.md](COMPONENT_LIBRARY.md); navigation refers to [NAVIGATION_MAP.md](NAVIGATION_MAP.md); copy follows DESIGN_SYSTEM §6.

## 0. Conventions that apply to every page (not repeated below)

| Concern | Standard behaviour |
|---|---|
| **Loading** | Route-level skeleton matching the layout (`loading.tsx`). Skeletons appear only after 150ms (no flash). Server components stream sections independently. |
| **Error** | Section-level `ErrorState` with "Try again" and a request ID. Route-level `error.tsx` for fatal errors. 401 → `/login?next=`. 403 → "You don't have access to this page". 404 → PG-009. |
| **Offline** | OfflineChip + banner (DESIGN_SYSTEM §4.3). Cached data is shown with an "as of {time}" caption. Write actions queue if the entity is offline-capable per the offline matrix in [SRS §18](../specifications/SRS.md) (journals are never offline); otherwise they are disabled with an explanation. |
| **In-app browser** | InAppBrowserBanner on first view in a webview. Google sign-in hidden. Install prompt hidden. |
| **EN/BN** | All strings come from catalogs. Numbers and dates use the user's numeral system. BN line heights apply. Layouts must hold BN strings that are 30 % longer. Titles use 2-line clamps. |
| **Theme** | Light/dark tokens only. |
| **Responsive** | Patterns from RESPONSIVE_GUIDELINES §3 unless a page says otherwise. |
| **Analytics** | Only consented, aggregate page events (F-RPT-008). No journal or worship content is ever sent. |
| **Title** | `<title>` = "{Page} · Daily Good Deeds" (BN: "{পেজ} · ডেইলি গুড ডিডস") |

Format per page: **Purpose · Role · Features · Layout · Components · Navigation · States (page-specific) · Responsive · EN/BN**.

---

## A. Public pages

### PG-001 Landing — `/`
- **Purpose:** Explain the product, build trust (privacy, bilingual), and convert visitors to sign-up. **Role:** Guest. **Features:** F-I18N-002, F-PWA-001.
- **Layout:** Hero (tagline "Small Good Deeds, Every Day. A Better You, Every Day." / "প্রতিদিন ছোট ভালো কাজ। প্রতিদিন আরও ভালো আপনি।"), three pillars (Goodness, Personal Growth, Social Impact), feature highlights (Today checklist, Islamic tools, Family), privacy promise, FAQ, footer.
- **Components:** Button, Card, language SegmentedControl, illustration, Accordion (FAQ).
- **Navigation:** Get started → PG-003. Sign in → PG-002. Footer → PG-007. Signed-in users → `/today`.
- **States:** Static (SSG). No data states.
- **Responsive:** Single column on mobile. Hero image hidden below 375px. Two-column hero on ≥ lg.
- **EN/BN:** Locale is detected from `Accept-Language` on the first visit (bn-BD → BN), with a visible switcher. `hreflang` alternates for SEO.

### PG-002 Sign in — `/login`
- **Purpose:** Authenticate. **Role:** Guest. **Features:** F-AUTH-002, F-AUTH-003, F-PWA-007.
- **Layout:** Centered card (max 420px): email, password (show/hide), "Forgot password?", primary submit, divider, "Continue with Google", link to register.
- **Components:** Input, Button, Link, InAppBrowserBanner.
- **Navigation:** Success → `next` (validated) or `/today` (or `/onboarding` if not completed). Unverified email → `/today` with the verify banner.
- **States:** Submitting (button loading). Invalid credentials: generic "Email or password is incorrect" (no account enumeration). Rate-limited: "Too many attempts. Try again in {n} minutes." Locked account message. Google OAuth error → inline error.
- **Responsive:** Full-width card on mobile with 16px margin.
- **EN/BN:** Error messages localized. Email field forced LTR.

### PG-003 Register — `/register`
- **Purpose:** Create an account. **Role:** Guest. **Features:** F-AUTH-001, F-AUTH-003.
- **Layout:** Name, email, password (strength meter + rules list), preferred language (pre-filled), terms & privacy consent checkbox (required), submit, Google option.
- **States:** Field validation on blur. Email already used → "If this email is available, we've sent a verification link" (anti-enumeration; the same response either way). Success → PG-004 "check your email".
- **Responsive / EN/BN:** As PG-002. The strength-meter labels are localized.

### PG-004 Verify email — `/verify-email`
- **Purpose:** Confirm email ownership. **Role:** Guest / User. **Features:** F-AUTH-004.
- **Layout:** Two modes. (a) "Check your inbox" with a resend button (60s cooldown, countdown text); (b) token landing: verifying → success → Continue.
- **States:** Expired or used token → "This link has expired" + resend. Already verified → success.
- **EN/BN:** The email is sent in the user's chosen language.

### PG-005 Forgot password — `/forgot-password`
- **Purpose:** Request a reset link. **Features:** F-AUTH-005.
- **Layout:** Email field + submit. Always shows the same confirmation (anti-enumeration).
- **States:** Rate-limit message. Success confirmation.

### PG-006 Reset password — `/reset-password?token=`
- **Purpose:** Set a new password. **Features:** F-AUTH-005, F-AUTH-007.
- **Layout:** New password + confirm, strength meter, and the checkbox "Sign out of all other devices" (default on).
- **States:** Invalid/expired token → error with a link to PG-005. Success → sign in.

### PG-007 Legal & about — `/legal/privacy`, `/legal/terms`, `/about`, `/legal/religious-content`
- **Purpose:** Privacy policy, terms, about, and the religious content sourcing policy. **Role:** All. **Features:** F-ISL-018 (sourcing policy), F-AUTH-009 (data rights).
- **Layout:** Reading layout (max 720px), table of contents, last-updated date.
- **EN/BN:** Both versions maintained. If BN is missing, show EN with a "Bengali version coming soon" note (fallback rule F-I18N-009).

### PG-008 Offline fallback — `/offline` (service-worker served)
- **Purpose:** Shown when navigating to an uncached route while offline. **Features:** F-PWA-003/004.
- **Layout:** Illustration, "You're offline", a list of cached pages available (Today, Tasbih, Prayer times, Duas), retry button.
- **EN/BN:** Precached in both locales.

### PG-009 Error pages — 404 / 500 / maintenance
- **Purpose:** Friendly error handling. **Layout:** Illustration, message, primary action (Go to Today / Home), request ID for 500. Maintenance shows the expected return time (from `system_settings`).

### PG-010 Accept invitation — `/invite/:code`
- **Purpose:** Join a family/community group. **Role:** Guest → User. **Features:** F-COMM-002.
- **Layout:** Group card (name, type, inviter first name, member count), and a list of exactly what joining shares (only items you choose to share; nothing by default). Accept / Decline.
- **Navigation:** Guest → sign in/register with `next` back here.
- **States:** Expired/revoked code, already a member, group full (if a limit is set), email-restricted invitation mismatch.

### PG-011 Campaign landing (QR) — `/c/:slug`
- **Purpose:** Join a campaign by scanning a QR code. **Role:** Guest/User. **Features:** F-INTG-006, F-COMM-007.
- **Layout:** Campaign hero, description, dates, organiser (verified badge if verified by an admin), "Join campaign", what participation means.
- **States:** Campaign ended → read-only summary. Not found → 404.

### PG-052 Install guide — `/install`
- **Purpose:** Explain how to install the PWA and the Android widget. **Role:** All. **Features:** F-PWA-001, F-WIDGET-001.
- **Layout:** Platform tabs (Android Chrome, iOS Safari, Desktop, In-app browser). Each tab gives steps with illustrations and, where supported, an install button. Android widget section with a Play Store link (when available) and a "Link widget" code generator for signed-in users.
- **States:** Platform auto-detected. Already installed (`display-mode: standalone`) → "You're using the installed app".

---

## B. User app — onboarding & daily

### PG-012 Onboarding — `/onboarding`
- **Purpose:** Personalise in under 60 seconds. **Role:** User (new). **Features:** F-AUTH-010, F-I18N-003, F-ISL-017, F-NOTIF-009, F-DEED-014.
- **Layout:** 5-step wizard with progress dots: (1) Language & numerals; (2) Timezone (auto-detected, confirm) & week start; (3) Interests: pick life-balance categories; (4) Islamic features on/off (default **on**, with the explanation "You can change this anytime"), prayer method & location if on; (5) Starter deeds: 3–5 suggested deeds pre-selected from the chosen categories, editable, plus a reminder time (optional; the push permission is requested **only** when the user taps "Enable reminders").
- **Components:** Stepper, SegmentedControl, Combobox (timezone/city), Chip (filter), DeedCard, Switch.
- **Navigation:** Skip available on steps 3–5 (sensible defaults). Finish → PG-013.
- **States:** Location denied → manual city search. Saving step errors are retried inline.
- **Responsive:** Full screen on mobile. Centered 560px card on desktop.
- **EN/BN:** The language choice in step 1 immediately re-renders the wizard.

### PG-013 Today — `/today`
- **Purpose:** The daily home: complete today's deeds quickly and see gentle progress. **Role:** User. **Features:** F-DEED-004, F-DEED-009, F-DEED-008, F-CAL-006, F-CAL-007, F-GAME-003, F-DEED-012, F-ISL-002 (snapshot), F-WELL-007, F-AI-012 (if enabled), F-PWA-005.
- **Layout (mobile order):** Greeting with Gregorian + Hijri date → DailyProgressRing + StreakCounter → Checklist (grouped: Time-based, Anytime, Done collapsed) → Next prayer card (if Islamic is on) → "Try a 5-minute good deed" suggestion card (random/recommended) → affirmation or AI motivational message (labelled) → morning intention / evening reflection prompt card (time-of-day aware).
- **Data:** One `GET /api/v1/today` request with an ETag (FR-DEED-004-05); it uses the same builder as the widget snapshot.
- **Components:** ChecklistItem, DailyProgressRing, StreakCounter, PrayerTimesCard (compact), DeedCard, Card, Toast (Undo), FAB "Add deed".
- **Navigation:** Row ⋯ → note/attach sheets. Deed title → PG-015. Prayer card → PG-032. Reflection prompt → PG-027 with the type preset.
- **States:** *Empty* (no plans): "Let's choose your first good deeds" + "Browse deeds" + 3 quick-add suggestions. *All done:* a celebration card ("Everything planned for today is done. May it bring goodness."), with no confetti under reduced motion. *Offline:* checklist fully interactive; pending badges. *Past-midnight edge:* the day boundary uses the user's timezone (F-CAL-010), and a "Yesterday" link allows editing within the window (F-CAL-011).
- **Responsive:** Tablet 2 columns. Desktop 3 zones (RESPONSIVE §3).
- **EN/BN:** Deed titles from translations (fall back to EN with a subtle "EN" marker for screen readers only if missing). Counts use the numeral preference.

### PG-014 Discover deeds — `/deeds`
- **Purpose:** Browse, search, and filter the deed library; add deeds to plans. **Features:** F-DEED-001, F-DEED-002, F-DEED-011, F-DEED-012, F-DEED-013, F-DEED-014, F-DEED-006.
- **Layout:** Search bar, category chips (scrollable), filter chips (5-minute, Favourites, Family-friendly, At home / Outside), "Surprise me" button (random), "Recommended for you" row, results grid.
- **Components:** FilterBar, Chip, DeedCard, Button.
- **States:** No results → "No deeds match. Try another word or create your own" + "Create custom deed". Library loading skeleton cards.
- **Responsive:** 1 column (mobile), 2 (md), 3 (lg).
- **EN/BN:** Search matches both EN and BN titles and BN transliterations (server-side `unaccent` + trigram).

### PG-015 Deed detail — `/deeds/:id`
- **Purpose:** Understand a deed and plan it. **Features:** F-DEED-001, F-DEED-003, F-DEED-006, F-DEED-005.
- **Layout:** Title, category, est. duration, description, "Why it matters" (optional, may include a sourced hadith/verse for Islamic deeds with a citation), Favourite, "Add to my plan" (RecurrencePicker sheet), my history for this deed (mini heatmap + streak).
- **States:** Custom deed owned by the user → Edit/Delete. System deed archived → read-only notice.

### PG-016 Create / edit deed & plan — `/deeds/new`, `/plans/:id/edit`
- **Purpose:** Create a custom deed and/or schedule a deed. **Features:** F-DEED-003, F-DEED-005, F-PLAN-005.
- **Layout:** Title (≤ 120), category, optional description, recurrence (RecurrencePicker), optional time of day, reminder toggle (links to F-NOTIF-003), start/end date, target per occurrence (optional count, e.g. "Read 2 pages").
- **States:** Validation errors. Duplicate-title hint ("You already have a similar deed. Use it instead?"). Save offline → queued.
- **Responsive:** Full screen on mobile. Dialog on desktop.

### PG-017 My plans — `/plans`
- **Purpose:** Manage all scheduled deeds. **Features:** F-DEED-005, F-DEED-006.
- **Layout:** Tabs Active / Paused / Ended. List with recurrence summary, next occurrence, streak. Actions: pause, resume, edit, end, reorder (Move up/down).
- **States:** Empty → link to PG-014.

### PG-018 Calendar — `/calendar?view=day|week|month|year`
- **Purpose:** Review activity over time. **Features:** F-CAL-001..005, F-ISL-013 (Hijri secondary dates).
- **Layout:** SegmentedControl (Day/Week/Month/Year), date navigator (prev/next/today), the view itself. Year view = Heatmap + monthly totals.
- **Components:** CalendarMonth, CalendarWeek, Heatmap, DayCell.
- **Navigation:** Day tap → PG-019 (mobile) or side panel (desktop).
- **States:** Future days are shown as planned only (no completion). Empty month → "No activity recorded this month". Rest days are marked with a leaf.
- **EN/BN:** Week start from preference (Saturday common in BD; default Saturday for BN, Monday for EN, configurable). Month names localized. Hijri line optional.

### PG-019 Day detail — `/calendar/:date`
- **Purpose:** See and edit a specific day. **Features:** F-DEED-007, F-DEED-008, F-CAL-011, F-ISL-001 (salah summary), F-JRNL-001 (linked entries).
- **Layout:** Date header (Gregorian + Hijri), completion summary, checklist for that day (editable only inside the window; otherwise read-only with a lock note), notes and attachments, salah row (if Islamic), journal entries of the day (titles only, private).
- **States:** Outside the edit window → "Past days can be edited for 7 days" (value from settings).

### PG-020 Progress & streaks — `/progress`
- **Purpose:** Personal consistency overview. **Features:** F-CAL-005..009, F-GAME-003, F-RPT-001, F-RPT-003, F-RPT-004.
- **Layout:** Overall streak + longest; per-deed streak list (sortable); heatmap (52 weeks); weekly summary card; category trend chart; "Consistency by weekday" bar chart.
- **States:** Fewer than 7 days of data → "Insights appear after your first week" with a progress hint.
- **EN/BN:** Chart axes and summaries localized.

---

## C. User app — growth, journal, planning

### PG-023 Growth overview — `/growth`
- **Purpose:** The hub for goals, insights, timeline, and life balance. **Features:** F-GROW-004..009, F-AI-009 (if enabled).
- **Layout:** Active goals (top 3) → Life balance radar + "Check in" → Insights list (rule-based; AI-labelled if AI) → Growth timeline (milestones, achievements, reflections) → Monthly reflection prompt (shown in the last 3 days of the month and the first 5 days of the next).
- **States:** New user → guided empty state "Set your first goal".

### PG-021 Goals — `/growth/goals`
- **Purpose:** List and create goals. **Features:** F-GROW-001, F-GROW-002.
- **Layout:** Tabs (Active, Weekly, Monthly, Completed, Archived), GoalCard list, "New goal" (dialog: title, why, period/type, target date, linked deeds, measurable target optional).
- **States:** Empty per tab.

### PG-022 Goal detail — `/growth/goals/:id`
- **Purpose:** Track one goal. **Features:** F-GROW-001, F-GROW-003, F-RPT-005.
- **Layout:** Header with progress, milestones (add/check/reorder), linked deeds and their consistency, notes, Complete / Archive.
- **States:** Completed → celebration and a reflection prompt. Overdue target date → neutral "Target date passed. Extend or close?" (no red).

### PG-024 Life balance check-in — `/growth/life-balance`
- **Purpose:** Monthly 1–5 self-assessment across 8 categories. **Features:** F-GROW-009.
- **Layout:** 8 labelled sliders with icons, optional note per category, history chart (last 6 check-ins).
- **States:** Already checked in this month → edit mode.
- **EN/BN:** Category names from the `life_balance_categories` translations.

### PG-025 Monthly reflection — `/growth/reflection/:yyyy-mm`
- **Purpose:** A guided reflection on the month. **Features:** F-GROW-008, F-JRNL-003.
- **Layout:** Auto-summary of facts (deeds done, top categories, goals progressed, all neutral), guided prompts (What went well? What would I like to grow? One intention for next month), saved as a private journal entry.
- **States:** Partial month → allowed, labelled "so far".

### PG-026 Journal — `/journal`
- **Purpose:** Private journal history. **Features:** F-JRNL-001..004, F-JRNL-006, F-JRNL-007, F-JRNL-008, F-JRNL-009.
- **Layout:** "Only you can see your journal" banner (first visit), type filter chips (All, Journal, Intentions, Reflections, Gratitude, Learning notes, Letters), search, date range, list grouped by month, Export (menu).
- **States:** Empty → "Your journal is waiting. A single sentence is a great start." Search no results. Locked (if app lock is enabled in future) → n/a now.
- **Responsive:** List/detail split on ≥ md.
- **EN/BN:** Users may write in either language. Search is language-agnostic (`simple` FTS config + trigram).

### PG-027 Journal entry editor — `/journal/new?type=`, `/journal/:id`
- **Purpose:** Write or read an entry. **Features:** F-JRNL-001..004, F-JRNL-006, F-JRNL-010, F-AI-011.
- **Layout:** JournalEditor. Type-specific prompts (intention: "What is one thing you intend today?"; gratitude: 3 lines). Optional mood. "Summarize with AI" (only if AI consent is given; shows exactly what will be sent). "Voice entry" (AI voice; only if supported and consented).
- **States:** Draft saved locally / synced. Conflict (edited on another device) → compare & choose. Delete → confirm, with 30-day trash.
- **EN/BN:** Spellcheck follows the `lang` attribute of the editor (set from the UI language, user can toggle).

### PG-028 Future letters — `/journal/letters`
- **Purpose:** Write letters to your future self. **Features:** F-JRNL-005.
- **Layout:** List of sealed letters (deliver date shown, content hidden until delivery) and delivered letters. "Write a letter" → editor with a delivery date (≥ 7 days ahead; presets 1 month, 6 months, 1 year).
- **States:** Sealed letters cannot be edited, only deleted (confirm). On delivery: notification + email (preference) with a link, never the content in the email body.

### PG-029 Planner (day) — `/planner?date=`
- **Purpose:** Plan the day with time blocks and priorities. **Features:** F-PLAN-001..006, F-PLAN-004.
- **Layout:** Morning planning card (top 3 priorities), timeline (time blocks, drag + buttons), unscheduled tasks (priority High/Medium/Low), planned deeds (from plans, read-only links), Evening review card (done / move to tomorrow / drop, plus a reflection link).
- **States:** Empty day → "Plan your day in 2 minutes" guided flow.
- **Responsive:** Mobile shows the list view with time labels. Desktop shows the timeline + side list.

### PG-030 Planner (week) — `/planner/week`
- **Purpose:** Weekly planning. **Features:** F-PLAN-007, F-GROW-002.
- **Layout:** 7 day columns (desktop) or day accordion (mobile), weekly goals at the top, carry-over of unfinished items.

### PG-040 Wellbeing — `/wellbeing`
- **Purpose:** Self-reported digital wellbeing and habit avoidance. **Features:** F-WELL-001..007.
- **Layout:** Tabs: Habits to avoid (daily "kept away" check-ins; counts of clean days), Screen-time journal (manual minutes + reflection), Social media goals, Procrastination log, Anger reflection (guided prompts), Detox challenges, Affirmations.
- **States:** A clear notice: "We don't track your device. Everything here is what you choose to record." (BN: "আমরা আপনার ডিভাইস ট্র্যাক করি না। এখানে যা আছে তা আপনি নিজে লিখে রাখেন।")
- **EN/BN:** Affirmations library localized and admin-managed.

### PG-041 Achievements & tree — `/achievements`
- **Purpose:** Positive recognition. **Features:** F-GAME-001, F-GAME-002, F-GAME-004..006, F-GAME-008, F-CAL-009.
- **Layout:** GoodDeedsTree (hero), earned badges grid, upcoming milestones ("3 more days to 30-day milestone"), random challenge card (opt-in), surprise deed card.
- **States:** No badges yet → tree sapling + "Your tree grows with every good deed".
- **Rules:** No worship-based badges that rank, no leaderboard. Salah-related badges are off by default (setting "Include worship in achievements", default off).

### PG-049 Reports & export — `/reports`
- **Purpose:** Personal reports and data export. **Features:** F-RPT-001..007, F-JRNL-009.
- **Layout:** Period selector (week/month/year/custom), summary cards, category trends, habit consistency, goal completion, Export (CSV, PDF), export history with download links (expire after 7 days).
- **States:** Export generating (job) → notification when ready. Too large a range → "Choose a range up to 2 years" (or a server limit).

---

## D. User app — Islamic

### PG-031 Islamic home — `/islamic`
- **Purpose:** Hub for the Islamic lifestyle tools. **Features:** F-ISL-002, F-ISL-013, F-ISL-016, F-ISL-017.
- **Layout:** Hijri + Gregorian date, PrayerTimesCard (next prayer), today's SalahDayRow, Quran today (pages/ayahs + khatam progress), Dhikr shortcut (TasbihCounter mini), Hadith of the Day (ArabicTextBlock + source), fasting status (if Ramadan/fasting plan), grid of tools.
- **States:** Module disabled → "Islamic features are turned off. Turn on in Settings". Location not set → prompt to choose a city.
- **EN/BN:** Arabic blocks RTL. Translations EN/BN with citations.

### PG-032 Salah tracker — `/islamic/salah?date=`
- **Purpose:** Privately log daily prayers. **Features:** F-ISL-001, F-ISL-002, F-NOTIF-010.
- **Layout:** Date navigator, SalahDayRow (5 fard), optional sunnah/witr toggles, weekly grid (7 × 5), monthly summary (counts only; neutral wording), prayer reminder settings shortcut.
- **States:** Not logged = neutral grey with an outline, never red. Future prayers are disabled until their time begins (based on computed times; override allowed for early logging after confirmation).
- **Privacy:** "Your salah records are private and never shared." No sharing action exists on this page.

### PG-033 Quran — `/islamic/quran`
- **Purpose:** Track reading, memorization, and khatam. **Features:** F-ISL-003, F-ISL-004, F-ISL-005.
- **Layout:** Tabs: Reading (log by surah:ayah range or pages; today's total; history), Memorization (surah list with status not started/learning/memorized/revising; revision schedule), Khatam planner (start date, target date → daily pages, progress, adjust plan).
- **Components:** QuranProgress, Combobox (surah list with Arabic + EN/BN names), ArabicTextBlock (for a selected ayah preview, from the Quran API cache).
- **States:** Quran API unavailable → logging still works (surah metadata is bundled locally); verse preview shows "Text unavailable offline".

### PG-034 Dhikr & tasbih — `/islamic/dhikr`
- **Purpose:** Daily dhikr and counter. **Features:** F-ISL-006, F-ISL-007.
- **Layout:** TasbihCounter (focus mode, full screen on mobile), preset dhikr list (morning/evening adhkar with Arabic, transliteration, translation, source, recommended count), today's dhikr log.
- **States:** Works fully offline. Count persists across reloads. Screen wake lock while the counter is open (where supported; toggle).

### PG-035 Duas — `/islamic/duas`, `/islamic/duas/:id`
- **Purpose:** Browse verified duas. **Features:** F-ISL-008, F-ISL-018.
- **Layout:** Categories (morning, evening, travel, food, sleep, distress, …), search, list → detail (ArabicTextBlock, transliteration, EN/BN translation, source & grade, favourite, copy).
- **States:** Only `published` + verified content is visible. Missing BN translation → EN shown with the note "Bengali translation pending review".

### PG-036 Fasting & Ramadan — `/islamic/fasting`, `/islamic/ramadan`
- **Purpose:** Track fasts and plan Ramadan. **Features:** F-ISL-011, F-ISL-012.
- **Layout:** Fasting calendar (type: Ramadan, Monday/Thursday, Ayyam al-Bid, Shawwal, qada, nafl), qada counter (owed/made up, user-entered). Ramadan planner: daily goals (Quran pages, taraweeh, charity, dua list), suhoor/iftar times (from prayer-times calc), last-10-nights section.
- **States:** Outside Ramadan → the planner shows "Prepare for Ramadan" and the days remaining (Hijri-based, offset-aware).

### PG-037 Zakat calculator — `/islamic/zakat`
- **Purpose:** An informational zakat estimate. **Features:** F-ISL-014.
- **Layout:** ZakatForm stepper → result (zakatable wealth, nisab used with the price date, amount due 2.5 %), "Save calculation" (optional), saved history.
- **States:** Metal price feed unavailable → manual price entry required. Below nisab → "Your zakatable wealth is below the nisab threshold you selected."
- **EN/BN:** Currency default BDT (৳) for BN, user-selectable. Large numbers formatted with Indian grouping in BN.
- **Disclaimer:** always visible above the result.

### PG-038 Hijri calendar — `/islamic/hijri`
- **Purpose:** Hijri month view with Islamic dates of note. **Features:** F-ISL-013.
- **Layout:** Month grid (Hijri primary, Gregorian secondary), notable days (Ramadan, Eid, Ashura, Ayyam al-Bid) marked as approximate, offset setting (−2..+2) with an explanation.
- **States:** "Dates may differ by local moon sighting."

### PG-039 Learning hub & Hadith — `/islamic/learn`
- **Purpose:** Curated learning content. **Features:** F-ISL-015, F-ISL-016.
- **Layout:** Hadith of the Day archive, short lessons (admin-curated articles with sources), topics, bookmarks.
- **States:** Content count low at launch → show only populated topics.

---

## E. User app — community, AI, account

### PG-042 Family — `/family`, `/family/:groupId`
- **Purpose:** Family groups, challenges, shared calendar. **Features:** F-COMM-001..005, F-COMM-014.
- **Layout:** My groups list → group page: members (roles), shared calendar (only items members explicitly shared), family challenges, family achievements, invite button (link/QR/code), group settings (owner).
- **States:** No group → "Create a family group" / "Join with a code". Pending invitations. Removed from group → notice.
- **Privacy:** A sharing preview before anything is shared. Children's accounts are out of scope for the initial release (see FUTURE_ENHANCEMENTS).

### PG-043 Community feed — `/community`
- **Purpose:** Kindness stories and community groups. **Features:** F-COMM-006, F-COMM-009..011, F-COMM-013, F-GAME-007.
- **Layout:** Composer entry ("Share a kindness story"), feed (chronological, paginated; not engagement-ranked), group filter, PostCard list.
- **Components:** PostCard, ReportDialog, Composer (text ≤ 1000 chars, optional image, Anonymous toggle, audience: Public / Group).
- **States:** Email not verified → read-only + verify prompt. Post pending moderation (if pre-moderation is on for new users) → "Visible after review". Blocked users' content hidden.
- **Rules:** No worship records are postable. No counts of others' deeds. Reactions are positive only.

### PG-044 Post detail — `/community/posts/:id`
- **Purpose:** View a post and its comments. **Features:** F-COMM-009, F-COMM-012, F-COMM-013.
- **Layout:** PostCard, comments (threaded 1 level), comment composer, report/block menu.
- **States:** Removed post → "This post is no longer available."

### PG-045 Challenges & campaigns — `/challenges`, `/campaigns/:id`
- **Purpose:** Join challenges and campaigns. **Features:** F-COMM-003, F-COMM-007, F-GAME-005, F-WELL-006, F-NOTIF-007.
- **Layout:** Tabs: My challenges, Discover, Campaigns. Challenge detail: description, dates, my progress, collective progress (aggregate only), Join/Leave.
- **States:** Ended → summary. Full → waitlist (if configured).

### PG-046 Volunteer — `/volunteer`
- **Purpose:** Browse admin-verified volunteer opportunities. **Features:** F-COMM-008.
- **Layout:** Filters (location/city, date, cause), cards with organiser, date, location, external link ("Opens organiser's site"), "I'm interested" (saved locally to my list; no data sent to the organiser in the initial release).
- **States:** None in your area → widen the filter.

### PG-047 AI assistant — `/ai`
- **Purpose:** An optional AI coach/assistant. **Features:** F-AI-001..006, F-AI-008..010, F-AI-013.
- **Layout:** Consent gate (first use: ConsentCard explaining the data sent, the provider (Anthropic), retention, and how to disable). Then conversation list + chat (AiMessage), quick prompts ("Suggest a deed for today", "Help me plan my week", "Turn this into tasks"), usage meter ("12 of 30 messages left this month"), settings link.
- **States:** AI disabled → hidden from nav; direct URL → explanation page. Quota exhausted → friendly message with the reset date. Provider error → "The assistant is unavailable right now. Everything else works normally." Safety refusal for religious rulings → "I can't give religious rulings. Please consult a qualified scholar." + links to sourced content.
- **EN/BN:** The AI responds in the UI language (system prompt specifies the locale). The user can type in either language.

### PG-048 Weekly AI report — `/ai/weekly`
- **Purpose:** A narrative weekly summary. **Features:** F-AI-007, F-AI-009.
- **Layout:** Week selector, narrative (AI-labelled), factual stats beside it (computed, not AI), suggestions with "Add to plan" buttons, feedback.
- **States:** Not generated yet → "Your report will be ready on {day}" or "Generate now" (counts against quota).

### PG-050 Notifications — `/notifications`
- **Purpose:** In-app notification centre. **Features:** F-NOTIF-001.
- **Layout:** Tabs All / Unread, NotificationItem list, "Mark all read", settings link.
- **States:** Empty → "You're all caught up."

### PG-051 Settings — `/settings/*`
- **Purpose:** All user configuration. **Role:** User. **Features:** F-AUTH-006..011, F-AUTH-010, F-I18N-002/003, F-NOTIF-008/009, F-ISL-017, F-AI-002, F-COMM-014, F-WIDGET-001, F-RPT-008.
- **Sub-pages:**
  - `profile`: name, avatar, email (change → re-verify), password change.
  - `preferences`: language, numerals, theme, timezone, week start, past-day edit window (read-only display), rest days.
  - `notifications`: channels × types matrix, daily reminder time, quiet hours, push permission status + test notification, email digest frequency.
  - `islamic`: module on/off, prayer method, madhab (Asr), location, high-latitude rule, per-prayer minute adjustments, Hijri offset, "Include worship in achievements" (default off).
  - `privacy`: default sharing (private), blocked users, analytics consent, anonymous posting default.
  - `ai`: AI on/off, what data AI may use (checkboxes: deeds, goals, journal — journal default **off**), conversation history retention, delete AI data.
  - `devices`: active sessions (device, location approximation, last active), sign out a session (takes effect on that device's next request), sign out all; linked widget devices (unlink); "Link Android widget" shows an 8-character code and a QR code that opens the host app through an App Link when scanned with the phone camera, valid 10 minutes (FR-WIDGET-001-02). No in-app scanner is needed.
  - `data`: export all my data (JSON + CSV zip), delete account (type DELETE to confirm, 30-day grace period with a cancel link by email).
  - `security` (Admins): TOTP setup, recovery codes.
- **Layout:** Desktop: left sub-nav + content. Mobile: list → pushed sub-pages.
- **States:** Each section saves independently with a toast. Push unsupported → explanation (iOS not installed, in-app browser, permission denied with how to re-enable).

---

## F. Admin console (role Admin / Super Admin; English-first UI with full BN support)

All admin pages: AdminShell (sidebar, breadcrumbs), permission-gated sections, step-up re-auth for sensitive actions, every mutation audit-logged, DataTable conventions (server pagination, filters; CSV export arrives in P10, DL-032). Admin pages are not cached by the service worker and are not available offline.

### PG-066 Admin verification — `/admin/verify`
- **Purpose:** Step-up authentication before entering the admin area or performing sensitive actions. **Features:** F-RBAC-006, F-RBAC-007.
- **Layout:** Password re-entry + TOTP code (or recovery code). A step-up is valid for 10 minutes (FR-RBAC-006-01); the admin session itself follows FR-AUTH-002-03 (12 h absolute, 30 min idle).
- **States:** TOTP not set up → forced setup flow (QR + verify). Wrong code → attempts left. Locked → contact a Super Admin.

### PG-053 Admin dashboard — `/admin`
- **Purpose:** Platform overview. **Features:** F-ADMIN-012, F-ADMIN-013, F-ADMIN-014, F-RPT-008.
- **Layout:** StatTiles (DAU/WAU/MAU, new sign-ups, completions today, open reports, failed jobs, AI spend MTD vs budget), health status, recent audit events, quick links.
- **States:** Metrics are aggregate only. No individual user content is shown.

### PG-054 Users — `/admin/users`, `/admin/users/:id`
- **Purpose:** Manage accounts. **Features:** F-ADMIN-001, F-RBAC-003, F-RBAC-004.
- **Layout:** DataTable (name, email masked partially, status, roles, created, last active). Detail: profile metadata, roles, sessions (revoke), status actions (suspend/reactivate, force password reset, resend verification, cancel or execute deletion), moderation history.
- **Privacy:** **No access to journals, worship records, or private deeds.** The detail view shows counts only where needed for support (e.g. "Data size: 1.2 MB").
- **States:** Self-demotion is prevented. Removing the last Super Admin is blocked.

### PG-055 Roles & permissions — `/admin/roles`
- **Purpose:** View the four seeded roles and their permissions; assign or revoke roles. **Features:** F-ADMIN-002, F-RBAC-001, F-RBAC-002, F-RBAC-003.
- **Layout:** Role list (read-only in P2), permission matrix (grouped by module, read-only), assignment counts, and an "Assign role" action (Super Admin, step-up). Creating and editing custom roles arrives in P10 (DL-032).

### PG-056 Content: deeds, categories, achievements, affirmations — `/admin/content/*`
- **Purpose:** Manage the system content library. **Features:** F-ADMIN-003, F-ADMIN-011, F-I18N-008.
- **Layout:** Tabs per content type. DataTable → editor (fields, EN/BN TranslationEditor, status draft/published/archived, preview as user in EN/BN, version history with diff and restore).
- **States:** Publishing without BN → warning (allowed with fallback; tracked as a missing translation).

### PG-057 Translations — `/admin/translations`
- **Purpose:** Find and fix missing or outdated content translations. **Features:** F-ADMIN-004, F-I18N-008, F-I18N-009.
- **Layout:** Coverage per content type (% BN complete), a filter for missing/outdated (EN changed after BN), inline TranslationEditor, a missing UI-key report (read-only; UI strings are fixed in the repo).

### PG-058 Islamic content — `/admin/islamic`
- **Purpose:** Manage duas, hadith, dhikr presets, learning articles, sunnah practices, and sources, with verification. **Features:** F-ADMIN-005, F-ISL-018, F-ISL-008, F-ISL-015, F-ISL-016.
- **Layout:** Tabs per type, editor with SourceReferenceField, status workflow `draft → in_review → verified → published` (verifier ≠ author enforced), Hadith of the Day schedule.
- **States:** Cannot publish without a source and a verifier.

### PG-059 Campaigns — `/admin/campaigns`
- **Purpose:** Create and manage campaigns and volunteer listings. **Features:** F-ADMIN-006, F-COMM-007, F-COMM-008, F-INTG-006.
- **Layout:** List, editor (EN/BN, dates, cover image, organiser, verified flag), QR code generator/download (PNG/SVG), participation stats (aggregate).

### PG-060 Moderation — `/admin/moderation`
- **Purpose:** Review reported content. **Features:** F-ADMIN-008, F-COMM-012, F-COMM-013.
- **Layout:** Queue (ModerationQueueItem) with filters (reason, age, severity), detail with the content and its context, actions with a required reason, user moderation history, appeal notes.
- **States:** SLA indicators (time in queue). Empty → "Queue is clear".

### PG-061 Notifications & broadcasts — `/admin/notifications`
- **Purpose:** Schedule announcements and manage templates. **Features:** F-ADMIN-007, F-I18N-006.
- **Layout:** Broadcast composer (EN/BN required, audience segment by locale/role/flag, channel, schedule time, quiet-hours respected), preview, scheduled list (cancel), template library (transactional email templates read-only preview).
- **States:** Requires a second Admin's approval for broadcasts to more than 1,000 users (configurable).

### PG-062 Feature flags & experiments — `/admin/flags`
- **Purpose:** Toggle features; from P10, run A/B tests. **Features:** F-ADMIN-009, F-ADMIN-010.
- **Layout:** FeatureFlagRow list of **boolean** flags with an optional role allowlist (global kill switches: `ai`, `community`, `islamic_module`, `push`, `widget_sync`). An Experiments tab (P10) shows variants, weights, primary metric and status; percentage allocation lives only in experiments (DL-029).
- **States:** Kill-switch changes need step-up + reason.

### PG-063 System — `/admin/system`
- **Purpose:** Operational health. **Features:** F-ADMIN-012, F-ADMIN-014, F-ADMIN-015, F-ADMIN-013.
- **Layout:** Service health (API, worker, DB, email, push, AI provider, storage), job queues (JobQueueTable, retry failed), last backup and restore-test results, API analytics (requests, p95 latency, error rate per route), system settings (Super Admin: edit window days, quotas, maintenance mode).

### PG-064 Audit log — `/admin/audit`
- **Purpose:** Investigate privileged and security events. **Features:** F-ADMIN-016, F-RBAC-005.
- **Layout:** AuditLogViewer with filters (actor, action, target type, date). Read-only and immutable. CSV export (Super Admin, itself audited) arrives in P10.

### PG-065 AI usage & cost — `/admin/ai`
- **Purpose:** Monitor AI usage and enforce budgets. **Features:** F-AI-003, F-AI-001, F-AI-013.
- **Layout:** Spend MTD vs budget, tokens by feature, per-user quota distribution (anonymised percentiles), safety event counts (refusals, filtered outputs), provider/model config (read-only unless Super Admin), budget and quota settings.
- **Privacy:** No conversation content is visible to admins.

---

## G. Page index

| ID | Page | Route | Role | Phase |
|---|---|---|---|---|
| PG-001 | Landing | `/` | Guest | P2 |
| PG-002 | Sign in | `/login` | Guest | P2 |
| PG-003 | Register | `/register` | Guest | P2 |
| PG-004 | Verify email | `/verify-email` | Guest/User | P2 |
| PG-005 | Forgot password | `/forgot-password` | Guest | P2 |
| PG-006 | Reset password | `/reset-password` | Guest | P2 |
| PG-007 | Legal & about | `/legal/*` | All | P2 |
| PG-008 | Offline fallback | `/offline` | All | P2 |
| PG-009 | Error pages | — | All | P2 |
| PG-010 | Accept invitation | `/invite/:code` | Guest/User | P7 |
| PG-011 | Campaign landing | `/c/:slug` | Guest/User | P7 |
| PG-012 | Onboarding | `/onboarding` | User | P2 (P3 deeds step, P5 Islamic step) |
| PG-013 | Today | `/today` | User | P3 |
| PG-014 | Discover deeds | `/deeds` | User | P3 |
| PG-015 | Deed detail | `/deeds/:id` | User | P3 |
| PG-016 | Create/edit deed & plan | `/deeds/new` | User | P3 |
| PG-017 | My plans | `/plans` | User | P3 |
| PG-018 | Calendar | `/calendar` | User | P3 |
| PG-019 | Day detail | `/calendar/:date` | User | P3 |
| PG-020 | Progress & streaks | `/progress` | User | P3/P4 |
| PG-021 | Goals | `/growth/goals` | User | P4 |
| PG-022 | Goal detail | `/growth/goals/:id` | User | P4 |
| PG-023 | Growth overview | `/growth` | User | P4 |
| PG-024 | Life balance | `/growth/life-balance` | User | P4 |
| PG-025 | Monthly reflection | `/growth/reflection/:m` | User | P4 |
| PG-026 | Journal | `/journal` | User | P4 |
| PG-027 | Journal editor | `/journal/:id` | User | P4 |
| PG-028 | Future letters | `/journal/letters` | User | P4 |
| PG-029 | Planner day | `/planner` | User | P4 |
| PG-030 | Planner week | `/planner/week` | User | P4 |
| PG-031 | Islamic home | `/islamic` | User | P5 |
| PG-032 | Salah tracker | `/islamic/salah` | User | P5 |
| PG-033 | Quran | `/islamic/quran` | User | P5 |
| PG-034 | Dhikr & tasbih | `/islamic/dhikr` | User | P5 |
| PG-035 | Duas | `/islamic/duas` | User | P5 |
| PG-036 | Fasting & Ramadan | `/islamic/fasting` | User | P5 |
| PG-037 | Zakat | `/islamic/zakat` | User | P5 |
| PG-038 | Hijri calendar | `/islamic/hijri` | User | P5 |
| PG-039 | Learning hub | `/islamic/learn` | User | P5 |
| PG-040 | Wellbeing | `/wellbeing` | User | P4/P7 |
| PG-041 | Achievements & tree | `/achievements` | User | P4 |
| PG-042 | Family | `/family` | User | P7 |
| PG-043 | Community feed | `/community` | User | P7 |
| PG-044 | Post detail | `/community/posts/:id` | User | P7 |
| PG-045 | Challenges & campaigns | `/challenges` | User | P7 |
| PG-046 | Volunteer | `/volunteer` | User | P7 |
| PG-047 | AI assistant | `/ai` | User | P8 |
| PG-048 | Weekly AI report | `/ai/weekly` | User | P8 |
| PG-049 | Reports & export | `/reports` | User | P4/P10 |
| PG-050 | Notifications | `/notifications` | User | P6 |
| PG-051 | Settings | `/settings/*` | User | P2 → P8 |
| PG-052 | Install guide | `/install` | All | P2/P9 |
| PG-053 | Admin dashboard | `/admin` | Admin | P2 → P10 |
| PG-054 | Users | `/admin/users` | Admin | P2 |
| PG-055 | Roles & permissions | `/admin/roles` | Super Admin | P2 |
| PG-056 | Content | `/admin/content` | Admin | P3 |
| PG-057 | Translations | `/admin/translations` | Admin | P3 |
| PG-058 | Islamic content | `/admin/islamic` | Admin | P5 |
| PG-059 | Campaigns | `/admin/campaigns` | Admin | P7 |
| PG-060 | Moderation | `/admin/moderation` | Admin | P7 |
| PG-061 | Notifications & broadcasts | `/admin/notifications` | Admin | P6 |
| PG-062 | Feature flags | `/admin/flags` | Super Admin | P2 |
| PG-063 | System | `/admin/system` | Admin | P6/P10 |
| PG-064 | Audit log | `/admin/audit` | Admin | P2 |
| PG-065 | AI usage & cost | `/admin/ai` | Admin | P8 |
| PG-066 | Admin verification | `/admin/verify` | Admin | P2 |

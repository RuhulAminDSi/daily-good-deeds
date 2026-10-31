# Design System — "Daily Good Deeds"

> Status: specification only (Phase 1). It becomes code in Phase 2 as `packages/tokens` + `packages/ui`. There is no existing design system to preserve (see [../EXISTING_ARCHITECTURE.md](../EXISTING_ARCHITECTURE.md)).

## 1. Design principles

| # | Principle | In practice |
|---|---|---|
| 1 | **Calm, not compulsive** | No red badges for "missed" days, no countdown pressure, no infinite feeds on the home screen. Motion is subtle and optional. |
| 2 | **Encouraging, never shaming** | Progress is shown as what *was* done, not what was missed. Copy follows §6. |
| 3 | **Private by default** | Privacy state is always visible: a lock icon on private items and an explicit share action. Nothing personal appears on community surfaces without a deliberate step. |
| 4 | **One-thumb daily use** | The Today checklist is completable on a phone with one hand. Primary actions sit in the bottom half of mobile screens. |
| 5 | **Bilingual equality** | Bengali is a first-class language. Layouts are tested with BN strings, which are longer and taller. |
| 6 | **Resilient** | Every screen defines its loading, empty, error, and offline states. Unsupported capabilities degrade with a clear explanation. |
| 7 | **Respectful religious presentation** | Arabic text is given space and proper typography, always with a source. There is no gamified scoring of worship. |

## 2. Foundations

| Foundation | Spec |
|---|---|
| Colour | [COLOR_TOKENS.md](COLOR_TOKENS.md) |
| Typography | [TYPOGRAPHY.md](TYPOGRAPHY.md) |
| Spacing | 4px base. Scale `0, 1(4), 2(8), 3(12), 4(16), 5(20), 6(24), 8(32), 10(40), 12(48), 16(64)`. Card padding 16 (mobile) / 20 (≥md). Section gap 24 / 32. |
| Radius | `--radius-sm 6px` (chips, inputs), `--radius-md 10px` (buttons), `--radius-lg 16px` (cards, sheets), `--radius-full` (avatars, pills, FAB). |
| Elevation | Three levels (`shadow-sm/md/lg`). Cards use `sm` or a border, never both heavy. Dark mode uses tint plus border. |
| Iconography | **Lucide** (outline, 1.75 stroke, 20/24px). Icons always have a text label or `aria-label`. Category and life-balance icons are fixed (COLOR_TOKENS §3.2). No mosque/crescent clichés as generic decoration. Islamic module icons are respectful and minimal. |
| Illustration | Flat, soft, nature-themed (leaves, saplings, the Good Deeds Tree). Used only on empty states, onboarding, and achievements. Maximum one per screen. |
| Motion | Durations 120ms (micro), 200ms (enter), 280ms (sheet). Easing `cubic-bezier(.2,.8,.2,1)`. Checklist completion uses a 200ms check-draw plus a light leaf "pop", **disabled** under `prefers-reduced-motion`. No auto-playing animations longer than 3s. |
| Layout grid | Mobile: 4 columns, 16px gutters and margins. Tablet: 8 columns, 24px. Desktop: 12 columns, max content width 1200px (reading pages 720px). See [RESPONSIVE_GUIDELINES.md](RESPONSIVE_GUIDELINES.md). |
| Density | Comfortable by default. Admin tables offer a "compact" density toggle. |

## 3. Implementation architecture
- `packages/tokens` (built in T-P2-UI-001): tokens in TypeScript, emitted as `tokens.css` and an Android `colors.xml` export.
  - `tokens.css` is a Tailwind 4 `@theme` that replaces Tailwind's default palette, shadows and text sizes, so only tokens exist (`bg-primary`, `text-h1`, `shadow-md`, `rounded-lg`).
  - Dark values apply under `prefers-color-scheme: dark` unless `<html data-theme>` overrides them.
  - Bengali line heights and the 13px minimum apply under `:lang(bn)`.
- `packages/ui`: React components built on Radix primitives. Styled only with Tailwind classes that reference tokens. Every component has a Storybook story (EN + BN, light + dark) and an axe check.
- **No hardcoded strings in `packages/ui`.** Components receive labels as props. Default labels such as "Close" come from `packages/i18n`.
- Lint rules:
  - **Implemented:** `apps/web` bans Tailwind palette classes and arbitrary hex values (`no-restricted-syntax`). Removed palette classes would otherwise render unstyled without any error.
  - **Implemented (T-P2-I18N-002):** ban letters in JSX text and user-visible attributes (`@dgd/config/eslint/ui`, which also holds the raw-colour rule). The rules and allowlist are in [../qa/I18N.md](../qa/I18N.md).

## 4. Key patterns

### 4.1 Daily checklist row (core interaction)
`[checkbox 24px][title + category chip + optional time][status menu ⋯]`. Tapping the row toggles **done**. The ⋯ menu gives Partial, Skip, Add note, and Attach. The tap target is the full row (≥ 48px tall). A completed row gets the `primary-subtle` background and a check, with **no strikethrough** (it reads as "crossed out", which feels negative). Undo snackbar lasts 5s.

### 4.2 Progress representation
- A ring or bar showing *completed / planned* for **today only**, with the label "3 of 5 done", never "2 missed".
- The streak shows the current count with the amber flame icon. When a streak breaks, show the longest streak and a "fresh start" message. Never show "you lost your 20-day streak".
- Each user may enable "streak freeze / rest days" (planned rest days do not break streaks; see the SRS).

### 4.3 System banners (stacked, top of content, dismissible unless critical)

| Banner | Token | Icon | EN | BN |
|---|---|---|---|---|
| Offline | `info-bg` | cloud-off | "You're offline. Changes will sync when you're back online." | "আপনি অফলাইনে আছেন। ইন্টারনেট ফিরলে পরিবর্তনগুলো সিঙ্ক হবে।" |
| Pending sync | `info-bg` | refresh | "3 changes waiting to sync" | "৩টি পরিবর্তন সিঙ্কের অপেক্ষায়" |
| Sync conflict | `warning-bg` | alert-triangle | "Some changes were updated on another device. Review" | "কিছু পরিবর্তন অন্য ডিভাইসে হালনাগাদ হয়েছে। দেখুন" |
| In-app browser | `info-bg` | external-link | "For the best experience (install, notifications, Google sign-in), open in your browser." **[Open in browser]** **[Copy link]** | "সেরা অভিজ্ঞতার জন্য (ইনস্টল, নোটিফিকেশন, গুগল সাইন-ইন) ব্রাউজারে খুলুন।" **[ব্রাউজারে খুলুন]** **[লিংক কপি করুন]** |
| Update available | `primary-subtle` | sparkles | "A new version is ready. Refresh" | "নতুন সংস্করণ প্রস্তুত। রিফ্রেশ করুন" |
| Email not verified | `warning-bg` | mail | "Please verify your email to secure your account. Resend" | "আপনার অ্যাকাউন্ট সুরক্ষিত রাখতে ইমেইল যাচাই করুন। আবার পাঠান" |

**In-app browser banner details (F-PWA-007):** detected through the UA (`FBAN|FBAV|FB_IAB|Messenger|Instagram|Telegram|Line|wv\)`) plus capability checks. "Open in browser" uses an Android `intent://` URL (Chrome fallback). On iOS, where no reliable escape exists, it shows a two-step illustrated hint ("Tap ⋯ → Open in Safari") plus **Copy link**. On these surfaces, the Google sign-in button is replaced with a note and email sign-in stays available. The banner is persistent but collapsible to a chip.

**Offline indicator (F-PWA-005/006):** a small persistent chip in the top app bar (cloud-off icon plus "Offline") as well as the dismissible banner the first time. Items changed offline show a small clock badge ("pending sync") until confirmed. Never block reading. Actions that need the network (AI, community posting, payments of any kind) are disabled with an inline explanation.

### 4.4 Privacy affordances
- A lock icon plus the "Only you" label on journal entries, worship records, and personal deeds.
- Sharing flows always show a **preview** of exactly what will be visible and to whom ("Family: Rahman family (4 members)"), with an explicit confirm. There is an "Anonymous" toggle where F-COMM-010 applies.

### 4.5 AI surfaces
- Always labelled with an "AI" chip and a sparkles icon, plus the disclaimer "AI can make mistakes. Not religious guidance." (BN: "এআই ভুল করতে পারে। এটি ধর্মীয় নির্দেশনা নয়।").
- Hidden entirely when AI is disabled (globally or by the user). Feature entry points never appear greyed out without explanation.

## 5. Theming & locale switching
- Theme: light, dark, or system (COLOR_TOKENS §6).
- Locale: URL-prefixed routes (`/en/...`, `/bn/...`) through next-intl. The switcher is in the top bar, onboarding, and settings. Switching keeps the current route. The choice persists to the account and a cookie. `<html lang>` updates.

## 6. Voice, tone & non-shaming copy guidelines

**Voice:** warm, humble, encouraging, plain. Write like a kind friend, not a coach shouting or a judge.

| Do | Don't |
|---|---|
| Celebrate effort and any progress | Count failures or misses |
| Offer a next small step | Use guilt, fear, or social comparison |
| Use "you can", "when you're ready" | Use "you must", "you failed", "don't break the chain!" |
| Keep religious phrasing gentle and sourced | Claim acceptance of deeds or worship ("Allah accepted your prayer") |
| Say what happens and how to fix it (errors) | Blame the user ("You entered wrong data") |

### Example pairs

| Situation | ❌ Avoid | ✅ EN | ✅ BN |
|---|---|---|---|
| Incomplete day reminder | "You missed 3 deeds today!" | "A few deeds are still open today. Even one small act counts." | "আজকের কয়েকটি কাজ এখনো বাকি। একটি ছোট ভালো কাজও মূল্যবান।" |
| Streak broken | "You lost your 12-day streak." | "Every day is a fresh start. Your longest streak so far: 12 days." | "প্রতিটি দিনই নতুন শুরু। এখন পর্যন্ত আপনার সবচেয়ে দীর্ঘ ধারাবাহিকতা: ১২ দিন।" |
| Low weekly completion | "Your consistency is poor." | "This week was lighter. Want to pick one deed to focus on next week?" | "এই সপ্তাহটি একটু হালকা গেছে। আগামী সপ্তাহে মনোযোগ দিতে একটি কাজ বেছে নেবেন?" |
| Weak habit insight (F-GROW-006) | "Your weakest habit: Fajr" | "Fajr was logged on 2 of 7 days. Would a gentle reminder help?" | "ফজর ৭ দিনের মধ্যে ২ দিন লেখা হয়েছে। একটি কোমল রিমাইন্ডার কি সহায়ক হবে?" |
| Salah not logged | "You skipped Asr." | "Asr not logged yet." (neutral; user may simply not have logged it) | "আসর এখনো লেখা হয়নি।" |
| Empty journal | "You haven't written anything." | "Your journal is waiting. A single sentence is a great start." | "আপনার জার্নাল অপেক্ষা করছে। একটি বাক্য দিয়েই শুরু করা যায়।" |
| Completion | "Perfect! Allah accepted it." | "Done. May it bring goodness." | "সম্পন্ন। এটি কল্যাণ বয়ে আনুক।" |
| Validation error | "Invalid input." | "Please enter a title (up to 120 characters)." | "অনুগ্রহ করে একটি শিরোনাম লিখুন (সর্বোচ্চ ১২০ অক্ষর)।" |
| Server error | "Error 500." | "Something went wrong on our side. Your data is safe. Please try again." | "আমাদের দিকে একটি সমস্যা হয়েছে। আপনার তথ্য নিরাপদ আছে। আবার চেষ্টা করুন।" |

**Rules:** no exclamation marks in reminders. No "!" plus red together. No comparative statements about other users. Never imply worship quality from data. Notifications respect quiet hours and never stack more than one nudge per type per day.

## 7. Governance
- Token or component changes need a design-review checklist entry plus updated stories and passing contrast and axe tests.
- New copy needs both EN and BN before merge (CI missing-key check). BN copy is reviewed by the designated Bengali reviewer before release.
- This document is versioned in git. Breaking token renames require a codemod.

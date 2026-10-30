# Accessibility Guidelines

**Target conformance: WCAG 2.2 Level AA** for the web app (user + admin), and Android accessibility guidelines for the widget. These map to `NFR-ACCESSIBILITY-*` in the SRS and to the a11y test cases in `docs/qa/TEST_PLAN.md`.

## 1. Requirements checklist

| Area | Requirement | WCAG |
|---|---|---|
| Semantics | Landmarks (`header`, `nav`, `main`, `footer`). One `h1` per page. Logical heading order. Lists rendered as lists. | 1.3.1, 2.4.6 |
| Language | `<html lang="en">` or `"bn"`. Inline `lang` on mixed-script and Arabic spans. | 3.1.1, 3.1.2 |
| Keyboard | Everything operable by keyboard. No traps (except modal focus containment with Esc). Visible focus (2px `focus-ring` + 2px offset). | 2.1.1, 2.1.2, 2.4.7, 2.4.11 |
| Skip link | "Skip to main content" is the first focusable element. | 2.4.1 |
| Focus management | Route changes move focus to the page `h1`. Dialogs move focus inside and return it on close. Toasts never steal focus. | 2.4.3 |
| Contrast | Text ≥ 4.5:1, UI ≥ 3:1 (measured; see COLOR_TOKENS §4) | 1.4.3, 1.4.11 |
| Colour independence | Status, category, and heatmap level are always paired with text or icon | 1.4.1 |
| Reflow & zoom | Works at 320 CSS px and 400 % zoom without loss of content | 1.4.10, 1.4.4 |
| Text spacing | Survives the WCAG text-spacing bookmarklet in both EN and BN | 1.4.12 |
| Target size | ≥ 24px minimum (we design for 48px on touch) | 2.5.8 |
| Motion | `prefers-reduced-motion` disables celebratory and confetti animation. No flashing. | 2.3.1, 2.3.3 |
| Forms | Visible labels (no placeholder-only). Errors described in text, linked via `aria-describedby`. An error summary at the top focuses on submit. Autocomplete attributes on auth forms. | 1.3.5, 3.3.1–3.3.3 |
| Auth | No cognitive tests. Allow password managers and paste. Email OTP and magic link alternatives are planned. | 3.3.8 |
| Time limits | Session expiry warns the user and offers to extend. No timed tasks in core flows. Tasbih has no timer. | 2.2.1 |
| Status messages | `role="status"` / `aria-live="polite"` for sync state, save confirmations, and checklist toggles ("Marked done: Help a neighbour") | 4.1.3 |
| Consistent help | The help/feedback link is in the same place on every page (More → Help) | 3.2.6 |
| Redundant entry | Onboarding data is never asked for again. Forms pre-fill from preferences. | 3.3.7 |
| Dragging | Any drag (reordering planner items, priorities) has button alternatives (Move up/down) | 2.5.7 |

## 2. Component-specific patterns
| Component | Pattern |
|---|---|
| Checklist row | `role="checkbox"` semantics via a native `<input type="checkbox">` with a visible label. The ⋯ menu is a separate button labelled "More actions for {deed}". |
| Tasbih counter | A large button with `aria-label="Count, current {n} of {target}"`. Increment announced politely every 10 counts and at target (not every tap, to avoid noise). Hardware keys Space/Enter increment. Optional haptic via `navigator.vibrate` where supported. |
| Calendar grid | ARIA grid pattern. Arrow keys move by day/week. Each cell is labelled with the full date, Hijri date (if enabled), and completion summary. |
| Heatmap | Same grid semantics plus a "View as table" toggle. Legend with numeric ranges. |
| Charts | Each chart has a text summary ("Spiritual growth increased from 3 to 5 this month") and a data-table toggle. SVG uses `role="img"` and `aria-label`. |
| Tabs (calendar views, Islamic sections) | Radix Tabs (roving tabindex, arrow keys) |
| Dialogs / sheets | Radix Dialog. Labelled by title. Esc closes. Bottom sheets on mobile are still dialogs semantically. |
| Toasts / snackbar (Undo) | `aria-live="polite"`. Undo stays available for ≥ 5s and longer on hover/focus. Not used for critical errors. |
| Bottom nav | `<nav aria-label="Primary">`. The current item has `aria-current="page"`. |
| Arabic text | `lang="ar" dir="rtl"` plus translation underneath. "Play audio" (where licensed audio exists) is labelled. |
| Data tables (admin) | `<table>` with `<caption>`, `scope` headers, and sortable headers using `aria-sort` |
| Rich text journal editor | Plain-text-first editor (Markdown-lite) with standard textarea semantics. Formatting toolbar buttons have labels and keyboard shortcuts. |

## 3. Bengali screen-reader support
- Supported readers: TalkBack (Android), which has Bengali TTS via Google TTS, and NVDA on Windows with eSpeak Bengali (lower quality). VoiceOver Bengali support is limited, so this is documented as a known limitation.
- Never put meaning in a visual-only Bengali glyph or abbreviation. `aria-label`s are localized (from the same catalogs).
- Numbers in `aria-label`s use the user's numeral preference. TalkBack reads both digit systems.

## 4. Android widget accessibility
- `contentDescription` on every Glance element. Checkbox actions are labelled "Mark {deed} done".
- Respect the system font scale (up to 200 %). The large widget switches to fewer rows rather than clipping.
- Minimum touch target 48dp. Stale-data indicator text such as "Updated 2h ago" is shown, not just a coloured icon.

## 5. Testing
| Level | Tooling | Gate |
|---|---|---|
| Component | Storybook + `@storybook/addon-a11y` (axe) on every story × theme × locale | CI fails on serious/critical issues |
| Page | Playwright + `@axe-core/playwright` on all routes in PAGE_SPECIFICATIONS | CI fails on serious/critical issues |
| Contrast | Token contrast unit test | CI fails below thresholds |
| Manual | Keyboard-only pass, NVDA + Chrome, TalkBack + Chrome Android, 400 % zoom, text-spacing; once per phase release | Release checklist sign-off |
| Widget | Android Accessibility Scanner + TalkBack manual pass | P9 exit criteria |

Automated tools catch only a fraction of issues, so the manual pass is mandatory before each phase is marked done.

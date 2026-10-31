# Color Tokens

> Source of truth for colour. The code lives in `packages/tokens` (`src/tokens.ts`) and is emitted as a Tailwind 4 theme with CSS custom properties (`tokens.css`, so `bg-primary`, `text-text-muted` and so on) and as Android `colors.xml` / `values-night/colors.xml` for the widget's Glance `ColorProviders`. Components **never** use raw colours; they reference semantic tokens. The web lint rule rejects Tailwind palette classes and arbitrary hex values.

## 1. Palette philosophy

| Role | Direction | Why |
|---|---|---|
| Primary | Deep leaf green | Calm, growth, goodness, nature. Reads as positive without the "alarm" of a saturated green. |
| Background | Warm paper neutral (`#FAF7F2`) | Softer than pure white for daily journaling and reading; reduces glare. |
| Accent / highlight | Amber / honey | Celebration, streak flame, tree fruit. Used sparingly. |
| Info | Calm teal | Informational banners, links in secondary contexts, focus ring (distinct from primary so focus is always visible on primary buttons). |
| Danger / destructive | Muted terracotta | Destructive actions and errors. Deliberately **not** bright red, to avoid alarming or shaming the user. |

Rules: no heavy gradients (a single subtle gradient is allowed only on the Good Deeds Tree illustration); no more than **one** accent colour per view besides primary; status colours are always paired with an icon and text (never colour alone).

## 2. Semantic tokens

### 2.1 Light theme (`[data-theme="light"]`, default)

| Token | Hex | Use |
|---|---|---|
| `--color-bg` | `#FAF7F2` | App background |
| `--color-surface` | `#FFFFFF` | Cards, sheets, inputs |
| `--color-surface-raised` | `#FFFFFF` (+ `shadow-md`) | Popovers, dialogs, menus |
| `--color-surface-sunken` | `#F3EEE6` | Wells, table headers, skeletons |
| `--color-text` | `#1F2A24` | Body and headings |
| `--color-text-muted` | `#56615A` | Secondary text, captions |
| `--color-text-placeholder` | `#6E776F` | Input placeholder |
| `--color-text-disabled` | `#9A9F99` | Disabled text (exempt from contrast per WCAG 1.4.3) |
| `--color-border` | `#E2DBD0` | Decorative dividers, card outlines |
| `--color-border-strong` | `#8C8273` | Input borders, checkbox outlines, meaningful separators |
| `--color-primary` | `#2F6B47` | Primary buttons, active nav, checked states |
| `--color-primary-hover` | `#265A3B` | Hover/pressed primary |
| `--color-primary-contrast` | `#FFFFFF` | Text/icons on primary |
| `--color-primary-subtle` | `#E4F0E8` | Selected rows, completed checklist row background |
| `--color-primary-subtle-text` | `#21543A` | Text on primary-subtle |
| `--color-success` | `#2E7048` | Success text/icons |
| `--color-warning` | `#8A5A00` | Warning text/icons |
| `--color-warning-bg` | `#FDF1D8` | Warning banner background |
| `--color-accent` | `#B7800F` | Amber UI accents (streak flame icon, badges) |
| `--color-accent-soft` | `#F6E3B8` | Decorative amber fills (celebration chips, tree fruit) |
| `--color-accent-text` | `#8A5A00` | Text in amber contexts |
| `--color-danger` | `#A3412C` | Destructive buttons, error text |
| `--color-danger-contrast` | `#FFFFFF` | Text on danger |
| `--color-danger-bg` | `#FBE9E4` | Error banner background |
| `--color-info` | `#1D6573` | Info text/icons |
| `--color-info-bg` | `#E2F1F3` | Info banner (offline, in-app browser) |
| `--color-focus-ring` | `#1D6573` | 2px focus outline + 2px offset |
| `--color-overlay` | `rgba(31,42,36,0.48)` | Modal scrim |

### 2.2 Dark theme (`[data-theme="dark"]`; default follows `prefers-color-scheme`)

| Token | Hex |
|---|---|
| `--color-bg` | `#121613` |
| `--color-surface` | `#1A201C` |
| `--color-surface-raised` | `#222924` |
| `--color-surface-sunken` | `#0D100E` |
| `--color-text` | `#ECE8E1` |
| `--color-text-muted` | `#A7AEA7` |
| `--color-text-placeholder` | `#8A928B` |
| `--color-text-disabled` | `#5E665F` |
| `--color-border` | `#313A34` |
| `--color-border-strong` | `#6E786F` |
| `--color-primary` | `#6FBF8A` |
| `--color-primary-hover` | `#86CC9D` |
| `--color-primary-contrast` | `#0E1A12` |
| `--color-primary-subtle` | `#1F3528` |
| `--color-primary-subtle-text` | `#A5DDB6` |
| `--color-success` | `#6FBF8A` |
| `--color-warning` | `#E8B04B` |
| `--color-warning-bg` | `#3A2E14` |
| `--color-accent` | `#E8B04B` |
| `--color-accent-soft` | `#3A2E14` |
| `--color-accent-text` | `#E8B04B` |
| `--color-danger` | `#EC8F78` |
| `--color-danger-contrast` | `#1A0E0A` |
| `--color-danger-bg` | `#3D201A` |
| `--color-info` | `#6CC3D1` |
| `--color-info-bg` | `#15343A` |
| `--color-focus-ring` | `#8FD1E0` |
| `--color-overlay` | `rgba(0,0,0,0.6)` |

Dark mode is not an inversion: surfaces get lighter with elevation (`bg` < `surface` < `surface-raised`), and shadows are replaced by elevation tint plus a 1px `--color-border`.

## 3. Data-visualization tokens

### 3.1 Activity heatmap scale (levels 0–4)

| Level | Meaning (relative to the user's own planned deeds that day) | Light | Dark |
|---|---|---|---|
| 0 | Nothing logged | `#ECE6DC` | `#222924` |
| 1 | 1–25 % | `#C6DFCC` | `#244A32` |
| 2 | 26–50 % | `#8DC29C` | `#2F7048` |
| 3 | 51–75 % | `#4C9466` | `#55A06F` |
| 4 | 76–100 % | `#2F6B47` | `#9AD7AE` |

The scale is monotonic in lightness in both themes. Levels 1 and 2 cannot reach 3:1 against the surface without collapsing the scale (see §4.3). The heatmap therefore **must not rely on colour alone**: every cell has an `aria-label` / tooltip with the date and exact count ("12 Oct: 4 of 6 deeds"), and a "View as table" toggle renders the same data as an accessible table.

### 3.2 Life-balance categorical palette (8 categories)

| # | Category (F-GROW-009) | Light | Dark | Icon (always shown with the colour) |
|---|---|---|---|---|
| c1 | Spiritual Growth | `#2F6B47` | `#6FBF8A` | sparkle / crescent-free leaf |
| c2 | Family & Relationships | `#B5573A` | `#E8977B` | users |
| c3 | Health & Fitness | `#1D7385` | `#5FC0D3` | heart-pulse |
| c4 | Knowledge & Learning | `#5457A0` | `#A3A6F0` | book-open |
| c5 | Social Responsibility | `#9A6A0C` | `#E2B04F` | hand-heart |
| c6 | Personal Discipline | `#6B4F3A` | `#C9A887` | target |
| c7 | Environmental Responsibility | `#557F2B` | `#A6CF6E` | sprout |
| c8 | Emotional Wellbeing | `#9A4878` | `#E39AC7` | smile |

Charts always pair colour with a label or icon. Adjacent hues were chosen to stay distinguishable under deuteranopia (green c1 vs leaf c7 differ strongly in lightness and are never adjacent in the radar/legend order).

## 4. Measured contrast (WCAG 2.2)

Ratios were **computed** with the WCAG relative-luminance formula (Node script run on 2026-10-30). Thresholds: body text ≥ 4.5:1 (SC 1.4.3); non-text UI and graphics ≥ 3:1 (SC 1.4.11).

### 4.1 Text pairs

| Foreground / background | Light | Dark | Result |
|---|---|---|---|
| `text` / `bg` | 13.89 | 14.95 | PASS |
| `text` / `surface` | 14.84 | 13.57 | PASS |
| `text` / `surface-raised` | 14.84 | 12.19 | PASS |
| `text-muted` / `bg` | 6.04 | 8.05 | PASS |
| `text-muted` / `surface` | 6.46 | 7.30 | PASS |
| `text-muted` / `surface-raised` | 6.46 | 6.56 | PASS |
| `text-placeholder` / `surface` | 4.63 | 5.18 | PASS |
| `primary-contrast` / `primary` | 6.33 | 8.08 | PASS |
| `primary-contrast` / `primary-hover` | 8.05 | 9.48 | PASS |
| `primary` / `surface` (links, text buttons) | 6.33 | 7.49 | PASS |
| `primary` / `bg` | 5.93 | 8.26 | PASS |
| `primary-subtle-text` / `primary-subtle` | 7.49 | 8.52 | PASS |
| `success` / `surface` | 5.95 | 7.49 | PASS |
| `warning` / `surface` | 5.93 | 8.48 | PASS |
| `warning` / `warning-bg` | 5.29 | 6.80 | PASS |
| `accent-text` / `surface` | 5.93 | 8.48 | PASS |
| `danger` / `surface` | 6.27 | 6.92 | PASS |
| `danger` / `danger-bg` | 5.34 | 6.17 | PASS |
| `danger-contrast` / `danger` | 6.27 | 7.89 | PASS |
| `info` / `surface` | 6.64 | 8.18 | PASS |
| `info` / `info-bg` | 5.73 | 6.54 | PASS |

### 4.2 Non-text UI pairs

| Element / background | Light | Dark | Result |
|---|---|---|---|
| `border-strong` / `surface` (inputs, checkboxes) | 3.78 | 3.61 | PASS |
| `border-strong` / `bg` | 3.54 | 3.98 | PASS |
| `focus-ring` / `surface` | 6.64 | 9.76 | PASS |
| `focus-ring` / `bg` | 6.22 | 10.75 | PASS |
| `primary` / `bg` (active nav indicator) | 5.93 | 8.26 | PASS |
| `accent` / `surface` | 3.44 | 8.48 | PASS |
| `chart-1`–`chart-8` / `surface` | 4.71 – 7.49 | 7.22 – 9.29 | PASS (all) |
| `heat-4` (heatmap level 4) / `surface` | 6.33 | 10.03 | PASS |
| `heat-3` (heatmap level 3) / `surface` | 3.66 | 5.24 | PASS |
| `heat-4` / `heat-0` (heatmap levels 4 and 0) | 5.10 | 9.01 | PASS |

### 4.3 Adjustments made and known exceptions

| Item | Finding | Action |
|---|---|---|
| Light accent (first draft `#D99A1E`) | 2.44:1 on white: **failed** 3:1 | Darkened to `#B7800F` (3.44:1). `#D99A1E`-style warmth is now only in `accent-soft` decorative fills. |
| `--color-border` (`#E2DBD0` light 1.37:1, `#313A34` dark 1.41:1) | Below 3:1 | Allowed **only** for decorative separators and card outlines whose boundary is not needed to identify the control. Interactive control boundaries use `border-strong`. |
| Heatmap levels 1–2 vs surface (1.42 / 2.03 light; 1.66 / 2.79 dark), adjacent level steps 1.14–1.91 | Below 3:1 | Accepted: colour is supplementary. The required information is given by text (aria-label, tooltip, table view, legend with numeric ranges). Tracked in the a11y test plan. |
| `text-disabled` (2.69 light) | Below 4.5 | Exempt (inactive components, SC 1.4.3). Disabled controls also show a `not-allowed` cursor and `aria-disabled`. |

`packages/tokens/src/tokens.spec.ts` reads this document. CI fails if the code and the hex values in §2–§3 disagree, if a ratio in §4.1–§4.2 differs from what the tokens produce (to two decimals), or if any pair drops below its threshold. Change the tokens and this document together.

## 5. Elevation & shadow tokens

| Token | Light | Dark |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(31,42,36,.06)` | none (use border) |
| `--shadow-md` | `0 2px 8px rgba(31,42,36,.08)` | `0 2px 8px rgba(0,0,0,.4)` |
| `--shadow-lg` | `0 8px 24px rgba(31,42,36,.12)` | `0 8px 24px rgba(0,0,0,.5)` |

## 6. Theme switching
- The default is `system` (follows `prefers-color-scheme`). The preference (`light` / `dark` / `system`) is kept in the `dgd_theme` cookie for one year. The server renders `<html data-theme>` from it, so the first paint is already right, without a flash and without an inline script. Mirroring it to `user_preferences.theme`, so it follows the account across devices, comes with the settings work after auth.
- `color-scheme: light dark` is set on `:root` so native controls and scrollbars match.
- The widget follows Android system dark mode via Glance `ColorProviders(day, night)` built from the same tokens.

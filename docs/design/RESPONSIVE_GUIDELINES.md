# Responsive Guidelines

Mobile-first. Styles are authored for the smallest viewport and enhanced with `min-width` breakpoints.

## 1. Breakpoints (Tailwind)

| Token | Min width | Typical devices | Layout mode |
|---|---|---|---|
| (base) | 0 | Small phones (320–374) | Single column, bottom nav |
| `sm` | 375px | Most phones | Single column, bottom nav |
| `md` | 768px | Tablets portrait, large foldables | Two-pane where useful, **navigation rail** (icons + labels) |
| `lg` | 1024px | Tablets landscape, small laptops | Full **sidebar**, 2–3 column dashboards |
| `xl` | 1280px | Desktops | Sidebar + content (max 1200) + optional right panel |
| `2xl` | 1536px | Large screens | Centered content, no further stretching |

The minimum supported width is **320px**, with no horizontal scroll (WCAG 1.4.10 Reflow). Layout is also tested at 200 % and 400 % zoom.

## 2. Navigation by breakpoint
| < 768 | 768–1023 | ≥ 1024 |
|---|---|---|
| Top app bar (title, offline chip, notifications bell, avatar) + **bottom nav, 5 items** + contextual FAB ("Add deed") | Top app bar + **left navigation rail** (72px, icons + short labels) | Top app bar + **left sidebar** (260px, collapsible to rail) with grouped sections |

Bottom nav items and overflow rules are defined in [NAVIGATION_MAP.md](NAVIGATION_MAP.md). Bottom nav and FAB respect `env(safe-area-inset-bottom)`.

## 3. Layout patterns

| Pattern | Mobile | Tablet | Desktop |
|---|---|---|---|
| Today dashboard | Stacked cards: progress → checklist → Islamic snapshot → suggestion | 2 columns (checklist left, widgets right) | 3 zones: checklist (main), progress + streak (right rail), Islamic/planner cards |
| List → detail (journal, goals, admin users) | Full-screen list → push detail | Split view 40/60 | Split view 35/65 |
| Forms | Full-screen page or bottom sheet (≤ 5 fields) | Dialog (max 560px) | Dialog or side sheet (480px) |
| Calendar | Day/week default; month as compact dots | Month grid | Month grid + selected-day side panel |
| Heatmap | Last 16 weeks, horizontally scrollable *inside its card* with scroll-snap | 26 weeks | 52 weeks |
| Data tables (admin) | Card list (each row → card with key fields) | Table with priority columns | Full table, sticky header, column chooser |
| Charts | Simplified (fewer ticks, legend below) | Legend right | Legend right + data table toggle |
| Reading (dua, hadith, journal) | Full width, 16px padding | Max 680px centered | Max 720px centered |

## 4. Touch & input
- Minimum target **48×48 px** on touch (WCAG 2.5.8 requires 24px; we use the 48px Material/Android guideline). Leave 8px between adjacent targets.
- Hover-only affordances are not allowed. Every hover reveal has a tap or focus equivalent.
- Swipe gestures (e.g. swipe a checklist row to skip) are **shortcuts only**. The same action is always available in the ⋯ menu.
- Keyboard shortcuts on desktop: `n` new deed, `t` today, `/` search, `?` shortcut help. They are disabled while focus is in an input.
- Inputs use the correct `inputmode`/`type` (`numeric` for zakat amounts and tasbih targets, `email`, `tel`).

## 5. Bengali-specific responsive rules
- Never fix the height of a container that holds text. BN wraps more and is taller.
- Bottom-nav labels: limit of 1 line, ≤ 8 characters EN. BN labels are pre-validated to fit at 320px with Hind Siliguri at 12px/13px (e.g. "আজ", "ক্যালেন্ডার", "ইসলামিক", "উন্নতি", "আরও"). "ক্যালেন্ডার" is the longest, and the CI visual test at 320px must confirm it fits. Fallback label: "দিনপঞ্জি".
- Buttons grow vertically rather than truncating.
- Test matrix: every page is screenshot-tested at 320, 375, 768, 1024, 1440 × {EN, BN} × {light, dark} in Playwright for core pages; the remaining pages at 375 and 1440.

## 6. In-app browsers & webviews
- Respect the reduced viewport (Facebook/Messenger add top and bottom chrome). Use `100dvh`, not `100vh`.
- Do not depend on `position: fixed` elements stacking above the webview chrome. Bottom nav uses `sticky` inside a `100dvh` flex layout.
- Avoid `window.open` popups (blocked). Use same-tab navigation.
- File inputs and camera capture may be unavailable. Hide the attachment option when `input[type=file]` support is not detected, and explain why.

## 7. Images & media
- `next/image` with responsive `sizes`, AVIF/WebP. Illustrations are SVG.
- Attachments (F-DEED-010) show thumbnails at 64px (mobile) / 96px (desktop) and open in a full-screen viewer.

## 8. Performance budget per breakpoint (mobile is the constraint)
| Metric | Budget (Moto G Power-class, 4G) |
|---|---|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| JS on Today route | ≤ 170 KB gzipped |
| Fonts | ≤ 120 KB per locale |

## 9. Android widget sizing (reference)
Covered in `architecture/ANDROID_WIDGET_ARCHITECTURE.md`. Visual tokens are shared: small 2×1 / 2×2, medium 4×2, large 4×4, Islamic 4×2. All widgets follow the same green/neutral tokens and the system dark mode.

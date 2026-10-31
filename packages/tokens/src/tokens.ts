// Design tokens: the single source for web (CSS / Tailwind) and the Android widget.
// Values come from docs/design/COLOR_TOKENS.md and TYPOGRAPHY.md; tokens.spec.ts fails when the
// two disagree, so change both together.

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];
type ByTheme = Record<Theme, string>;

/** Semantic colours (COLOR_TOKENS §2) plus data-visualization colours (§3). Name → `--color-<name>`. */
export const COLORS = {
  bg: { light: '#FAF7F2', dark: '#121613' },
  surface: { light: '#FFFFFF', dark: '#1A201C' },
  'surface-raised': { light: '#FFFFFF', dark: '#222924' },
  'surface-sunken': { light: '#F3EEE6', dark: '#0D100E' },
  text: { light: '#1F2A24', dark: '#ECE8E1' },
  'text-muted': { light: '#56615A', dark: '#A7AEA7' },
  'text-placeholder': { light: '#6E776F', dark: '#8A928B' },
  'text-disabled': { light: '#9A9F99', dark: '#5E665F' },
  border: { light: '#E2DBD0', dark: '#313A34' },
  'border-strong': { light: '#8C8273', dark: '#6E786F' },
  primary: { light: '#2F6B47', dark: '#6FBF8A' },
  'primary-hover': { light: '#265A3B', dark: '#86CC9D' },
  'primary-contrast': { light: '#FFFFFF', dark: '#0E1A12' },
  'primary-subtle': { light: '#E4F0E8', dark: '#1F3528' },
  'primary-subtle-text': { light: '#21543A', dark: '#A5DDB6' },
  success: { light: '#2E7048', dark: '#6FBF8A' },
  warning: { light: '#8A5A00', dark: '#E8B04B' },
  'warning-bg': { light: '#FDF1D8', dark: '#3A2E14' },
  accent: { light: '#B7800F', dark: '#E8B04B' },
  'accent-soft': { light: '#F6E3B8', dark: '#3A2E14' },
  'accent-text': { light: '#8A5A00', dark: '#E8B04B' },
  danger: { light: '#A3412C', dark: '#EC8F78' },
  'danger-contrast': { light: '#FFFFFF', dark: '#1A0E0A' },
  'danger-bg': { light: '#FBE9E4', dark: '#3D201A' },
  info: { light: '#1D6573', dark: '#6CC3D1' },
  'info-bg': { light: '#E2F1F3', dark: '#15343A' },
  'focus-ring': { light: '#1D6573', dark: '#8FD1E0' },
  overlay: { light: 'rgba(31,42,36,0.48)', dark: 'rgba(0,0,0,0.6)' },
  // Activity heatmap, levels 0–4 (§3.1). Never the only carrier of information.
  'heat-0': { light: '#ECE6DC', dark: '#222924' },
  'heat-1': { light: '#C6DFCC', dark: '#244A32' },
  'heat-2': { light: '#8DC29C', dark: '#2F7048' },
  'heat-3': { light: '#4C9466', dark: '#55A06F' },
  'heat-4': { light: '#2F6B47', dark: '#9AD7AE' },
  // Life-balance categories c1–c8 (§3.2), always shown with a label or icon.
  'chart-1': { light: '#2F6B47', dark: '#6FBF8A' },
  'chart-2': { light: '#B5573A', dark: '#E8977B' },
  'chart-3': { light: '#1D7385', dark: '#5FC0D3' },
  'chart-4': { light: '#5457A0', dark: '#A3A6F0' },
  'chart-5': { light: '#9A6A0C', dark: '#E2B04F' },
  'chart-6': { light: '#6B4F3A', dark: '#C9A887' },
  'chart-7': { light: '#557F2B', dark: '#A6CF6E' },
  'chart-8': { light: '#9A4878', dark: '#E39AC7' },
} as const satisfies Record<string, ByTheme>;
export type ColorName = keyof typeof COLORS;

/** Elevation (COLOR_TOKENS §5). Dark mode replaces small shadows with a border. */
export const SHADOWS = {
  sm: { light: '0 1px 2px rgba(31,42,36,.06)', dark: 'none' },
  md: { light: '0 2px 8px rgba(31,42,36,.08)', dark: '0 2px 8px rgba(0,0,0,.4)' },
  lg: { light: '0 8px 24px rgba(31,42,36,.12)', dark: '0 8px 24px rgba(0,0,0,.5)' },
} as const satisfies Record<string, ByTheme>;

/** Corner radius (DESIGN_SYSTEM §2). `full` is Tailwind's built-in `rounded-full`. */
export const RADII = { sm: '6px', md: '10px', lg: '16px' } as const;

export interface TypeStyle {
  size: string;
  lineHeight: number;
  /** Bengali needs taller lines (TYPOGRAPHY §3.1); absent for Arabic-only styles. */
  lineHeightBn?: number;
  weight: number;
  /** Bengali minimum size where the EN size is below 13px (TYPOGRAPHY §3.5). */
  sizeBn?: string;
  /** Below 640px (TYPOGRAPHY §2). */
  sizeMobile?: string;
}

/** Type scale (TYPOGRAPHY §2). Name → Tailwind `text-<name>`. */
export const TYPE_SCALE = {
  display: {
    size: '2.25rem',
    lineHeight: 1.2,
    lineHeightBn: 1.35,
    weight: 700,
    sizeMobile: '1.875rem',
  },
  h1: { size: '1.75rem', lineHeight: 1.25, lineHeightBn: 1.4, weight: 700, sizeMobile: '1.5rem' },
  h2: { size: '1.375rem', lineHeight: 1.3, lineHeightBn: 1.45, weight: 600 },
  h3: { size: '1.125rem', lineHeight: 1.35, lineHeightBn: 1.5, weight: 600 },
  body: { size: '1rem', lineHeight: 1.5, lineHeightBn: 1.7, weight: 400 },
  'body-sm': { size: '0.875rem', lineHeight: 1.45, lineHeightBn: 1.65, weight: 400 },
  caption: {
    size: '0.75rem',
    lineHeight: 1.4,
    lineHeightBn: 1.6,
    weight: 500,
    sizeBn: '0.8125rem',
  },
  label: { size: '0.875rem', lineHeight: 1.3, lineHeightBn: 1.5, weight: 500 },
  arabic: { size: '1.5rem', lineHeight: 2, weight: 400 },
  'arabic-lg': { size: '2rem', lineHeight: 2.1, weight: 400 },
  counter: { size: '3rem', lineHeight: 1.1, weight: 700 },
} as const satisfies Record<string, TypeStyle>;

/** Motion (DESIGN_SYSTEM §2). Disabled under `prefers-reduced-motion` by components. */
export const MOTION = {
  duration: { micro: '120ms', enter: '200ms', sheet: '280ms' },
  ease: 'cubic-bezier(.2,.8,.2,1)',
} as const;

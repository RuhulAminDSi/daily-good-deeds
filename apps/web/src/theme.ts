// Colour theme preference (F-AUTH-010, COLOR_TOKENS §6). Stored in a cookie so the server renders
// `data-theme` into the first HTML: no flash of the wrong theme, and no inline script (strict CSP).
// Account-level persistence (user_preferences.theme) joins with the settings work after auth.

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_COOKIE = 'dgd_theme';

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && (THEMES as readonly string[]).includes(value);

/** `data-theme` for <html>: absent for "system", so the CSS follows `prefers-color-scheme`. */
export const themeAttribute = (theme: Theme) => (theme === 'system' ? undefined : theme);

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Browser only: applies a theme at once and remembers it for a year. When the account preference
 * arrives (after auth), this write moves to a server action that sets both cookie and preference.
 */
export function applyTheme(theme: Theme): void {
  const secure = location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
  const attribute = themeAttribute(theme);
  if (attribute) document.documentElement.dataset.theme = attribute;
  else delete document.documentElement.dataset.theme;
}

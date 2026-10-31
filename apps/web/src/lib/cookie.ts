const ONE_YEAR = 60 * 60 * 24 * 365;

/** Browser only: a site-wide preference cookie (theme, language), kept for a year by default. */
export function setCookie(name: string, value: string, maxAgeSeconds = ONE_YEAR): void {
  const secure = location.protocol === 'https:' ? '; secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax${secure}`;
}

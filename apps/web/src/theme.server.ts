import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { isTheme, THEME_COOKIE, type Theme } from './theme';

/** The visitor's saved theme; "system" when unset or invalid. Read once per request (layouts share it). */
export const readTheme = cache(async (): Promise<Theme> => {
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(value) ? value : 'system';
});

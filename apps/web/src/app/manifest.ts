import { translator } from '@dgd/i18n/messages';
import { COLORS } from '@dgd/tokens';
import type { MetadataRoute } from 'next';
import { cookies, headers } from 'next/headers';
import { APP_ICONS, iconRef } from '@/lib/app-icons';
import { LOCALE_COOKIE } from '@/i18n/locales';
import { preferredLocale } from '@/i18n/preferred-locale';

/**
 * The one web app manifest (F-PWA-001, FR-PWA-001-01, DL-028). `scope: /` with a locale-less
 * `start_url`: src/proxy.ts redirects to `/{locale}/today`, so switching language never leaves
 * the installed app. The name is in the visitor's language: an installed app keeps the name it
 * had at install time, so per-request text is all a single manifest can offer.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const locale = preferredLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    headerStore.get('accept-language'),
  );
  const t = translator(locale);
  return {
    id: '/',
    name: t('app.name'),
    short_name: t('app.shortName'),
    description: t('app.tagline'),
    lang: locale,
    dir: 'ltr',
    scope: '/',
    start_url: '/today?source=pwa',
    display: 'standalone',
    theme_color: COLORS.surface.light,
    background_color: COLORS.bg.light,
    icons: (['icon-192.png', 'icon-512.png', 'maskable-512.png'] as const).map((file) => ({
      ...iconRef(file),
      purpose: APP_ICONS[file].purpose,
    })),
    // Tasbih joins when its page lands (T-P5); a shortcut to a missing page would be a dead end.
    shortcuts: [
      {
        name: t('nav.today'),
        url: '/today?source=pwa-shortcut',
        icons: [iconRef('icon-192.png')],
      },
    ],
  };
}

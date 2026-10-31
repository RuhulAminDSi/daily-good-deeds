import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { readTheme } from '@/theme.server';
import { Navigation } from './navigation';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';

interface AppShellProps {
  /** System banners (offline, in-app browser, update…), stacked above the content. Their content
   *  arrives with the PWA tasks; the slot is here so pages never need to change. */
  banners?: ReactNode;
  children: ReactNode;
}

/**
 * The signed-in app layout (COMPONENT_LIBRARY §2 AppShell). Focus order: skip link, navigation,
 * top bar, main. It fills the dynamic viewport (`dvh`), so in-app browsers' toolbars never
 * cover the bottom bar.
 */
export async function AppShell({ banners, children }: AppShellProps) {
  const [t, theme] = await Promise.all([getTranslations(), readTheme()]);
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only rounded-md bg-surface-raised px-4 py-2 text-label shadow-md focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50"
      >
        {t('nav.skipToContent')}
      </a>
      <Navigation />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          <span className="text-h3 text-primary">{t('app.name')}</span>
          <div className="ms-auto flex items-center gap-2">
            {/* Phones: in the More sheet; the top bar has no room (RESPONSIVE_GUIDELINES §2). */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <ThemeSwitcher initial={theme} />
          </div>
        </header>
        {banners && <div className="flex flex-col gap-2 px-4 pt-4 md:px-6">{banners}</div>}
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none md:px-6 lg:px-8">
          <div className="mx-auto max-w-300">{children}</div>
        </main>
      </div>
    </div>
  );
}

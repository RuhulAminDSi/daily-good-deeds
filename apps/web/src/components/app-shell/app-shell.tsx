import type { ReactNode } from 'react';
import type { Messages } from '@/i18n/dictionary';
import type { Locale } from '@/i18n/locales';
import { Navigation } from './navigation';

interface AppShellProps {
  locale: Locale;
  m: Messages;
  /** System banners (offline, in-app browser, update…), stacked above the content. Their content
   *  arrives with the PWA tasks; the slot is here so pages never need to change. */
  banners?: ReactNode;
  children: ReactNode;
}

/**
 * The signed-in app layout (COMPONENT_LIBRARY §2 AppShell). Focus order: skip link, top bar,
 * navigation, main. It fills the dynamic viewport (`dvh`), so in-app browsers' toolbars never
 * cover the bottom bar.
 */
export function AppShell({ locale, m, banners, children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <a
        href="#main"
        className="sr-only rounded-md bg-surface-raised px-4 py-2 text-label shadow-md focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50"
      >
        {m.nav.skipToContent}
      </a>
      <Navigation locale={locale} labels={m.nav} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          <span className="text-h3 text-primary">{m.app.name}</span>
        </header>
        {banners && <div className="flex flex-col gap-2 px-4 pt-4 md:px-6">{banners}</div>}
        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none md:px-6 lg:px-8">
          <div className="mx-auto max-w-300">{children}</div>
        </main>
      </div>
    </div>
  );
}

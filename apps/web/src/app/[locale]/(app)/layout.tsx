import { AppShell } from '@/components/app-shell/app-shell';
import { InstallPrompt } from '@/components/install-prompt';
import { OfflineBanner } from '@/components/offline-banner';

/** Signed-in app layout. The auth guard (T-P2-AUTH-011) is added by its task. */
export default function AppLayout({ children }: LayoutProps<'/[locale]'>) {
  return (
    <AppShell
      banners={
        <>
          <OfflineBanner />
          <InstallPrompt />
        </>
      }
    >
      {children}
    </AppShell>
  );
}

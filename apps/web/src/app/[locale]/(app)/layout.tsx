import { AppShell } from '@/components/app-shell/app-shell';
import { routeMessages } from '@/i18n/route-locale';

/** Signed-in app layout. The auth guard (T-P2-AUTH-011) is added by its task. */
export default async function AppLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale, m } = await routeMessages(params);
  return (
    <AppShell locale={locale} m={m}>
      {children}
    </AppShell>
  );
}

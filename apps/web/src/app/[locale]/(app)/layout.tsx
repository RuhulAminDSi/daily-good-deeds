import { AppShell } from '@/components/app-shell/app-shell';
import { routeMessages } from '@/i18n/route-locale';
import { readTheme } from '@/theme.server';

/** Signed-in app layout. The auth guard (T-P2-AUTH-011) is added by its task. */
export default async function AppLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const [{ locale, m }, theme] = await Promise.all([routeMessages(params), readTheme()]);
  return (
    <AppShell locale={locale} m={m} theme={theme}>
      {children}
    </AppShell>
  );
}

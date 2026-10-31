import Link from 'next/link';
import { routeMessages } from '@/i18n/route-locale';

/**
 * Signed-in app shell. The auth guard (T-P2-AUTH-011) and the responsive navigation
 * (T-P2-UI-003: bottom bar on mobile, sidebar on desktop) are added by their tasks.
 */
export default async function AppLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale, m } = await routeMessages(params);
  return (
    <div className="min-h-dvh">
      <nav aria-label={m.nav.main} className="flex gap-4 border-b border-border px-4 py-3">
        <Link href={`/${locale}/today`}>{m.nav.today}</Link>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}

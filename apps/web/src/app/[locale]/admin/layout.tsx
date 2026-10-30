import Link from 'next/link';
import { routeMessages } from '@/i18n/route-locale';

/** Admin area: separate layout. Role check + step-up gate arrive with T-P2-ADMIN-001. */
export default async function AdminLayout({ children, params }: LayoutProps<'/[locale]/admin'>) {
  const { locale, m } = await routeMessages(params);
  return (
    <div className="min-h-dvh bg-white">
      <nav aria-label={m.nav.admin} className="flex gap-4 bg-stone-900 px-4 py-3 text-white">
        <span className="font-semibold">{m.nav.admin}</span>
        <Link href={`/${locale}`}>{m.nav.home}</Link>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}

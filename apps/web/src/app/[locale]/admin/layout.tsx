import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

/** Admin area: separate layout. Role check + step-up gate arrive with T-P2-ADMIN-001. */
export default async function AdminLayout({ children }: LayoutProps<'/[locale]/admin'>) {
  const t = await getTranslations('nav');
  return (
    <div className="min-h-dvh bg-surface">
      <nav
        aria-label={t('admin')}
        className="flex gap-4 border-b border-border bg-surface-sunken px-4 py-3"
      >
        <span className="font-semibold">{t('admin')}</span>
        <Link href="/">{t('home')}</Link>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}

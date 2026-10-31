'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('common');
  return (
    <main className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-h3">{t('notFoundTitle')}</h1>
      <Link href="/" className="mt-4 inline-block text-primary underline">
        {t('backHome')}
      </Link>
    </main>
  );
}

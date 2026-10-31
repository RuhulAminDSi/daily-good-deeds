'use client';

import { Link } from '@/i18n/navigation';
import { useClientTranslations } from '@/i18n/client';

export default function NotFound() {
  const t = useClientTranslations('common');
  return (
    <main className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-h3">{t('notFoundTitle')}</h1>
      <Link href="/" className="mt-4 inline-block text-primary underline">
        {t('backHome')}
      </Link>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { useBoundaryMessages } from '@/i18n/boundary-messages';

export default function NotFound() {
  const { locale, common } = useBoundaryMessages();
  return (
    <main className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-h3">{common.notFoundTitle}</h1>
      <Link href={`/${locale}`} className="mt-4 inline-block text-primary underline">
        {common.backHome}
      </Link>
    </main>
  );
}

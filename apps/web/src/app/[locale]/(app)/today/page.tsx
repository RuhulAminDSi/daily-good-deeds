import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';

export default async function Today() {
  const t = await getTranslations('today');
  return <PageHeader title={t('title')} description={t('comingSoon')} />;
}

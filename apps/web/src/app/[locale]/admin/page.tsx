import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';

export default async function AdminDashboard() {
  const t = await getTranslations('admin');
  return <PageHeader title={t('title')} description={t('comingSoon')} />;
}

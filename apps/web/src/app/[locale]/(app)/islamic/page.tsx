import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';

// Placeholder until its phase ships (NAVIGATION_MAP §3): the navigation never links to a 404.
export default async function IslamicPage() {
  const t = await getTranslations();
  return <PageHeader title={t('nav.islamic')} description={t('section.comingSoon')} />;
}

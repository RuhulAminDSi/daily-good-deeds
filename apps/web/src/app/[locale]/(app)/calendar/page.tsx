import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/page-header';

// Placeholder until its phase ships (NAVIGATION_MAP §3): the navigation never links to a 404.
export default async function CalendarPage() {
  const t = await getTranslations();
  return <PageHeader title={t('nav.calendar')} description={t('section.comingSoon')} />;
}

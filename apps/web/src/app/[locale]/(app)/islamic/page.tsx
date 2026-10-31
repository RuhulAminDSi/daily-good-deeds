import { PageHeader } from '@/components/page-header';
import { routeMessages } from '@/i18n/route-locale';

// Placeholder until its phase ships (NAVIGATION_MAP §3): the navigation never links to a 404.
export default async function IslamicPage({ params }: PageProps<'/[locale]/islamic'>) {
  const { m } = await routeMessages(params);
  return <PageHeader title={m.nav.islamic} description={m.section.comingSoon} />;
}

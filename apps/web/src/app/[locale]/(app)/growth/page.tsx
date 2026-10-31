import { PageHeader } from '@/components/page-header';
import { routeMessages } from '@/i18n/route-locale';

// Placeholder until its phase ships (NAVIGATION_MAP §3): the navigation never links to a 404.
export default async function GrowthPage({ params }: PageProps<'/[locale]/growth'>) {
  const { m } = await routeMessages(params);
  return <PageHeader title={m.nav.growth} description={m.section.comingSoon} />;
}

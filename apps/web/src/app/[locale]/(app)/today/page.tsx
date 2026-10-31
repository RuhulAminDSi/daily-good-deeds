import { PageHeader } from '@/components/page-header';
import { routeMessages } from '@/i18n/route-locale';

export default async function Today({ params }: PageProps<'/[locale]/today'>) {
  const { m } = await routeMessages(params);
  return <PageHeader title={m.today.title} description={m.today.comingSoon} />;
}

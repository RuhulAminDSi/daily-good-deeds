import { PageHeader } from '@/components/page-header';
import { routeMessages } from '@/i18n/route-locale';

export default async function AdminDashboard({ params }: PageProps<'/[locale]/admin'>) {
  const { m } = await routeMessages(params);
  return <PageHeader title={m.admin.title} description={m.admin.comingSoon} />;
}

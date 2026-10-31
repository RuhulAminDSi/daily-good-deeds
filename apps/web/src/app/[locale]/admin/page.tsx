import { routeMessages } from '@/i18n/route-locale';

export default async function AdminDashboard({ params }: PageProps<'/[locale]/admin'>) {
  const { m } = await routeMessages(params);
  return (
    <>
      <h1 className="text-h1">{m.admin.title}</h1>
      <p className="mt-2 text-text-muted">{m.admin.comingSoon}</p>
    </>
  );
}

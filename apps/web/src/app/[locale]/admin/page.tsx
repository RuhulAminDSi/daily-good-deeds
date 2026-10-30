import { routeMessages } from '@/i18n/route-locale';

export default async function AdminDashboard({ params }: PageProps<'/[locale]/admin'>) {
  const { m } = await routeMessages(params);
  return (
    <>
      <h1 className="text-2xl font-semibold">{m.admin.title}</h1>
      <p className="mt-2 text-stone-600">{m.admin.comingSoon}</p>
    </>
  );
}

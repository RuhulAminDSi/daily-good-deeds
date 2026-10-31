import { routeMessages } from '@/i18n/route-locale';

export default async function Today({ params }: PageProps<'/[locale]/today'>) {
  const { m } = await routeMessages(params);
  return (
    <>
      <h1 className="text-h1">{m.today.title}</h1>
      <p className="mt-2 text-text-muted">{m.today.comingSoon}</p>
    </>
  );
}

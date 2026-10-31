import { getTranslations } from 'next-intl/server';
import { RegisterForm } from './register-form';

export async function generateMetadata() {
  const t = await getTranslations('register');
  return { title: t('title') };
}

/** Sign-up page (F-AUTH-001; PAGE_SPECIFICATIONS, Register). */
export default async function RegisterPage() {
  const t = await getTranslations('register');
  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{t('title')}</h1>
        <p className="text-body text-text-muted">{t('intro')}</p>
      </div>
      <RegisterForm />
    </main>
  );
}

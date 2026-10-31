import { APP_ICONS, type AppIcon } from '@/lib/app-icons';
import { brandIcon } from '@/lib/brand-icon';

/** Every app icon (src/lib/app-icons.ts), rendered once at build time. */
export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(APP_ICONS).map((icon) => ({ icon }));

export async function GET(_req: Request, { params }: RouteContext<'/icons/[icon]'>) {
  const icon: { size: number; fullBleed?: boolean } = APP_ICONS[(await params).icon as AppIcon];
  return brandIcon(icon.size, { fullBleed: icon.fullBleed });
}

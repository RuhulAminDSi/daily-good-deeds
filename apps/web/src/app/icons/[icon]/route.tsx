import { brandIcon } from '@/lib/brand-icon';

/** Manifest icons (src/app/manifest.ts): rendered once at build time. */
const ICONS = {
  'icon-192.png': () => brandIcon(192),
  'icon-512.png': () => brandIcon(512),
  'maskable-512.png': () => brandIcon(512, { fullBleed: true }),
} as const;

export const dynamic = 'force-static';
export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(ICONS).map((icon) => ({ icon }));

export async function GET(_req: Request, { params }: RouteContext<'/icons/[icon]'>) {
  const { icon } = await params;
  return ICONS[icon as keyof typeof ICONS]();
}

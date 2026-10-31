/**
 * Every app icon (F-PWA-001), served as `/icons/<file>` by src/app/icons/[icon]/route.tsx and
 * referenced by the manifest and the page metadata. `.png` paths, so the locale proxy skips them.
 */
export const APP_ICONS = {
  'icon-192.png': { size: 192, purpose: 'any' },
  'icon-512.png': { size: 512, purpose: 'any' },
  'maskable-512.png': { size: 512, purpose: 'maskable', fullBleed: true },
  /** Browser tab. */
  'tab-32.png': { size: 32 },
  /** iOS home screen: Add to Home Screen ignores the manifest, and iOS rounds the corners. */
  'apple-180.png': { size: 180, fullBleed: true },
} as const satisfies Record<
  string,
  { size: number; purpose?: 'any' | 'maskable'; fullBleed?: boolean }
>;

export type AppIcon = keyof typeof APP_ICONS;

/** `{ src, sizes, type }` for manifest and metadata entries. */
export const iconRef = (file: AppIcon) => {
  const { size } = APP_ICONS[file];
  return { src: `/icons/${file}`, sizes: `${size}x${size}`, type: 'image/png' };
};

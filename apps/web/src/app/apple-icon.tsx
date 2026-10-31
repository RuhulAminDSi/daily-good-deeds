import { brandIcon } from '@/lib/brand-icon';

/** iOS home-screen icon (Add to Home Screen ignores the manifest's icons). */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return brandIcon(180, { fullBleed: true });
}

// The app icon (F-PWA-001): a sprout on the brand green, rendered to PNG by next/og at build time,
// so no binary assets live in the repo and the colours follow @dgd/tokens.
import { COLORS } from '@dgd/tokens';
import { ImageResponse } from 'next/og';

/** Sprout outline from lucide (ISC), on a 24-unit grid; the leaves are filled for small sizes. */
function Sprout({ size }: { size: number }) {
  const color = COLORS['primary-contrast'].light;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path
        fill={color}
        d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"
      />
      <path
        fill={color}
        d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"
      />
    </svg>
  );
}

export interface BrandIconOptions {
  /**
   * Maskable: a full-bleed square with the sprout inside the central safe zone (the inner 80%
   * circle), so any launcher mask (circle, squircle) keeps it whole. Otherwise a rounded tile
   * with transparent corners. Apple touch icons are full-bleed too (iOS rounds them itself).
   */
  fullBleed?: boolean;
}

export function brandIcon(size: number, { fullBleed = false }: BrandIconOptions = {}) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.primary.light,
        borderRadius: fullBleed ? 0 : size * 0.22,
      }}
    >
      <Sprout size={Math.round(size * (fullBleed ? 0.56 : 0.66))} />
    </div>,
    { width: size, height: size },
  );
}

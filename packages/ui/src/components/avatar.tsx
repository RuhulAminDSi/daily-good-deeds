import { Avatar as RadixAvatar } from 'radix-ui';
import { cn } from '../lib/cn';

const SIZES = {
  24: 'size-6 text-caption',
  32: 'size-8 text-caption',
  40: 'size-10 text-label',
  64: 'size-16 text-h3',
} as const;

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Up to two initials, taken as whole grapheme clusters so Bengali conjuncts and vowel signs stay
 * intact ("ক্ষমা রহমান" → "ক্ষর", not a broken half-letter).
 */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => graphemes.segment(word)[Symbol.iterator]().next().value?.segment ?? '')
    .join('')
    .toLocaleUpperCase();
}

export interface AvatarProps {
  /** The person's name: the accessible name, and the source of the initials fallback. */
  name: string;
  src?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/** Photo, or initials while it loads or when there is none. */
export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  return (
    <RadixAvatar.Root
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-subtle text-primary-subtle-text select-none',
        SIZES[size],
        className,
      )}
    >
      {src && <RadixAvatar.Image src={src} alt="" className="size-full object-cover" />}
      <RadixAvatar.Fallback aria-hidden>{initials(name)}</RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}

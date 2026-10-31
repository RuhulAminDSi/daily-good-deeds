'use client';

import { cn } from '../lib/cn';
import { useUi } from '../lib/ui';

const formatters = new Map<string, Intl.NumberFormat>();
const formatter = (locale: string) => {
  let f = formatters.get(locale);
  if (!f) formatters.set(locale, (f = new Intl.NumberFormat(locale)));
  return f;
};

export interface BadgeProps {
  count: number;
  /** Full accessible text, e.g. "3 unread notifications" / "৩টি অপঠিত বিজ্ঞপ্তি". */
  label: string;
  max?: number;
  className?: string;
}

/** Notification count only, never a "missed" count (COMPONENT_LIBRARY §1). Hidden at 0; caps at 99+. */
export function Badge({ count, label, max = 99, className }: BadgeProps) {
  // Digits follow the UI language (Bengali digits for `bn`).
  const { format } = formatter(useUi().locale);
  if (count <= 0) return null;
  const shown = count > max ? `${format(max)}+` : format(count);
  return (
    <span
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-caption text-primary-contrast',
        className,
      )}
    >
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

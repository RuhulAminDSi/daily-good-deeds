import { Card } from '@dgd/ui';
import type { LucideIcon } from 'lucide-react';
import { type ReactNode, useId } from 'react';

interface BannerCardProps {
  icon: LucideIcon;
  title: ReactNode;
  children: ReactNode;
  /** Buttons, the primary one first. */
  actions: ReactNode;
}

/** A dismissible invitation in the app shell's banner slot (install, open in browser…). */
export function BannerCard({ icon: Icon, title, children, actions }: BannerCardProps) {
  const titleId = useId();
  return (
    <Card as="section" variant="highlight" aria-labelledby={titleId} className="flex gap-3">
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p id={titleId} className="text-label">
          {title}
        </p>
        {children}
        <div className="mt-2 flex flex-wrap gap-2">{actions}</div>
      </div>
    </Card>
  );
}

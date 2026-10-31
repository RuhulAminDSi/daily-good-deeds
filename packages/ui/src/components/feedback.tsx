import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Placeholder shaped like the content it stands for. No shimmer under reduced motion. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('rounded-sm bg-surface-sunken motion-safe:animate-pulse', className)}
    />
  );
}

export interface EmptyStateProps {
  title: ReactNode;
  /** Encouraging, never shaming (DESIGN_SYSTEM §6): "Your journal is waiting…". */
  body?: ReactNode;
  /** Decorative icon or illustration. */
  icon?: ReactNode;
  action?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
}

export function EmptyState({
  title,
  body,
  icon,
  action,
  headingLevel = 2,
  className,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div
      className={cn(
        'mx-auto flex max-w-sm flex-col items-center gap-3 py-10 text-center',
        className,
      )}
    >
      {icon && (
        <div aria-hidden className="text-primary">
          {icon}
        </div>
      )}
      <Heading className="text-h3">{title}</Heading>
      {body && <p className="text-body text-text-muted">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

import type { AnchorHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

const VARIANTS = {
  default: 'border-border bg-surface shadow-sm',
  highlight: 'border-transparent bg-primary-subtle text-primary-subtle-text',
  // The whole card is clickable through its single CardLink (stretched over the card).
  interactive: 'relative border-border bg-surface shadow-sm hover:border-border-strong',
} as const;

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: keyof typeof VARIANTS;
  /** `article` for self-contained items in a list; `div` otherwise. */
  as?: 'div' | 'article' | 'section';
}

export function Card({ variant = 'default', as: Tag = 'div', className, ...props }: CardProps) {
  return (
    <Tag className={cn('rounded-lg border p-4 md:p-5', VARIANTS[variant], className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-start justify-between gap-3', className)} {...props} />;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level that fits the page outline (one h1 per page). */
  level?: 2 | 3 | 4;
}

export function CardTitle({ level = 3, className, ...props }: CardTitleProps) {
  const Heading = `h${level}` as const;
  return <Heading className={cn('text-h3', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4 flex flex-wrap items-center gap-2', className)} {...props} />;
}

/** The single link of an `interactive` card; its hit area covers the whole card. */
export function CardLink({ className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        'text-text no-underline after:absolute after:inset-0 after:rounded-lg hover:underline',
        className,
      )}
      {...props}
    />
  );
}

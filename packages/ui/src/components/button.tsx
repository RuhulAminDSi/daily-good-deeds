import { LoaderCircle } from 'lucide-react';
import { Slot } from 'radix-ui';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Tooltip } from './tooltip';

const VARIANTS = {
  primary: 'bg-primary text-primary-contrast hover:bg-primary-hover',
  secondary: 'border border-border-strong bg-surface text-text hover:bg-surface-sunken',
  ghost: 'text-text hover:bg-surface-sunken',
  danger: 'bg-danger text-danger-contrast hover:bg-danger/90',
  link: 'text-primary underline underline-offset-4 hover:text-primary-hover',
} as const;

/** 36 / 44 / 52 px tall (COMPONENT_LIBRARY §1). Labels may wrap (Bengali is longer). */
const SIZES = { sm: 'min-h-9 px-3', md: 'min-h-11 px-4', lg: 'min-h-13 px-5' } as const;
const ICON_SIZES = { sm: 'size-9', md: 'size-11', lg: 'size-13' } as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner, keeps the label (and width), sets `aria-busy`, and announces `loadingLabel`. */
  loading?: boolean;
  /** Announced while loading, e.g. "Saving…". */
  loadingLabel?: string;
  /** Style the single child (e.g. a link) as a button instead of rendering a `<button>`. */
  asChild?: boolean;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <LoaderCircle
      aria-hidden
      className={cn('size-4 animate-spin motion-reduce:animate-none', className)}
    />
  );
}

/**
 * A native button. `disabled` is rendered as `aria-disabled`, so the button stays focusable (a
 * tooltip can explain why) but ignores clicks, including form submission. (Only buttons work this
 * way; form fields use native `disabled`.)
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel,
  asChild = false,
  disabled,
  className,
  children,
  onClick,
  type = 'button',
  ...props
}: ButtonProps) {
  const classes = cn(
    'relative inline-flex items-center justify-center gap-2 rounded-md text-label',
    'transition-colors duration-(--duration-micro)',
    VARIANTS[variant],
    variant !== 'link' && SIZES[size],
    disabled && 'cursor-not-allowed opacity-50',
    loading && 'cursor-progress',
    className,
  );
  if (asChild)
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );

  const inert = disabled || loading;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (inert) event.preventDefault();
    else onClick?.(event);
  };
  const button = (
    <button
      type={type}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={handleClick}
      className={classes}
      {...props}
    >
      {/* Transparent, not hidden: the label stays the button's accessible name while loading. */}
      <span className={cn('inline-flex items-center gap-2', loading && 'opacity-0')}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      )}
    </button>
  );
  // A single element unless loading, so wrappers (Tooltip, DialogClose…) can merge props into it.
  if (!(loading && loadingLabel)) return button;
  return (
    <>
      {button}
      {/* Outside the button so it is announced without becoming part of the button's name. */}
      <span role="status" className="sr-only">
        {loadingLabel}
      </span>
    </>
  );
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'aria-label' | 'asChild'> {
  /** Accessible name, also shown as a tooltip on hover and focus. */
  label: string;
  icon: ReactNode;
}

/** Icon-only button: square, at least 44px by default, labelled and with a tooltip. */
export function IconButton({
  label,
  icon,
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: IconButtonProps) {
  return (
    <Tooltip content={label}>
      <Button
        aria-label={label}
        variant={variant}
        size={size}
        className={cn('px-0', ICON_SIZES[size], className)}
        {...props}
      >
        <span aria-hidden className="inline-flex">
          {icon}
        </span>
      </Button>
    </Tooltip>
  );
}

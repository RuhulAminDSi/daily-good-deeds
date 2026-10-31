'use client';

import { X } from 'lucide-react';
import { Dialog as RadixDialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { useUi } from '../lib/ui';
import { IconButton } from './button';

export interface ModalProps {
  title: ReactNode;
  description?: ReactNode;
  /** Accessible name of the ✕ button; defaults to UiProvider's `close`. */
  closeLabel?: string;
  /** Element that opens it (uncontrolled use). */
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Action buttons, end-aligned; wrap them in `DialogClose` to close on click. */
  footer?: ReactNode;
  children?: ReactNode;
}

const PLACEMENT = {
  dialog:
    'left-1/2 top-1/2 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg',
  // Bottom sheet on phones, side sheet from 768px.
  sheet:
    'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-lg md:inset-y-0 md:start-auto md:end-0 md:max-h-none md:w-96 md:rounded-none md:rounded-s-lg',
} as const;

/** Radix Dialog: focus moves inside, Esc closes, focus returns to the trigger (ACCESSIBILITY §2). */
function Modal({
  variant,
  title,
  description,
  closeLabel,
  trigger,
  open,
  onOpenChange,
  footer,
  children,
}: ModalProps & { variant: keyof typeof PLACEMENT }) {
  const { strings } = useUi();
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>}
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-overlay" />
        <RadixDialog.Content
          // Without a description, say so explicitly (Radix otherwise warns).
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={cn(
            'fixed z-50 overflow-y-auto border border-border bg-surface-raised p-5 text-text shadow-lg',
            PLACEMENT[variant],
          )}
        >
          {variant === 'sheet' && (
            <div
              aria-hidden
              className="mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-border-strong md:hidden"
            />
          )}
          <RadixDialog.Title className="pe-10 text-h2">{title}</RadixDialog.Title>
          {description && (
            <RadixDialog.Description className="mt-1 text-body-sm text-text-muted">
              {description}
            </RadixDialog.Description>
          )}
          {children && <div className="mt-4">{children}</div>}
          {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
          <RadixDialog.Close asChild>
            <IconButton
              label={closeLabel ?? strings.close}
              icon={<X className="size-5" />}
              size="sm"
              className="absolute end-3 top-3"
            />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export const Dialog = (props: ModalProps) => <Modal variant="dialog" {...props} />;
/** A dialog that slides from the bottom on phones and from the side on larger screens. */
export const Sheet = (props: ModalProps) => <Modal variant="sheet" {...props} />;
/** Closes the surrounding Dialog or Sheet; wrap a footer button in it (`asChild`). */
export const DialogClose = RadixDialog.Close;

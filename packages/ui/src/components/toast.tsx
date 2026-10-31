import { X } from 'lucide-react';
import { Toast as RadixToast } from 'radix-ui';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
import { useUi } from '../lib/ui';
import { Button, IconButton } from './button';

export interface ToastOptions {
  title: string;
  description?: string;
  /** e.g. Undo. `altText` tells screen-reader users how to do it another way. */
  action?: { label: string; altText: string; onClick: () => void };
  /** Milliseconds (default 5000). With an action it never drops below 5000 (ACCESSIBILITY §2). */
  duration?: number;
}

const MIN_ACTION_MS = 5000;
const ToastContext = createContext<((toast: ToastOptions) => void) | null>(null);
let nextId = 0;

/** Shows a toast: `const toast = useToast(); toast({ title })`. Provided by UiProvider. */
export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast() needs a <UiProvider> above it');
  return show;
}

/** Polite, never steals focus, pauses on hover/focus. Bottom on phones, bottom-end on desktop.
 *  Rendered by UiProvider. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { strings } = useUi();
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);
  const show = useCallback(
    (toast: ToastOptions) => setToasts((all) => [...all, { ...toast, id: ++nextId }]),
    [],
  );
  const remove = useCallback(
    (id: number) => setToasts((all) => all.filter((t) => t.id !== id)),
    [],
  );

  return (
    <RadixToast.Provider label={strings.notification} duration={MIN_ACTION_MS}>
      <ToastContext value={show}>{children}</ToastContext>
      {toasts.map(({ id, title, description, action, duration }) => (
        <RadixToast.Root
          key={id}
          type="background"
          duration={action && duration ? Math.max(duration, MIN_ACTION_MS) : duration}
          onOpenChange={(open) => !open && remove(id)}
          className="flex items-start gap-3 rounded-md border border-border bg-surface-raised p-4 text-text shadow-lg"
        >
          <div className="flex-1">
            <RadixToast.Title className="text-label">{title}</RadixToast.Title>
            {description && (
              <RadixToast.Description className="mt-1 text-body-sm text-text-muted">
                {description}
              </RadixToast.Description>
            )}
          </div>
          {action && (
            <RadixToast.Action altText={action.altText} asChild>
              <Button size="sm" variant="secondary" onClick={action.onClick}>
                {action.label}
              </Button>
            </RadixToast.Action>
          )}
          <RadixToast.Close asChild>
            <IconButton label={strings.close} icon={<X className="size-4" />} size="sm" />
          </RadixToast.Close>
        </RadixToast.Root>
      ))}
      <RadixToast.Viewport
        label={`${strings.notifications} ({hotkey})`}
        className="fixed inset-x-4 bottom-4 z-50 flex flex-col gap-2 outline-none md:start-auto md:w-96"
      />
    </RadixToast.Provider>
  );
}

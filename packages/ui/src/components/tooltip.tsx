import { Tooltip as RadixTooltip } from 'radix-ui';
import type { ReactNode } from 'react';

/** Wrap the app (or story) once; tooltips share its open delay. */
export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>;
}

export interface TooltipProps {
  /** Supplementary only: never the sole place essential information appears. */
  content: ReactNode;
  /** A single focusable element. */
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

/** Shows on hover and focus; Esc dismisses (COMPONENT_LIBRARY §1). */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-xs rounded-sm bg-text px-2 py-1 text-body-sm text-bg shadow-md"
        >
          {content}
          <RadixTooltip.Arrow className="fill-text" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}

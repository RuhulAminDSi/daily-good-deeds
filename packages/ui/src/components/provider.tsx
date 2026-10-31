'use client';

import { type ReactNode, useMemo } from 'react';
import { type Ui, UiContext } from '../lib/ui';
import { ToastProvider } from './toast';
import { TooltipProvider } from './tooltip';

export type { UiStrings } from '../lib/ui';

/** Wrap the app once: locale and shared strings, plus the tooltip and toast machinery. */
export function UiProvider({ locale, strings, children }: Ui & { children: ReactNode }) {
  const ui = useMemo(() => ({ locale, strings }), [locale, strings]);
  return (
    <UiContext value={ui}>
      <TooltipProvider>
        <ToastProvider>{children}</ToastProvider>
      </TooltipProvider>
    </UiContext>
  );
}

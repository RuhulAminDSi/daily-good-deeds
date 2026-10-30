'use client';

import { createContext, type ReactNode, use } from 'react';
import type { Messages } from './dictionary';
import type { Locale } from './locales';

type BoundaryMessages = { locale: Locale; common: Messages['common'] };

const Context = createContext<BoundaryMessages | null>(null);

/**
 * Gives the client-side error and not-found boundaries only the strings they need, so the
 * full dictionaries are not shipped to the browser. Replaced by next-intl in T-P2-I18N-001.
 */
export function BoundaryMessagesProvider({
  value,
  children,
}: {
  value: BoundaryMessages;
  children: ReactNode;
}) {
  return <Context value={value}>{children}</Context>;
}

export function useBoundaryMessages(): BoundaryMessages {
  const value = use(Context);
  if (!value) throw new Error('useBoundaryMessages must be used inside BoundaryMessagesProvider');
  return value;
}

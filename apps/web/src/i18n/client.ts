import { useTranslations } from 'next-intl';
import type { CLIENT_NAMESPACES } from './client-namespaces';

export type ClientNamespace = (typeof CLIENT_NAMESPACES)[number];

/**
 * `useTranslations` for client components, limited at compile time to the namespaces sent to the
 * browser: any other namespace is a type error instead of a raw key on screen. Lint bans importing
 * next-intl's `useTranslations` anywhere else in the app.
 */
export const useClientTranslations = <N extends ClientNamespace>(namespace: N) =>
  useTranslations(namespace);

import type { Messages } from '@dgd/i18n/messages';

/**
 * Catalog namespaces sent to the browser (src/app/[locale]/layout.tsx); the rest stay on the
 * server. Client components translate with `useClientTranslations` (src/i18n/client.ts), which only
 * accepts these namespaces; server components use `getTranslations`.
 */
export const CLIENT_NAMESPACES = [
  'common',
  'errors',
  'inApp',
  'install',
  'language',
  'nav',
  'pwa',
  'theme',
  'validation',
] as const satisfies (keyof Messages)[];

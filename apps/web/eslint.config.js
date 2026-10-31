import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig } from 'eslint/config';
import base from '@dgd/config/eslint';
import ui from '@dgd/config/eslint/ui';

// Next's preset parses .js/.mjs with Babel; listing our base last switches those files to the
// TypeScript parser that typescript-eslint rules need. No Next rules are lost.
export default defineConfig(
  nextVitals,
  base,
  ui,
  {
    ignores: [
      '.next/**',
      '.next-e2e/**',
      'next-env.d.ts',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  {
    // Client translations go through useClientTranslations (src/i18n/client.ts), which only accepts
    // the namespaces sent to the browser.
    ignores: ['src/i18n/client.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next-intl',
              importNames: ['useTranslations'],
              message: 'Use useClientTranslations from @/i18n/client.',
            },
          ],
        },
      ],
    },
  },
);

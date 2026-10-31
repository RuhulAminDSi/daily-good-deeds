import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig } from 'eslint/config';
import base from '@dgd/config/eslint';
import tokens from '@dgd/config/eslint/tokens';

// Next's preset parses .js/.mjs with Babel; listing our base last switches those files to the
// TypeScript parser that typescript-eslint rules need. No Next rules are lost.
export default defineConfig(nextVitals, base, tokens, {
  ignores: ['.next/**', '.next-e2e/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'],
});

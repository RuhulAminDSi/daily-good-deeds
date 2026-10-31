import nextVitals from 'eslint-config-next/core-web-vitals';
import { defineConfig } from 'eslint/config';
import base from '@dgd/config/eslint';

// Colours come only from @dgd/tokens (DESIGN_SYSTEM §3). Tailwind's default palette is removed, so
// a class like `bg-emerald-700` would silently render unstyled; arbitrary hex values bypass themes.
const RAW_COLOR = String.raw`/(^|[ :])(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|divide|placeholder|accent|caret)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)([-/ ]|$)|\[#[0-9a-fA-F]{3,8}\]/`;
const message = 'Use a design token (docs/design/COLOR_TOKENS.md), not a raw colour.';

// Next's preset parses .js/.mjs with Babel; listing our base last switches those files to the
// TypeScript parser that typescript-eslint rules need. No Next rules are lost.
export default defineConfig(
  nextVitals,
  base,
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
    files: ['src/**/*.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=${RAW_COLOR}]`, message },
        { selector: `TemplateElement[value.raw=${RAW_COLOR}]`, message },
      ],
    },
  },
);

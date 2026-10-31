// Colours come only from @dgd/tokens (DESIGN_SYSTEM §3). The tokens theme removes Tailwind's default
// palette, so a class like `bg-emerald-700` would silently render unstyled; arbitrary hex values
// bypass the themes. Applies to JSX files of every UI package.
import { defineConfig } from 'eslint/config';

const RAW_COLOR = String.raw`/(^|[ :])(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|divide|placeholder|accent|caret)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)([-/ ]|$)|\[#[0-9a-fA-F]{3,8}\]/`;
const message = 'Use a design token (docs/design/COLOR_TOKENS.md), not a raw colour.';

export default defineConfig({
  files: ['**/*.tsx'],
  rules: {
    'no-restricted-syntax': [
      'error',
      { selector: `Literal[value=${RAW_COLOR}]`, message },
      { selector: `TemplateElement[value.raw=${RAW_COLOR}]`, message },
    ],
  },
});

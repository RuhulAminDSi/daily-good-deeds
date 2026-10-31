// Lint for UI code (apps/web, packages/ui): design tokens only (no raw colours) and no hard-coded
// user-facing text. Rules and allowlist: docs/qa/I18N.md and DESIGN_SYSTEM §3. Two file scopes that
// never overlap, so the shared `no-restricted-syntax` rule is set exactly once per file.
import { defineConfig } from 'eslint/config';

// Raw colours: Tailwind's default palette is removed by @dgd/tokens, so a class like
// `bg-emerald-700` would silently render unstyled; arbitrary hex values bypass the themes.
const RAW_COLOR = String.raw`/(^|[ :])(bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|divide|placeholder|accent|caret)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)([-/ ]|$)|\[#[0-9a-fA-F]{3,8}\]/`;
const colourMessage = 'Use a design token (docs/design/COLOR_TOKENS.md), not a raw colour.';
const COLOURS = [
  { selector: `Literal[value=${RAW_COLOR}]`, message: colourMessage },
  { selector: `TemplateElement[value.raw=${RAW_COLOR}]`, message: colourMessage },
];

// Literal text: letters (Latin or Bengali) as JSX text, as a JSX child expression, or as the
// value of a user-visible attribute, directly or in a conditional branch. One level deep only,
// so translation keys inside `t('…')` calls are not flagged.
const LETTERS = '/[A-Za-zঀ-৿]/';
const VISIBLE =
  'JSXAttribute[name.name=/^(aria-label|aria-description|title|placeholder|alt|label)$/]';
const textMessage = 'User-facing text must come from the i18n catalogs (or a prop), not a literal.';
const VALUE = (parent) => [
  `${parent} > Literal[value=${LETTERS}]`,
  `${parent} > TemplateLiteral > TemplateElement[value.raw=${LETTERS}]`,
  `${parent} > ConditionalExpression > Literal[value=${LETTERS}]`,
];
const TEXT = [
  `JSXText[value=${LETTERS}]`,
  ...VALUE('JSXElement > JSXExpressionContainer'),
  ...VALUE(`${VISIBLE} > JSXExpressionContainer`),
  `${VISIBLE} > Literal[value=${LETTERS}]`,
].map((selector) => ({ selector, message: textMessage }));

/** Stories and E2E-only routes hold sample copy; they still use tokens. */
const SAMPLE_FILES = ['**/*.stories.tsx', '**/*.e2e.tsx'];

export default defineConfig(
  {
    files: ['**/*.tsx'],
    ignores: SAMPLE_FILES,
    rules: { 'no-restricted-syntax': ['error', ...COLOURS, ...TEXT] },
  },
  { files: SAMPLE_FILES, rules: { 'no-restricted-syntax': ['error', ...COLOURS] } },
);

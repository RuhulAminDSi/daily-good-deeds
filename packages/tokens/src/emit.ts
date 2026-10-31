// Build step (`pnpm build`): writes dist/tokens.css and the Android colour resources.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { toColorsXml } from './android.js';
import { toCss } from './css.js';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

const write = (path: string, content: string) => {
  const file = join(DIST, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
};

write('tokens.css', toCss());
write('android/values/colors.xml', toColorsXml('light'));
write('android/values-night/colors.xml', toColorsXml('dark'));

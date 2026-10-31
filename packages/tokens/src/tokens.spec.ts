// The design docs are the specification: these tests fail when the code and
// docs/design/COLOR_TOKENS.md disagree, or when any documented pair drops below its WCAG threshold.
import { readFileSync } from 'node:fs';
import { toAndroidColor, toColorsXml } from './android.js';
import { contrastRatio } from './contrast.js';
import { toCss } from './css.js';
import { COLORS, type ColorName, THEMES } from './tokens.js';

const doc = readFileSync(
  new URL('../../../docs/design/COLOR_TOKENS.md', import.meta.url),
  'utf8',
).replaceAll('\r\n', '\n');

/** The table rows (cells, trimmed) of the section starting at `heading`, up to the next heading. */
function rows(heading: string): string[][] {
  const start = doc.indexOf(heading);
  if (start < 0) throw new Error(`COLOR_TOKENS.md has no "${heading}"`);
  const rest = doc.slice(start + heading.length);
  const end = rest.search(/\n#{2,4} /);
  return (end < 0 ? rest : rest.slice(0, end))
    .split('\n')
    .filter((l) => l.startsWith('|') && !/^\|\s*[-:]/.test(l))
    .slice(1) // header row
    .map((l) =>
      l
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim()),
    );
}

/** Every `code` span in a cell. */
const codes = (cell: string) => [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);

describe('tokens match docs/design/COLOR_TOKENS.md', () => {
  it.each([
    ['### 2.1 Light theme', 'light'],
    ['### 2.2 Dark theme', 'dark'],
  ] as const)('%s', (heading, theme) => {
    const documented = rows(heading).map(([token, value]) => [
      codes(token!)[0]!.replace('--color-', ''),
      codes(value!)[0]!,
    ]);
    const semantic = Object.keys(COLORS).filter((n) => !/^(heat|chart)-/.test(n));
    expect(documented.map(([n]) => n).sort()).toEqual(semantic.sort());
    for (const [name, value] of documented) expect(COLORS[name as ColorName][theme]).toBe(value);
  });

  it.each([
    ['### 3.1', (level: string) => `heat-${level}`],
    ['### 3.2', (id: string) => `chart-${id.slice(1)}`],
  ] as const)('data-visualization palette %s', (heading, tokenOf) => {
    for (const [id, , light, dark] of rows(heading)) {
      const { light: l, dark: d } = COLORS[tokenOf(id!) as ColorName];
      expect([l, d]).toEqual([codes(light!)[0], codes(dark!)[0]]);
    }
  });
});

/** "`a` / `b`" → [[a], b]; "`chart-1`–`chart-8` / `surface`" expands the foreground range. */
function pairTokens(label: string): [ColorName[], ColorName] {
  const [fg, bg] = label.split(' / ').map(codes) as [string[], string[]];
  const [first, last = first] = fg as [string, string?];
  const num = (token: string) => Number(/\d+$/.exec(token)?.[0] ?? 0);
  const fgs = Array.from({ length: num(last!) - num(first) + 1 }, (_, i) =>
    last === first ? first : `${first.replace(/\d+$/, '')}${num(first) + i}`,
  );
  return [fgs as ColorName[], bg[0] as ColorName];
}

describe('documented contrast pairs (COLOR_TOKENS §4) meet WCAG 2.2', () => {
  // §4.1 text needs 4.5:1 (SC 1.4.3); §4.2 non-text UI needs 3:1 (SC 1.4.11).
  const table = (heading: string, threshold: number) =>
    rows(heading).map(([label, light, dark]) => ({
      label: label!,
      documented: [light!, dark!],
      threshold,
    }));
  const cases = [...table('### 4.1 Text pairs', 4.5), ...table('### 4.2 Non-text UI pairs', 3)];

  it.each(cases)('$label', ({ label, documented: byTheme, threshold }) => {
    const [fgs, bg] = pairTokens(label);
    for (const name of [...fgs, bg]) expect(COLORS[name], `unknown token ${name}`).toBeDefined();
    THEMES.forEach((theme, i) => {
      const ratios = fgs.map((fg) => contrastRatio(COLORS[fg][theme], COLORS[bg][theme]));
      for (const r of ratios) expect(r).toBeGreaterThanOrEqual(threshold);
      // The documented ratio (or "min – max" range) is what the tokens produce.
      const documented = byTheme[i]!.split('–').map((s) => Number.parseFloat(s));
      const actual = documented.length === 2 ? [Math.min(...ratios), Math.max(...ratios)] : ratios;
      expect(actual.map((r) => r.toFixed(2))).toEqual(documented.map((d) => d.toFixed(2)));
    });
  });
});

describe('outputs', () => {
  const css = toCss();

  it('defines every colour for both themes, with the system default and explicit overrides', () => {
    for (const [name, { light, dark }] of Object.entries(COLORS)) {
      expect(css).toContain(`--color-${name}: ${light};`);
      expect(css).toContain(`--color-${name}: ${dark};`);
    }
    expect(css).toContain(
      "@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light'])",
    );
    expect(css).toContain(":root[data-theme='dark']");
    expect(css).toContain('--color-*: initial;');
  });

  it('gives Bengali taller lines and a 13px caption minimum', () => {
    const bn = css.slice(css.indexOf(':root:lang(bn)'));
    expect(bn).toContain('--text-body--line-height: 1.7;');
    expect(bn).toContain('--text-caption: 0.8125rem;');
  });

  it('exports Android colours as #AARRGGBB, including translucent ones', () => {
    expect(toAndroidColor('#2F6B47')).toBe('#FF2F6B47');
    expect(toAndroidColor('rgba(31,42,36,0.48)')).toBe('#7A1F2A24');
    expect(toColorsXml('dark')).toContain('<color name="dgd_primary">#FF6FBF8A</color>');
    expect(toColorsXml('light')).toContain('<color name="dgd_text_muted">#FF56615A</color>');
  });
});

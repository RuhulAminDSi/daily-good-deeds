import { isLocale, LOCALES } from './index.js';
import { MESSAGES, translator } from './messages.js';

/** Every message as [dotted key, value]: [["nav.today", "Today"], …]. */
const leaves = (tree: object, prefix = ''): [string, unknown][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? leaves(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value] as [string, unknown]],
  );

describe('catalogs', () => {
  it('have the same keys in every locale', () => {
    const keysOf = (locale: (typeof LOCALES)[number]) =>
      leaves(MESSAGES[locale])
        .map(([k]) => k)
        .sort();
    for (const locale of LOCALES) expect(keysOf(locale)).toEqual(keysOf('en'));
  });

  it('have no empty messages', () => {
    for (const locale of LOCALES) {
      const empty = leaves(MESSAGES[locale])
        .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
        .map(([key]) => key);
      expect(empty, locale).toEqual([]);
    }
  });
});

describe('translator (API and worker side)', () => {
  it('translates typed keys in both locales', () => {
    expect(translator('en')('nav.today')).toBe('Today');
    expect(translator('bn')('nav.today')).toBe('আজ');
  });

  it('validates locales', () => {
    expect(isLocale('bn')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });
});

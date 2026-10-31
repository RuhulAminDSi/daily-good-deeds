import { createTranslator } from 'use-intl/core';
import { isLocale } from './index.js';
import {
  assertComplete,
  MISSING_KEYS,
  MissingTranslationsError,
  reportMissingTranslations,
  translator,
  withFallback,
} from './messages.js';
import bn from './messages/bn.json' with { type: 'json' };
import en from './messages/en.json' with { type: 'json' };

describe('catalogs', () => {
  it('are complete: no locale falls back to English', () => {
    expect(MISSING_KEYS).toEqual({ en: [], bn: [] });
  });

  it('have no keys English lacks', () => {
    expect(withFallback(en, bn).missing).toEqual([]);
  });

  it('have no empty English messages', () => {
    expect(withFallback(en, en).missing).toEqual([]);
  });
});

// T-P2-I18N-007 (F-I18N-009): a missing BN message renders in English and is reported once.
describe('fallback', () => {
  const reference = {
    nav: { today: 'Today', more: 'More' },
    extra: { n: '{count, number} items' },
  };
  const partial = { nav: { today: 'আজ', more: ' ' } };
  const { messages, missing } = withFallback(partial, reference);
  const missingBn = { en: [], bn: missing };

  it('fills missing and blank messages from English and lists them', () => {
    expect(missing).toEqual(['nav.more', 'extra.n']);
    const t = createTranslator({ locale: 'bn', messages: messages as typeof reference });
    expect(t('nav.today')).toBe('আজ');
    expect(t('nav.more')).toBe('More');
    expect(t('extra.n', { count: 3 })).toBe('৩ items');
  });

  it('throws in dev mode', () => {
    expect(() => assertComplete('bn', missingBn)).toThrow(MissingTranslationsError);
    expect(() => assertComplete('en', missingBn)).not.toThrow();
  });

  it('reports one event per incomplete locale, tagged with it', () => {
    const report = vi.fn();
    reportMissingTranslations({ report }, missingBn);
    expect(report).toHaveBeenCalledOnce();
    expect(report.mock.calls[0]![1]).toEqual({ tags: { locale: 'bn' } });
    expect(report.mock.calls[0]![0]).toMatchObject({ locale: 'bn', keys: ['nav.more', 'extra.n'] });
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

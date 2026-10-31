import {
  defaultNumerals,
  type FormatContext,
  formatCode,
  formatDate,
  formatHijri,
  formatNumber,
  formatRelative,
  formatTime,
} from './format.js';

// 31 Oct 2026, 14:30 in Dhaka (UTC+6).
const AT = new Date('2026-10-31T08:30:00Z');
const DHAKA = 'Asia/Dhaka';
const en: FormatContext = { locale: 'en', timeZone: DHAKA };
const bn: FormatContext = { locale: 'bn', timeZone: DHAKA };
const bnLatin: FormatContext = { ...bn, numerals: 'latn' };
const enBengali: FormatContext = { ...en, numerals: 'beng' };

describe('numerals', () => {
  it('default to the locale: Bengali digits in bn, Latin in en', () => {
    expect(defaultNumerals('bn')).toBe('beng');
    expect(defaultNumerals('en')).toBe('latn');
  });
});

describe('formatNumber', () => {
  it('groups the Bangladeshi way in bn (lakh, crore) and the Western way in en', () => {
    expect(formatNumber(bn, 1234567.5)).toBe('১২,৩৪,৫৬৭.৫');
    expect(formatNumber(en, 1234567.5)).toBe('1,234,567.5');
  });

  it('follows the digit preference in either language', () => {
    expect(formatNumber(bnLatin, 1234567)).toBe('12,34,567');
    expect(formatNumber(enBengali, 42)).toBe('৪২');
  });

  it('passes Intl options through (percent, currency)', () => {
    expect(formatNumber(bn, 0.6, { style: 'percent' })).toBe('৬০%');
    // Intl puts a no-break space between code and amount.
    expect(formatNumber(en, 2.5, { style: 'currency', currency: 'BDT' })).toBe('BDT 2.50');
  });
});

describe('formatCode', () => {
  it('keeps codes in Latin digits without grouping, whatever the preference', () => {
    expect(formatCode('004217')).toBe('004217');
  });
});

describe('formatter cache', () => {
  it('gives the same results when formatters are reused across contexts', () => {
    expect([formatNumber(bn, 5), formatNumber(en, 5), formatNumber(bn, 5)]).toEqual([
      '৫',
      '5',
      '৫',
    ]);
  });
});

describe('formatDate and formatTime', () => {
  it('formats in the user time zone with localized month names and digits', () => {
    expect(formatDate(en, AT)).toBe('31 Oct 2026');
    expect(formatDate(bn, AT)).toBe('৩১ অক্টো, ২০২৬');
    expect(formatDate(bn, AT, 'full')).toBe('শনিবার, ৩১ অক্টোবর, ২০২৬');
    expect(formatDate(bnLatin, AT, 'full')).toBe('শনিবার, 31 অক্টোবর, 2026');
  });

  it('uses the user time zone for the calendar day', () => {
    const lateEvening = new Date('2026-10-31T19:30:00Z'); // 01:30 on 1 Nov in Dhaka
    expect(formatDate(en, lateEvening)).toBe('1 Nov 2026');
    expect(formatDate({ locale: 'en', timeZone: 'UTC' }, lateEvening)).toBe('31 Oct 2026');
  });

  it('shows times on the 12-hour clock', () => {
    expect(formatTime(en, AT)).toBe('2:30 pm');
    expect(formatTime(bn, AT)).toBe('২:৩০ PM');
  });
});

describe('formatRelative', () => {
  it('uses words where natural and localized digits otherwise', () => {
    expect(formatRelative(en, -1, 'day')).toBe('yesterday');
    expect(formatRelative(bn, -1, 'day')).toBe('গতকাল');
    expect(formatRelative(en, 3, 'hour')).toBe('in 3 hours');
    expect(formatRelative(bn, 3, 'hour')).toBe('৩ ঘণ্টায়');
  });
});

describe('formatHijri (stub for the Islamic module, P5)', () => {
  it('formats Umm al-Qura dates with the era as written in Bangladesh', () => {
    expect(formatHijri(en, AT)).toBe('20 Jumada I 1448 AH');
    expect(formatHijri(bn, AT)).toBe('২০ জমাদিউল আউয়াল, ১৪৪৮ হিজরি');
  });

  it('applies the moon-sighting offset in days', () => {
    expect(formatHijri(en, AT, -1)).toBe('19 Jumada I 1448 AH');
    expect(formatHijri(en, AT, 1)).toBe('21 Jumada I 1448 AH');
  });
});

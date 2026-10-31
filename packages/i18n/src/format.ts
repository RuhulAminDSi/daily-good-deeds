// Locale formatting (F-I18N-004, TYPOGRAPHY §4–5) for web, API and worker. Every user-visible number,
// date and time goes through these, never `.toString()` or a hand-built string. Browser-safe: no
// catalogs are imported here.
import type { Locale } from './index.js';

/** Digits: Latin (0-9) or Bengali (০-৯). The user's `numeral_system` preference. */
export type Numerals = 'latn' | 'beng';

export interface FormatContext {
  locale: Locale;
  /** Defaults to the locale's own: Bengali digits for `bn`, Latin for `en`. */
  numerals?: Numerals;
  /** IANA zone of the user (dates and "today" are local to it); defaults to the runtime's. */
  timeZone?: string;
}

/** BCP 47 tags: `bn-BD` for Bangladeshi conventions (Indian grouping ১২,৩৪,৫৬৭). */
const TAG: Record<Locale, string> = { en: 'en-GB', bn: 'bn-BD' };

export const defaultNumerals = (locale: Locale): Numerals => (locale === 'bn' ? 'beng' : 'latn');

/** Locale tag with the digit system as a Unicode extension (`bn-BD-u-nu-latn`): works for every
 *  Intl formatter, and for calendars (`-u-ca-…-nu-…`). */
const tag = (ctx: FormatContext, calendar?: string) =>
  `${TAG[ctx.locale]}-u-${calendar ? `ca-${calendar}-` : ''}nu-${ctx.numerals ?? defaultNumerals(ctx.locale)}`;

/** Intl formatters are costly to build: one per (kind, tag, options), reused across calls. */
const cache = new Map<string, unknown>();
function cached<T>(kind: string, tagged: string, options: object, create: () => T): T {
  const key = `${kind}|${tagged}|${JSON.stringify(options)}`;
  let value = cache.get(key) as T | undefined;
  if (!value) cache.set(key, (value = create()));
  return value;
}

const numberFormat = (ctx: FormatContext, options: Intl.NumberFormatOptions = {}) =>
  cached('n', tag(ctx), options, () => new Intl.NumberFormat(tag(ctx), options));
const dateFormat = (ctx: FormatContext, options: Intl.DateTimeFormatOptions, calendar?: string) =>
  cached(
    'd',
    tag(ctx, calendar),
    options,
    () => new Intl.DateTimeFormat(tag(ctx, calendar), options),
  );

export function formatNumber(
  ctx: FormatContext,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return numberFormat(ctx, options).format(value);
}

/**
 * Codes that are copied or typed elsewhere (OTP/TOTP, IDs, audit timestamps) always use Latin
 * digits and no grouping, whatever the preference, so they are never ambiguous (TYPOGRAPHY §4).
 * Strings only: a code held as a number loses leading zeros (004217 → 4217). It marks the intent
 * at call sites; the value is shown as is.
 */
export const formatCode = (value: string): string => value;

export type DateStyle = 'short' | 'medium' | 'long' | 'full';

export function formatDate(ctx: FormatContext, date: Date, style: DateStyle = 'medium'): string {
  return dateFormat(ctx, { dateStyle: style, timeZone: ctx.timeZone }).format(date);
}

/** Hours and minutes on the 12-hour clock used in Bangladesh ("2:30 pm", "২:৩০ PM"). */
export function formatTime(ctx: FormatContext, date: Date): string {
  return dateFormat(ctx, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: ctx.timeZone,
  }).format(date);
}

/** "yesterday", "in 3 hours", "গতকাল", "৩ ঘণ্টায়". */
export function formatRelative(
  ctx: FormatContext,
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
): string {
  const options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' };
  return cached(
    'r',
    tag(ctx),
    options,
    () => new Intl.RelativeTimeFormat(tag(ctx), options),
  ).format(value, unit);
}

/** The Hijri era as Bangladeshi users write it (CLDR's Bengali "যুগ" is just the generic "era"). */
const HIJRI_ERA: Record<Locale, string> = { en: 'AH', bn: 'হিজরি' };
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Hijri date (Umm al-Qura), shown as a second line under Gregorian dates (TYPOGRAPHY §5).
 * `offsetDays` is the user's moon-sighting adjustment (F-ISL-013, −2…+2). The Islamic module (P5)
 * adds the preference and the content review of this output. The offset adds whole 24-hour
 * days: exact in Bangladesh (no DST); P5 shifts by calendar days if DST zones need it.
 */
export function formatHijri(ctx: FormatContext, date: Date, offsetDays = 0): string {
  const shifted = new Date(date.getTime() + offsetDays * DAY_MS);
  return dateFormat(ctx, { dateStyle: 'long', timeZone: ctx.timeZone }, 'islamic-umalqura')
    .formatToParts(shifted)
    .map((part) => (part.type === 'era' ? HIJRI_ERA[ctx.locale] : part.value))
    .join('');
}

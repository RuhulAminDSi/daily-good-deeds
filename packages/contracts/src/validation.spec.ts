import { z } from 'zod';
import { LOCALES } from '@dgd/i18n';
import { translator } from '@dgd/i18n/messages';
import { ERROR_CODES, type ErrorCode, i18nKeyOf } from './errors.js';
import { fieldErrorFromIssue, VALIDATION_KEYS } from './validation.js';

const fieldErrors = (schema: z.ZodType, input: unknown) =>
  schema.safeParse(input).error!.issues.map(fieldErrorFromIssue);

describe('Zod issues as field errors', () => {
  it('reports a missing value as required, a wrong type as invalid_type', () => {
    const schema = z.object({ title: z.string(), count: z.number() });
    expect(fieldErrors(schema, { count: 'x' })).toEqual([
      { pointer: '/title', code: 'required', i18nKey: 'validation.required' },
      { pointer: '/count', code: 'invalid_type', i18nKey: 'validation.invalid_type' },
    ]);
  });

  it('passes ICU params: bounds with their origin, formats, unknown keys', () => {
    const schema = z.strictObject({
      title: z.string().max(5),
      tags: z.array(z.string()).min(1),
      email: z.email(),
    });
    expect(fieldErrors(schema, { title: 'too long', tags: [], email: 'x', extra: 1 })).toEqual([
      expect.objectContaining({ pointer: '/title', params: { max: 5, origin: 'string' } }),
      expect.objectContaining({ pointer: '/tags', params: { min: 1, origin: 'array' } }),
      expect.objectContaining({ code: 'invalid_format', params: { format: 'email' } }),
      expect.objectContaining({
        pointer: '',
        code: 'unrecognized_keys',
        params: { keys: 'extra' },
      }),
    ]);
  });

  it('uses a schema-provided key as both code and i18nKey, but not plain prose', () => {
    const keyed = z.string().refine((s) => s.length > 7, { error: 'validation.password_weak' });
    expect(fieldErrors(keyed, 'short')).toEqual([
      { pointer: '', code: 'password_weak', i18nKey: 'validation.password_weak' },
    ]);
    const prose = z.string().min(8, 'Too short');
    expect(fieldErrors(prose, 'short')[0]).toMatchObject({ i18nKey: 'validation.too_small' });
  });

  it('escapes JSON pointer segments (RFC 6901)', () => {
    const schema = z.object({ 'a/b~c': z.array(z.string()) });
    expect(fieldErrors(schema, { 'a/b~c': [1] })[0]?.pointer).toBe('/a~1b~0c/0');
  });
});

// ERROR_HANDLING §4 / F-I18N-007 AC: every code and every validation key has EN and BN text.
describe.each(LOCALES)('%s catalog', (locale) => {
  const t = translator(locale);
  const has = (key: string) => t.has(key as Parameters<typeof t.has>[0]);

  it('has a message for every error code', () => {
    const missing = (Object.keys(ERROR_CODES) as ErrorCode[]).map(i18nKeyOf).filter((k) => !has(k));
    expect(missing).toEqual([]);
  });

  it('has a message for every validation key, renderable with its params', () => {
    expect(VALIDATION_KEYS.filter((k) => !has(k))).toEqual([]);
    const render = (key: string, params: Record<string, string | number>) =>
      t(key as Parameters<typeof t>[0], params);
    expect(render('validation.too_big', { max: 120, origin: 'string' })).toMatch(
      locale === 'bn' ? /১২০/ : /120 characters/,
    );
    expect(render('validation.too_small', { min: 1, origin: 'array' })).toMatch(
      locale === 'bn' ? /১/ : /1 item\./,
    );
  });
});

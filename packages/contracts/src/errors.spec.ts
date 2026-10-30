import { CODE_BY_STATUS, ERROR_CODES, i18nKeyOf, ProblemSchema, typeUriOf } from './errors.js';

describe('error catalog', () => {
  it('maps each status to its first (generic) code', () => {
    expect(CODE_BY_STATUS.get(400)).toBe('VALIDATION_FAILED');
    expect(CODE_BY_STATUS.get(404)).toBe('RESOURCE_NOT_FOUND');
    expect(CODE_BY_STATUS.get(503)).toBe('DEPENDENCY_UNAVAILABLE');
  });

  it('derives stable i18n keys and type URIs', () => {
    expect(i18nKeyOf('MALFORMED_JSON')).toBe('errors.malformed_json');
    expect(typeUriOf('MALFORMED_JSON')).toBe(
      'https://docs.dailygooddeeds.app/errors/malformed-json',
    );
  });

  it('has only UPPER_SNAKE codes with 4xx/5xx statuses', () => {
    for (const [code, { status }] of Object.entries(ERROR_CODES)) {
      expect(code).toMatch(/^[A-Z]+(_[A-Z]+)*$/);
      expect(status).toBeGreaterThanOrEqual(400);
    }
  });
});

describe('ProblemSchema', () => {
  it('accepts an API problem with extension members', () => {
    const problem = {
      type: typeUriOf('DEPENDENCY_UNAVAILABLE'),
      title: 'A service is temporarily unavailable',
      status: 503,
      code: 'DEPENDENCY_UNAVAILABLE',
      i18nKey: 'errors.dependency_unavailable',
      checks: { db: 'fail' },
    };
    expect(ProblemSchema.parse(problem)).toMatchObject({ checks: { db: 'fail' } });
  });

  it('rejects an unknown code', () => {
    expect(() =>
      ProblemSchema.parse({ type: 'x', title: 'x', status: 400, code: 'NOPE', i18nKey: 'x' }),
    ).toThrow();
  });
});

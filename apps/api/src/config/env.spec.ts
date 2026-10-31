import { DEV_WEB_ORIGINS, InvalidConfigError, loadConfig } from './env.js';

const DATABASE_URL = 'postgresql://u:p@localhost:5432/dgd';

describe('loadConfig', () => {
  it('applies defaults', () => {
    expect(loadConfig({ DATABASE_URL })).toEqual({
      NODE_ENV: 'development',
      PORT: 4000,
      LOG_LEVEL: 'info',
      APP_RELEASE: 'dev',
      DATABASE_URL,
      DB_POOL_MAX: 5,
      TRUST_PROXY: 0,
      WEB_ORIGINS: DEV_WEB_ORIGINS,
    });
  });

  it('coerces numbers from strings', () => {
    expect(loadConfig({ DATABASE_URL, PORT: '8080' }).PORT).toBe(8080);
  });

  it('aborts on invalid values and names every bad key', () => {
    const run = () =>
      loadConfig({ PORT: 'not-a-port', NODE_ENV: 'staging', DATABASE_URL: 'mysql://x/y' });
    expect(run).toThrow(InvalidConfigError);
    expect(run).toThrow(/PORT/);
    expect(run).toThrow(/NODE_ENV/);
    expect(run).toThrow(/DATABASE_URL/);
  });

  it('requires DATABASE_URL', () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
  });

  it('requires certificate verification for remote databases', () => {
    const remote = 'postgresql://u:p@db.example.com/dgd';
    expect(() => loadConfig({ DATABASE_URL: `${remote}?sslmode=require` })).toThrow(/verify-full/);
    expect(() => loadConfig({ DATABASE_URL: remote })).toThrow(/verify-full/);
    expect(loadConfig({ DATABASE_URL: `${remote}?sslmode=verify-full` }).DATABASE_URL).toContain(
      'verify-full',
    );
  });

  it('requires WEB_ORIGINS and TRUST_PROXY in production and validates them', () => {
    const prod = { NODE_ENV: 'production', DATABASE_URL };
    const run = () => loadConfig(prod);
    expect(run).toThrow(/WEB_ORIGINS/);
    expect(run).toThrow(/TRUST_PROXY/);
    expect(() => loadConfig({ ...prod, TRUST_PROXY: '1', WEB_ORIGINS: 'not a url' })).toThrow(
      /WEB_ORIGINS/,
    );
    const ok = loadConfig({
      ...prod,
      TRUST_PROXY: '0',
      WEB_ORIGINS: 'https://a.example, https://b.example',
    });
    expect(ok.WEB_ORIGINS).toEqual(['https://a.example', 'https://b.example']);
    expect(ok.TRUST_PROXY).toBe(0); // explicit 0 is allowed (API exposed directly)
  });
});

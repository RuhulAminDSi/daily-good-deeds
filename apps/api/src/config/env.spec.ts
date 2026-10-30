import { InvalidConfigError, loadConfig } from './env.js';

const DATABASE_URL = 'postgresql://u:p@localhost:5432/dgd';

describe('loadConfig', () => {
  it('applies defaults', () => {
    expect(loadConfig({ DATABASE_URL })).toEqual({
      NODE_ENV: 'development',
      PORT: 4000,
      LOG_LEVEL: 'info',
      DATABASE_URL,
      DB_POOL_MAX: 5,
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
});

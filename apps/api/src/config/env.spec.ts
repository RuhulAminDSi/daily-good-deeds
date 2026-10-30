import { InvalidConfigError, loadConfig } from './env.js';

describe('loadConfig', () => {
  it('applies defaults for an empty environment', () => {
    expect(loadConfig({})).toEqual({ NODE_ENV: 'development', PORT: 4000, LOG_LEVEL: 'info' });
  });

  it('coerces PORT from a string', () => {
    expect(loadConfig({ PORT: '8080' }).PORT).toBe(8080);
  });

  it('aborts on invalid values and names every bad key', () => {
    const run = () => loadConfig({ PORT: 'not-a-port', NODE_ENV: 'staging' });
    expect(run).toThrow(InvalidConfigError);
    expect(run).toThrow(/PORT/);
    expect(run).toThrow(/NODE_ENV/);
  });
});

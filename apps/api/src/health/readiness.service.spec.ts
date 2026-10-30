import { ReadinessService } from './readiness.service.js';

describe('ReadinessService', () => {
  it('reports nothing when there are no checks', async () => {
    expect(await new ReadinessService().run()).toEqual({});
  });

  it('reports each check', async () => {
    const readiness = new ReadinessService();
    readiness.register('db', async () => {});
    readiness.register('email', async () => {
      throw new Error('down');
    });
    expect(await readiness.run()).toEqual({ db: 'ok', email: 'fail' });
  });

  it('fails a check that hangs past the timeout', async () => {
    vi.useFakeTimers();
    try {
      const readiness = new ReadinessService();
      readiness.register('slow', () => new Promise(() => {}));
      const report = readiness.run();
      await vi.advanceTimersByTimeAsync(5000);
      expect(await report).toEqual({ slow: 'fail' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('reuses a recent result instead of re-running checks', async () => {
    const readiness = new ReadinessService();
    const check = vi.fn(async () => {});
    readiness.register('db', check);
    await readiness.run();
    await readiness.run();
    expect(check).toHaveBeenCalledTimes(1);
  });
});

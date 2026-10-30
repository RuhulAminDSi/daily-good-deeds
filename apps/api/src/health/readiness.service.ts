import { Injectable } from '@nestjs/common';

/** Resolves when the dependency is usable; rejects (or times out) otherwise. */
export type ReadinessCheck = () => Promise<void>;
type Status = 'ok' | 'fail';

const CHECK_TIMEOUT_MS = 5000;
/** Probes arrive every few seconds; reuse a recent result instead of re-querying dependencies. */
const CACHE_MS = 10_000;

async function settle(check: ReadinessCheck): Promise<Status> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), CHECK_TIMEOUT_MS).unref();
  });
  try {
    await Promise.race([check(), timeout]);
    return 'ok';
  } catch {
    return 'fail';
  } finally {
    clearTimeout(timer);
  }
}

/** Modules register their dependency checks here; GET /health/ready runs them all. */
@Injectable()
export class ReadinessService {
  private readonly checks = new Map<string, ReadinessCheck>();
  private cached?: { at: number; result: Promise<Record<string, Status>> };

  register(name: string, check: ReadinessCheck): void {
    this.checks.set(name, check);
    this.cached = undefined;
  }

  /** Status per registered check, e.g. `{ db: 'ok' }`. */
  run(): Promise<Record<string, Status>> {
    if (!this.cached || Date.now() - this.cached.at > CACHE_MS) {
      const result = Promise.all(
        [...this.checks].map(async ([name, check]) => [name, await settle(check)] as const),
      ).then(Object.fromEntries);
      this.cached = { at: Date.now(), result };
    }
    return this.cached.result;
  }
}

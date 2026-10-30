import { InvalidConfigError } from './env.js';

/** Runs a process entrypoint; any boot failure exits non-zero (config errors without a stack). */
export function runOrExit(bootstrap: () => Promise<unknown>): void {
  bootstrap().catch((err: unknown) => {
    // The logger may not exist yet, so boot failures go to stderr.
    console.error(err instanceof InvalidConfigError ? err.message : err);
    process.exit(1);
  });
}

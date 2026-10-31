/**
 * Runs a browser access that may throw, or returns `fallback`: Web Storage when it is unavailable
 * (private mode, blocked site data, so per-device conveniences aren't remembered), or a capability
 * getter that throws in some webviews.
 */
export function safely<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

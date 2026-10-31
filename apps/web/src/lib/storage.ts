/**
 * Runs a Web Storage access, or returns `fallback` when storage is unavailable (private mode,
 * blocked site data): per-device conveniences then simply aren't remembered.
 */
export function safely<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

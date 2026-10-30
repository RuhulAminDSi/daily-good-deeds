/** Runs once when the Next server starts: fail fast on misconfiguration instead of per request. */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { serverEnv } = await import('./env');
    serverEnv();
  }
}

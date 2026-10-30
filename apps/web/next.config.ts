import type { NextConfig } from 'next';

// E2E builds (E2E_ROUTES=1) also compile `*.e2e.tsx` test-only routes, into a separate output
// directory so they never mix with, or ship in, the normal build.
const e2e = process.env.E2E_ROUTES === '1';

const config: NextConfig = {
  poweredByHeader: false,
  // Consumed as TypeScript source (no build step).
  transpilePackages: ['@dgd/api-client'],
  pageExtensions: e2e ? ['e2e.tsx', 'tsx', 'ts'] : ['tsx', 'ts'],
  distDir: e2e ? '.next-e2e' : '.next',
};

export default config;

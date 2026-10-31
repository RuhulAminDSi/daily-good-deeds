import type { NextConfig } from 'next';

// E2E builds (E2E_ROUTES=1) also compile `*.e2e.tsx` test-only routes, into a separate output
// directory so they never mix with, or ship in, the normal build.
const e2e = process.env.E2E_ROUTES === '1';

/** Static security headers (NFR-SECURITY-014/015); the per-request CSP is set in src/proxy.ts. */
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // Geolocation is allowed same-origin for prayer times (F-ISL-002); everything else is off.
  { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=()' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]
    : []),
];

const config: NextConfig = {
  poweredByHeader: false,
  // Consumed as TypeScript source (no build step).
  transpilePackages: ['@dgd/api-client', '@dgd/ui'],
  // Import only the @dgd/ui components a route uses, not the whole barrel.
  experimental: { optimizePackageImports: ['@dgd/ui'] },
  pageExtensions: e2e ? ['e2e.tsx', 'tsx', 'ts'] : ['tsx', 'ts'],
  distDir: e2e ? '.next-e2e' : '.next',
  headers: async () => [{ source: '/:path*', headers: SECURITY_HEADERS }],
};

export default config;

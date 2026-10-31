// Serves the service worker (src/sw.ts) as /serwist/sw.js, bundled at build time with the precache
// manifest injected (@serwist/turbopack: Turbopack has no plugin hook, so a static route builds it).
import { spawnSync } from 'node:child_process';
import { LOCALES } from '@dgd/i18n';
import { createSerwistRoute } from '@serwist/turbopack';

/** Offline pages change with the code: the commit versions them (a new commit re-precaches). */
const revision =
  spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf-8' }).stdout?.trim() ||
  crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute(
  {
    swSrc: 'src/sw.ts',
    additionalPrecacheEntries: LOCALES.map((locale) => ({ url: `/${locale}/offline`, revision })),
    useNativeEsbuild: true,
  },
);

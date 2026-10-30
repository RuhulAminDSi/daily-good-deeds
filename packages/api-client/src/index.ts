// Derived from the API: `openapi.json` and `schema.ts` are written by `pnpm --filter @dgd/api openapi`
// (and verified by the API's test suite). Consumed as TypeScript source (no build step).
import createClient from 'openapi-fetch';
import type { paths } from './schema';

export type { components, paths } from './schema';

/** Typed fetch client: paths, params and response bodies come from the API's OpenAPI document. */
export const createApiClient = (baseUrl: string) => createClient<paths>({ baseUrl });
export type ApiClient = ReturnType<typeof createApiClient>;

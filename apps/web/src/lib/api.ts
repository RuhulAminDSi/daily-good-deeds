// Server-side client for the Daily Good Deeds API (typed from the API's OpenAPI document).
import 'server-only';
import { createApiClient } from '@dgd/api-client';
import { type Problem, ProblemSchema } from '@dgd/contracts';
import { headers } from 'next/headers';
import { serverEnv } from '@/env';

/** A non-2xx response. `problem` is absent when the body was not problem+json (e.g. a proxy). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem?: Problem,
  ) {
    super(`API ${status}${problem ? ` ${problem.code}` : ''}`);
  }
}

let client: ReturnType<typeof createApiClient> | undefined;

function createClient() {
  const created = createApiClient(serverEnv().API_URL);
  // The page's request id (src/proxy.ts) becomes the API's: one id across both apps' logs and
  // error reports.
  created.use({
    async onRequest({ request }) {
      const requestId = (await headers()).get('x-request-id');
      if (requestId) request.headers.set('x-request-id', requestId);
    },
  });
  return created;
}

/** The shared client; paths, params and bodies are type-checked against the API contract. */
export const api = () => (client ??= createClient());

/** Unwraps an openapi-fetch result: returns `data`, or throws ApiError with the parsed problem. */
export function unwrap<T>({
  data,
  error,
  response,
}: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (response.ok && data !== undefined) return data;
  throw new ApiError(response.status, ProblemSchema.safeParse(error).data);
}

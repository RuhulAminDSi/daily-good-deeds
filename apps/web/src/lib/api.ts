// Server-side fetch for the Daily Good Deeds API. Response and Problem types come from
// packages/contracts (generated from the OpenAPI document) once T-P2-PLAT-006 lands.
import { serverEnv } from '@/env';

/** RFC 9457 problem+json body (docs/api/ERROR_HANDLING.md); the fields clients branch on. */
export interface Problem {
  status: number;
  code: string;
  i18nKey: string;
  requestId?: string;
  errors?: { pointer?: string; code: string; i18nKey?: string; params?: object }[];
}

/** A non-2xx response. `problem` is absent when the body was not problem+json (e.g. a proxy). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly problem?: Problem,
  ) {
    super(`API ${status}${problem ? ` ${problem.code}` : ''}`);
  }
}

export async function apiFetch<T>(path: `/${string}`, init?: RequestInit): Promise<T> {
  const res = await fetch(`${serverEnv().API_URL}/api/v1${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  const body: unknown = await res.json().catch(() => undefined);
  if (!res.ok) throw new ApiError(res.status, body as Problem | undefined);
  return body as T;
}

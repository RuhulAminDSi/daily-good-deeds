/**
 * Loading state for a route; an accessible live region announces it. Re-export it as
 * `loading.tsx` only in **leaf** segments that do slow work. A `loading.tsx` streams the response
 * before the page renders, so a `notFound()` beneath it returns HTTP 200 (a "soft 404"), and
 * pages that may 404 must check existence above any loading boundary.
 */
export default function RouteLoading() {
  return (
    <div role="status" aria-live="polite" className="p-6">
      <span className="inline-block h-4 w-32 animate-pulse rounded-sm bg-surface-sunken" />
    </div>
  );
}

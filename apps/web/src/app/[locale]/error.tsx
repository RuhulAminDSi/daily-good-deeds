'use client';

import { useBoundaryMessages } from '@/i18n/boundary-messages';

/** Route-level error boundary. Never shows error details to users; they go to error reporting. */
export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  const { common } = useBoundaryMessages();
  return (
    <div role="alert" className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-lg font-semibold">{common.errorTitle}</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-white"
      >
        {common.retry}
      </button>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useBoundaryMessages } from '@/i18n/boundary-messages';
import { reportError } from '@/lib/error-reporting';

/** Route-level error boundary. Never shows error details to users; they go to error reporting. */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { common } = useBoundaryMessages();
  useEffect(() => reportError(error, error.digest), [error]);
  return (
    <div role="alert" className="mx-auto max-w-md p-6 text-center">
      <h1 className="text-h3">{common.errorTitle}</h1>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md bg-primary px-4 py-2 text-label text-primary-contrast hover:bg-primary-hover"
      >
        {common.retry}
      </button>
    </div>
  );
}

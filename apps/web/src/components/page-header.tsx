import type { ReactNode } from 'react';

/** A page's h1 (one per page) and an optional line under it (COMPONENT_LIBRARY §2 PageHeader). */
export function PageHeader({ title, description }: { title: ReactNode; description?: ReactNode }) {
  return (
    <div>
      <h1 className="text-h1">{title}</h1>
      {description && <p className="mt-2 text-text-muted">{description}</p>}
    </div>
  );
}

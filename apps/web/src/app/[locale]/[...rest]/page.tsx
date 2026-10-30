import { notFound } from 'next/navigation';

/** Unmatched paths under a locale render that locale's not-found page (not Next's generic one). */
export default function CatchAll() {
  notFound();
}

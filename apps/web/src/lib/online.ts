import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  addEventListener('online', onChange);
  addEventListener('offline', onChange);
  return () => {
    removeEventListener('online', onChange);
    removeEventListener('offline', onChange);
  };
};

/** The browser's online state; the server (and hydration) assume online. */
export const useOnline = () =>
  useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );

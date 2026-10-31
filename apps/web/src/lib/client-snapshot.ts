import { useSyncExternalStore } from 'react';

const noSubscribe = () => () => {};

/**
 * A browser-only value that never changes after load (capabilities, the in-app browser): the
 * server's value on the server and during hydration, then the browser's, without a mismatch.
 */
export const useClientSnapshot = <T>(get: () => T, serverValue: T) =>
  useSyncExternalStore(noSubscribe, get, () => serverValue);

import { useSyncExternalStore } from 'react';
import { inAppBrowser } from './in-app-browser';

const never = () => () => {};

/**
 * The in-app browser this page runs in, or null (also on the server and during hydration). The
 * Google sign-in button (T-P2-AUTH) hides itself when this is set (F-PWA-007, F-AUTH Google).
 */
export const useInAppBrowser = () => useSyncExternalStore(never, inAppBrowser, () => null);

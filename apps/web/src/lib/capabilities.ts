// Capability detection (F-PWA-008, FR-PWA-008-01): every optional browser API is checked here
// before use, so a missing one hides or degrades its feature instead of throwing. The fallback for
// each is in PWA_ARCHITECTURE §6.1. Pure over an injectable global, so it is unit-tested against
// bare and full environments (capabilities.spec.ts).
import { useClientSnapshot } from './client-snapshot';
import { isIosStandalone } from './in-app-browser';
import { safely } from './storage';

// Loose on purpose: in old browsers and webviews any of these can be missing.
type Env = Partial<Window & typeof globalThis> & { navigator?: Partial<Navigator> };

const CHECKS = {
  serviceWorker: (g: Env) => 'serviceWorker' in (g.navigator ?? {}),
  push: (g: Env) => 'serviceWorker' in (g.navigator ?? {}) && 'PushManager' in g,
  notifications: (g: Env) => 'Notification' in g,
  backgroundSync: (g: Env) => 'SyncManager' in g,
  share: (g: Env) => typeof g.navigator?.share === 'function',
  clipboard: (g: Env) => typeof g.navigator?.clipboard?.writeText === 'function',
  persist: (g: Env) => typeof g.navigator?.storage?.persist === 'function',
  /** Chromium's install event; iOS installs through Add to Home Screen instead (no API). */
  installPrompt: (g: Env) => 'onbeforeinstallprompt' in g,
  vibration: (g: Env) => typeof g.navigator?.vibrate === 'function',
  geolocation: (g: Env) => 'geolocation' in (g.navigator ?? {}),
  badging: (g: Env) => typeof g.navigator?.setAppBadge === 'function',
  wakeLock: (g: Env) => 'wakeLock' in (g.navigator ?? {}),
  mediaRecorder: (g: Env) => typeof g.MediaRecorder === 'function',
  indexedDb: (g: Env) => typeof g.indexedDB?.open === 'function',
  cacheStorage: (g: Env) => typeof g.caches?.match === 'function',
} satisfies Record<string, (g: Env) => boolean>;

export type Capability = keyof typeof CHECKS;
export const CAPABILITIES = Object.keys(CHECKS) as Capability[];

/** Whether `env` (the browser's global by default) supports `capability`. Never throws. */
export function supports(capability: Capability, env: Env = globalThis as Env): boolean {
  // A getter that throws (some webviews) counts as unsupported.
  return safely(() => CHECKS[capability](env), false);
}

/** `supports()` for components: false on the server and during hydration, then the real answer. */
export const useCapability = (capability: Capability) =>
  useClientSnapshot(() => supports(capability), false);

/** Running as an installed app (home screen, dock), not in a browser tab. */
export const isInstalled = () =>
  matchMedia('(display-mode: standalone)').matches || isIosStandalone();

/**
 * Asks the browser to keep this site's storage under pressure (PWA_ARCHITECTURE §7), from client
 * startup. Only for installed apps: Chromium grants it silently there, and in a browser tab Firefox
 * would show a prompt.
 */
export async function persistIfInstalled(): Promise<boolean> {
  if (!supports('persist') || !isInstalled()) return false;
  try {
    return (await navigator.storage.persisted()) || (await navigator.storage.persist());
  } catch {
    return false;
  }
}

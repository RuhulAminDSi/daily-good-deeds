// Install prompt state (F-PWA-001, FR-PWA-001-02), browser only. The browser's own
// `beforeinstallprompt` fires once, possibly before React hydrates, so it is captured from
// src/instrumentation-client.ts and kept here for the InstallPrompt banner.
import { inAppBrowser, IOS_UA, isIosStandalone } from './in-app-browser';
import { safely } from './storage';

/** Chromium's install event (not in TypeScript's DOM types). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const VISITS_KEY = 'dgd.visits';
const VISIT_COUNTED_KEY = 'dgd.visitCounted';
const DISMISSED_KEY = 'dgd.installDismissedAt';
/** Offered from the second visit on (FR-PWA-001-02). */
const MIN_VISITS = 2;
/** "Not now" keeps it away for 30 days. */
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

let deferred: BeforeInstallPromptEvent | undefined;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Starts capturing the install event; called once, as early as possible. */
export function captureInstallPrompt(): void {
  addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault(); // no mini-infobar: the app asks at a better moment
    deferred = event as BeforeInstallPromptEvent;
    notify();
  });
  addEventListener('appinstalled', () => {
    deferred = undefined;
    notify();
  });
}

export const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
export const canPromptNatively = () => deferred !== undefined;

/** Opens the browser's install dialog; the event is single-use either way. */
export async function promptInstall(): Promise<'accepted' | 'dismissed'> {
  const event = deferred;
  deferred = undefined;
  notify();
  if (!event) return 'dismissed';
  await event.prompt();
  return (await event.userChoice).outcome;
}

/** Counts this visit (once per browser session) and returns the total. */
export function countVisit(): number {
  return safely(() => {
    const visits = Number(localStorage.getItem(VISITS_KEY) ?? 0);
    if (sessionStorage.getItem(VISIT_COUNTED_KEY)) return visits;
    sessionStorage.setItem(VISIT_COUNTED_KEY, '1');
    localStorage.setItem(VISITS_KEY, String(visits + 1));
    return visits + 1;
  }, 0);
}

export const snoozeInstallPrompt = () =>
  safely(() => localStorage.setItem(DISMISSED_KEY, String(Date.now())), undefined);

/**
 * Engaged enough (second visit), not snoozed, not already running installed, and not inside a
 * social app's webview, which cannot install (F-PWA-007).
 */
export function shouldOfferInstall(visits: number): boolean {
  const dismissedAt = Number(safely(() => localStorage.getItem(DISMISSED_KEY), null) ?? 0);
  const installed = matchMedia('(display-mode: standalone)').matches || isIosStandalone();
  return (
    visits >= MIN_VISITS && Date.now() - dismissedAt >= SNOOZE_MS && !installed && !inAppBrowser()
  );
}

/** iOS has no install event; its users get Add to Home Screen steps instead. */
export const isIos = () =>
  IOS_UA.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

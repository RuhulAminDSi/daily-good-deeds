// In-app browser detection (F-PWA-007). Social apps open links in their own webviews, where Google
// sign-in is blocked, installing is impossible and storage may not survive. Detection uses the user
// agent plus one feature check (Telegram injects a bridge object); it is pure, so it is tested
// against real user-agent fixtures (in-app-browser.spec.ts).

export type InAppApp =
  | 'facebook'
  | 'messenger'
  | 'instagram'
  | 'telegram'
  | 'line'
  | 'tiktok'
  | 'wechat'
  | 'linkedin'
  | 'webview';

export interface InAppBrowser {
  app: InAppApp;
  /** Android can hand the page to the default browser (intent://); iOS needs manual steps. */
  os: 'android' | 'ios' | 'other';
}

/** First match wins: Messenger also carries Facebook's markers. */
const APPS: [InAppApp, RegExp][] = [
  ['messenger', /\bMessenger|FBAN\/Messenger|FB_IAB\/Orca/i],
  ['instagram', /\bInstagram\b/i],
  ['facebook', /\bFBAN\/|\bFBAV\/|\bFB_IAB\/|\bFBIOS\b/i],
  ['telegram', /\bTelegram-Android\b|\bTelegram\b/i],
  ['line', /\bLine\/\d/i],
  ['tiktok', /\bmusical_ly\b|\bBytedanceWebview\b|\bTikTok\b/i],
  ['wechat', /\bMicroMessenger\b/i],
  ['linkedin', /\bLinkedInApp\b/i],
];

export interface DetectionEnv {
  userAgent: string;
  /** Telegram's in-app browser injects `TelegramWebviewProxy` (its UA is plain on iOS). */
  telegramBridge?: boolean;
  /** An installed iOS web app also lacks "Safari" in its UA; it is not a webview. */
  standalone?: boolean;
}

/** The in-app browser this page runs in, or null for a real browser. */
export function detectInAppBrowser({
  userAgent: ua,
  telegramBridge = false,
  standalone = false,
}: DetectionEnv): InAppBrowser | null {
  const os = /Android/i.test(ua) ? 'android' : /iPhone|iPad|iPod/i.test(ua) ? 'ios' : 'other';
  const named = APPS.find(([, pattern]) => pattern.test(ua))?.[0];
  if (named) return { app: named, os };
  if (telegramBridge) return { app: 'telegram', os };
  // Android System WebView marks itself with "; wv)"; iOS WKWebView omits "Safari/" (every real
  // iOS browser, Chrome and Firefox included, keeps it).
  const androidWebView = os === 'android' && /;\s*wv\)/.test(ua);
  const iosWebView = os === 'ios' && !standalone && /AppleWebKit/.test(ua) && !/Safari\//.test(ua);
  return androidWebView || iosWebView ? { app: 'webview', os } : null;
}

/**
 * Android: hands the current page to the default browser. The fallback URL keeps the user on the
 * page if no browser takes the intent.
 */
export function androidIntentUrl(href: string): string {
  const url = new URL(href);
  const fallback = encodeURIComponent(href);
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${url.protocol.slice(0, -1)};S.browser_fallback_url=${fallback};end`;
}

let current: InAppBrowser | null | undefined;

/** Browser only: this page's in-app browser (computed once; it cannot change). */
export function inAppBrowser(): InAppBrowser | null {
  if (current === undefined) {
    current = detectInAppBrowser({
      userAgent: navigator.userAgent,
      telegramBridge: 'TelegramWebviewProxy' in window,
      standalone: (navigator as { standalone?: boolean }).standalone === true,
    });
  }
  return current;
}

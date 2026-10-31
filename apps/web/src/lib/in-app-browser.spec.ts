import { androidIntentUrl, detectInAppBrowser } from './in-app-browser';

const ANDROID_WV =
  'Mozilla/5.0 (Linux; Android 13; SM-S911B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/119.0.6045.163 Mobile Safari/537.36';
const IOS_WKWEBVIEW =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';

/** Real user agents of in-app browsers (T-P2-PWA-003 fixtures). */
const IN_APP: [string, string, string, string][] = [
  ['Facebook, Android', `${ANDROID_WV} [FB_IAB/FB4A;FBAV/442.0.0.33.113;]`, 'facebook', 'android'],
  [
    'Facebook, iOS',
    `${IOS_WKWEBVIEW} [FBAN/FBIOS;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBRV/0]`,
    'facebook',
    'ios',
  ],
  [
    'Messenger, Android',
    `${ANDROID_WV} [FB_IAB/Orca-Android;FBAV/434.0.0.31.115;]`,
    'messenger',
    'android',
  ],
  [
    'Messenger, iOS',
    `${IOS_WKWEBVIEW} [FBAN/MessengerForiOS;FBAV/440.0.0.33.111;FBBV/553419330;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.1]`,
    'messenger',
    'ios',
  ],
  [
    'Instagram, Android',
    `${ANDROID_WV} Instagram 309.1.0.41.113 Android (34/14; 420dpi; 1080x2205; Google/google; Pixel 8; shiba; shiba; en_US; 541635890)`,
    'instagram',
    'android',
  ],
  [
    'Instagram, iOS',
    `${IOS_WKWEBVIEW} Instagram 307.0.0.34.111 (iPhone14,5; iOS 17_1; en_US; en; scale=3.00; 1170x2532; 532277361)`,
    'instagram',
    'ios',
  ],
  [
    'Telegram, Android',
    `${ANDROID_WV} Telegram-Android/10.5.0 (Samsung SM-A536B; Android 13; SDK 33; AVERAGE)`,
    'telegram',
    'android',
  ],
  [
    'LINE, iOS',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/13.20.0',
    'line',
    'ios',
  ],
  ['Android System WebView', ANDROID_WV, 'webview', 'android'],
  ['iOS WKWebView', IOS_WKWEBVIEW, 'webview', 'ios'],
];

const BROWSERS: [string, string][] = [
  [
    'Chrome, Android',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  ],
  [
    'Samsung Internet',
    'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
  ],
  ['Safari, iOS', `${IOS_WKWEBVIEW.replace('Mobile/', 'Version/17.1 Mobile/')} Safari/604.1`],
  [
    'Chrome, iOS',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
  ],
  [
    'Firefox, desktop',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  ],
];

describe('detectInAppBrowser', () => {
  it.each(IN_APP)('detects %s', (_, userAgent, app, os) => {
    expect(detectInAppBrowser({ userAgent })).toEqual({ app, os });
  });

  it.each(BROWSERS)('leaves %s alone', (_, userAgent) => {
    expect(detectInAppBrowser({ userAgent })).toBeNull();
  });

  it("detects Telegram's iOS browser by its bridge (its user agent is plain)", () => {
    const ua = `${IOS_WKWEBVIEW.replace('Mobile/', 'Version/17.1 Mobile/')} Safari/604.1`;
    expect(detectInAppBrowser({ userAgent: ua, telegramBridge: true })).toEqual({
      app: 'telegram',
      os: 'ios',
    });
  });

  it('does not take an installed iOS web app for a webview', () => {
    expect(detectInAppBrowser({ userAgent: IOS_WKWEBVIEW, standalone: true })).toBeNull();
  });
});

describe('androidIntentUrl', () => {
  it('hands the same page to the default browser, falling back to staying here', () => {
    expect(androidIntentUrl('https://example.org/bn/today?x=1')).toBe(
      'intent://example.org/bn/today?x=1#Intent;scheme=https;S.browser_fallback_url=https%3A%2F%2Fexample.org%2Fbn%2Ftoday%3Fx%3D1;end',
    );
  });
});

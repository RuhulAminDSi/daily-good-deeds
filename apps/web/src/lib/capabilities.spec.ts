import { CAPABILITIES, supports } from './capabilities';

const fn = () => {};

/** Roughly what Chrome on Android exposes. */
const FULL = {
  navigator: {
    serviceWorker: {},
    share: fn,
    clipboard: { writeText: fn },
    storage: { persist: fn },
    vibrate: fn,
    geolocation: {},
    setAppBadge: fn,
    wakeLock: {},
  },
  PushManager: fn,
  Notification: fn,
  SyncManager: fn,
  onbeforeinstallprompt: null,
  MediaRecorder: fn,
  indexedDB: { open: fn },
  caches: { match: fn },
};

describe('supports', () => {
  it('finds every capability in a full environment', () => {
    const missing = CAPABILITIES.filter((c) => !supports(c, FULL as never));
    expect(missing).toEqual([]);
  });

  it('reports nothing, without throwing, in a bare environment (old webview, server)', () => {
    for (const env of [{}, { navigator: {} }]) {
      expect(CAPABILITIES.filter((c) => supports(c, env as never))).toEqual([]);
    }
  });

  it('treats a throwing getter as unsupported', () => {
    const env = {
      navigator: {
        get clipboard(): never {
          throw new Error('denied');
        },
      },
    };
    expect(supports('clipboard', env as never)).toBe(false);
  });

  it('needs a service worker for push', () => {
    expect(supports('push', { PushManager: fn, navigator: {} } as never)).toBe(false);
  });
});

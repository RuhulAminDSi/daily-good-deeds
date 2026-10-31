'use client';

import { Button } from '@dgd/ui';
import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useClientTranslations } from '@/i18n/client';
import { useCapability } from '@/lib/capabilities';
import { androidIntentUrl, useInAppBrowser } from '@/lib/in-app-browser';
import { safely } from '@/lib/storage';
import { BannerCard } from './banner-card';

const DISMISSED_KEY = 'dgd.inAppBannerDismissed';
/** Facebook, Messenger and Instagram share Meta's in-app browser and its menu. */
const META = new Set(['facebook', 'messenger', 'instagram']);

/**
 * "For the best experience, open this in your browser" (F-PWA-007), inside social apps' webviews.
 * Android gets a button that hands the page to the default browser; iOS gets the app's menu steps
 * and a copy-link button. Dismissible for the rest of the session; the app keeps working here.
 */
export function InAppBrowserBanner() {
  const t = useClientTranslations('inApp');
  const inApp = useInAppBrowser();
  // Read once: `inApp` is null on the server and during hydration, so this never runs there.
  const [dismissed, setDismissed] = useState(() =>
    safely(() => sessionStorage.getItem(DISMISSED_KEY) !== null, false),
  );
  const [copied, setCopied] = useState(false);
  const canCopy = useCapability('clipboard');

  if (!inApp || dismissed) return null;

  const dismiss = () => {
    safely(() => sessionStorage.setItem(DISMISSED_KEY, '1'), undefined);
    setDismissed(true);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(location.href);
    setCopied(true);
  };

  return (
    <BannerCard
      icon={ExternalLink}
      title={t('title')}
      actions={
        <>
          {inApp.os === 'android' ? (
            <Button size="sm" asChild>
              <a href={androidIntentUrl(location.href)}>{t('open')}</a>
            </Button>
          ) : (
            canCopy && (
              <Button size="sm" onClick={copy} aria-live="polite">
                {copied ? t('copied') : t('copy')}
              </Button>
            )
          )}
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {t('dismiss')}
          </Button>
        </>
      }
    >
      <p className="text-body-sm">{t('body', { app: inApp.app })}</p>
      {inApp.os !== 'android' && (
        <>
          <p className="text-body-sm">
            {t('steps', { app: META.has(inApp.app) ? 'meta' : inApp.app })}
          </p>
          {/* No clipboard API (insecure context, old webview): the link to copy by hand. */}
          {!canCopy && <p className="text-body-sm break-all select-all">{location.href}</p>}
        </>
      )}
    </BannerCard>
  );
}

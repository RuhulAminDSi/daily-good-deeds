'use client';

import { Button, Card } from '@dgd/ui';
import { ExternalLink } from 'lucide-react';
import { useId, useState } from 'react';
import { useClientTranslations } from '@/i18n/client';
import { androidIntentUrl } from '@/lib/in-app-browser';
import { useInAppBrowser } from '@/lib/use-in-app-browser';

const DISMISSED_KEY = 'dgd.inAppBannerDismissed';

const wasDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) !== null;
  } catch {
    return false;
  }
};

/**
 * "For the best experience, open this in your browser" (F-PWA-007), inside social apps' webviews.
 * Android gets a button that hands the page to the default browser; iOS gets the app's menu steps
 * and a copy-link button. Dismissible for the rest of the session; the app keeps working here.
 */
export function InAppBrowserBanner() {
  const t = useClientTranslations('inApp');
  const titleId = useId();
  const inApp = useInAppBrowser();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!inApp || dismissed || wasDismissed()) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // still hidden for this page
    }
    setDismissed(true);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(location.href);
    setCopied(true);
  };

  return (
    <Card as="section" variant="highlight" aria-labelledby={titleId} className="flex gap-3">
      <ExternalLink aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p id={titleId} className="text-label">
          {t('title')}
        </p>
        <p className="text-body-sm">{t('body', { app: inApp.app })}</p>
        {inApp.os !== 'android' && <p className="text-body-sm">{t('steps', { app: inApp.app })}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          {inApp.os === 'android' ? (
            <Button size="sm" asChild>
              <a href={androidIntentUrl(location.href)}>{t('open')}</a>
            </Button>
          ) : (
            <Button size="sm" onClick={copy} aria-live="polite">
              {copied ? t('copied') : t('copy')}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {t('dismiss')}
          </Button>
        </div>
      </div>
    </Card>
  );
}

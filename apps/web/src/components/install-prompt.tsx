'use client';

import { Button, Card } from '@dgd/ui';
import { Download } from 'lucide-react';
import { useEffect, useId, useState, useSyncExternalStore } from 'react';
import { useClientTranslations } from '@/i18n/client';
import {
  canPromptNatively,
  countVisit,
  isIos,
  promptInstall,
  shouldOfferInstall,
  snoozeInstallPrompt,
  subscribe,
} from '@/lib/install-prompt';

/**
 * The app's own install invitation (F-PWA-001, FR-PWA-001-02): from the second visit, never on the
 * first, and "Not now" snoozes it for 30 days. Chromium gets an Install button (the captured
 * `beforeinstallprompt`), iOS gets Add to Home Screen steps, other browsers nothing.
 */
export function InstallPrompt() {
  const t = useClientTranslations('install');
  const titleId = useId();
  const native = useSyncExternalStore(subscribe, canPromptNatively, () => false);
  const [eligible, setEligible] = useState(false);

  // After hydration: storage and the display mode exist only in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of browser state
    setEligible(shouldOfferInstall(countVisit()));
  }, []);

  // `eligible` is only true after mount, so isIos() never runs on the server.
  const ios = eligible && isIos();
  if (!eligible || (!ios && !native)) return null;

  const dismiss = () => {
    snoozeInstallPrompt();
    setEligible(false);
  };
  // promptInstall() consumes the event, which hides the banner.
  const install = async () => {
    if ((await promptInstall()) === 'dismissed') snoozeInstallPrompt();
  };

  return (
    <Card as="section" variant="highlight" aria-labelledby={titleId} className="flex gap-3">
      <Download aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p id={titleId} className="text-label">
          {t('title')}
        </p>
        <p className="text-body-sm">{ios ? t('iosSteps') : t('body')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {!ios && (
            <Button size="sm" onClick={install}>
              {t('install')}
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

'use client';

import { Button } from '@dgd/ui';
import { Download } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
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
import { BannerCard } from './banner-card';

/**
 * The app's own install invitation (F-PWA-001, FR-PWA-001-02): from the second visit, never on the
 * first, and "Not now" snoozes it for 30 days. Chromium gets an Install button (the captured
 * `beforeinstallprompt`), iOS gets Add to Home Screen steps, other browsers nothing.
 */
export function InstallPrompt() {
  const t = useClientTranslations('install');
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
    <BannerCard
      icon={Download}
      title={t('title')}
      actions={
        <>
          {!ios && (
            <Button size="sm" onClick={install}>
              {t('install')}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {t('dismiss')}
          </Button>
        </>
      }
    >
      <p className="text-body-sm">{ios ? t('iosSteps') : t('body')}</p>
    </BannerCard>
  );
}

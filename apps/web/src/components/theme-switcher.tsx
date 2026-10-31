'use client';

import { SegmentedControl } from '@dgd/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { applyTheme, type Theme } from '@/theme';

/** Light / dark / system, for any shell's top bar. Applies at once, remembered for a year. */
export function ThemeSwitcher({ initial }: { initial: Theme }) {
  const t = useTranslations('theme');
  const [theme, setTheme] = useState(initial);

  const choose = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <SegmentedControl
      label={t('label')}
      iconOnly
      value={theme}
      onValueChange={choose}
      options={[
        { value: 'light', label: t('light'), icon: <Sun className="size-4" /> },
        { value: 'dark', label: t('dark'), icon: <Moon className="size-4" /> },
        { value: 'system', label: t('system'), icon: <Monitor className="size-4" /> },
      ]}
    />
  );
}

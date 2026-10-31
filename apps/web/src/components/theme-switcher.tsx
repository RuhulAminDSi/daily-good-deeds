'use client';

import { SegmentedControl } from '@dgd/ui';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import type { Messages } from '@/i18n/dictionary';
import { applyTheme, type Theme } from '@/theme';

/** Light / dark / system, for any shell's top bar. Applies at once, remembered for a year. */
export function ThemeSwitcher({ initial, labels }: { initial: Theme; labels: Messages['theme'] }) {
  const [theme, setTheme] = useState(initial);

  const choose = (next: Theme) => {
    setTheme(next);
    applyTheme(next);
  };

  return (
    <SegmentedControl
      label={labels.label}
      iconOnly
      value={theme}
      onValueChange={choose}
      options={[
        { value: 'light', label: labels.light, icon: <Sun className="size-4" /> },
        { value: 'dark', label: labels.dark, icon: <Moon className="size-4" /> },
        { value: 'system', label: labels.system, icon: <Monitor className="size-4" /> },
      ]}
    />
  );
}

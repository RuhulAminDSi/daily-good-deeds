import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import { UiProvider, type UiStrings } from '../src';
import './preview.css';

const STRINGS: Record<'en' | 'bn', UiStrings> = {
  en: {
    close: 'Close',
    notifications: 'Notifications',
    notification: 'Notification',
    required: 'required',
  },
  bn: {
    close: 'বন্ধ করুন',
    notifications: 'বিজ্ঞপ্তিসমূহ',
    notification: 'বিজ্ঞপ্তি',
    required: 'আবশ্যক',
  },
};

/** Locale and theme live on <html>, exactly as in the app: `lang` drives Bengali typography,
 *  `data-theme` the token theme (COLOR_TOKENS §6). */
const withDocument: Decorator = (Story, { globals }) => {
  const { locale, theme } = globals as { locale: 'en' | 'bn'; theme: 'light' | 'dark' };
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);
  return (
    <UiProvider locale={locale} strings={STRINGS[locale]}>
      <div lang={locale} className="p-4 text-body">
        <Story />
      </div>
    </UiProvider>
  );
};

const preview: Preview = {
  decorators: [withDocument],
  globalTypes: {
    locale: {
      description: 'UI language',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'bn', title: 'বাংলা' },
        ],
      },
    },
    theme: {
      description: 'Colour theme',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  initialGlobals: { locale: 'en', theme: 'light' },
  parameters: {
    // Every story is an axe test: any violation fails it (ACCESSIBILITY_GUIDELINES §5).
    a11y: { test: 'error' },
  },
};

export default preview;

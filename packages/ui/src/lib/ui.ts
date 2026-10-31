import { createContext, useContext } from 'react';

/** Text the components themselves need. The app passes them from its i18n catalogs (I18N-001). */
export interface UiStrings {
  /** ✕ buttons of dialogs, sheets and toasts: "Close" / "বন্ধ করুন". */
  close: string;
  /** Name of the toast region: "Notifications" / "বিজ্ঞপ্তিসমূহ". */
  notifications: string;
  /** Announced before each toast: "Notification" / "বিজ্ঞপ্তি". */
  notification: string;
  /** Marker after required field labels: "required" / "আবশ্যক". */
  required: string;
}

export interface Ui {
  /** BCP 47 locale for numbers and text segmentation, e.g. "en" or "bn". */
  locale: string;
  strings: UiStrings;
}

export const UiContext = createContext<Ui | null>(null);

export function useUi(): Ui {
  const ui = useContext(UiContext);
  if (!ui) throw new Error('@dgd/ui components need a <UiProvider> above them');
  return ui;
}

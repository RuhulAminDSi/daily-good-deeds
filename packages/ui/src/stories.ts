// Story helpers (not exported from the package). Every component's main story also runs in Bengali,
// dark, and Bengali + dark, so axe checks contrast and the layout copes with longer Bengali text.

export type Locale = 'en' | 'bn';

/** Picks the story text for the toolbar's locale. */
export const t = (globals: Record<string, unknown>, text: Record<Locale, string>) =>
  text[globals.locale === 'bn' ? 'bn' : 'en'];

export const BN = { locale: 'bn' };
export const DARK = { theme: 'dark' };
export const BN_DARK = { locale: 'bn', theme: 'dark' };

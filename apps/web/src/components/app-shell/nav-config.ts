// The user app's navigation (docs/design/NAVIGATION_MAP.md §3), in one list: the sidebar and the
// More sheet show it grouped; `primary` items also go in the bottom bar and the rail. Items join as
// their pages ship (a link never points at a page that does not exist), and feature-flag or role
// conditions will filter this one list.
import { BookHeart, Calendar, type LucideIcon, Sprout, Sun } from 'lucide-react';
import type { Messages } from '@/i18n/dictionary';

export interface NavItem {
  label: Exclude<keyof Messages['nav'], 'groups'>;
  /** Path after the locale prefix. */
  href: `/${string}`;
  icon: LucideIcon;
  /** Also in the bottom bar (< 768px) and the rail (768–1023px). */
  primary?: true;
}

export const NAV_GROUPS: { label: keyof Messages['nav']['groups']; items: NavItem[] }[] = [
  {
    label: 'daily',
    items: [
      { label: 'today', href: '/today', icon: Sun, primary: true },
      { label: 'calendar', href: '/calendar', icon: Calendar, primary: true },
    ],
  },
  {
    label: 'faith',
    items: [{ label: 'islamic', href: '/islamic', icon: BookHeart, primary: true }],
  },
  { label: 'growth', items: [{ label: 'growth', href: '/growth', icon: Sprout, primary: true }] },
];

export const PRIMARY_NAV = NAV_GROUPS.flatMap((group) =>
  group.items.filter((item) => item.primary),
);

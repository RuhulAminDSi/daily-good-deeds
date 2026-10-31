'use client';

import { Sheet } from '@dgd/ui';
import { Menu } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_GROUPS, type NavItem, PRIMARY_NAV } from './nav-config';
import { useClientTranslations } from '@/i18n/client';
import { LanguageSwitcher } from '../language-switcher';

/** Bottom bar and rail item: icon above a one-line label. */
const TAB =
  'flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md px-1 text-caption text-text-muted hover:text-text aria-[current=page]:text-primary';

/**
 * One navigation landmark, laid out per breakpoint (RESPONSIVE_GUIDELINES §2): a bottom bar below
 * 768px, a 72px icon rail from 768px, a 260px grouped sidebar from 1024px.
 */
export function Navigation() {
  const t = useClientTranslations('nav');
  return (
    <nav
      aria-label={t('main')}
      className="sticky bottom-0 z-30 order-last border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:top-0 md:order-none md:h-dvh md:w-18 md:shrink-0 md:overflow-y-auto md:border-t-0 md:border-e md:py-3 lg:w-65 lg:px-3"
    >
      <ul className="grid grid-cols-5 md:flex md:flex-col md:gap-1 md:px-1 lg:hidden">
        {PRIMARY_NAV.map((item) => (
          <li key={item.href}>
            <NavLink item={item} className={TAB}>
              <item.icon aria-hidden className="size-6" />
              <span className="whitespace-nowrap md:whitespace-normal">{t(item.label)}</span>
            </NavLink>
          </li>
        ))}
        <li>
          <MoreSheet />
        </li>
      </ul>
      <Groups className="hidden lg:flex" />
    </nav>
  );
}

/** A locale-prefixed link that marks itself `aria-current="page"` on its route and the routes below it. */
function NavLink({
  item,
  className,
  onClick,
  children,
}: {
  item: NavItem;
  className: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname(); // without the locale prefix
  const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
  return (
    <Link
      href={item.href}
      aria-current={current ? 'page' : undefined}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  );
}

/** "More" (bottom bar and rail): every group in a sheet; choosing a link closes it. */
function MoreSheet() {
  const t = useClientTranslations('nav');
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title={t('more')}
      trigger={
        <button type="button" className={TAB}>
          <Menu aria-hidden className="size-6" />
          <span>{t('more')}</span>
        </button>
      }
    >
      <Groups onNavigate={() => setOpen(false)} />
      <div className="mt-6 border-t border-border pt-4 md:hidden">
        <LanguageSwitcher />
      </div>
    </Sheet>
  );
}

/** Grouped links (sidebar and More sheet). The active item has a primary bar and `aria-current`. */
function Groups({
  className = 'flex',
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const t = useClientTranslations('nav');
  // The sidebar and an open More sheet can both be in the DOM: ids must not collide.
  const id = useId();
  return (
    <div className={`${className} flex-col gap-5`}>
      {NAV_GROUPS.map((group) => (
        <section key={group.label} aria-labelledby={`${id}-${group.label}`}>
          {/* A label, not a heading: the page's own h1 starts the document outline. */}
          <p id={`${id}-${group.label}`} className="px-3 pb-1 text-caption text-text-muted">
            {t(`groups.${group.label}`)}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.href}>
                <NavLink
                  item={item}
                  onClick={onNavigate}
                  className="flex min-h-11 items-center gap-3 rounded-md border-s-4 border-transparent px-3 text-label text-text hover:bg-surface-sunken aria-[current=page]:border-primary aria-[current=page]:bg-primary-subtle aria-[current=page]:text-primary-subtle-text"
                >
                  <item.icon aria-hidden className="size-5" />
                  {t(item.label)}
                </NavLink>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

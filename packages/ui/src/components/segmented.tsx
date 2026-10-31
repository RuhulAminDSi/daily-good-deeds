'use client';

import { ToggleGroup } from 'radix-ui';
import type { ReactNode } from 'react';
import { cn } from '../lib/cn';
import { Tooltip } from './tooltip';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  /** Names the group for screen readers, e.g. "Theme". */
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Show only the icons; each label stays the option's accessible name. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * One choice among a few, all visible (Day/Week/Month, EN/BN, theme). Radix ToggleGroup: arrow keys
 * move between options, Enter/Space selects (COMPONENT_LIBRARY §1). A selection is never cleared.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onValueChange,
  iconOnly = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      aria-label={label}
      value={value}
      // Radix reports '' when the active option is pressed again; keep the current choice.
      onValueChange={(next) => next && onValueChange(next as T)}
      className={cn(
        'inline-flex rounded-md border border-border-strong bg-surface p-0.5',
        className,
      )}
    >
      {options.map((option) => {
        const item = (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            aria-label={iconOnly ? option.label : undefined}
            className={cn(
              'inline-flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-sm px-2 text-label text-text-muted hover:text-text',
              'data-[state=on]:bg-primary data-[state=on]:text-primary-contrast',
            )}
          >
            {option.icon && (
              <span aria-hidden className="inline-flex">
                {option.icon}
              </span>
            )}
            {!iconOnly && option.label}
          </ToggleGroup.Item>
        );
        // Icon-only: the label is the accessible name and, as for IconButton, the tooltip.
        return iconOnly ? (
          <Tooltip key={option.value} content={option.label}>
            {item}
          </Tooltip>
        ) : (
          item
        );
      })}
    </ToggleGroup.Root>
  );
}

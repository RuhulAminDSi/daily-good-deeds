import { Check } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface ChoiceProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

const ROW =
  'inline-flex min-h-11 cursor-pointer items-center gap-3 text-body text-text has-disabled:cursor-not-allowed has-disabled:opacity-50';

/** Native checkbox (not Radix: native inputs post with forms without JS and need no state
 *  mirroring, as COMPONENT_LIBRARY §1 specifies) with custom visuals: `border-strong` outline (3:1), and when checked the primary
 *  fill **and** a check glyph, never colour alone (COMPONENT_LIBRARY §1). */
export function Checkbox({ label, className, ...props }: ChoiceProps) {
  return (
    <label className={cn(ROW, className)}>
      <span className="relative inline-flex size-6 shrink-0">
        <input
          type="checkbox"
          className="peer size-6 cursor-[inherit] appearance-none rounded-sm border-2 border-border-strong bg-surface checked:border-primary checked:bg-primary"
          {...props}
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute inset-0 m-auto size-4 text-primary-contrast opacity-0 peer-checked:opacity-100"
        />
      </span>
      <span>{label}</span>
    </label>
  );
}

/** A native checkbox with `role="switch"`, for settings that apply immediately. */
export function Switch({ label, className, ...props }: ChoiceProps) {
  return (
    <label className={cn(ROW, className)}>
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          role="switch"
          className="peer absolute inset-0 cursor-[inherit] appearance-none rounded-full border-2 border-border-strong bg-surface-sunken checked:border-primary checked:bg-primary"
          {...props}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute start-1 top-1 size-4 rounded-full bg-border-strong transition-transform duration-(--duration-micro) peer-checked:translate-x-5 peer-checked:bg-primary-contrast motion-reduce:transition-none"
        />
      </span>
      <span>{label}</span>
    </label>
  );
}

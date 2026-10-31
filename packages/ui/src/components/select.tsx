import { Check, ChevronDown } from 'lucide-react';
import { Select as RadixSelect } from 'radix-ui';
import { cn } from '../lib/cn';
import { CONTROL, fieldProps, useField } from './field';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
}

/** Radix Select, for up to ~10 options (COMPONENT_LIBRARY §1): arrow keys and type-ahead. Put it in a
 *  Field for its label, hint and error. Longer lists use a Combobox (later). */
export function Select({ options, placeholder, className, ...props }: SelectProps) {
  const { required, ...wiring } = fieldProps(useField(), {});
  return (
    <RadixSelect.Root required={required} {...props}>
      <RadixSelect.Trigger
        {...wiring}
        className={cn(
          CONTROL,
          'inline-flex min-h-11 items-center justify-between gap-2 text-start data-placeholder:text-text-placeholder',
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown aria-hidden className="size-4 text-text-muted" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-sm border border-border bg-surface-raised shadow-md"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="relative flex min-h-11 cursor-default items-center rounded-sm ps-8 pe-3 text-body text-text outline-none select-none data-highlighted:bg-primary-subtle data-highlighted:text-primary-subtle-text"
              >
                <RadixSelect.ItemIndicator className="absolute start-2 inline-flex">
                  <Check aria-hidden className="size-4" />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

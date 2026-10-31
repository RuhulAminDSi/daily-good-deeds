import { CircleAlert } from 'lucide-react';
import {
  createContext,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useContext,
  useId,
  useMemo,
} from 'react';
import { cn } from '../lib/cn';
import { useUi } from '../lib/ui';

interface FieldState {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldState | null>(null);

/** The surrounding Field's wiring, for controls that live inside one (Input, Textarea, Select). */
export const useField = () => useContext(FieldContext);

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  /** Shown with an icon and wired to the control via `aria-describedby`; marks it invalid. */
  error?: ReactNode;
  /** Marks the control `required` and shows the localized "required" marker after the label. */
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label, hint and error around one control, with `for`/`aria-describedby` wired (ACCESSIBILITY §1). */
export function Field({ label, hint, error, required = false, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);
  const state = useMemo(
    () => ({ id, describedBy, invalid, required }),
    [id, describedBy, invalid, required],
  );
  const { strings } = useUi();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-label text-text">
        {label}
        {required && <span className="ms-1 text-text-muted">({strings.required})</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-body-sm text-text-muted">
          {hint}
        </p>
      )}
      <FieldContext value={state}>{children}</FieldContext>
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-body-sm text-danger">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared look of text controls: `border-strong` boundary (3:1), danger border when invalid. */
export const CONTROL =
  'w-full rounded-sm border border-border-strong bg-surface px-3 text-body text-text ' +
  'placeholder:text-text-placeholder aria-invalid:border-danger aria-invalid:border-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-surface-sunken';

/** Props a control takes from its Field (explicit props win). */
export function fieldProps(
  field: FieldState | null,
  own: { id?: string; 'aria-describedby'?: string },
) {
  return {
    id: own.id ?? field?.id,
    'aria-describedby': own['aria-describedby'] ?? field?.describedBy,
    'aria-invalid': field?.invalid || undefined,
    required: field?.required || undefined,
  };
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const wiring = fieldProps(useField(), props);
  return <input {...wiring} {...props} className={cn(CONTROL, 'min-h-11', className)} />;
}

/** Grows with its content where the browser supports `field-sizing`. */
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const wiring = fieldProps(useField(), props);
  return (
    <textarea
      rows={3}
      {...wiring}
      {...props}
      className={cn(CONTROL, 'field-sizing-content min-h-24 py-2', className)}
    />
  );
}

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type LabelHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from "react";
import { cn } from "../../lib/utils";

const fieldClass =
  "w-full rounded-field border-[1.5px] border-line-2 bg-surface px-3.5 text-[14.5px] font-semibold text-ink transition-[border-color,box-shadow] duration-150 " +
  "placeholder:text-faint focus:border-brand-500 focus:shadow-[0_0_0_4px_var(--b50)] focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-n-25 disabled:text-muted aria-invalid:border-danger-500 aria-invalid:focus:shadow-[0_0_0_4px_var(--r50)]";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldClass, "h-[46px]", className)} {...props} />
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClass, "h-[46px] pr-9", className)} {...props} />
  )
);
Select.displayName = "Select";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldClass, "min-h-[120px] resize-y py-3 leading-relaxed", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-[13.5px] font-bold text-ink", className)} {...props} />;
}

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} type="checkbox" className={cn("size-[18px] shrink-0 rounded accent-brand-600", className)} {...props} />
  )
);
Checkbox.displayName = "Checkbox";

/** On/off switch (role="switch"), e.g. the dark mode toggle. */
export function Switch({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200",
        checked ? "bg-brand-600" : "bg-n-200"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sh1 transition-transform duration-200 ease-soft",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

/** Label + control + error/hint, wired with ids for accessibility. */
export function Field({
  label,
  error,
  hint,
  children
}: {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children({ id, "aria-invalid": Boolean(error), ...(describedBy ? { "aria-describedby": describedBy } : {}) })}
      {error ? (
        <p id={`${id}-error`} className="text-[12.5px] font-medium text-danger-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12.5px] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

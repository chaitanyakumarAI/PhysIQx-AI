import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Field, fieldDescribedBy } from "@/components/ui/Field";

/** Shared text-control styling, reused by TextArea and SearchInput. */
export const textControlStyles =
  "w-full rounded-field border border-border bg-surface text-base text-foreground placeholder:text-foreground-secondary transition-colors focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-50";

export const textControlErrorStyles =
  "border-danger/60 focus-visible:border-danger/60 focus-visible:ring-danger/40";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  helper?: string;
  error?: string;
}

// forwardRef so React Hook Form's register() can attach its ref — an
// uncontrolled input needs a real DOM ref, which a plain function component
// cannot receive.
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id: idProp, label, helper, error, className, ...props },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <Field id={id} label={label} helper={helper} error={error}>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldDescribedBy(id, { error, helper })}
        className={cn(
          textControlStyles,
          "h-12 px-4",
          error && textControlErrorStyles,
          className,
        )}
        {...props}
      />
    </Field>
  );
});

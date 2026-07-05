import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Field, fieldDescribedBy } from "@/components/ui/Field";
import {
  textControlErrorStyles,
  textControlStyles,
} from "@/components/ui/Input";

export interface TextAreaProps extends React.ComponentProps<"textarea"> {
  label?: string;
  helper?: string;
  error?: string;
}

// forwardRef — same reasoning as Input: React Hook Form's register() needs
// a real DOM ref.
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ id: idProp, label, helper, error, className, ...props }, ref) {
    const autoId = useId();
    const id = idProp ?? autoId;

    return (
      <Field id={id} label={label} helper={helper} error={error}>
        <textarea
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldDescribedBy(id, { error, helper })}
          className={cn(
            textControlStyles,
            "min-h-28 px-4 py-3",
            error && textControlErrorStyles,
            className,
          )}
          {...props}
        />
      </Field>
    );
  },
);

"use client";

import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, fieldDescribedBy } from "@/components/ui/Field";
import { textControlErrorStyles, textControlStyles } from "@/components/ui/Input";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string;
  helper?: string;
  error?: string;
}

/**
 * Auth-scoped for now (only Login/Signup need it). A likely promotion
 * candidate to components/ui if a future Settings "change password" flow
 * needs the same show/hide pattern — not built there yet on spec.
 *
 * forwardRef — React Hook Form's register() needs a real DOM ref.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ id: idProp, label, helper, error, className, ...props }, ref) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const [visible, setVisible] = useState(false);

    return (
      <Field id={id} label={label} helper={helper} error={error}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={error ? true : undefined}
            aria-describedby={fieldDescribedBy(id, { error, helper })}
            className={cn(
              textControlStyles,
              "h-12 px-4 pr-11",
              error && textControlErrorStyles,
              className,
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-foreground-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
          >
            {visible ? (
              <EyeOff size={iconSize.sm} aria-hidden />
            ) : (
              <Eye size={iconSize.sm} aria-hidden />
            )}
          </button>
        </div>
      </Field>
    );
  },
);

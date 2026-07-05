/**
 * Shared form-field shell: label, control, helper/error text. Used by Input
 * and TextArea so field chrome is defined exactly once. The control inside
 * must carry `id` and reference `fieldErrorId`/`fieldHelperId` via
 * aria-describedby.
 */

export const fieldErrorId = (id: string) => `${id}-error`;
export const fieldHelperId = (id: string) => `${id}-helper`;

export function fieldDescribedBy(
  id: string,
  { error, helper }: { error?: string; helper?: string },
): string | undefined {
  if (error) return fieldErrorId(id);
  if (helper) return fieldHelperId(id);
  return undefined;
}

export interface FieldProps {
  id: string;
  label?: string;
  helper?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ id, label, helper, error, children }: FieldProps) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground-secondary"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={fieldErrorId(id)} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : helper ? (
        <p id={fieldHelperId(id)} className="text-xs text-foreground-secondary">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

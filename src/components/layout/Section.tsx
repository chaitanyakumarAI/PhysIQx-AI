import { useId } from "react";
import { cn } from "@/lib/utils";

export interface SectionProps
  extends Omit<React.ComponentProps<"section">, "title"> {
  /** The letter-spaced uppercase label ("TODAY'S MISSION", "FUEL", …). */
  title?: string;
  /** Right-aligned header content (e.g. "86%", "3/8", a "See all" link). */
  action?: React.ReactNode;
}

export function Section({
  className,
  title,
  action,
  children,
  ...props
}: SectionProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={title ? headingId : undefined}
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-baseline justify-between gap-4">
          {title && (
            <h2
              id={headingId}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-secondary"
            >
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

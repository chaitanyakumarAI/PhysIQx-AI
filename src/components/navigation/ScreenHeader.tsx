import { cn } from "@/lib/utils";

export interface ScreenHeaderProps
  extends Omit<React.ComponentProps<"header">, "title"> {
  title: string;
  subtitle?: string;
  /** Left of the title — typically a BackButton/IconButton. */
  leading?: React.ReactNode;
  /** Right-aligned content — avatar, actions. */
  trailing?: React.ReactNode;
}

/** Page title block: large display heading + optional subtitle and slots. */
export function ScreenHeader({
  className,
  title,
  subtitle,
  leading,
  trailing,
  ...props
}: ScreenHeaderProps) {
  return (
    <header
      className={cn("flex items-start justify-between gap-4 pt-6", className)}
      {...props}
    >
      <div className="flex items-center gap-3">
        {leading}
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-base text-foreground-secondary">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {trailing && <div className="shrink-0 pt-1">{trailing}</div>}
    </header>
  );
}

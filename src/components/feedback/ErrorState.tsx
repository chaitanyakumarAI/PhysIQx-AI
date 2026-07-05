import { AlertTriangle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.ComponentProps<"div"> {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/** Friendly, recoverable error display. Never shows technical errors. */
export function ErrorState({
  className,
  icon: Icon = AlertTriangle,
  title = "Something went wrong",
  description = "We couldn't load this right now. Give it another try.",
  onRetry,
  retryLabel = "Try again",
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-12 text-center",
        className,
      )}
      {...props}
    >
      <div className="mb-2 grid size-14 place-items-center rounded-full bg-danger/10">
        <Icon size={iconSize.md} aria-hidden className="text-danger" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-xs text-sm text-foreground-secondary">
        {description}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

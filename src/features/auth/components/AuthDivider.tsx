import { cn } from "@/lib/utils";

export interface AuthDividerProps {
  label?: string;
  className?: string;
}

export function AuthDivider({ label = "or", className }: AuthDividerProps) {
  return (
    <div className={cn("flex items-center gap-3 text-xs text-foreground-secondary", className)}>
      <span aria-hidden className="h-px flex-1 bg-border" />
      {label}
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}

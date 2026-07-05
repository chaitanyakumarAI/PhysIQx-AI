import { cn } from "@/lib/utils";

/**
 * Loading placeholder block. Shape it with className (h-*, w-*, rounded-*).
 * Hidden from assistive tech — pair with an aria-busy region or visible
 * loading text at the screen level.
 */
export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-xl bg-foreground/5",
        className,
      )}
      {...props}
    />
  );
}

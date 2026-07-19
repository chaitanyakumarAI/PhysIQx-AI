import { cn } from "@/lib/utils";

export interface PageContainerProps extends React.ComponentProps<"main"> {
  /** Reserve space for the fixed bottom navigation (default true). */
  withBottomNav?: boolean;
}

/**
 * The mobile-first screen column: centered, max-w-md, consistent gutters.
 * On larger viewports the app renders as a centered column (Architecture v1
 * responsive strategy) — true desktop layouts are deliberately out of scope.
 */
export function PageContainer({
  className,
  withBottomNav = true,
  ...props
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-5 pt-4",
        withBottomNav ? "pb-36" : "pb-10",
        className,
      )}
      {...props}
    />
  );
}

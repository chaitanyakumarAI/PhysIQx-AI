import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

// Automatic Next.js loading UI while SessionPage's async getSessionSetup()
// call is in flight. Shapes mirror the real layout so there's no content jump.
export default function SessionLoading() {
  return (
    <PageContainer withBottomNav={false}>
      <p role="status" className="sr-only">
        Loading your session…
      </p>

      <div className="flex items-center justify-between">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <span aria-hidden className="size-11" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-card" />
        ))}
      </div>
    </PageContainer>
  );
}

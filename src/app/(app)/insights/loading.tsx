import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

// Automatic Next.js loading UI while InsightsPage's async getInsightsData()
// call is in flight. Shapes mirror the real layout so there's no content jump.
export default function InsightsLoading() {
  return (
    <PageContainer>
      <p role="status" className="sr-only">
        Loading Insights…
      </p>

      <div className="flex flex-col gap-2 pt-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>

      <Skeleton className="h-48 w-full rounded-card" />

      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
      </div>

      <Skeleton className="h-64 w-full rounded-card" />
      <Skeleton className="h-40 w-full rounded-card" />
      <Skeleton className="h-56 w-full rounded-card" />
    </PageContainer>
  );
}

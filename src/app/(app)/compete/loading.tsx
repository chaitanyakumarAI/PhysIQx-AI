import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

// Automatic Next.js loading UI while CompetePage's async getCompeteData()
// call is in flight. Shapes mirror the real layout so there's no content jump.
export default function CompeteLoading() {
  return (
    <PageContainer>
      <p role="status" className="sr-only">
        Loading Compete…
      </p>

      <div className="flex flex-col gap-2 pt-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-48 w-full rounded-card" />
        <Skeleton className="h-16 w-full rounded-card" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-card" />
      </div>

      <Skeleton className="h-48 w-full rounded-card" />
    </PageContainer>
  );
}

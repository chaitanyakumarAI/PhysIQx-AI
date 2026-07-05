import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

// Automatic Next.js loading UI while TrainPage's async getTrainData() call is
// in flight. Shapes mirror the real layout so there's no content jump.
export default function TrainLoading() {
  return (
    <PageContainer>
      <p role="status" className="sr-only">
        Loading Train…
      </p>

      <div className="flex flex-col gap-2 pt-6">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      <Skeleton className="h-56 w-full rounded-card" />

      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-20 shrink-0 rounded-full" />
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full rounded-full" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-16 shrink-0 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-card" />
        ))}
      </div>
    </PageContainer>
  );
}

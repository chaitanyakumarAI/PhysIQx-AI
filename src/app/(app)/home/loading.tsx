import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

// Automatic Next.js loading UI while HomePage's async getHomeData() call is
// in flight. Shapes mirror the real layout so there's no content jump.
export default function HomeLoading() {
  return (
    <PageContainer>
      <p role="status" className="sr-only">
        Loading your home screen…
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="size-12 rounded-full" />
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-72 w-full rounded-card" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-2 w-full rounded-full" />
          ))}
        </div>
      </div>

      <Skeleton className="h-44 w-full rounded-card" />
      <Skeleton className="h-32 w-full rounded-card" />

      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-36 rounded-card" />
        <Skeleton className="h-36 rounded-card" />
      </div>

      <Skeleton className="h-24 w-full rounded-card" />
      <Skeleton className="h-24 w-full rounded-card" />
    </PageContainer>
  );
}

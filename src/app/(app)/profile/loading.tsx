import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";

// Automatic Next.js loading UI while ProfilePage's async getProfileData()
// call is in flight. Shapes mirror the real layout so there's no content jump.
export default function ProfileLoading() {
  return (
    <PageContainer>
      <p role="status" className="sr-only">
        Loading Profile…
      </p>

      <Skeleton className="h-9 w-32" />

      <div className="flex flex-col gap-4">
        <Skeleton className="h-28 w-full rounded-card" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-card" />
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-card" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-card" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-card" />
        ))}
      </div>

      <Skeleton className="h-48 w-full rounded-card" />
    </PageContainer>
  );
}

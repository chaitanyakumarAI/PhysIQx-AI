import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";

// Shown when getSessionSetup() can't resolve the mission id (see
// docs/UX_PRINCIPLES.md: errors should be friendly and offer a next action,
// never a bare technical 404).
export default function SessionNotFound() {
  return (
    <PageContainer withBottomNav={false}>
      <div className="flex flex-1 items-center">
        <EmptyState
          mascot="kix-sheepish"
          title="No workout to start here"
          description="This mission doesn't exist or hasn't been assigned yet."
          action={
            <Button asChild size="sm">
              <Link href="/home">Back to Home</Link>
            </Button>
          }
        />
      </div>
    </PageContainer>
  );
}

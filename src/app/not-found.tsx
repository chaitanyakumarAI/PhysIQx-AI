import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";

// Root-level catch-all for any unmatched route in the whole app (a typo'd
// URL, a removed link) — without this, Next's default unstyled 404 page
// would be the only fallback anywhere in the app.
export default function NotFound() {
  return (
    <PageContainer withBottomNav={false}>
      <div className="flex flex-1 items-center">
        <EmptyState
          icon={Compass}
          title="Page not found"
          description="That page doesn't exist — let's get you back on track."
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

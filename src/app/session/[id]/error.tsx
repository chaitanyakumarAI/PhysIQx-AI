"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";

export default function SessionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // No telemetry service exists yet in this phase — this is the seam
    // where one gets wired in later.
    console.error(error);
  }, [error]);

  return (
    <PageContainer withBottomNav={false}>
      <ErrorState
        title="Couldn't load your session"
        description="Something went wrong setting up your workout."
        onRetry={reset}
      />
    </PageContainer>
  );
}

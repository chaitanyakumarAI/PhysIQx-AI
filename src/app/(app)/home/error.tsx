"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";

export default function HomeError({
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
    <PageContainer>
      <ErrorState
        title="Couldn't load your home screen"
        description="Something went wrong pulling your score and today's plan."
        onRetry={reset}
      />
    </PageContainer>
  );
}

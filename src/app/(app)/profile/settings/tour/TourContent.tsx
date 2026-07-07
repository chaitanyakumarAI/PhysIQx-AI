"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { fadeInUp } from "@/lib/motion";
import { SettingsPageHeader } from "@/features/profile/components/SettingsPageHeader";
import { TourSlideView } from "@/features/onboarding/components/TourSlideView";
import { tourSlides } from "@/features/onboarding/lib/tourSlides";

/** The onboarding feature tour, replayable — same slides, same component. */
export function TourContent() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = tourSlides[index]!;
  const isLast = index === tourSlides.length - 1;

  return (
    <PageContainer>
      <SettingsPageHeader title="App tour" />
      <m.div key={slide.id} initial="hidden" animate="visible" variants={fadeInUp}>
        <TourSlideView slide={slide} />
      </m.div>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Button
          size="lg"
          fullWidth
          onClick={() => (isLast ? router.push("/profile") : setIndex(index + 1))}
        >
          {isLast ? "Done" : "Next"}
        </Button>
        {index > 0 && !isLast && (
          <Button variant="ghost" fullWidth onClick={() => setIndex(index - 1)}>
            Back
          </Button>
        )}
      </div>
    </PageContainer>
  );
}

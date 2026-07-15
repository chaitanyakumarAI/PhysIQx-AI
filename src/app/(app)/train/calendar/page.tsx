import { Suspense } from "react";
import type { Metadata } from "next";
import { CalendarContent } from "./CalendarContent";

export const metadata: Metadata = {
  title: "Program Calendar",
};

export default function ProgramCalendarPage() {
  return (
    // Suspense: useSearchParams inside must not block static prerender.
    <Suspense fallback={null}>
      <CalendarContent />
    </Suspense>
  );
}

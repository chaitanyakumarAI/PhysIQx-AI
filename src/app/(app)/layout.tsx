import { Suspense } from "react";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NetworkStatusIndicator } from "@/components/ui/NetworkStatusIndicator";
import { GuidedTour } from "@/features/home/components/GuidedTour";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { AppBottomNav } from "./AppBottomNav";

// Tab shell per docs/ROUTES.md — owns the persistent bottom navigation so tab
// switches never remount it. Server Component: all client behavior lives in
// the AppBottomNav leaf. GuidedTour lives here (not on a screen) because the
// walkthrough travels across tabs — it must survive route changes.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <NetworkStatusIndicator />
      <NotificationCenter />
      <AppBottomNav />
      <CommandPalette />
      {/* Suspense: useSearchParams inside must not block static prerender. */}
      <Suspense fallback={null}>
        <GuidedTour />
      </Suspense>
    </>
  );
}

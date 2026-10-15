import { Suspense } from "react";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { NetworkStatusIndicator } from "@/components/ui/NetworkStatusIndicator";
import { CharacterTour } from "@/features/tour/components/CharacterTour";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { AppBottomNav } from "./AppBottomNav";

// Tab shell per docs/ROUTES.md — owns the persistent bottom navigation so tab
// switches never remount it. Server Component: all client behavior lives in
// the AppBottomNav leaf. The character tour lives here (not on a screen)
// because it travels across tabs — it must survive route changes.
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
        <CharacterTour />
      </Suspense>
    </>
  );
}

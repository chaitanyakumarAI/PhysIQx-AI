import type { Metadata } from "next";
import { InsightsScreen } from "./InsightsScreen";

export const metadata: Metadata = {
  title: "Insights",
};

// Derived entirely from the on-device ledger — a static shell around a
// client screen.
export default function InsightsPage() {
  return <InsightsScreen />;
}

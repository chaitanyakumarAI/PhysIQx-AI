import type { Metadata } from "next";
import { RecoveryScreen } from "@/features/insights/components/RecoveryScreen";

export const metadata: Metadata = {
  title: "Training load",
  description: "This week's lifting volume against your own 4-week average.",
};

export default function RecoveryPage() {
  return <RecoveryScreen />;
}

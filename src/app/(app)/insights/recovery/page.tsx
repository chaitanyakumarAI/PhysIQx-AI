import type { Metadata } from "next";
import { RecoveryScreen } from "@/features/insights/components/RecoveryScreen";

export const metadata: Metadata = {
  title: "Athletic Recovery & Readiness | PhysIQx",
  description: "Monitor systemic fatigue, ACWR training load ratio, and neuromuscular recovery capacity.",
};

export default function RecoveryPage() {
  return <RecoveryScreen />;
}

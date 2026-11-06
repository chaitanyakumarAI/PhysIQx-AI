import type { Metadata } from "next";
import { StrengthStandardsScreen } from "@/features/insights/components/StrengthStandardsScreen";

export const metadata: Metadata = {
  // The root layout's template adds " · PhysIQx AI".
  title: "Strength standards",
  description:
    "Compare your Big 4 compound lifts against canonical bodyweight percentiles and strength tiers.",
};

export default function StrengthStandardsPage() {
  return <StrengthStandardsScreen />;
}

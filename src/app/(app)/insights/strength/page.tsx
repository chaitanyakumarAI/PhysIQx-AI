import type { Metadata } from "next";
import { StrengthStandardsScreen } from "@/features/insights/components/StrengthStandardsScreen";

export const metadata: Metadata = {
  title: "Strength Standards & Percentiles | PhysIQx",
  description:
    "Compare your Big 4 compound lifts against canonical bodyweight percentiles and strength tiers.",
};

export default function StrengthStandardsPage() {
  return <StrengthStandardsScreen />;
}

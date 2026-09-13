import type { Metadata } from "next";
import { AchievementsContent } from "./AchievementsContent";

export const metadata: Metadata = {
  title: "Achievement Collection",
  description: "Track unlocked milestone badges and feature them in your showcase.",
};

export default function AchievementsPage() {
  return <AchievementsContent />;
}

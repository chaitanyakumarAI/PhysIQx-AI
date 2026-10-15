import type { Metadata } from "next";
import { CollectionScreen } from "@/features/collection/components/CollectionScreen";

export const metadata: Metadata = {
  title: "Collection",
  description: "Badges, milestones and ranks earned by training.",
};

export default function AchievementsPage() {
  return <CollectionScreen />;
}

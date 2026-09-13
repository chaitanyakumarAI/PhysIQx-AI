import type { Metadata } from "next";
import { HistoryContent } from "./HistoryContent";

export const metadata: Metadata = {
  title: "Workout History",
  description: "Chronological log of all completed training sessions.",
};

export default function HistoryPage() {
  return <HistoryContent />;
}

import type { Metadata } from "next";
import { getInsightsData } from "@/features/insights/api/getInsightsData";
import { InsightsScreen } from "./InsightsScreen";

export const metadata: Metadata = {
  title: "Insights",
};

// Thin server entry point: fetch through the service seam, hand the result
// to the declarative client composition. No business logic lives here.
export default async function InsightsPage() {
  const data = await getInsightsData();

  return (
    <InsightsScreen
      score={data.score}
      trends={data.trends}
      insights={data.insights}
      personalRecords={data.personalRecords}
      streakWeeks={data.streakWeeks}
    />
  );
}

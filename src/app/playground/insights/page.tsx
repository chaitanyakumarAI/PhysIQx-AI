import { getInsightsData } from "@/features/insights/api/getInsightsData";
import { InsightsPlaygroundDemo } from "./InsightsPlaygroundDemo";

/**
 * Dev-only verification harness for the Insights feature layer. Server page
 * fetches through the service seam, client demo adds range-selector state.
 * Not the Insights screen.
 */
export default async function InsightsFeaturePlaygroundPage() {
  const data = await getInsightsData();

  return (
    <InsightsPlaygroundDemo
      score={data.score}
      trends={data.trends}
      insights={data.insights}
      bodyBalance={data.bodyBalance}
      personalRecords={data.personalRecords}
      streakWeeks={data.streakWeeks}
    />
  );
}

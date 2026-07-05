import { getCompeteData } from "@/features/compete/api/getCompeteData";
import { CompetePlaygroundDemo } from "./CompetePlaygroundDemo";

/**
 * Dev-only verification harness for the Compete feature layer. Server page
 * fetches through the service seam, client demo adds scope-tab state.
 * Not the Compete screen.
 */
export default async function CompeteFeaturePlaygroundPage() {
  const data = await getCompeteData();

  return (
    <CompetePlaygroundDemo
      challenge={data.challenge}
      participation={data.participation}
      currentUserId={data.currentUserId}
      scopes={data.scopes}
      activity={data.activity}
    />
  );
}

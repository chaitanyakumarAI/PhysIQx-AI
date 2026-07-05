import type { Metadata } from "next";
import { getCompeteData } from "@/features/compete/api/getCompeteData";
import { CompeteScreen } from "./CompeteScreen";

export const metadata: Metadata = {
  title: "Compete",
};

// Thin server entry point: fetch through the service seam, hand the result
// to the declarative client composition. No business logic lives here.
export default async function CompetePage() {
  const data = await getCompeteData();

  return (
    <CompeteScreen
      challenge={data.challenge}
      participation={data.participation}
      currentUserId={data.currentUserId}
      scopes={data.scopes}
      activity={data.activity}
    />
  );
}

import type { Metadata } from "next";
import { getHomeData } from "@/features/home/api/getHomeData";
import { HomeScreen } from "./HomeScreen";

export const metadata: Metadata = {
  title: "Home",
};

// Thin server entry point: fetch through the service seam, hand the result
// to the declarative client composition. No business logic lives here.
// Note: the greeting is deliberately NOT computed here — this route is
// statically prerendered, so server-side time would freeze at build time.
export default async function HomePage() {
  const data = await getHomeData();

  return (
    <HomeScreen
      profile={data.profile}
      streak={data.streak}
      score={data.score}
      mission={data.mission}
      week={data.week}
      fuel={data.fuel}
      insight={data.insight}
      level={data.level}
    />
  );
}

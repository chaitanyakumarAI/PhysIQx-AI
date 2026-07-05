import type { Metadata } from "next";
import { getProfileData } from "@/features/profile/api/getProfileData";
import { ProfileScreen } from "./ProfileScreen";

export const metadata: Metadata = {
  title: "Profile",
};

// Thin server entry point: fetch through the service seam, hand the result
// to the declarative client composition. No business logic lives here.
export default async function ProfilePage() {
  const data = await getProfileData();

  return (
    <ProfileScreen
      profile={data.profile}
      score={data.score}
      level={data.level}
      streak={data.streak}
      stats={data.stats}
      achievements={data.achievements}
      settings={data.settings}
    />
  );
}

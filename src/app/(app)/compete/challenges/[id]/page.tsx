import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengeDetailContent } from "./ChallengeDetailContent";

interface ChallengePageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Challenge Details",
  description: "Community competition leaderboard, rules, and live standings.",
};

export default async function ChallengeDetailPage({ params }: ChallengePageProps) {
  const { id } = await params;
  return <ChallengeDetailContent challengeId={id} />;
}

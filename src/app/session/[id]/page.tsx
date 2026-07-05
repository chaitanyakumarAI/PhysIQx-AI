import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSessionSetup } from "@/features/session/api/getSessionSetup";
import { SessionScreen } from "./SessionScreen";

export const metadata: Metadata = {
  title: "Workout Session",
};

// Thin server entry point: resolve the mission/template by id through the
// service seam, hand the result to the client controller. Outside the
// (app) tab shell entirely — full-screen, no bottom nav, per docs/ROUTES.md.
export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const setup = await getSessionSetup(id);
  if (!setup) notFound();

  return (
    <SessionScreen
      missionId={id}
      mission={setup.mission}
      template={setup.template}
      exercises={setup.exercises}
    />
  );
}

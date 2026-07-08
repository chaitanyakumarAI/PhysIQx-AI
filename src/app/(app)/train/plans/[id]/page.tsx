import type { Metadata } from "next";
import { PlanEditor } from "@/features/train/components/PlanEditor";

export const metadata: Metadata = {
  title: "Edit plan",
};

// The plan itself lives client-side (persisted store) — this server page
// only unwraps the route param; PlanEditor loads the plan after hydration.
export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlanEditor planId={id} />;
}

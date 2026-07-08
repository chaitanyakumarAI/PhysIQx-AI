import type { Metadata } from "next";
import { PlanEditor } from "@/features/train/components/PlanEditor";

export const metadata: Metadata = {
  title: "New plan",
};

export default function NewPlanPage() {
  return <PlanEditor />;
}

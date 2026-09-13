import type { Metadata } from "next";
import { mockExercises } from "@/data/exercises";
import { ExerciseCatalogContent } from "./ExerciseCatalogContent";

export const metadata: Metadata = {
  title: "Exercise Library",
  description: "Browse 189 cataloged movements with EMG activation breakdowns, equipment specs, and mechanics.",
};

export default function ExerciseCatalogPage() {
  return <ExerciseCatalogContent exercises={mockExercises} />;
}

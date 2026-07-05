import type { Metadata } from "next";
import { getTrainData } from "@/features/train/api/getTrainData";
import { TrainScreen } from "./TrainScreen";

export const metadata: Metadata = {
  title: "Train",
};

// Thin server entry point: fetch through the service seam, hand the result
// to the declarative client composition. No business logic lives here.
export default async function TrainPage() {
  const data = await getTrainData();

  return (
    <TrainScreen
      mission={data.mission}
      programs={data.programs}
      activeProgramId={data.activeProgramId}
      exercises={data.exercises}
      catalogSize={data.catalogSize}
    />
  );
}

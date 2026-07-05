import { getTrainData } from "@/features/train/api/getTrainData";
import { TrainPlaygroundDemo } from "./TrainPlaygroundDemo";

/**
 * Dev-only verification harness for the Train feature layer. Server page
 * fetches through the service seam (TrainData is fully serializable), the
 * client demo adds filter state. Not the Train screen.
 */
export default async function TrainFeaturePlaygroundPage() {
  const data = await getTrainData();

  return (
    <TrainPlaygroundDemo
      mission={data.mission}
      programs={data.programs}
      activeProgramId={data.activeProgramId}
      exercises={data.exercises}
      catalogSize={data.catalogSize}
    />
  );
}

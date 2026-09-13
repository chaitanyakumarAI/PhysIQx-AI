import type { Metadata } from "next";
import { PhotosContent } from "./PhotosContent";

export const metadata: Metadata = {
  title: "Progress Photos",
  description: "Visual transformation timeline and before-and-after comparison journal.",
};

export default function ProgressPhotosPage() {
  return <PhotosContent />;
}

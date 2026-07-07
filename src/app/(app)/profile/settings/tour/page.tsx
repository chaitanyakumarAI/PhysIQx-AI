import type { Metadata } from "next";
import { TourContent } from "./TourContent";

export const metadata: Metadata = {
  title: "App tour",
};

export default function TourSettingsPage() {
  return <TourContent />;
}

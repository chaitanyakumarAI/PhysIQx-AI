import type { Metadata } from "next";
import { IntegrationsContent } from "./IntegrationsContent";

export const metadata: Metadata = {
  title: "Cardio sync & imports",
  description:
    "Import runs, rides and walks from GPX or TCX files. Strava is next; Apple Health and Health Connect come with the mobile app.",
};

export default function IntegrationsPage() {
  return <IntegrationsContent />;
}

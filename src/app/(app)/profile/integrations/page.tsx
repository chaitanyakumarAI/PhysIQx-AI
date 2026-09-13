import type { Metadata } from "next";
import { IntegrationsContent } from "./IntegrationsContent";

export const metadata: Metadata = {
  title: "Wearables & Integrations",
  description: "Sync workouts, biometric telemetry, and recovery metrics with Apple Health, Garmin, and Health Connect.",
};

export default function IntegrationsPage() {
  return <IntegrationsContent />;
}

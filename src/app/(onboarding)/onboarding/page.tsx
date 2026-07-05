import type { Metadata } from "next";
import { OnboardingFlow } from "@/features/onboarding/components/OnboardingFlow";

export const metadata: Metadata = {
  title: "Onboarding",
};

// Thin server wrapper (needed for the metadata export — a client component
// can't have one). Everything else lives in OnboardingFlow.
export default function OnboardingPage() {
  return <OnboardingFlow />;
}

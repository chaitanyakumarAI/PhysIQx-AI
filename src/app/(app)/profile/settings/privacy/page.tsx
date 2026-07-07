import type { Metadata } from "next";
import { PrivacyContent } from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacySettingsPage() {
  return <PrivacyContent />;
}

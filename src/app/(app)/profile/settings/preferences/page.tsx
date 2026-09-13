import type { Metadata } from "next";
import { PreferencesContent } from "./PreferencesContent";

export const metadata: Metadata = {
  title: "Preferences & Logging",
};

export default function PreferencesSettingsPage() {
  return <PreferencesContent />;
}

import type { Metadata } from "next";
import { AppearanceContent } from "./AppearanceContent";

export const metadata: Metadata = {
  title: "Appearance",
};

export default function AppearanceSettingsPage() {
  return <AppearanceContent />;
}

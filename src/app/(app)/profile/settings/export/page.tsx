import type { Metadata } from "next";
import { ExportContent } from "./ExportContent";

export const metadata: Metadata = {
  title: "Export data",
};

export default function ExportSettingsPage() {
  return <ExportContent />;
}

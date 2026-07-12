import type { Metadata } from "next";
import { BodyContent } from "./BodyContent";

export const metadata: Metadata = {
  title: "Body Stats",
};

export default function BodyStatsPage() {
  return <BodyContent />;
}

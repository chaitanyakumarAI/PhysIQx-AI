import type { Metadata } from "next";
import { CardioContent } from "./CardioContent";

export const metadata: Metadata = {
  title: "Log Cardio",
};

export default function CardioPage() {
  return <CardioContent />;
}

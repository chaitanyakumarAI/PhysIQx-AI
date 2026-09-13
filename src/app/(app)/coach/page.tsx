import type { Metadata } from "next";
import { CoachScreen } from "./CoachScreen";

export const metadata: Metadata = {
  title: "AI Coach Dialogue",
  description: "Direct conversational training guidance from Kix & Nyra.",
};

export default function CoachPage() {
  return <CoachScreen />;
}

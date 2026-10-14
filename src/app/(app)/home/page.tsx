import type { Metadata } from "next";
import { HomeScreen } from "./HomeScreen";

export const metadata: Metadata = {
  title: "Home",
};

// Everything on Home derives from the on-device ledger (local-first), so
// the route is a static shell and the screen reads the stores client-side.
export default function HomePage() {
  return <HomeScreen />;
}

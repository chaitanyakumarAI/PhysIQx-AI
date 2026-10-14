import type { Metadata } from "next";
import { ProfileScreen } from "./ProfileScreen";

export const metadata: Metadata = {
  title: "Profile",
};

// Derived from the on-device ledger — a static shell around a client screen.
export default function ProfilePage() {
  return <ProfileScreen />;
}

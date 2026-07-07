import type { Metadata } from "next";
import { AvatarContent } from "./AvatarContent";

export const metadata: Metadata = {
  title: "Avatar",
};

export default function AvatarSettingsPage() {
  return <AvatarContent />;
}

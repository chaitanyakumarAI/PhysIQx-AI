import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { StoreHydrator } from "@/components/providers/StoreHydrator";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// The display face — fills the --font-display slot reserved since Foundation.
// Space Grotesk: technical, confident numerals that separate data moments
// (score, PRs, timers) from prose, which Inter alone couldn't do.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PhysIQx AI",
    template: "%s · PhysIQx AI",
  },
  description: "Every rep feeds your PhysIQ Score.",
};

export const viewport: Viewport = {
  themeColor: "#0a0d0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <StoreHydrator />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

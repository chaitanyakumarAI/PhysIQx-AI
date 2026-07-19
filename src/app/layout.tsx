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
  // Only semibold and bold are used in the app (font-display class on score,
  // PRs, timers, headings). Loading all weights is ~15–25 KB wasted.
  weight: ["600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PhysIQx AI",
    template: "%s · PhysIQx AI",
  },
  description: "Every rep feeds your PhysIQ Score.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png",      sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png",      sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
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

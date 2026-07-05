import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { StoreHydrator } from "@/components/providers/StoreHydrator";
import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PhysIQx AI",
    template: "%s · PhysIQx AI",
  },
  description: "AI-powered fitness. Every rep feeds your PhysIQ Score.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StoreHydrator />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}

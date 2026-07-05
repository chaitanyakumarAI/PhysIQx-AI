"use client";

import { BarChart3, Dumbbell, Home, User, Users } from "lucide-react";
import {
  BottomNavigation,
  type BottomNavItem,
} from "@/components/navigation/BottomNavigation";
import { ResumeSessionBanner } from "@/features/session/components/ResumeSessionBanner";

// Client leaf so the (app) layout can stay a Server Component. navItems hold
// Lucide icon components (functions), which can't cross the server/client
// boundary as props — so the app's tab IA is defined here, on the client side
// of the boundary, while the generic BottomNavigation stays config-driven.
const navItems: BottomNavItem[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/train", label: "Train", icon: Dumbbell },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/compete", label: "Compete", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppBottomNav() {
  return (
    <>
      <ResumeSessionBanner />
      <BottomNavigation items={navItems} />
    </>
  );
}

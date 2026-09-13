"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  Download,
  LogOut,
  Moon,
  Play,
  Ruler,
  Shield,
  Sliders,
  Camera,
  type LucideIcon,
} from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { SettingsIconId, SettingsItem } from "../types";

export interface SettingsRowProps {
  item: SettingsItem;
  className?: string;
}

const settingsIcon: Record<SettingsIconId, LucideIcon> = {
  bell: Bell,
  moon: Moon,
  shield: Shield,
  download: Download,
  user: CircleUserRound,
  play: Play,
  ruler: Ruler,
  sliders: Sliders,
  camera: Camera,
  "log-out": LogOut,
};

export function SettingsRow({ item, className }: SettingsRowProps) {
  const router = useRouter();
  const Icon = settingsIcon[item.iconId];

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (item.id === "logout") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60",
          className,
        )}
      >
        <Icon size={iconSize.sm} aria-hidden className="shrink-0 text-red-400" />
        <span className="flex-1 font-semibold">{item.label}</span>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
        item.accent && "text-brand",
        className,
      )}
    >
      <Icon
        size={iconSize.sm}
        aria-hidden
        className={cn("shrink-0", item.accent ? "text-brand" : "text-foreground-secondary")}
      />
      <span className={cn("flex-1 font-medium", item.accent && "font-semibold")}>
        {item.label}
      </span>
      {item.value && <span className="text-sm text-foreground-secondary">{item.value}</span>}
      <ChevronRight
        size={iconSize.sm}
        aria-hidden
        className={cn("shrink-0", item.accent ? "text-brand" : "text-foreground-secondary")}
      />
    </Link>
  );
}

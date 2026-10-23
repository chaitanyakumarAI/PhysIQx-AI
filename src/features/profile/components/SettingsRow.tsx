"use client";

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CircleUserRound,
  Cloud,
  Download,
  LogOut,
  Moon,
  Play,
  Ruler,
  Shield,
  Sliders,
  Camera,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import type { SettingsIconId, SettingsItem } from "../types";
import { LogoutRow } from "./LogoutRow";
import { SyncRow } from "./SyncRow";

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
  activity: Activity,
  "log-out": LogOut,
  cloud: Cloud,
};

export function SettingsRow({ item, className }: SettingsRowProps) {
  const Icon = settingsIcon[item.iconId];

  // Rows with behaviour, not just a destination.
  if (item.id === "logout") return <LogoutRow item={item} className={className} />;
  if (item.id === "sync") return <SyncRow item={item} className={className} />;

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

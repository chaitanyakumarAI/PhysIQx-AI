"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { iconSize } from "@/constants/icons";

export interface SettingsPageHeaderProps {
  title: string;
}

/** Shared header for the four Settings sub-pages — back-to-Profile + title. */
export function SettingsPageHeader({ title }: SettingsPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 pt-6">
      <IconButton label="Back to Profile" variant="ghost" onClick={() => router.push("/profile")}>
        <ArrowLeft size={iconSize.sm} aria-hidden />
      </IconButton>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
    </div>
  );
}

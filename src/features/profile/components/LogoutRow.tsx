"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut } from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import { prepareSignOut, signOutAndClear, useSyncState } from "@/lib/sync/pullClient";
import { cn } from "@/lib/utils";
import type { SettingsItem } from "../types";

const rowClass =
  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2";

/**
 * Profile › Log out (owner decision 2026-10-23): upload what's waiting, then
 * remove the account's data from this device — it's safe in the cloud, and
 * a shared phone shouldn't show it. If changes couldn't upload (offline),
 * ask first. Guests have nothing to sign out of: the row offers sign-in.
 */
export function LogoutRow({ item, className }: { item: SettingsItem; className?: string }) {
  const router = useRouter();
  const { account } = useSyncState();
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState<number | null>(null);

  if (!account) {
    return (
      <Link href="/login" className={cn(rowClass, "focus-visible:ring-brand/60", className)}>
        <LogIn size={iconSize.sm} aria-hidden className="shrink-0 text-foreground-secondary" />
        <span className="flex-1 font-medium">Sign in</span>
      </Link>
    );
  }

  async function signOut() {
    setBusy(true);
    try {
      await signOutAndClear();
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
      setWaiting(null);
    }
  }

  async function handleClick() {
    setBusy(true);
    const pending = await prepareSignOut().finally(() => setBusy(false));
    if (pending > 0) setWaiting(pending);
    else await signOut();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        className={cn(rowClass, "text-red-400 focus-visible:ring-red-500/60 disabled:cursor-progress", className)}
      >
        <LogOut size={iconSize.sm} aria-hidden className="shrink-0 text-red-400" />
        <span className="flex-1 font-semibold">{busy ? "Signing out…" : item.label}</span>
      </button>

      <BottomSheet open={waiting !== null} onClose={() => setWaiting(null)} title="Changes still uploading">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-foreground-secondary">
            {waiting === 1 ? "1 change hasn't" : `${waiting} changes haven't`} reached the cloud yet —
            you may be offline. Signing out removes your data from this device. The changes stay
            queued and upload the next time you sign in here.
          </p>
          <Button fullWidth onClick={() => setWaiting(null)}>
            Stay signed in
          </Button>
          <Button fullWidth variant="ghost" loading={busy} onClick={() => void signOut()}>
            Sign out anyway
          </Button>
        </div>
      </BottomSheet>
    </>
  );
}

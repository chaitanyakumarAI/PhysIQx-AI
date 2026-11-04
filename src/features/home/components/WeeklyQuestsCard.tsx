"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { iconSize } from "@/constants/icons";
import { daysBetweenIso } from "@/lib/dates";
import { QUEST_XP, SWEEP_XP, weeklyQuests } from "@/lib/gamification/quests";
import { cn } from "@/lib/utils";
import type { Ledger } from "@/types/ledger";

interface WeeklyQuestsCardProps {
  ledger: Ledger;
  todayIso: string;
}

const formatAmount = (value: number) => value.toLocaleString("en-US");

/** This week's three quests (lib/gamification/quests), with progress. */
export function WeeklyQuestsCard({ ledger, todayIso }: WeeklyQuestsCardProps) {
  const week = useMemo(() => weeklyQuests(ledger, todayIso, todayIso), [ledger, todayIso]);
  const daysLeft = daysBetweenIso(todayIso, week.weekEnd);

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold">This week&apos;s quests</h3>
        <span className="text-xs font-semibold text-foreground-secondary">
          {daysLeft === 0 ? "Last day" : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {week.quests.map((quest) => {
          const done = quest.doneOn !== null;
          return (
            <li key={quest.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className={cn("flex items-center gap-2 font-medium", done && "text-brand")}>
                  {done && <Check size={iconSize.xs} aria-hidden />}
                  {quest.title}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-foreground-secondary">
                  {done
                    ? `+${QUEST_XP} XP`
                    : `${formatAmount(quest.progress)} / ${formatAmount(quest.target)}${quest.unit ? ` ${quest.unit}` : ""}`}
                </span>
              </div>
              <ProgressBar
                value={quest.progress}
                max={quest.target}
                size="sm"
                aria-label={`${quest.title}: ${formatAmount(quest.progress)} of ${formatAmount(quest.target)}`}
              />
            </li>
          );
        })}
      </ul>
      <p className={cn("text-xs", week.sweptOn ? "font-semibold text-brand" : "text-foreground-secondary")}>
        {week.sweptOn ? `Clean sweep · +${SWEEP_XP} XP` : `Finish all three for a +${SWEEP_XP} XP sweep`}
      </p>
    </Card>
  );
}

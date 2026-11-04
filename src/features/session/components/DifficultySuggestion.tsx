"use client";

import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { todayIso } from "@/lib/dates";
import { difficultySignal, type DifficultySignal } from "@/lib/difficulty";
import { useSessionStore } from "@/store/sessionStore";

const COPY: Record<DifficultySignal["kind"], { title: string; body: (signal: DifficultySignal) => string; apply: string }> = {
  deload: {
    title: "Lighter day suggested",
    body: ({ sessions, avgRpe }) =>
      `Your last ${sessions} workouts averaged RPE ${avgRpe}. Drop one set per exercise and rest a little longer today.`,
    apply: "Make it lighter",
  },
  "add-set": {
    title: "Room to push",
    body: ({ sessions, avgRpe }) =>
      `Your last ${sessions} workouts averaged RPE ${avgRpe}. Add one more set to each exercise today.`,
    apply: "Add the sets",
  },
};

/**
 * Today's difficulty suggestion, from logged RPE (lib/difficulty). The
 * athlete decides: nothing changes until they apply it, and once answered
 * it's gone for this workout.
 */
export function DifficultySuggestion() {
  const history = useSessionStore((state) => state.history);
  const answered = useSessionStore((state) => Boolean(state.session?.difficulty));
  const answer = useSessionStore((state) => state.answerDifficulty);
  const signal = useMemo(() => difficultySignal(history, todayIso()), [history]);

  if (!signal || answered) return null;
  const copy = COPY[signal.kind];
  const Icon = signal.kind === "deload" ? TrendingDown : TrendingUp;

  return (
    <Card padding="md" role="region" aria-label={copy.title} className="flex flex-col gap-3 border-brand/30">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
          <Icon size={iconSize.sm} aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{copy.title}</p>
          <p className="text-sm text-foreground-secondary">{copy.body(signal)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" fullWidth onClick={() => answer(signal.kind, "dismissed")}>
          Not today
        </Button>
        <Button size="sm" fullWidth onClick={() => answer(signal.kind, "applied")}>
          {copy.apply}
        </Button>
      </div>
    </Card>
  );
}

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { findProgram, programLevelLabels } from "@/data/programs";
import type { ProgramType } from "@/types/training";

export interface ProgramSummaryCardProps {
  programType: ProgramType;
  className?: string;
}

const levelTone: Record<string, string> = {
  beginner: "bg-brand/15 text-brand",
  intermediate: "bg-info/15 text-info",
  advanced: "bg-danger/15 text-danger",
};

/**
 * The chip row's compact preview: name, level, two lines of description,
 * and the path to the full program page. The complete schedule lives at
 * /train/programs/[type] — inlining it here made Train a three-screen
 * scroll (visual-audit finding).
 */
export function ProgramSummaryCard({ programType, className }: ProgramSummaryCardProps) {
  if (programType === "ai") {
    return (
      <Card padding="md" className={className}>
        <p className="text-sm leading-relaxed text-foreground-secondary">
          The Coach program builds Today&apos;s Mission for you automatically —
          nothing to browse. Pick any preset chip to see its full weekly
          schedule.
        </p>
      </Card>
    );
  }

  const program = findProgram(programType);
  if (!program) return null;

  return (
    <Card padding="md" className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{program.name}</h3>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
            levelTone[program.level],
          )}
        >
          {programLevelLabels[program.level]}
        </span>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
        {program.description}
      </p>
      <Link
        href={`/train/programs/${program.type}`}
        className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 rounded-full"
      >
        View program
        <ChevronRight size={iconSize.xs} aria-hidden />
      </Link>
    </Card>
  );
}

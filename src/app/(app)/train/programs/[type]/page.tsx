import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { iconSize } from "@/constants/icons";
import { findProgram, programLibrary } from "@/data/programs";
import { ProgramSchedule } from "@/features/train/components/ProgramSchedule";
import type { ProgramType } from "@/types/training";

interface ProgramPageProps {
  params: Promise<{ type: string }>;
}

export function generateStaticParams() {
  return programLibrary.map((program) => ({ type: program.type }));
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { type } = await params;
  return { title: findProgram(type as ProgramType)?.name ?? "Program" };
}

/**
 * A program's own page — the full weekly schedule, notes, calendar link,
 * and adopt action. Train's chip row links here via compact summary cards;
 * inlining all of this on Train made the tab a three-screen scroll
 * (visual-audit finding).
 */
export default async function ProgramPage({ params }: ProgramPageProps) {
  const { type } = await params;
  const program = findProgram(type as ProgramType);
  if (!program) notFound();

  return (
    <PageContainer>
      <div className="flex items-center gap-3 pt-6">
        <Link
          href="/train"
          aria-label="Back to Train"
          className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
        >
          <ArrowLeft size={iconSize.sm} aria-hidden />
        </Link>
        <h1 className="font-display text-2xl font-bold">{program.name}</h1>
      </div>
      <ProgramSchedule programType={program.type} hideTitle />
    </PageContainer>
  );
}

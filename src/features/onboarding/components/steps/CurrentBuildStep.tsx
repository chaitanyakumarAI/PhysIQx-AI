import Image from "next/image";
import { Check } from "lucide-react";
import { BODY_BUILDS, bodyBuildImage } from "@/lib/bodyShape";
import { cn } from "@/lib/utils";
import type { BodyBuild, Sex } from "@/types/ledger";

export interface CurrentBuildStepProps {
  value: BodyBuild | undefined;
  sex: Sex | undefined;
  onChange: (value: BodyBuild) => void;
}

/**
 * The Body Shape pillar is self-reported, never computed from photos:
 * pick the silhouette closest to you today. Honest beats flattering — it
 * only moves up from here.
 */
export function CurrentBuildStep({ value, sex, onChange }: CurrentBuildStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold">Which build is closest to you today?</h2>
        <p className="mt-1 text-sm text-foreground-secondary">
          Be honest — this is your starting line, and you can update it anytime.
        </p>
      </div>
      <div role="radiogroup" aria-label="Current build" className="grid grid-cols-2 gap-3">
        {BODY_BUILDS.map((build) => {
          const selected = value === build.id;
          return (
            <button
              key={build.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${build.label}: ${build.description}`}
              onClick={() => onChange(build.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-card border p-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60",
                selected
                  ? "border-brand bg-brand/10"
                  : "border-border bg-surface hover:bg-surface-elevated",
              )}
            >
              {selected && (
                <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand text-zinc-950">
                  <Check size={14} aria-hidden />
                </span>
              )}
              <Image
                src={bodyBuildImage(build.id, sex ?? null)}
                alt=""
                width={120}
                height={160}
                className="h-32 w-auto object-contain"
              />
              <span className="text-sm font-semibold">{build.label}</span>
              <span className="text-xs text-foreground-secondary">{build.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { iconSize } from "@/constants/icons";
import { parseActivityFile, SUPPORTED_EXTENSIONS } from "@/lib/cardio/parsers";
import { queueCardio } from "@/lib/sync/syncClient";
import { useCardioStore } from "@/store/cardioStore";

/** Larger files are almost certainly not a single activity export. */
const MAX_FILE_BYTES = 25 * 1024 * 1024;

interface ImportOutcome {
  added: number;
  updated: number;
  duplicates: number;
  problems: string[];
}

function describe(outcome: ImportOutcome): string {
  const parts = [
    outcome.added > 0 && `${outcome.added} added`,
    outcome.updated > 0 && `${outcome.updated} merged with an existing activity`,
    outcome.duplicates > 0 && `${outcome.duplicates} already imported`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Nothing new to import";
}

/**
 * Import exported activities (GPX/TCX, many at once). Parsing happens on
 * the device; the ledger de-duplicates across files and sources, and new
 * activities are queued for cloud sync.
 */
export function CardioImportCard({ className }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const ingest = useCardioStore((state) => state.ingest);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const problems: string[] = [];
    const incoming = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_BYTES) {
        problems.push(`${file.name} is too large to be one activity.`);
        continue;
      }
      const parsed = parseActivityFile(file.name, await file.text());
      incoming.push(...parsed.activities);
      problems.push(...parsed.errors.map((error) => `${file.name}: ${error}`));
    }
    const result = ingest(incoming);
    queueCardio(result.changed);
    if (result.rejected > 0) {
      problems.push(
        `${result.rejected} ${result.rejected === 1 ? "activity was" : "activities were"} skipped (too short, too long, or dated in the future).`,
      );
    }
    setOutcome({ added: result.added, updated: result.updated, duplicates: result.duplicates, problems });
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card padding="md" className={className}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">
          <FileUp size={iconSize.sm} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">Import activities</h3>
          <p className="mt-0.5 text-sm text-foreground-secondary">
            GPX or TCX exports from Garmin, Strava, Coros, Polar, Wahoo or Apple Health apps.
            Select several at once — duplicates are merged.
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(",")}
        multiple
        className="sr-only"
        aria-label="Choose GPX or TCX files"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 size={iconSize.xs} className="animate-spin" aria-hidden /> : <FileUp size={iconSize.xs} aria-hidden />}
        {busy ? "Importing…" : "Choose files"}
      </Button>
      {outcome && (
        <div role="status" className="mt-3 rounded-field bg-surface-elevated/70 p-3 text-sm">
          <p className="font-semibold">{describe(outcome)}</p>
          {outcome.problems.map((problem) => (
            <p key={problem} className="mt-1 text-xs text-warning">
              {problem}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}

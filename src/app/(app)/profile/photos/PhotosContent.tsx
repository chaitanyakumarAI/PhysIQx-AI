"use client";

import { useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Plus,
  Trash2,
  Lock,
  Columns,
  Grid,
  Calendar,
  Scale,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { iconSize } from "@/constants/icons";
import { cn } from "@/lib/utils";
import { useProfileStore, type ProgressPhotoEntry } from "@/store/profileStore";

type ViewMode = "timeline" | "compare";
type AngleFilter = "all" | "front" | "side" | "back";

export function PhotosContent() {
  const photos = useProfileStore((state) => state.photos) ?? [];
  const addPhoto = useProfileStore((state) => state.addPhoto);
  const deletePhoto = useProfileStore((state) => state.deletePhoto);
  const weightEntries = useProfileStore((state) => state.weightEntries);

  const [mode, setMode] = useState<ViewMode>("timeline");
  const [angleFilter, setAngleFilter] = useState<AngleFilter>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Compare mode selection IDs
  const [baselineId, setBaselineId] = useState<string>(
    photos[photos.length - 1]?.id ?? ""
  );
  const [currentId, setCurrentId] = useState<string>(photos[0]?.id ?? "");

  // Upload modal form state
  const latestWeight = weightEntries[weightEntries.length - 1]?.weightKg ?? 80;
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]!);
  const [newAngle, setNewAngle] = useState<"front" | "side" | "back">("front");
  const [newWeight, setNewWeight] = useState<string>(latestWeight.toString());
  const [newNotes, setNewNotes] = useState("");
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered photos for timeline
  const filteredPhotos = useMemo(() => {
    if (angleFilter === "all") return photos;
    return photos.filter((p) => p.angle === angleFilter);
  }, [photos, angleFilter]);

  // Selected compare photos
  const baselinePhoto = photos.find((p) => p.id === baselineId) ?? photos[photos.length - 1];
  const currentPhoto = photos.find((p) => p.id === currentId) ?? photos[0];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleSavePhoto() {
    // If no custom image was uploaded, generate a themed athletic SVG silhouette
    let finalDataUrl = newImagePreview;
    if (!finalDataUrl) {
      const color = newAngle === "front" ? "%2310b981" : newAngle === "side" ? "%2338bdf8" : "%23a855f7";
      finalDataUrl = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500' fill='%23121214'><rect width='400' height='500' rx='16' fill='%2318181b'/><circle cx='200' cy='130' r='45' fill='${color}' fill-opacity='0.3' stroke='${color}' stroke-width='2'/><path d='M130,220 C130,170 270,170 270,220 L280,360 C280,380 250,390 200,390 C150,390 120,380 120,360 Z' fill='${color}' fill-opacity='0.25' stroke='${color}' stroke-width='2'/><text x='200' y='450' fill='${color}' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>Logged Check-in (${newAngle.toUpperCase()})</text></svg>`;
    }

    addPhoto({
      date: newDate,
      angle: newAngle,
      weightKg: newWeight ? parseFloat(newWeight) : undefined,
      notes: newNotes.trim() || undefined,
      dataUrl: finalDataUrl,
    });

    // Reset and close
    setShowUploadModal(false);
    setNewImagePreview(null);
    setNewNotes("");
  }

  // Calculate comparison deltas
  const compareStats = useMemo(() => {
    if (!baselinePhoto || !currentPhoto) return null;
    const baseDate = new Date(baselinePhoto.date);
    const currDate = new Date(currentPhoto.date);
    const daysDiff = Math.round(
      (currDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weightDiff =
      currentPhoto.weightKg && baselinePhoto.weightKg
        ? Number((currentPhoto.weightKg - baselinePhoto.weightKg).toFixed(1))
        : null;

    return { daysDiff, weightDiff };
  }, [baselinePhoto, currentPhoto]);

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-3 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              aria-label="Back to Profile"
              className="grid size-11 place-items-center rounded-full text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              <ArrowLeft size={iconSize.sm} aria-hidden />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold">Progress Photos</h1>
              <p className="text-xs text-foreground-secondary">
                {photos.length} transformation check-ins
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5"
          >
            <Camera size={14} aria-hidden />
            <span>Add Check-in</span>
          </Button>
        </div>

        {/* Local-First Privacy Guarantee */}
        <div className="flex items-center gap-2 rounded-field border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-foreground-secondary">
          <Lock size={13} className="shrink-0 text-brand" />
          <span>
            <strong className="text-foreground">100% Private & Local:</strong> Photos stay securely on your device and are never uploaded to external servers.
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-card border border-border/60 bg-surface p-1">
          <button
            onClick={() => setMode("timeline")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-field py-2 text-xs font-semibold transition-colors",
              mode === "timeline"
                ? "bg-brand text-background shadow"
                : "text-foreground-secondary hover:text-foreground"
            )}
          >
            <Grid size={14} />
            Timeline Gallery
          </button>
          <button
            onClick={() => setMode("compare")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-field py-2 text-xs font-semibold transition-colors",
              mode === "compare"
                ? "bg-brand text-background shadow"
                : "text-foreground-secondary hover:text-foreground"
            )}
          >
            <Columns size={14} />
            Before & After Compare
          </button>
        </div>
      </div>

      {/* Upload / Log Modal */}
      {showUploadModal && (
        <Card padding="lg" className="my-3 border-brand/40 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold flex items-center gap-2">
              <Camera size={18} className="text-brand" />
              Log Transformation Photo
            </h3>
            <button
              onClick={() => setShowUploadModal(false)}
              className="text-foreground-secondary hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            {/* Angle Selection */}
            <div>
              <span className="font-semibold uppercase text-foreground-secondary block mb-1">
                Pose Angle
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["front", "side", "back"] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setNewAngle(a)}
                    className={cn(
                      "py-2 rounded-field border font-semibold capitalize text-center transition-colors",
                      newAngle === a
                        ? "border-brand bg-brand/15 text-brand"
                        : "border-border/60 bg-surface-elevated text-foreground-secondary hover:text-foreground"
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold uppercase text-foreground-secondary block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-field border border-border/60 bg-surface px-3 py-2 text-xs focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold uppercase text-foreground-secondary block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="e.g. 80.5"
                  className="w-full rounded-field border border-border/60 bg-surface px-3 py-2 text-xs focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="font-semibold uppercase text-foreground-secondary block mb-1">
                Notes & Reflections (Optional)
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Visible quad separation, rested state..."
                className="w-full rounded-field border border-border/60 bg-surface px-3 py-2 text-xs focus:border-brand focus:outline-none"
              />
            </div>

            {/* Photo Upload or Silhouette */}
            <div>
              <span className="font-semibold uppercase text-foreground-secondary block mb-1">
                Select Photo or Camera
              </span>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 rounded-field border border-dashed border-border/80 bg-surface-elevated/40 p-4 transition-colors hover:border-brand/60"
              >
                {newImagePreview ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={newImagePreview}
                      alt="Preview"
                      className="max-h-36 rounded-md object-contain"
                    />
                    <span className="text-[11px] text-brand underline">Replace photo</span>
                  </div>
                ) : (
                  <>
                    <Upload size={20} className="text-foreground-secondary" />
                    <span className="text-xs text-foreground-secondary">
                      Tap to upload photo or take picture
                    </span>
                    <span className="text-[10px] text-foreground-secondary/70">
                      (Or leave empty to use an athletic silhouette)
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </Button>
            <Button size="sm" fullWidth onClick={handleSavePhoto}>
              Save Check-in
            </Button>
          </div>
        </Card>
      )}

      {/* TIMELINE VIEW */}
      {mode === "timeline" && (
        <div className="flex flex-col gap-4 pb-8">
          {/* Angle Filter Chips */}
          <div className="flex gap-2 pt-1">
            {(["all", "front", "side", "back"] as const).map((angle) => (
              <button
                key={angle}
                onClick={() => setAngleFilter(angle)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors",
                  angleFilter === angle
                    ? "bg-brand text-background"
                    : "bg-surface-elevated text-foreground-secondary hover:text-foreground"
                )}
              >
                {angle === "all" ? "All Angles" : angle}
              </button>
            ))}
          </div>

          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPhotos.map((photo) => (
                <Card
                  key={photo.id}
                  padding="md"
                  className="flex flex-col gap-3 overflow-hidden border-border/60 group hover:border-brand/40 transition-colors"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-elevated">
                    <img
                      src={photo.dataUrl}
                      alt={`${photo.angle} progress on ${photo.date}`}
                      className="size-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-foreground">
                        {photo.angle}
                      </span>
                    </div>
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="absolute top-2.5 right-2.5 grid size-7 place-items-center rounded-full bg-background/80 text-foreground-secondary hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete check-in"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between text-foreground-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(`${photo.date}T00:00:00`).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {photo.weightKg && (
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Scale size={12} />
                          {photo.weightKg} kg
                        </span>
                      )}
                    </div>
                    {photo.notes && (
                      <p className="mt-1 text-xs text-foreground-secondary italic">
                        "{photo.notes}"
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card padding="lg" className="flex flex-col items-center gap-3 text-center my-6">
              <Camera size={28} className="text-foreground-secondary" />
              <p className="font-semibold text-sm">No photos found for this angle</p>
              <Button size="sm" onClick={() => setShowUploadModal(true)}>
                Take or add check-in
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* COMPARE VIEW */}
      {mode === "compare" && (
        <div className="flex flex-col gap-4 pb-8">
          {/* Comparison Delta Summary */}
          {compareStats && (
            <Card padding="md" variant="accent" className="flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
                  Time Span
                </span>
                <span className="font-display text-lg font-bold text-brand">
                  {Math.abs(compareStats.daysDiff)} days
                </span>
              </div>
              <div className="h-8 w-px bg-border/60" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground-secondary block">
                  Weight Delta
                </span>
                <span
                  className={cn(
                    "font-display text-lg font-bold",
                    compareStats.weightDiff !== null && compareStats.weightDiff <= 0
                      ? "text-brand"
                      : "text-info"
                  )}
                >
                  {compareStats.weightDiff !== null
                    ? `${compareStats.weightDiff > 0 ? "+" : ""}${compareStats.weightDiff} kg`
                    : "--"}
                </span>
              </div>
            </Card>
          )}

          {/* Comparison Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase text-foreground-secondary block mb-1">
                Baseline (Before)
              </label>
              <select
                value={baselineId}
                onChange={(e) => setBaselineId(e.target.value)}
                className="w-full rounded-field border border-border/60 bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
              >
                {photos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.date} ({p.angle}) · {p.weightKg ? `${p.weightKg}kg` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-foreground-secondary block mb-1">
                Current (After)
              </label>
              <select
                value={currentId}
                onChange={(e) => setCurrentId(e.target.value)}
                className="w-full rounded-field border border-border/60 bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
              >
                {photos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.date} ({p.angle}) · {p.weightKg ? `${p.weightKg}kg` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Baseline */}
            {baselinePhoto && (
              <Card padding="sm" className="flex flex-col gap-2 overflow-hidden border-border/60">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-elevated">
                  <img
                    src={baselinePhoto.dataUrl}
                    alt="Baseline"
                    className="size-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-background/80 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-foreground">
                    Before
                  </span>
                </div>
                <div className="text-[11px] text-foreground-secondary flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">{baselinePhoto.date}</span>
                  <span>{baselinePhoto.weightKg ? `${baselinePhoto.weightKg} kg` : ""}</span>
                  {baselinePhoto.notes && (
                    <span className="truncate italic">"{baselinePhoto.notes}"</span>
                  )}
                </div>
              </Card>
            )}

            {/* Current */}
            {currentPhoto && (
              <Card padding="sm" className="flex flex-col gap-2 overflow-hidden border-brand/40">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md bg-surface-elevated">
                  <img
                    src={currentPhoto.dataUrl}
                    alt="Current"
                    className="size-full object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-brand text-background px-2 py-0.5 text-[10px] font-bold">
                    After
                  </span>
                </div>
                <div className="text-[11px] text-foreground-secondary flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">{currentPhoto.date}</span>
                  <span className="text-brand font-semibold">
                    {currentPhoto.weightKg ? `${currentPhoto.weightKg} kg` : ""}
                  </span>
                  {currentPhoto.notes && (
                    <span className="truncate italic">"{currentPhoto.notes}"</span>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

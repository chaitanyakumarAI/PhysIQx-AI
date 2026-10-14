import type { CardioActivityType } from "@/types/cardio";
import type { IncomingActivity } from "./ingest";

/**
 * GPX / TCX import — the cardio source that works in every browser today.
 * Garmin, Strava, Apple Health (via export apps), Coros, Polar and Wahoo
 * can all export these formats. Parsing uses the platform's DOMParser and
 * matches elements by local name, so vendor namespaces (gpxtpx:, ns3:)
 * don't matter.
 */

export interface ParseResult {
  activities: IncomingActivity[];
  /** Human-readable reasons a file (or part of it) couldn't be used. */
  errors: string[];
}

/** Element name without any namespace prefix, lower-cased. */
function bareName(element: Element): string {
  return (element.localName || element.tagName).split(":").pop()!.toLowerCase();
}

/**
 * Descendants by local name — prefix- and case-insensitive, because XML
 * parsers (and exporters) disagree on both.
 */
function elements(root: Element | Document, localName: string): Element[] {
  const wanted = localName.toLowerCase();
  return Array.from(root.getElementsByTagName("*")).filter(
    (element) => bareName(element) === wanted,
  );
}

/** Attribute lookup tolerant of parsers that lower-case attribute names. */
function attribute(element: Element, name: string): string | null {
  return element.getAttribute(name) ?? element.getAttribute(name.toLowerCase());
}

function firstText(root: Element, localName: string): string | null {
  return elements(root, localName)[0]?.textContent?.trim() || null;
}

function toNumber(value: string | null | undefined): number | undefined {
  if (value === null || value === undefined || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

const TYPE_KEYWORDS: [RegExp, CardioActivityType][] = [
  [/run|jog/i, "run"],
  [/ride|cycl|bik|biking/i, "cycle"],
  [/walk|hik/i, "walk"],
  [/swim/i, "swim"],
  [/row/i, "row"],
  [/hiit|interval|crossfit/i, "hiit"],
  [/soccer|football|tennis|basketball|sport/i, "sports"],
];

export function activityTypeFrom(...hints: (string | null | undefined)[]): CardioActivityType {
  for (const hint of hints) {
    if (!hint) continue;
    for (const [pattern, type] of TYPE_KEYWORDS) if (pattern.test(hint)) return type;
  }
  return "other";
}

/** Great-circle distance in km between two lat/lon points. */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseXml(text: string): Document | null {
  const document = new DOMParser().parseFromString(text, "application/xml");
  return elements(document, "parsererror").length > 0 ? null : document;
}

export function parseGpx(text: string): ParseResult {
  const document = parseXml(text);
  if (!document) return { activities: [], errors: ["The GPX file couldn't be read."] };
  const activities: IncomingActivity[] = [];
  const errors: string[] = [];

  for (const track of elements(document, "trk")) {
    const points = elements(track, "trkpt")
      .map((point) => ({
        lat: toNumber(attribute(point, "lat")),
        lon: toNumber(attribute(point, "lon")),
        time: Date.parse(firstText(point, "time") ?? ""),
        hr: toNumber(firstText(point, "hr")),
      }))
      .filter((point) => Number.isFinite(point.time));
    if (points.length < 2) {
      errors.push("A track had no timestamps, so its duration is unknown.");
      continue;
    }
    let distanceKm = 0;
    for (let index = 1; index < points.length; index++) {
      const [a, b] = [points[index - 1]!, points[index]!];
      if (a.lat !== undefined && a.lon !== undefined && b.lat !== undefined && b.lon !== undefined) {
        distanceKm += haversineKm(a.lat, a.lon, b.lat, b.lon);
      }
    }
    const heartRates = points.flatMap((point) => (point.hr ? [point.hr] : []));
    const startedAt = new Date(points[0]!.time).toISOString();
    activities.push({
      source: "gpx",
      externalId: startedAt,
      type: activityTypeFrom(firstText(track, "type"), firstText(track, "name")),
      startedAt,
      durationMin: (points.at(-1)!.time - points[0]!.time) / 60_000,
      distanceKm: distanceKm > 0 ? distanceKm : undefined,
      avgHeartRate: heartRates.length
        ? heartRates.reduce((sum, hr) => sum + hr, 0) / heartRates.length
        : undefined,
      maxHeartRate: heartRates.length ? Math.max(...heartRates) : undefined,
    });
  }
  if (activities.length === 0 && errors.length === 0) {
    errors.push("No tracks were found in the GPX file.");
  }
  return { activities, errors };
}

export function parseTcx(text: string): ParseResult {
  const document = parseXml(text);
  if (!document) return { activities: [], errors: ["The TCX file couldn't be read."] };
  const activities: IncomingActivity[] = [];
  const errors: string[] = [];

  for (const activity of elements(document, "Activity")) {
    const laps = elements(activity, "Lap");
    const startedAt =
      firstText(activity, "Id") ?? (laps[0] ? attribute(laps[0], "StartTime") : null);
    if (!startedAt || laps.length === 0) {
      errors.push("An activity had no laps or start time.");
      continue;
    }
    let seconds = 0;
    let meters = 0;
    let calories = 0;
    let weightedHr = 0;
    let maxHr = 0;
    for (const lap of laps) {
      const lapSeconds = toNumber(firstText(lap, "TotalTimeSeconds")) ?? 0;
      seconds += lapSeconds;
      meters += toNumber(firstText(lap, "DistanceMeters")) ?? 0;
      calories += toNumber(firstText(lap, "Calories")) ?? 0;
      const average = elements(lap, "AverageHeartRateBpm")[0];
      const maximum = elements(lap, "MaximumHeartRateBpm")[0];
      weightedHr += (toNumber(average && firstText(average, "Value")) ?? 0) * lapSeconds;
      maxHr = Math.max(maxHr, toNumber(maximum && firstText(maximum, "Value")) ?? 0);
    }
    activities.push({
      source: "tcx",
      externalId: startedAt,
      type: activityTypeFrom(attribute(activity, "Sport"), firstText(activity, "Notes")),
      startedAt,
      durationMin: seconds / 60,
      distanceKm: meters > 0 ? meters / 1000 : undefined,
      calories: calories > 0 ? calories : undefined,
      avgHeartRate: weightedHr > 0 && seconds > 0 ? weightedHr / seconds : undefined,
      maxHeartRate: maxHr > 0 ? maxHr : undefined,
    });
  }
  if (activities.length === 0 && errors.length === 0) {
    errors.push("No activities were found in the TCX file.");
  }
  return { activities, errors };
}

export const SUPPORTED_EXTENSIONS = [".gpx", ".tcx"] as const;

/** Parses one file by its extension (falling back to sniffing the root). */
export function parseActivityFile(fileName: string, text: string): ParseResult {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".gpx")) return parseGpx(text);
  if (lower.endsWith(".tcx")) return parseTcx(text);
  if (/<gpx[\s>]/i.test(text)) return parseGpx(text);
  if (/<TrainingCenterDatabase[\s>]/i.test(text)) return parseTcx(text);
  return {
    activities: [],
    errors: ["Not a GPX or TCX file — export the activity in one of those formats."],
  };
}

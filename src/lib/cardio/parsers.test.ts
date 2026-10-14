// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { activityTypeFrom, haversineKm, parseActivityFile, parseGpx, parseTcx } from "./parsers";

const GPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Garmin Connect" xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
  <trk>
    <name>Morning Run</name>
    <type>running</type>
    <trkseg>
      <trkpt lat="12.9716" lon="77.5946"><time>2026-10-13T06:30:00Z</time>
        <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>140</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>
      </trkpt>
      <trkpt lat="12.9806" lon="77.5946"><time>2026-10-13T06:45:00Z</time>
        <extensions><gpxtpx:TrackPointExtension><gpxtpx:hr>160</gpxtpx:hr></gpxtpx:TrackPointExtension></extensions>
      </trkpt>
      <trkpt lat="12.9896" lon="77.5946"><time>2026-10-13T07:00:00Z</time></trkpt>
    </trkseg>
  </trk>
</gpx>`;

const TCX = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Biking">
      <Id>2026-10-12T17:00:00Z</Id>
      <Lap StartTime="2026-10-12T17:00:00Z">
        <TotalTimeSeconds>1200</TotalTimeSeconds>
        <DistanceMeters>8000</DistanceMeters>
        <Calories>250</Calories>
        <AverageHeartRateBpm><Value>130</Value></AverageHeartRateBpm>
        <MaximumHeartRateBpm><Value>150</Value></MaximumHeartRateBpm>
      </Lap>
      <Lap StartTime="2026-10-12T17:20:00Z">
        <TotalTimeSeconds>600</TotalTimeSeconds>
        <DistanceMeters>4000</DistanceMeters>
        <Calories>120</Calories>
        <AverageHeartRateBpm><Value>160</Value></AverageHeartRateBpm>
        <MaximumHeartRateBpm><Value>172</Value></MaximumHeartRateBpm>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;

describe("parseGpx", () => {
  it("reads duration, distance, type, and heart rate from a track", () => {
    const { activities, errors } = parseGpx(GPX);
    expect(errors).toEqual([]);
    expect(activities).toHaveLength(1);
    const [run] = activities;
    expect(run!.type).toBe("run");
    expect(run!.durationMin).toBe(30);
    expect(run!.startedAt).toBe("2026-10-13T06:30:00.000Z");
    expect(run!.distanceKm).toBeCloseTo(2.0, 1);
    expect(run!.avgHeartRate).toBe(150);
    expect(run!.maxHeartRate).toBe(160);
  });

  it("reports unreadable files and tracks without timestamps", () => {
    // Browsers flag malformed XML; lenient parsers just find nothing usable.
    expect(parseGpx("<gpx><trk>").errors[0]).toMatch(/couldn't be read|No tracks|timestamps/);
    const noTimes = parseGpx(`<gpx><trk><trkseg><trkpt lat="1" lon="1"/></trkseg></trk></gpx>`);
    expect(noTimes.activities).toEqual([]);
    expect(noTimes.errors[0]).toMatch(/timestamps/);
  });
});

describe("parseTcx", () => {
  it("sums laps and weights heart rate by lap time", () => {
    const { activities } = parseTcx(TCX);
    expect(activities).toHaveLength(1);
    const [ride] = activities;
    expect(ride!.type).toBe("cycle");
    expect(ride!.durationMin).toBe(30);
    expect(ride!.distanceKm).toBe(12);
    expect(ride!.calories).toBe(370);
    expect(ride!.avgHeartRate).toBe(140);
    expect(ride!.maxHeartRate).toBe(172);
  });
});

describe("parseActivityFile", () => {
  it("routes by extension and rejects other formats with a clear message", () => {
    expect(parseActivityFile("run.GPX", GPX).activities).toHaveLength(1);
    expect(parseActivityFile("ride.tcx", TCX).activities).toHaveLength(1);
    expect(parseActivityFile("activity.fit", "binary").errors[0]).toMatch(/Not a GPX or TCX file/);
  });
});

describe("helpers", () => {
  it("maps activity names to types", () => {
    expect(activityTypeFrom("Evening Ride")).toBe("cycle");
    expect(activityTypeFrom(null, "Hike")).toBe("walk");
    expect(activityTypeFrom("Yoga")).toBe("other");
  });

  it("measures great-circle distance", () => {
    expect(haversineKm(0, 0, 0, 1)).toBeCloseTo(111.19, 1);
  });
});

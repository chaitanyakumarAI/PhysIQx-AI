/**
 * Pure SVG geometry for the vector medals, in a 100 × 100 box centred on
 * (50, 50). Angles are radians, SVG-style (0 = right, π/2 = down).
 */

export const CENTER = 50;
/** Where the light comes from (top-left), for facet shading. */
const LIGHT_ANGLE = (-3 * Math.PI) / 4;

const round = (value: number) => Math.round(value * 100) / 100;

export function polar(radius: number, angle: number): [number, number] {
  return [round(CENTER + radius * Math.cos(angle)), round(CENTER + radius * Math.sin(angle))];
}

/** Angle of vertex `index` of `count`, starting at the top. */
const vertexAngle = (index: number, count: number) => -Math.PI / 2 + (index / count) * Math.PI * 2;

/** Regular polygon with a vertex at the top. */
export function polygonPath(sides: number, radius: number): string {
  const points = Array.from({ length: sides }, (_, index) => polar(radius, vertexAngle(index, sides)));
  return `M${points.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
}

/** Star with `points` tips, the first at the top. */
export function starPath(points: number, outer: number, inner: number): string {
  const vertices = Array.from({ length: points * 2 }, (_, index) =>
    polar(index % 2 === 0 ? outer : inner, vertexAngle(index, points * 2)),
  );
  return `M${vertices.map(([x, y]) => `${x} ${y}`).join("L")}Z`;
}

/** A small star centred on (x, y) — tier stars on big medals. */
export function smallStarPath(x: number, y: number, outer: number, inner: number): string {
  const vertices = Array.from({ length: 10 }, (_, index) => {
    const angle = vertexAngle(index, 10);
    const radius = index % 2 === 0 ? outer : inner;
    return [round(x + radius * Math.cos(angle)), round(y + radius * Math.sin(angle))];
  });
  return `M${vertices.map(([vx, vy]) => `${vx} ${vy}`).join("L")}Z`;
}

/** Scalloped rosette: `count` bumps peaking at `outer`, valleys on `inner`. */
export function rosettePath(count: number, inner: number, outer: number): string {
  const step = (Math.PI * 2) / count;
  // A quadratic's midpoint sits halfway between its chord and its control
  // point, so place the control where the bump peaks exactly at `outer`.
  const control = 2 * outer - inner * Math.cos(step / 2);
  let d = "";
  for (let index = 0; index < count; index++) {
    const start = -Math.PI / 2 + index * step;
    const [x0, y0] = polar(inner, start);
    const [qx, qy] = polar(control, start + step / 2);
    const [x1, y1] = polar(inner, start + step);
    d += `${index === 0 ? `M${x0} ${y0}` : ""}Q${qx} ${qy} ${x1} ${y1}`;
  }
  return `${d}Z`;
}

/** Evenly spaced points on a circle (bead centres). */
export function ringPoints(count: number, radius: number): [number, number][] {
  return Array.from({ length: count }, (_, index) => polar(radius, vertexAngle(index, count)));
}

/** Points along an arc, each with its tangent in degrees (laurel leaves, stars). */
export function arcPoints(count: number, radius: number, from: number, to: number) {
  return Array.from({ length: count }, (_, index) => {
    const angle = count === 1 ? (from + to) / 2 : from + ((to - from) * index) / (count - 1);
    const [x, y] = polar(radius, angle);
    return { x, y, tangent: round((angle * 180) / Math.PI + 90) };
  });
}

/** Engraved sunburst: `count` spokes between two radii, as one path. */
export function sunburstPath(count: number, from: number, to: number): string {
  let d = "";
  for (let index = 0; index < count; index++) {
    const angle = (index / count) * Math.PI * 2;
    const [x0, y0] = polar(from, angle);
    const [x1, y1] = polar(to, angle);
    d += `M${x0} ${y0}L${x1} ${y1}`;
  }
  return d;
}

/**
 * Gem-cut facets between a polygon and a smaller one. `shade` runs from -1
 * (facing away from the light) to 1 (facing it).
 */
export function facets(sides: number, outer: number, inner: number): { d: string; shade: number }[] {
  return Array.from({ length: sides }, (_, index) => {
    const [ax, ay] = polar(outer, vertexAngle(index, sides));
    const [bx, by] = polar(outer, vertexAngle(index + 1, sides));
    const [cx, cy] = polar(inner, vertexAngle(index + 1, sides));
    const [dx, dy] = polar(inner, vertexAngle(index, sides));
    const facing = vertexAngle(index + 0.5, sides);
    return {
      d: `M${ax} ${ay}L${bx} ${by}L${cx} ${cy}L${dx} ${dy}Z`,
      shade: round(Math.cos(facing - LIGHT_ANGLE)),
    };
  });
}

/** Thin wedges radiating from the centre (the aura behind top-tier pieces). */
export function raysPath(count: number, inner: number, outer: number, halfWidth: number): string {
  let d = "";
  for (let index = 0; index < count; index++) {
    const angle = vertexAngle(index, count);
    const [x0, y0] = polar(inner, angle - halfWidth);
    const [x1, y1] = polar(outer, angle);
    const [x2, y2] = polar(inner, angle + halfWidth);
    d += `M${x0} ${y0}L${x1} ${y1}L${x2} ${y2}Z`;
  }
  return d;
}

/** A thick filled chevron (V) spanning `halfWidth` either side of the centre, top edge at `y`. */
export function chevronPath(y: number, halfWidth = 14, depth = 8, thickness = 5): string {
  const left = CENTER - halfWidth;
  const right = CENTER + halfWidth;
  return `M${left} ${y}L${CENTER} ${y + depth}L${right} ${y}L${right} ${y + thickness}L${CENTER} ${y + depth + thickness}L${left} ${y + thickness}Z`;
}

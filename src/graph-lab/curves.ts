import type { Curve, Knob, Point } from "./types";

export const G_ACC = 9.8;
export const R_EARTH = 6.371e6;
export const GAS_R = 8.314;

export const copper = "#c4623a";
export const green = "#1f7a62";
export const blue = "#2c5f9e";
export const gold = "#a97812";

export const noArea = "এই লেখের ক্ষেত্রফল দিয়ে আলাদা ভৌত রাশি পাওয়া যায় না।";

export function knob(key: string, label: string, min: number, max: number, step: number, unit: string): Knob {
  return { key, label, min, max, step, unit };
}

export function samples(x0: number, x1: number, fn: (x: number) => number, n = 81): Point[] {
  const count = Math.max(2, n);
  const out: Point[] = [];
  const span = x1 - x0;
  for (let i = 0; i < count; i++) {
    const x = x0 + (span * i) / (count - 1);
    const y = fn(x);
    if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y });
  }
  return out;
}

export function piecewise(x0: number, kink: number, x1: number, fn: (x: number) => number, left = 41, right = 61): Point[] {
  const start = samples(x0, kink, fn, left);
  const end = samples(kink, x1, fn, right);
  return [...start, ...end.slice(1)];
}

export function curve(id: string, name: string, color: string, points: Point[], opts?: { dashed?: boolean; dots?: boolean }): Curve {
  return { id, name, color, points, dashed: opts?.dashed, dots: opts?.dots };
}

export function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function leastSquares(points: Point[]) {
  const n = points.length;
  if (n < 2) return { m: 0, c: points[0]?.y ?? 0 };
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const point of points) {
    sx += point.x;
    sy += point.y;
    sxx += point.x * point.x;
    sxy += point.x * point.y;
  }
  const denominator = n * sxx - sx * sx;
  if (Math.abs(denominator) < 1e-12) return { m: 0, c: sy / n };
  const m = (n * sxy - sx * sy) / denominator;
  const c = (sy - m * sx) / n;
  return { m, c };
}

export function gAt(ratio: number) {
  if (ratio <= 1) return G_ACC * ratio;
  return G_ACC / (ratio * ratio);
}

export function potentialMJ(ratio: number) {
  const surface = (G_ACC * R_EARTH) / 1e6;
  if (ratio <= 1) return -((surface / 2) * (3 - ratio * ratio));
  return -surface / ratio;
}

export function orbitalSpeed(ratio: number) {
  return Math.sqrt((G_ACC * R_EARTH) / ratio) / 1000;
}

export function periodHours(ratio: number) {
  if (ratio <= 0) return 0;
  return (2 * Math.PI * Math.sqrt((ratio * ratio * ratio * R_EARTH) / G_ACC)) / 3600;
}

import type { Vec3 } from "./types";

const BN = "০১২৩৪৫৬৭৮৯";

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function neg(a: Vec3): Vec3 {
  return scale(a, -1);
}

export function dot(a: Vec3, b: Vec3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function mag(a: Vec3) {
  return Math.hypot(a.x, a.y, a.z);
}

export function unit(a: Vec3): Vec3 | null {
  const m = mag(a);
  if (m < 1e-8) return null;
  return scale(a, 1 / m);
}

export function withLength(v: Vec3, length: number): Vec3 {
  const u = unit(v);
  if (!u) return { x: length, y: 0, z: 0 };
  return scale(u, length);
}

export function rad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function angleDeg(a: Vec3, b: Vec3) {
  const ma = mag(a);
  const mb = mag(b);
  if (ma < 1e-8 || mb < 1e-8) return null;
  const cos = Math.min(1, Math.max(-1, dot(a, b) / (ma * mb)));
  return (Math.acos(cos) * 180) / Math.PI;
}

export function fromAngle(magnitude: number, thetaDeg: number, phiDeg: number): Vec3 {
  const theta = rad(thetaDeg);
  const phi = rad(phiDeg);
  return {
    x: magnitude * Math.cos(theta),
    y: magnitude * Math.sin(theta) * Math.cos(phi),
    z: magnitude * Math.sin(theta) * Math.sin(phi),
  };
}

export function fromDirection(magnitude: number, azimuthDeg: number, elevationDeg: number): Vec3 {
  const azimuth = rad(azimuthDeg);
  const elevation = rad(elevationDeg);
  const flat = Math.cos(elevation);
  return {
    x: magnitude * flat * Math.cos(azimuth),
    y: magnitude * flat * Math.sin(azimuth),
    z: magnitude * Math.sin(elevation),
  };
}

export function directionOf(v: Vec3) {
  const magnitude = mag(v);
  if (magnitude < 1e-8) return null;
  const azimuth = (Math.atan2(v.y, v.x) * 180) / Math.PI;
  const elevation = (Math.asin(Math.min(1, Math.max(-1, v.z / magnitude))) * 180) / Math.PI;
  return {
    magnitude,
    azimuth: azimuth < 0 ? azimuth + 360 : azimuth,
    elevation,
  };
}

export function planeArc(a: Vec3, b: Vec3, radius: number, portion: number, steps = 40): Vec3[] {
  const frame = planeFrame(a, b);
  if (!frame) return [];
  const count = Math.max(2, Math.round(steps * Math.max(portion, 0.001)));
  const points: Vec3[] = [];
  for (let i = 0; i <= count; i += 1) {
    const t = (i / count) * frame.theta * portion;
    points.push(add(scale(frame.au, radius * Math.cos(t)), scale(frame.perp, radius * Math.sin(t))));
  }
  return points;
}

export function arcEnd(a: Vec3, b: Vec3, radius: number, portion: number) {
  const frame = planeFrame(a, b);
  if (!frame) return null;
  const t = frame.theta * portion;
  const at = add(scale(frame.au, radius * Math.cos(t)), scale(frame.perp, radius * Math.sin(t)));
  const tangent = add(scale(frame.au, -Math.sin(t)), scale(frame.perp, Math.cos(t)));
  return { at, tangent };
}

function planeFrame(a: Vec3, b: Vec3) {
  const ma = mag(a);
  const mb = mag(b);
  if (ma < 1e-6 || mb < 1e-6) return null;
  const au = scale(a, 1 / ma);
  const n = cross(a, b);
  const mn = mag(n);
  if (mn < 1e-6) return null;
  const nu = scale(n, 1 / mn);
  const perp = cross(nu, au);
  const theta = Math.acos(Math.min(1, Math.max(-1, dot(au, scale(b, 1 / mb)))));
  return { au, perp, theta };
}

export function toBn(value: string | number) {
  return String(value).replace(/\d/g, (digit) => BN[Number(digit)] ?? digit);
}

export function fmt(n: number, digits = 2) {
  if (!Number.isFinite(n)) return "—";
  const v = Math.abs(n) < 5e-4 ? 0 : n;
  return v.toFixed(digits).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

export function show(n: number, digits = 2) {
  const text = fmt(n, digits);
  return text === "—" ? text : toBn(text).replace("-", "−");
}

export function vecText(v: Vec3, digits = 2) {
  return `(${show(v.x, digits)}, ${show(v.y, digits)}, ${show(v.z, digits)})`;
}

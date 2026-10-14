/** HSC gravitation. Surface g is 9.8 m/s², and M is chosen so GM/R² equals that g. */

export const G = 6.67e-11;
export const SURFACE_G = 9.8;
export const R_EARTH = 6.37e6;
export const M_EARTH = (SURFACE_G * R_EARTH * R_EARTH) / G;
export const M_MOON = 7.342e22;
export const R_MOON = 1.737e6;
export const G_MOON = (G * M_MOON) / (R_MOON * R_MOON);
export const M_SUN = 1.989e30;
export const AU = 1.496e11;
export const MOON_DISTANCE = 3.844e8;
export const SIDEREAL_DAY = 86164;

export type Params = {
  mass: number;
  mass1: number;
  mass2: number;
  gap: number;
  height: number;
  depth: number;
  latitude: number;
  orbit: number;
  speed: number;
  tower: number;
  gee: number;
};

export const baseParams: Params = {
  mass: 2,
  mass1: 6,
  mass2: 6,
  gap: 40,
  height: 400,
  depth: 1000,
  latitude: 45,
  orbit: 1.5,
  speed: 8,
  tower: 20,
  gee: 9.8,
};

export function gravityForce(p: Params) {
  const r = p.gap * 1e6;
  if (r <= 0) return 0;
  return (G * p.mass1 * p.mass2 * 1e48) / (r * r);
}

export function gHeight(km: number) {
  const r = R_EARTH + km * 1000;
  return SURFACE_G * (R_EARTH / r) ** 2;
}

export function gDepth(km: number) {
  const d = Math.min(Math.max(km, 0), R_EARTH / 1000);
  return SURFACE_G * (1 - (d * 1000) / R_EARTH);
}

export function gLatitude(deg: number) {
  const s = Math.sin((deg * Math.PI) / 180);
  return 9.78 * (1 + 0.0053024 * s * s);
}

export function spinLoss(deg: number) {
  const c = Math.cos((deg * Math.PI) / 180);
  const w = (2 * Math.PI) / SIDEREAL_DAY;
  return R_EARTH * w * w * c * c;
}

export function gAtRatio(n: number) {
  if (n <= 0) return 0;
  if (n < 1) return SURFACE_G * n;
  return SURFACE_G / (n * n);
}

export function orbitalSpeed(n: number) {
  return Math.sqrt((SURFACE_G * R_EARTH) / n);
}

export function orbitalPeriod(n: number) {
  return 2 * Math.PI * Math.sqrt((n ** 3 * R_EARTH) / SURFACE_G);
}

export function geoRatio() {
  const t = SIDEREAL_DAY;
  const gm = SURFACE_G * R_EARTH * R_EARTH;
  return Math.cbrt((gm * t * t) / (4 * Math.PI * Math.PI)) / R_EARTH;
}

export function escapeSpeed() {
  return Math.sqrt(2 * SURFACE_G * R_EARTH);
}

export function potential(n: number) {
  return -SURFACE_G * R_EARTH / n;
}

export function pairEnergy(p: Params) {
  const r = p.gap * 1e6;
  if (r <= 0) return 0;
  return -(G * p.mass1 * p.mass2 * 1e48) / r;
}

export function liftEnergy(mass: number, km: number) {
  const h = km * 1000;
  const exact = mass * SURFACE_G * R_EARTH * (1 - R_EARTH / (R_EARTH + h));
  return { mgh: mass * SURFACE_G * h, exact };
}

export function fieldAt(n: number) {
  return gAtRatio(n);
}

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function sup(exp: number) {
  const body = String(Math.abs(exp)).replace(/\d/g, (d) => SUP[Number(d)]);
  return exp < 0 ? `⁻${body}` : body;
}

export type Fact = { id: string; value: number; digits: number; unit: string };

function sci(id: string, value: number, unit: string): Fact {
  if (!Number.isFinite(value) || value === 0) return { id, value: 0, digits: 2, unit };
  const exp = Math.floor(Math.log10(Math.abs(value)));
  return { id, value: value / 10 ** exp, digits: 2, unit: `×10${sup(exp)} ${unit}` };
}

function plain(id: string, value: number, digits: number, unit: string): Fact {
  return { id, value, digits, unit };
}

export function factsFor(focus: string, p: Params): Fact[] {
  if (focus === "pair" || focus === "law" || focus === "mass" || focus === "distance" || focus === "vector" || focus === "interactive") {
    const f = gravityForce(p);
    const m1 = p.mass1 * 1e24;
    const m2 = p.mass2 * 1e24;
    return [sci("force", f, "N"), plain("a1", f / m1, 3, "m/s²"), plain("a2", f / m2, 3, "m/s²")];
  }
  if (focus === "trio") {
    const sunEarth = (G * M_SUN * M_EARTH) / (AU * AU);
    const earthMoon = (G * M_EARTH * M_MOON) / (MOON_DISTANCE * MOON_DISTANCE);
    return [sci("sunEarth", sunEarth, "N"), sci("earthMoon", earthMoon, "N")];
  }
  if (focus === "fall" || focus === "gvec" || focus === "freefall" || focus === "masses") {
    const t = Math.sqrt((2 * p.tower) / SURFACE_G);
    return [plain("gee", SURFACE_G, 1, "m/s²"), plain("time", t, 2, "s"), plain("weight", p.mass * SURFACE_G, 1, "N")];
  }
  if (focus === "feather") {
    return [plain("gee", SURFACE_G, 1, "m/s²"), plain("vacuum", Math.sqrt((2 * 20) / SURFACE_G), 2, "s")];
  }
  if (focus === "equator") {
    return [plain("equator", gLatitude(0), 2, "m/s²"), plain("mid", gLatitude(45), 2, "m/s²"), plain("pole", gLatitude(90), 2, "m/s²")];
  }
  if (focus === "places") {
    return [plain("equator", gLatitude(0), 2, "m/s²"), plain("here", gLatitude(p.latitude), 2, "m/s²"), plain("pole", gLatitude(90), 2, "m/s²")];
  }
  if (focus === "spin") {
    return [plain("loss", spinLoss(p.latitude), 3, "m/s²"), plain("equator", spinLoss(0), 3, "m/s²")];
  }
  if (focus === "height") return [plain("gee", gHeight(p.height), 2, "m/s²"), plain("height", p.height, 0, "km")];
  if (focus === "depth") return [plain("gee", gDepth(p.depth), 2, "m/s²"), plain("depth", p.depth, 0, "km")];
  if (focus === "regions") {
    return [plain("inside", gAtRatio(0.5), 1, "m/s²"), plain("surface", SURFACE_G, 1, "m/s²"), plain("outside", gAtRatio(2), 2, "m/s²")];
  }
  if (focus === "lines" || focus === "intensity") return [plain("field", fieldAt(1), 2, "N/kg")];
  if (focus === "sphere" || focus === "fieldvary") {
    const n = focus === "fieldvary" ? Math.max(p.orbit, 1) : 1;
    return [plain("field", fieldAt(n) * (p.mass1 / 6), 2, "N/kg"), plain("ratio", n, 2, "R")];
  }
  if (focus === "shells") return [sci("potential", potential(1), "J/kg"), sci("farV", potential(2), "J/kg")];
  if (focus === "lift") {
    const both = liftEnergy(p.mass, p.height);
    return [plain("mgh", both.mgh / 1e6, 2, "MJ"), plain("exact", both.exact / 1e6, 2, "MJ")];
  }
  if (focus === "compare") {
    return [sci("potential", potential(1), "J/kg"), sci("energy", p.mass * potential(1), "J")];
  }
  if (focus === "pairU") return [sci("energy", pairEnergy(p), "J")];
  if (focus === "leo" || focus === "speed") {
    const n = p.orbit;
    return [plain("speed", orbitalSpeed(n) / 1000, 2, "km/s"), plain("period", orbitalPeriod(n) / 60, 1, "min")];
  }
  if (focus === "centri") {
    const n = p.orbit;
    const force = p.mass * SURFACE_G / (n * n);
    return [plain("speed", orbitalSpeed(n) / 1000, 2, "km/s"), plain("grav", force, 0, "N"), plain("centri", force, 0, "N")];
  }
  if (focus === "moon") {
    const n = MOON_DISTANCE / R_EARTH;
    return [plain("field", gAtRatio(n) * 1000, 2, "×10⁻³ m/s²"), plain("speed", orbitalSpeed(n) / 1000, 2, "km/s"), plain("period", orbitalPeriod(n) / 86400, 1, "day")];
  }
  if (focus === "geo") {
    const n = geoRatio();
    return [plain("height", (n - 1) * R_EARTH / 1000, 0, "km"), plain("speed", orbitalSpeed(n) / 1000, 2, "km/s"), plain("period", orbitalPeriod(n) / 3600, 2, "h")];
  }
  if (focus === "leogeo") {
    const geo = geoRatio();
    return [plain("leo", orbitalPeriod(1.05) / 60, 0, "min"), plain("geo", orbitalPeriod(geo) / 3600, 1, "h")];
  }
  if (focus === "period") {
    return [plain("period", orbitalPeriod(p.orbit) / 60, 1, "min"), plain("double", orbitalPeriod(p.orbit * 2) / orbitalPeriod(p.orbit), 2, "×")];
  }
  if (focus === "escape") return [plain("escape", escapeSpeed() / 1000, 2, "km/s"), plain("circular", orbitalSpeed(1) / 1000, 2, "km/s")];
  if (focus === "rockets" || focus === "well") {
    const v = p.speed * 1000;
    const extra = 0.5 * v * v - SURFACE_G * R_EARTH;
    return [plain("speed", p.speed, 2, "km/s"), plain("escape", escapeSpeed() / 1000, 2, "km/s"), plain("extra", extra / 1e6, 1, "MJ/kg")];
  }
  if (focus === "float") return [plain("gee", gAtRatio(1.05), 2, "m/s²"), plain("normal", 0, 0, "N")];
  if (focus === "elevator") return [plain("restN", p.mass * SURFACE_G, 0, "N"), plain("fallN", 0, 0, "N")];
  if (focus === "k1" || focus === "k2") return [plain("a", 1.5, 1, "AU"), plain("e", 0.4, 1, "")];
  if (focus === "k3") {
    const near = orbitalPeriod(1.5);
    const far = orbitalPeriod(3);
    return [plain("near", near / 60, 0, "min"), plain("outer", far / 60, 0, "min"), plain("match", (far / near) ** 2 / 8, 2, "")];
  }
  if (focus === "weights") {
    return [plain("earth", p.mass * SURFACE_G, 1, "N"), plain("moon", p.mass * G_MOON, 2, "N")];
  }
  if (focus === "massweight") return [plain("mass", p.mass, 1, "kg"), plain("weight", p.mass * p.gee, 1, "N")];
  if (focus === "balance") return [plain("earth", p.mass * SURFACE_G, 1, "N"), plain("moon", p.mass * G_MOON, 2, "N")];
  if (focus === "planets") {
    return [plain("moon", G_MOON, 2, "m/s²"), plain("mars", 3.7, 1, "m/s²"), plain("earth", SURFACE_G, 1, "m/s²"), plain("jupiter", 24.8, 1, "m/s²")];
  }
  return [plain("gee", SURFACE_G, 1, "m/s²")];
}

function pull(x: number, y: number, gm: number): [number, number] {
  const rr = Math.hypot(x, y);
  const a = -gm / (rr * rr * rr);
  return [a * x, a * y];
}

/** Horizontal launch from the surface, in Earth radii. Stops at the ground or at 7.2 R. */
export function flightPath(speedKm: number) {
  const gm = SURFACE_G * R_EARTH * R_EARTH;
  let x = R_EARTH;
  let y = 0;
  let vx = 0;
  let vy = speedKm * 1000;
  let [ax, ay] = pull(x, y, gm);
  const dt = 10;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 2800; i++) {
    const r = Math.hypot(x, y);
    if (r < R_EARTH * 0.98 || r > R_EARTH * 7.2) break;
    if (i % 2 === 0) pts.push([x / R_EARTH, y / R_EARTH]);
    x += vx * dt + 0.5 * ax * dt * dt;
    y += vy * dt + 0.5 * ay * dt * dt;
    const next = pull(x, y, gm);
    vx += 0.5 * (ax + next[0]) * dt;
    vy += 0.5 * (ay + next[1]) * dt;
    ax = next[0];
    ay = next[1];
  }
  return pts;
}

/** Vertical climb. Values are r/R. Ends when the body returns to the surface or passes 10 R. */
export function climbSamples(speedKm: number) {
  const gm = SURFACE_G * R_EARTH * R_EARTH;
  let r = R_EARTH;
  let vr = speedKm * 1000;
  let a = -gm / (r * r);
  const dt = 4;
  const samples = [1];
  for (let i = 0; i < 9000; i++) {
    r += vr * dt + 0.5 * a * dt * dt;
    const a2 = -gm / (r * r);
    vr += 0.5 * (a + a2) * dt;
    a = a2;
    if (r <= R_EARTH) {
      samples.push(1);
      break;
    }
    if (r >= R_EARTH * 10) {
      samples.push(r / R_EARTH);
      break;
    }
    if (i % 5 === 0) samples.push(r / R_EARTH);
  }
  return samples;
}

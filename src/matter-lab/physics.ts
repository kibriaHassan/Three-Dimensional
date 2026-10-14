/** HSC properties of matter. SI units inside; knobs use the units named on each slider. */

export const G = 9.8;
export const STEEL = 7800;
export const WATER = 1000;

export type Params = {
  force: number;
  area: number;
  length: number;
  young: number;
  poisson: number;
  bulk: number;
  shear: number;
  pressure: number;
  tension: number;
  radius: number;
  density: number;
  viscosity: number;
  speed: number;
  temp: number;
  angle: number;
  count: number;
  spring: number;
  strain: number;
};

export const baseParams: Params = {
  force: 20,
  area: 1,
  length: 1,
  young: 200,
  poisson: 0.3,
  bulk: 160,
  shear: 80,
  pressure: 100,
  tension: 0.072,
  radius: 0.5,
  density: 1,
  viscosity: 1,
  speed: 1,
  temp: 20,
  angle: 0,
  count: 8,
  spring: 40,
  strain: 5,
};

const A = (areaMm2: number) => areaMm2 * 1e-6;

export function stressPa(p: Params) {
  return p.force / A(p.area);
}

export function deltaL(p: Params) {
  const denom = p.young * 1e9 * A(p.area);
  return denom > 0 ? (p.force * p.length) / denom : 0;
}

export function strainOf(p: Params) {
  return p.length > 0 ? deltaL(p) / p.length : 0;
}

export function forceFromStrain(p: Params) {
  return p.young * 1e9 * A(p.area) * p.strain * 1e-4;
}

export function lateralStrain(p: Params) {
  return p.poisson * strainOf(p);
}

export function volumeStrain(p: Params) {
  const k = p.bulk * 1e9;
  return k > 0 ? -((p.pressure * 1000) / k) : 0;
}

export function shearStrain(p: Params) {
  const denom = A(p.area) * p.shear * 1e9;
  return denom > 0 ? p.force / denom : 0;
}

export function capillaryHeight(p: Params) {
  const rho = p.density * 1000;
  const r = p.radius * 1e-3;
  const theta = (p.angle * Math.PI) / 180;
  if (rho <= 0 || r <= 0) return 0;
  return (2 * p.tension * Math.cos(theta)) / (rho * G * r);
}

export function dropArea(radiusM: number) {
  return 4 * Math.PI * radiusM * radiusM;
}

export function dropEnergy(radiusM: number, tension: number, surfaces = 1) {
  return surfaces * tension * dropArea(radiusM);
}

export function splitDrops(radiusM: number, count: number, tension: number) {
  const n = Math.max(2, Math.round(count));
  const small = radiusM / Math.cbrt(n);
  const before = dropArea(radiusM);
  const after = n * dropArea(small);
  return { n, small, before, after, energy: tension * (after - before) };
}

export function viscosityAt(p: Params) {
  return p.viscosity * Math.exp(-0.02 * (p.temp - 20));
}

export function terminalSpeed(p: Params, etaMilli?: number) {
  const r = p.radius * 1e-3;
  const eta = (etaMilli ?? p.viscosity) * 1e-3;
  const sigma = p.density * 1000;
  if (eta <= 0) return 0;
  return (2 * r * r * (STEEL - sigma) * G) / (9 * eta);
}

export function reynolds(p: Params, etaMilli?: number) {
  const r = p.radius * 1e-3;
  const eta = (etaMilli ?? p.viscosity) * 1e-3;
  const v = Math.abs(terminalSpeed(p, etaMilli));
  return eta > 0 ? (2 * r * p.density * 1000 * v) / eta : 0;
}

export function stokesDrag(p: Params, speed: number) {
  return 6 * Math.PI * (p.viscosity * 1e-3) * (p.radius * 1e-3) * speed;
}

export function sphereWeight() {
  const r = 1e-3;
  return (4 / 3) * Math.PI * r * r * r * STEEL * G;
}

export function buoyancy(p: Params, radiusMm = p.radius) {
  const r = radiusMm * 1e-3;
  return (4 / 3) * Math.PI * r * r * r * p.density * 1000 * G;
}

export function seeStrain(strain: number) {
  const mag = Math.abs(strain);
  if (mag < 1e-12) return 0;
  return Math.sign(strain) * Math.min(Math.pow(mag, 0.28) * 0.9, 0.48);
}

export type Fact = { id: string; value: number; digits: number; unit: string };

export function factsFor(focus: string, p: Params): Fact[] {
  const dlMm = deltaL(p) * 1000;
  const strain = strainOf(p);
  const stress = stressPa(p) / 1e6;
  if (focus === "spring" || focus === "hooke") {
    const x = p.spring > 0 ? p.force / p.spring : 0;
    return [
      { id: "extension", value: x * 100, digits: 2, unit: "cm" },
      { id: "stored", value: 0.5 * p.spring * x * x, digits: 2, unit: "J" },
    ];
  }
  if (focus === "volume" || focus === "bulk") {
    return [
      { id: "volStrain", value: volumeStrain(p) * 1e4, digits: 3, unit: "×10⁻⁴" },
      { id: "bulk", value: p.bulk, digits: 0, unit: "GPa" },
    ];
  }
  if (focus === "shear" || focus === "shear-mod") {
    return [
      { id: "shearStrain", value: shearStrain(p) * 1e4, digits: 3, unit: "×10⁻⁴" },
      { id: "shear", value: p.shear, digits: 1, unit: "GPa" },
    ];
  }
  if (focus === "graph") return [{ id: "young", value: p.young, digits: 0, unit: "GPa" }];
  if (focus === "moduli") {
    return [
      { id: "young", value: p.young, digits: 0, unit: "GPa" },
      { id: "bulk", value: p.bulk, digits: 0, unit: "GPa" },
      { id: "shear", value: p.shear, digits: 1, unit: "GPa" },
    ];
  }
  if (focus === "poisson" || focus === "strains" || focus === "shape") {
    return [
      { id: "long", value: strain * 1e4, digits: 2, unit: "×10⁻⁴" },
      { id: "lat", value: lateralStrain(p) * 1e4, digits: 2, unit: "×10⁻⁴" },
      { id: "poisson", value: p.poisson, digits: 2, unit: "" },
      { id: "deltaL", value: dlMm, digits: 3, unit: "mm" },
    ];
  }
  if (focus === "strain-set") {
    const f = forceFromStrain(p);
    return [
      { id: "force", value: f, digits: 2, unit: "N" },
      { id: "deltaL", value: p.strain * 1e-4 * p.length * 1000, digits: 3, unit: "mm" },
      { id: "young", value: p.young, digits: 0, unit: "GPa" },
    ];
  }
  if (focus === "molecules" || focus === "drop" || focus === "needle" || focus === "soap" || focus === "film") {
    return [{ id: "tension", value: p.tension * 1000, digits: 1, unit: "mN/m" }];
  }
  if (focus === "area" || focus === "radius") {
    const r = p.radius * 1e-3;
    return [
      { id: "area", value: dropArea(r) * 1e4, digits: 2, unit: "cm²" },
      { id: "energy", value: dropEnergy(r, p.tension) * 1e6, digits: 2, unit: "µJ" },
    ];
  }
  if (focus === "split") {
    const s = splitDrops(p.radius * 1e-3, p.count, p.tension);
    return [
      { id: "area", value: (s.after - s.before) * 1e4, digits: 2, unit: "cm²" },
      { id: "energy", value: s.energy * 1e6, digits: 2, unit: "µJ" },
    ];
  }
  if (focus === "bubble") {
    const r = p.radius * 1e-3;
    return [
      { id: "dropE", value: dropEnergy(r, p.tension, 1) * 1e6, digits: 2, unit: "µJ" },
      { id: "bubbleE", value: dropEnergy(r, p.tension, 2) * 1e6, digits: 2, unit: "µJ" },
    ];
  }
  if (focus === "water" || focus === "mercury" || focus === "bore" || focus === "meniscus" || focus === "contact" || focus === "cap-pair") {
    return [
      { id: "height", value: capillaryHeight(p) * 100, digits: 2, unit: "cm" },
      { id: "angle", value: p.angle, digits: 0, unit: "°" },
    ];
  }
  if (focus === "compare") {
    const water = { ...p, viscosity: 1, density: 1, radius: 1 };
    const gly = { ...p, viscosity: 1500, density: 1.26, radius: 1 };
    return [
      { id: "waterV", value: terminalSpeed(water) * 100, digits: 1, unit: "cm/s" },
      { id: "glyV", value: terminalSpeed(gly) * 100, digits: 2, unit: "cm/s" },
    ];
  }
  if (focus === "temp") {
    const eta = viscosityAt(p);
    return [
      { id: "eta", value: eta, digits: 2, unit: "mPa·s" },
      { id: "terminal", value: terminalSpeed({ ...p, viscosity: eta }) * 100, digits: 2, unit: "cm/s" },
    ];
  }
  if (focus === "layers") {
    return [{ id: "eta", value: p.viscosity, digits: 1, unit: "mPa·s" }];
  }
  if (focus === "stream" || focus === "turbulent" || focus === "paths" || focus === "pipe" || focus === "speed-lines") {
    const ratio = 2.4;
    return [
      { id: "speed", value: p.speed, digits: 2, unit: "m/s" },
      { id: "narrow", value: p.speed * ratio * ratio, digits: 2, unit: "m/s" },
    ];
  }
  if (focus === "height") {
    const rise = 1.2;
    return [
      { id: "rise", value: rise, digits: 1, unit: "m" },
      { id: "drop", value: (p.density * 1000 * G * rise) / 1000, digits: 2, unit: "kPa" },
    ];
  }
  if (focus === "wing") {
    const top = p.speed * 1.35;
    const drop = 0.5 * 1.2 * (top * top - p.speed * p.speed);
    return [
      { id: "narrow", value: top, digits: 2, unit: "m/s" },
      { id: "drop", value: drop, digits: 2, unit: "Pa" },
    ];
  }
  if (focus === "venturi" || focus === "narrow" || focus === "orient") {
    const v1 = p.speed;
    const v2 = p.speed * 2.4 * 2.4;
    const drop = 0.5 * p.density * 1000 * (v2 * v2 - v1 * v1);
    return [
      { id: "narrow", value: v2, digits: 2, unit: "m/s" },
      { id: "drop", value: drop / 1000, digits: 2, unit: "kPa" },
    ];
  }
  if (focus === "hydro") {
    return [{ id: "rd", value: p.density, digits: 2, unit: "" }];
  }
  if (
    focus === "terminal" ||
    focus === "drag" ||
    focus === "stokes" ||
    focus === "stokes-drag" ||
    focus === "stokes-vary" ||
    focus === "stokes-terms" ||
    focus === "fall-life"
  ) {
    const v = terminalSpeed(p);
    return [
      { id: "terminal", value: v * 100, digits: 2, unit: "cm/s" },
      { id: "re", value: reynolds(p), digits: 2, unit: "" },
      { id: "drag", value: stokesDrag(p, v) * 1e3, digits: 3, unit: "mN" },
    ];
  }
  return [
    { id: "stress", value: stress, digits: 2, unit: "MPa" },
    { id: "strain", value: strain * 1e4, digits: 2, unit: "×10⁻⁴" },
    { id: "deltaL", value: dlMm, digits: 3, unit: "mm" },
    { id: "young", value: p.young, digits: p.young < 1 ? 2 : 0, unit: "GPa" },
  ];
}

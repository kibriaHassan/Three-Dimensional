/** HSC physical optics, small-angle form used in the textbook. */

export const C = 2.99792458e8;
export const Y_MAX = 0.012;

export type Params = {
  lambdaNm: number;
  dMm: number;
  screenM: number;
  aMm: number;
  phaseDeg: number;
  thetaDeg: number;
  tiltDeg: number;
  amp: number;
  nSlits: number;
  order: number;
};

export const baseParams: Params = {
  lambdaNm: 550,
  dMm: 0.25,
  screenM: 1.2,
  aMm: 0.08,
  phaseDeg: 0,
  thetaDeg: 40,
  tiltDeg: 0,
  amp: 1,
  nSlits: 4,
  order: 1,
};

export function resolveParams(partial: Partial<Params>): Params {
  return { ...baseParams, ...partial };
}

export function lambdaM(p: Params) {
  return p.lambdaNm * 1e-9;
}

export function slitGapM(p: Params) {
  return p.dMm * 1e-3;
}

export function slitWidthM(p: Params) {
  return p.aMm * 1e-3;
}

/** β = λD/d */
export function fringeBeta(p: Params) {
  return (lambdaM(p) * p.screenM) / slitGapM(p);
}

/** Bright fringe yₙ = n λD/d, n = 0, 1, 2… */
export function brightY(n: number, p: Params) {
  return n * fringeBeta(p);
}

/** Dark fringe yₙ = (2n−1) λD/(2d), n = 1, 2, 3… */
export function darkY(n: number, p: Params) {
  return ((2 * n - 1) * fringeBeta(p)) / 2;
}

/**
 * δ ≈ dy/D, φ = 2πδ/λ + φ₀.
 * Equal amplitudes, vibration planes at tilt α:
 * I/Imax = (1 + cosα cosφ) / 2.
 * α = 0 recovers cos²(φ/2).
 */
export function youngAt(y: number, p: Params) {
  const lambda = lambdaM(p);
  const delta = (slitGapM(p) * y) / p.screenM;
  const phi = (2 * Math.PI * delta) / lambda + (p.phaseDeg * Math.PI) / 180;
  const contrast = Math.cos((p.tiltDeg * Math.PI) / 180);
  const I = (1 + contrast * Math.cos(phi)) / 2;
  return { delta, phi, I: clamp01(I) };
}

/** Minima a sinθ = mλ, so yₘ ≈ m λD/a. m = ±1, ±2… */
export function minimumY(m: number, p: Params) {
  return (m * lambdaM(p) * p.screenM) / slitWidthM(p);
}

/** Full width of the central maximum, 2λD/a. */
export function centralWidth(p: Params) {
  return (2 * lambdaM(p) * p.screenM) / slitWidthM(p);
}

export function singleAt(y: number, p: Params) {
  const beta = (Math.PI * slitWidthM(p) * y) / (lambdaM(p) * p.screenM);
  if (Math.abs(beta) < 1e-8) return { beta, I: 1 };
  const sinc = Math.sin(beta) / beta;
  return { beta, I: clamp01(sinc * sinc) };
}

export function multiAt(y: number, p: Params) {
  const lambda = lambdaM(p);
  const D = p.screenM;
  const N = Math.max(2, Math.round(p.nSlits));
  const delta = (2 * Math.PI * slitGapM(p) * y) / (lambda * D);
  const beta = (Math.PI * slitWidthM(p) * y) / (lambda * D);
  const envelope = Math.abs(beta) < 1e-8 ? 1 : Math.sin(beta) / beta;
  const denom = Math.sin(delta / 2);
  const grating = Math.abs(denom) < 1e-8 ? N : Math.sin((N * delta) / 2) / denom;
  return { I: clamp01((grating / N) ** 2 * envelope ** 2) };
}

/** I = I₀ cos²θ, θ between polarizer and analyzer. I₀ is after the polarizer. */
export function malus(thetaDeg: number) {
  const ratio = Math.cos((thetaDeg * Math.PI) / 180) ** 2;
  return { ratio: clamp01(ratio) };
}

export function frequencyHz(p: Params) {
  return C / lambdaM(p);
}

export function onScreen(y: number) {
  return Math.abs(y) <= Y_MAX + 1e-6;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/** HSC wave formulas. Sound speed is the textbook value 340 m/s. */

export const SOUND_V = 340;

export type Params = {
  amp: number;
  freq: number;
  lambda: number;
  phase: number;
  harmonic: number;
  vs: number;
  vo: number;
  gap: number;
  length: number;
  speed: number;
  distance: number;
};

export const baseParams: Params = {
  amp: 4,
  freq: 1,
  lambda: 1.2,
  phase: 0,
  harmonic: 1,
  vs: 30,
  vo: 0,
  gap: 0.35,
  length: 1,
  speed: 1.2,
  distance: 85,
};

export function resolveParams(partial: Partial<Params>): Params {
  return { ...baseParams, ...partial };
}

export function velocity(freq: number, lambda: number) {
  return freq * lambda;
}

export function periodOf(freq: number) {
  if (freq <= 0) return Number.POSITIVE_INFINITY;
  return 1 / freq;
}

/** Phase difference for a path gap dx: Δφ = 2π dx / λ */
export function phaseGap(dx: number, lambda: number) {
  if (lambda <= 0) return 0;
  return (2 * Math.PI * dx) / lambda;
}

/** Two equal waves: resultant amplitude 2A |cos(φ/2)| */
export function resultantAmp(amp: number, phaseDeg: number) {
  return 2 * amp * Math.abs(Math.cos(((phaseDeg * Math.PI) / 180) / 2));
}

export function intensityRatio(phaseDeg: number) {
  const c = Math.cos(((phaseDeg * Math.PI) / 180) / 2);
  return c * c;
}

/** String or open pipe: fₙ = n v / (2L) */
export function harmonicFreq(n: number, waveSpeed: number, length: number) {
  return (n * waveSpeed) / (2 * length);
}

export function stringWavelength(n: number, length: number) {
  return (2 * length) / n;
}

/** Closed pipe: fₙ = (2n−1) v / (4L), n = 1, 2, 3… */
export function closedFreq(n: number, length: number, waveSpeed = SOUND_V) {
  return ((2 * n - 1) * waveSpeed) / (4 * length);
}

export function closedWavelength(n: number, length: number) {
  return (4 * length) / (2 * n - 1);
}

export function soundWavelength(freq: number, waveSpeed = SOUND_V) {
  if (freq <= 0) return 0;
  return waveSpeed / freq;
}

/** Echo time for a wall at distance d. t = 2d/v */
export function echoTime(distance: number, waveSpeed = SOUND_V) {
  return (2 * distance) / waveSpeed;
}

/**
 * Doppler. vs > 0: source moves toward the observer.
 * vo > 0: observer moves toward the source.
 * f' = f (v + vo) / (v − vs)
 */
export function dopplerFreq(freq: number, vs: number, vo: number, waveSpeed = SOUND_V) {
  const denom = waveSpeed - vs;
  const numer = waveSpeed + vo;
  if (denom <= 5 || numer <= 0) return Number.NaN;
  return (freq * numer) / denom;
}

export function nodeGap(lambda: number) {
  return lambda / 2;
}

export function nodeAntinodeGap(lambda: number) {
  return lambda / 4;
}

/** Loudness tracks A². */
export function loudnessFactor(amp: number, reference = 4) {
  return (amp / reference) ** 2;
}

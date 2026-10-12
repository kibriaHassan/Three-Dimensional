/** Intermediate thermodynamics. Heat added ΔQ = ΔU + ΔW, and ΔW is work done by the gas. */

export const GAS_R = 8.314;
export const GAMMA = 1.4;
export const MOLAR_MASS = 0.029;
export const ALPHA = 1.2e-5;
export const ROD_LENGTH = 1;

export type Params = {
  temp: number;
  hot: number;
  cold: number;
  volume: number;
  ratio: number;
  moles: number;
};

export const baseParams: Params = {
  temp: 300,
  hot: 600,
  cold: 300,
  volume: 12,
  ratio: 2,
  moles: 0.5,
};

export type Process = "isothermal" | "adiabatic" | "isobaric" | "isochoric";

export type State = {
  pressure: number;
  volume: number;
  temp: number;
  heat: number;
  energy: number;
  work: number;
};

const CV = GAS_R / (GAMMA - 1);
const CP = GAMMA * CV;

export function celsius(kelvin: number) {
  return kelvin - 273;
}

export function rmsSpeed(kelvin: number) {
  return Math.sqrt((3 * GAS_R * Math.max(kelvin, 1)) / MOLAR_MASS);
}

export function expansion(kelvin: number) {
  return ALPHA * ROD_LENGTH * (kelvin - 300);
}

export function pressureOf(moles: number, litres: number, kelvin: number) {
  const cubic = Math.max(litres, 0.01) / 1000;
  return (moles * GAS_R * Math.max(kelvin, 1)) / cubic / 1000;
}

export function heatSpan(params: Params) {
  const hot = Math.max(params.hot, params.cold + 20);
  const cold = Math.min(params.cold, hot - 20);
  return { hot, cold, gap: hot - cold };
}

function endTemp(process: Process, params: Params) {
  if (process === "isothermal") return params.temp;
  if (process === "isochoric") return params.temp * params.ratio;
  if (process === "isobaric") return params.temp * params.ratio;
  return params.temp * Math.pow(params.ratio, 1 - GAMMA);
}

export function processState(process: Process, params: Params, progress: number): State {
  const u = Math.min(1, Math.max(0, progress));
  const n = params.moles;
  const startV = params.volume;
  const startT = params.temp;
  const endT = endTemp(process, params);
  const volume = process === "isochoric" ? startV : startV * (1 + (params.ratio - 1) * u);
  const temp = process === "adiabatic"
    ? startT * Math.pow(startV / volume, GAMMA - 1)
    : process === "isothermal"
      ? startT
      : startT + (endT - startT) * u;
  const pressure = pressureOf(n, volume, temp);
  let heat = 0;
  let energy = 0;
  let work = 0;
  if (process === "isothermal") {
    work = n * GAS_R * startT * Math.log(volume / startV);
    heat = work;
  } else if (process === "adiabatic") {
    energy = n * CV * (temp - startT);
    work = -energy;
  } else if (process === "isobaric") {
    energy = n * CV * (temp - startT);
    work = n * GAS_R * (temp - startT);
    heat = n * CP * (temp - startT);
  } else {
    energy = n * CV * (temp - startT);
    heat = energy;
  }
  return { pressure, volume, temp, heat, energy, work };
}

export function carnotVolumes(params: Params) {
  const { hot, cold } = heatSpan(params);
  const factor = Math.pow(hot / cold, 1 / (GAMMA - 1));
  const first = params.volume;
  const second = first * params.ratio;
  return {
    hot,
    cold,
    volumes: [first, second, second * factor, first * factor] as const,
  };
}

export function carnotState(params: Params, progress: number): State & { step: number } {
  const u = Math.min(1, Math.max(0, progress));
  const step = u >= 1 ? 3 : Math.floor(u * 4);
  const local = u >= 1 ? 1 : u * 4 - step;
  const n = params.moles;
  const { hot, cold, volumes } = carnotVolumes(params);
  const [v1, v2, v3, v4] = volumes;
  const logRatio = Math.log(params.ratio);
  const heatIn = n * GAS_R * hot * logRatio;
  const heatOut = n * GAS_R * cold * logRatio;
  let volume = v1;
  let temp = hot;
  let heat = 0;
  let work = 0;
  if (step === 0) {
    volume = v1 + (v2 - v1) * local;
    heat = n * GAS_R * hot * Math.log(volume / v1);
    work = heat;
  } else if (step === 1) {
    volume = v2 + (v3 - v2) * local;
    temp = hot * Math.pow(v2 / volume, GAMMA - 1);
    work = heatIn + n * CV * (hot - temp);
  } else if (step === 2) {
    volume = v3 + (v4 - v3) * local;
    temp = cold;
    const gained = n * GAS_R * cold * Math.log(volume / v3);
    heat = heatIn + gained;
    work = heatIn + n * CV * (hot - cold) + gained;
  } else {
    volume = v4 + (v1 - v4) * local;
    temp = cold * Math.pow(v4 / volume, GAMMA - 1);
    heat = heatIn - heatOut;
    work = heatIn - heatOut + n * CV * (hot - temp);
  }
  return {
    step,
    pressure: pressureOf(n, volume, temp),
    volume,
    temp,
    heat,
    energy: n * CV * (temp - hot),
    work,
  };
}

export function efficiency(params: Params) {
  const { hot, cold, gap } = heatSpan(params);
  const logRatio = Math.log(params.ratio);
  const absorbed = params.moles * GAS_R * hot * logRatio;
  const rejected = params.moles * GAS_R * cold * logRatio;
  return {
    hot,
    cold,
    absorbed,
    rejected,
    work: absorbed - rejected,
    engine: 1 - cold / hot,
    fridge: cold / gap,
    pump: hot / gap,
  };
}

export function compareCurves(params: Params, steps = 24) {
  const startP = pressureOf(params.moles, params.volume, params.temp);
  return Array.from({ length: steps }, (_, index) => {
    const fraction = index / (steps - 1);
    const volume = params.volume * (1 + (params.ratio - 1) * fraction);
    const scale = params.volume / volume;
    return {
      volume,
      isothermal: startP * scale,
      adiabatic: startP * Math.pow(scale, GAMMA),
    };
  });
}

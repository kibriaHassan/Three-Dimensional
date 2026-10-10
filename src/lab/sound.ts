const STORAGE_KEY = "trimatra-music";

type OscKind = "kick" | "snare" | "hat" | "bass" | "lead" | "harm";
type Wave = "square" | "sawtooth" | "triangle" | "sine";
type Spec = {
  bpm: number;
  root: number;
  leadWave: Wave;
  bassWave: Wave;
  lead: string;
  bass?: string;
  harm?: string;
  drums: string;
};
type Note = { step: number; midi: number; dur: number; vel: number; kind: OscKind; wave?: Wave };
type Piece = { bpm: number; steps: number; notes: Note[] };

const rock = "k.h.s.h.".repeat(4);
const specs: Record<string, Spec> = {
  path: {
    bpm: 118,
    root: 40,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: rock,
    bass: "0:4 0:4 0:4 3:4 0:4 5:4 3:4 -2:4",
    lead: "0 0 3 0 7 3 0 3 5 3 0 -2 0 3 7 3 0 3 5 7 10 7 5 3 0 3 7 12 7 5 3 0",
  },
  freefall: {
    bpm: 104,
    root: 43,
    leadWave: "sawtooth",
    bassWave: "sine",
    drums: "k...k...k..k..k.k.kkkkkkkkkkkkkk",
    bass: "12:4 7:4 3:2 0:2 -2:2 -5:2 -9:4 -12:8 0:4",
    lead: "15 15 12 12 10 7 5 3 0 -2 -5 -9 15 12 7 3 0 -2 -5 -9 -12 -9 -5 -2 0 3 0 -5 -9 -12 -12 -9",
  },
  projectile: {
    bpm: 128,
    root: 48,
    leadWave: "square",
    bassWave: "triangle",
    drums: ".h.hk.h..h.hk.h..h.hk.h..h.hk.h.",
    bass: "0:4 5:4 7:4 12:4 7:4 5:4 3:4 0:4",
    lead: "0 2 4 7 9 12 14 16 19 16 14 12 9 7 4 2 0 -1 0 2 4 7 4 2 0 -2 0 4 7 4 0 -5",
  },
  vector: {
    bpm: 106,
    root: 39,
    leadWave: "sawtooth",
    bassWave: "square",
    drums: "k...............k.......s.......",
    bass: "0:8 7:8 0:8 12:8",
    lead: "0:8 0:8 7:8 12:4 16:4",
    harm: "7:8 12:8 16:8 19:8",
  },
  newton2: {
    bpm: 134,
    root: 36,
    leadWave: "square",
    bassWave: "sine",
    drums: "xhhh".repeat(8),
    bass: "0:8 0:8 -2:8 5:8",
    lead: "12 15 12 10 12 15 19 15 12 10 7 10 12 15 12 7 19 15 12 10 7 3 0 3 7 10 12 15 19 15 12 7",
  },
  torque: {
    bpm: 92,
    root: 35,
    leadWave: "sawtooth",
    bassWave: "square",
    drums: "k.......s.......k.s.k.s.k.s.k.s.",
    bass: "0:8 0:8 0:2 0:2 0:2 0:2 7:2 7:2 0:2 0:2",
    lead: "0:4 .:4 0:4 .:4 12 12 15 19 15 12 19 15 12 7 3 0 7 12 15 19",
  },
  tension: {
    bpm: 124,
    root: 41,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k.k.h.k.k.k.h.k.".repeat(2),
    bass: "0:2 7:2 0:2 7:2 0:2 7:2 0:2 7:2 0:2 7:2 5:2 7:2 0:2 7:2 0:2 7:2",
    lead: "12:2 19:2 12:2 19:2 12:2 19:2 15:2 19:2 12:2 19:2 12:2 19:2 12:2 19:2 7:2 12:2",
  },
  "pulley-fixed": {
    bpm: 102,
    root: 43,
    leadWave: "square",
    bassWave: "sine",
    drums: "k..s..h.k..s..h.k..s..h.k..s..h.",
    bass: "0:8 0:8 -5:8 -5:8",
    lead: "12 9 7 3 12 9 7 3 -5 -2 0 3 7 9 12 15 12 9 7 3 0 3 7 12 15 12 9 7 3 0 -2 0",
  },
  "pulley-move": {
    bpm: 112,
    root: 38,
    leadWave: "sawtooth",
    bassWave: "triangle",
    drums: "k..hk..sk..hk..sk..hk..sk..hk..s",
    bass: "0:8 -2:8 0:8 -5:8",
    lead: "0 3 7 12 7 3 0 3 5 8 12 8 5 3 0 -2 0 3 7 10 12 10 7 3 0 5 7 12 7 3 0 -5",
  },
  friction: {
    bpm: 108,
    root: 36,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k.k.k.k.k.k.k.k.kkkksssshhhhk.s.",
    bass: "0:2 0:2 0:2 0:2 0:2 0:2 0:2 0:2 0:1 3:1 5:1 7:1 10:1 12:1 7:1 3:1 0:4 0:4",
    lead: "0 0 0 0 0 0 0 0 0 0 0 0 0 0 3 5 7 10 12 15 12 10 7 3 0 0 -2 0 5 3 0 0",
  },
  inertia: {
    bpm: 120,
    root: 45,
    leadWave: "square",
    bassWave: "sine",
    drums: "k.h.s.h.k.h.s.h.k...............",
    bass: "0:2 0:2 0:2 0:2 7:16 -5:8",
    lead: "7 7 4 4 7 7 4 4 7:8 0:8 4 2 0 -2 .:4",
  },
  reaction: {
    bpm: 126,
    root: 40,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k...s...k...s...k...s...k...s...",
    bass: "12 10 7 5 3 0 -2 -5 -5 -2 0 3 5 7 10 12 12 7 3 0 -5 -2 0 5 12 10 7 3 0 -2 -5 -9",
    lead: "0 3 5 7 10 12 15 17 17 15 12 10 7 5 3 0 0 3 7 10 12 15 17 15 12 7 5 3 0 -2 -5 -9",
  },
  collision: {
    bpm: 136,
    root: 42,
    leadWave: "square",
    bassWave: "square",
    drums: "k.h.k.h.k.h.k.h.s.s.s.s.k.......",
    bass: ".:16 0 3 7 10 7 3 0 3 10 7 3 0 -2 0:3",
    lead: "0 3 7 10 7 3 0 3 10 7 3 0 -2 0 3 7 .:16",
  },
  work: {
    bpm: 114,
    root: 43,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k.hk.hk.s.hs.hk.................",
    bass: "0:2 0:2 7:2 0:2 5:2 0:2 3:2 0:2 .:16",
    lead: "0 3 7 10 7 3 0 5 7 10 12 10 7 5 3 0 .:16",
  },
  energy: {
    bpm: 116,
    root: 36,
    leadWave: "sawtooth",
    bassWave: "square",
    drums: "x.h.x.h.".repeat(4),
    bass: "-12 -8 -5 -1 0 3 5 7 8 7 5 3 0 -1 -5 -8 0 3 7 10 7 3 0 -5 0 3 7 0 -5 -8 -12 -12",
    lead: "24 21 19 16 14 12 10 7 5 3 0 -1 0 3 5 7 3 0 -1 -5 0 3 7 10 12 10 7 3 0 -1 -5 -8",
  },
  pressure: {
    bpm: 96,
    root: 33,
    leadWave: "sawtooth",
    bassWave: "sine",
    drums: "k...s...k...s...K...s...K...s...",
    bass: "12:4 12:4 7:4 7:4 0:4 0:4 -5:4 -5:4",
    lead: "24:4 24:4 19:4 19:4 12:4 12:4 7:4 7:4",
  },
  buoyancy: {
    bpm: 98,
    root: 46,
    leadWave: "triangle",
    bassWave: "sawtooth",
    drums: "k..h.sk..h.sk..h.sk..h.s",
    bass: "12:3 7:3 3:3 0:3 0:6 0:6",
    lead: "-12:3 -5:3 0:3 7:3 12:6 7:6",
  },
  expansion: {
    bpm: 90,
    root: 44,
    leadWave: "sawtooth",
    bassWave: "square",
    drums: "k.......k.......k.......k.......",
    bass: "0:8 0:8 0:8 0:8",
    lead: "3:8 7:8 12:8 15:8",
    harm: "7:8 12:8 15:8 19:8",
  },
  pendulum: {
    bpm: 84,
    root: 43,
    leadWave: "square",
    bassWave: "sine",
    drums: "k..hk..hk..hk..hk..hk..hk..hk..h",
    bass: "0:4 7:4 0:4 7:4 0:4 7:4 0:4 7:4",
    lead: "12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19 12 19",
  },
  wave: {
    bpm: 110,
    root: 41,
    leadWave: "sawtooth",
    bassWave: "triangle",
    drums: "k..k..k.k..k..k.k..k..k.k..k..k.",
    bass: "0:4 0:4 3:4 7:4 0:4 0:4 -2:4 0:4",
    lead: "0 3 7 10 12 10 7 3 0 3 7 10 12 10 7 3 0 3 7 10 12 10 7 3 0 3 7 10 12 10 7 3",
    harm: ".:8 0 3 7 10 12 10 7 3 0 3 7 10 12 10 7 3 0 3 7 10 12 10 7 3",
  },
  sound: {
    bpm: 148,
    root: 48,
    leadWave: "square",
    bassWave: "square",
    drums: "ksksksks".repeat(4),
    bass: "0 . 0 . 3 . 0 . 7 . 3 . 0 . 5 . 0 . 0 . 3 . 7 . 0 . -2 . 0 . 5 .",
    lead: "12 . 15 . 12 . 10 . 12 . 15 . 19 . 15 . 12 . 10 . 7 . 12 . 15 . 12 . 7 . 0 .",
  },
  reflection: {
    bpm: 120,
    root: 45,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: rock,
    bass: "0:4 0:4 7:4 0:4 0:4 7:4 5:4 0:4",
    lead: "0 3 7 12 15 12 7 3 3 7 12 15 12 7 3 0 0 5 7 12 17 12 7 5 5 7 12 17 12 7 5 0",
  },
  refraction: {
    bpm: 100,
    root: 46,
    leadWave: "sawtooth",
    bassWave: "triangle",
    drums: "k..s.h.k".repeat(4),
    bass: "0:4 5:4 7:4 0:4 0:4 2:4 3:4 0:4",
    lead: "0 5 7 12 7 5 0 -5 0 2 3 5 3 2 0 -1 0 5 7 12 17 12 7 5 0 2 3 5 3 2 0 -5",
  },
  lens: {
    bpm: 108,
    root: 40,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k.......s.......k.s..k.sk.s.k.K.",
    bass: "-12:8 -5:8 0:8 0:8",
    lead: "16:8 12:8 7:8 0:8",
    harm: "7:8 4:8 2:8 0:8",
  },
  "mirror-concave": {
    bpm: 90,
    root: 38,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k..h..s..h.k..h..s..h.k..h..s.h.",
    bass: "0:4 -2:4 0:4 5:4 0:4 3:4 -2:4 0:4",
    lead: "0 3 7 12 7 3 0 5 7 10 12 7 3 0 -2 0 5 7 12 15 12 7 3 0 -5 -2 0 3 7 12 7 3",
  },
  "mirror-convex": {
    bpm: 144,
    root: 51,
    leadWave: "square",
    bassWave: "triangle",
    drums: "x.s.x.s.x.s.x.s.x.s.x.s.x.s.x.s.",
    bass: "12:2 12:2 10:2 7:2 12:2 15:2 12:2 10:2 7:2 7:2 5:2 3:2 7:2 10:2 12:2 15:2",
    lead: "19 22 19 15 12 15 19 22 24 22 19 15 12 10 7 10 12 15 19 15 12 7 3 7 12 15 19 22 19 15 12 7",
  },
  "lens-convex": {
    bpm: 114,
    root: 43,
    leadWave: "sawtooth",
    bassWave: "square",
    drums: "k.h.s.h.k.h.s.S.k.h.s.h.k.h.s.K.",
    bass: "0:4 5:4 7:4 12:4 7:4 5:4 0:4 -5:4",
    lead: "24 19 15 12 19 15 12 7 15 12 7 4 12 7 4 0 24 19 15 12 19 15 12 7 16 12 7 4 12 7 4 0",
  },
  "lens-concave": {
    bpm: 118,
    root: 46,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k..s..h.k..s..h.k..s..h.k..s..K.",
    bass: "0:4 -5:4 0:4 -7:4 0:4 -5:4 -2:4 0:4",
    lead: "0 4 7 12 16 12 7 4 0 5 9 14 9 5 0 -7 0 4 7 12 16 19 16 12 7 4 0 -2 0 5 7 0",
  },
  tir: {
    bpm: 100,
    root: 36,
    leadWave: "sawtooth",
    bassWave: "square",
    drums: "k...k...k...k...k.s.k.s.k.S.K.S.",
    bass: "0:8 0:8 0:4 1:4 0:4 7:4",
    lead: "0:4 0:4 3:4 0:4 7:2 12:2 15:2 19:2 24:2 19:2 15:2 12:2",
  },
  charge: {
    bpm: 138,
    root: 42,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "kk..kk..ss..kk..".repeat(2),
    bass: "0:2 1:2 0:2 1:2 0:2 -1:2 0:2 1:2 -12:2 -10:2 -8:2 -5:2 0:2 3:2 7:2 12:2",
    lead: "3:2 4:2 3:2 2:2 1:2 2:2 3:2 4:2 15:2 17:2 19:2 22:2 15:2 12:2 10:2 7:2",
  },
  circuit: {
    bpm: 122,
    root: 39,
    leadWave: "sawtooth",
    bassWave: "square",
    drums: "................k.s.x.S.k.s.x.S.",
    bass: ".:16 0:4 0:4 7:4 0:4",
    lead: ".:16 12:2 16:2 19:2 24:2 19:2 16:2 12:2 7:2",
  },
  magnet: {
    bpm: 130,
    root: 37,
    leadWave: "square",
    bassWave: "sawtooth",
    drums: "k.kkh.hh".repeat(4),
    bass: "0:4 0:4 7:4 0:4 12:4 7:4 0:4 -5:4",
    lead: "0 4 7 12 16 12 7 4 0 4 7 12 16 12 7 4 12 9 7 4 7 4 0 -5 0 4 7 12 7 4 0 -5",
  },
  halflife: {
    bpm: 100,
    root: 38,
    leadWave: "square",
    bassWave: "sine",
    drums: "k.k.k.k.k.k.k.k.k...k...k...k...k.......k.......k...............",
    bass: "0:2 0:2 0:2 0:2 0:2 0:2 0:2 0:2 0:4 0:4 0:4 0:4 0:8 0:8 0:16",
    lead: "0 3 7 10 7 3 0 3 0 3 7 10 7 3 0 3 0:4 7:4 3:4 0:4 0:8 7:8 0:16",
  },
};

function tokenSpan(token: string) {
  if (token === "." || token === "r" || token.startsWith(".:")) {
    return token.includes(":") ? Number(token.split(":")[1]) : 1;
  }
  return token.includes(":") ? Number(token.split(":")[1]) : 1;
}

function parsePitches(spec: string) {
  const events: { semi: number | null; dur: number; step: number }[] = [];
  let step = 0;
  if (!spec.trim()) return { events, steps: 0 };
  for (const token of spec.trim().split(/\s+/)) {
    const dur = tokenSpan(token);
    const rest = token === "." || token === "r" || token.startsWith(".:");
    const semi = rest ? null : Number(token.split(":")[0]);
    events.push({ semi, dur, step });
    step += dur;
  }
  return { events, steps: step };
}

function parseDrums(pattern: string) {
  const chars = pattern.replace(/\s+/g, "");
  const events: { step: number; kind: OscKind }[] = [];
  for (let i = 0; i < chars.length; i += 1) {
    const mark = chars[i];
    if (mark === "." || mark === "-") continue;
    if (mark === "k" || mark === "x" || mark === "K") events.push({ step: i, kind: "kick" });
    if (mark === "s" || mark === "S" || mark === "K") events.push({ step: i, kind: "snare" });
    if (mark === "h" || mark === "x" || mark === "S") events.push({ step: i, kind: "hat" });
  }
  return { events, steps: chars.length };
}

function compile(id: string, spec: Spec): Piece {
  const lead = parsePitches(spec.lead);
  const bass = parsePitches(spec.bass ?? "");
  const harm = parsePitches(spec.harm ?? "");
  const drums = parseDrums(spec.drums);
  const steps = Math.max(lead.steps, bass.steps, harm.steps, drums.steps);
  for (const [name, part] of [
    ["lead", lead.steps],
    ["bass", bass.steps],
    ["harm", harm.steps],
    ["drums", drums.steps],
  ] as const) {
    if (part && steps % part !== 0) throw new Error(`${id} ${name} ${part} does not fit ${steps}`);
  }
  const notes: Note[] = [];
  const place = (
    events: { semi: number | null; dur: number; step: number }[],
    partSteps: number,
    kind: OscKind,
    vel: number,
    wave?: Wave,
  ) => {
    if (!partSteps) return;
    for (let base = 0; base < steps; base += partSteps) {
      for (const event of events) {
        if (event.semi === null) continue;
        notes.push({
          step: event.step + base,
          midi: spec.root + event.semi + (kind === "lead" || kind === "harm" ? 12 : 0),
          dur: event.dur,
          vel,
          kind,
          wave,
        });
      }
    }
  };
  place(lead.events, lead.steps, "lead", 0.16, spec.leadWave);
  place(bass.events, bass.steps, "bass", 0.22, spec.bassWave);
  place(harm.events, harm.steps, "harm", 0.1, spec.leadWave);
  for (let base = 0; base < steps; base += drums.steps) {
    for (const hit of drums.events) {
      const vel = hit.kind === "kick" ? 0.72 : hit.kind === "snare" ? 0.34 : 0.14;
      notes.push({ step: hit.step + base, midi: 0, dur: 1, vel, kind: hit.kind });
    }
  }
  return { bpm: spec.bpm, steps, notes };
}

const problems: string[] = [];
const pieces: Record<string, Piece> = {};
for (const [id, spec] of Object.entries(specs)) {
  try {
    pieces[id] = compile(id, spec);
  } catch (error) {
    problems.push(error instanceof Error ? error.message : String(error));
  }
}
if (problems.length) throw new Error(problems.join("\n"));

let enabled = false;
let loaded = false;
let focusId = "";
let playingId = "";
let musicOn = false;
let generation = 0;
let stepCursor = 0;
let nextTime = 0;
let timer = 0;
let lastSync: { id: string; time: number; playing: boolean } | null = null;
const listeners = new Set<() => void>();

let armToken = 0;
let audioCtx: AudioContext | null = null;
let leadBus: GainNode | null = null;
let bassBus: GainNode | null = null;
let drumBus: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let live: { osc: OscillatorNode; gain: GainNode }[] = [];
let noises: AudioBufferSourceNode[] = [];

function loadPreference() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  enabled = false;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    enabled = false;
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function voiceEnabled() {
  loadPreference();
  return enabled;
}

export function subscribeVoice(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function noiseBuffer(ctx: AudioContext) {
  if (noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
  const length = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  noiseBuf = buffer;
  return buffer;
}

function context() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0.78;
  const leadFilter = ctx.createBiquadFilter();
  leadFilter.type = "lowpass";
  leadFilter.frequency.value = 2400;
  leadFilter.Q.value = 0.6;
  const bassFilter = ctx.createBiquadFilter();
  bassFilter.type = "lowpass";
  bassFilter.frequency.value = 420;
  leadBus = ctx.createGain();
  bassBus = ctx.createGain();
  drumBus = ctx.createGain();
  leadBus.gain.value = 0.85;
  bassBus.gain.value = 1;
  drumBus.gain.value = 1;
  leadBus.connect(leadFilter);
  leadFilter.connect(master);
  bassBus.connect(bassFilter);
  bassFilter.connect(master);
  drumBus.connect(master);
  master.connect(ctx.destination);
  audioCtx = ctx;
  return ctx;
}

function stopNoises() {
  for (const source of noises) {
    try {
      source.stop();
    } catch {
      /* already ended */
    }
  }
  noises = [];
}

function dropLive() {
  stopNoises();
  const ctx = audioCtx;
  if (!ctx) {
    live = [];
    return;
  }
  const now = ctx.currentTime;
  for (const item of live) {
    try {
      item.gain.gain.cancelScheduledValues(now);
      item.gain.gain.setValueAtTime(Math.max(item.gain.gain.value, 0.0001), now);
      item.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      item.osc.stop(now + 0.05);
    } catch {
      /* already stopped */
    }
  }
  live = [];
}

function track(node: OscillatorNode, gain: GainNode) {
  live.push({ osc: node, gain });
  node.onended = () => {
    live = live.filter((item) => item.osc !== node);
  };
}

function burst(ctx: AudioContext, time: number, dur: number, vel: number, frequency: number, type: BiquadFilterType) {
  if (!drumBus) return;
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vel, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(drumBus);
  source.start(time);
  source.stop(time + dur + 0.02);
  noises.push(source);
  source.onended = () => {
    noises = noises.filter((item) => item !== source);
  };
}

function strike(ctx: AudioContext, note: Note, time: number, grid: number) {
  if (note.kind === "kick") {
    if (!drumBus) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(170, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.08);
    gain.gain.setValueAtTime(note.vel, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    osc.connect(gain);
    gain.connect(drumBus);
    osc.start(time);
    osc.stop(time + 0.22);
    track(osc, gain);
    burst(ctx, time, 0.03, note.vel * 0.28, 1600, "highpass");
    return;
  }
  if (note.kind === "hat") {
    burst(ctx, time, 0.035, note.vel, 7000, "highpass");
    return;
  }
  if (note.kind === "snare") {
    burst(ctx, time, 0.14, note.vel, 1800, "bandpass");
    if (!drumBus) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(190, time);
    gain.gain.setValueAtTime(note.vel * 0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
    osc.connect(gain);
    gain.connect(drumBus);
    osc.start(time);
    osc.stop(time + 0.14);
    track(osc, gain);
    return;
  }
  const dest = note.kind === "bass" ? bassBus : leadBus;
  if (!dest) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = note.wave || "square";
  const freq = 440 * 2 ** ((note.midi - 69) / 12);
  if (note.kind === "bass") {
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(Math.max(freq, 40), time + 0.035);
  } else {
    osc.frequency.setValueAtTime(freq, time);
  }
  const dur = Math.max(grid * note.dur * 0.86, 0.05);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(note.vel, time + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(time);
  osc.stop(time + dur + 0.02);
  track(osc, gain);
}

function begin(id: string) {
  const ctx = audioCtx;
  if (!ctx || ctx.state !== "running") return;
  const piece = pieces[id] ?? pieces.path;
  dropLive();
  window.clearTimeout(timer);
  playingId = id;
  musicOn = true;
  stepCursor = 0;
  nextTime = ctx.currentTime + 0.04;
  const gen = ++generation;
  const grid = 60 / piece.bpm / 4;
  const pump = () => {
    if (gen !== generation || !musicOn) return;
    while (nextTime < ctx.currentTime + 0.25) {
      for (const note of piece.notes) {
        if (note.step === stepCursor) strike(ctx, note, nextTime, grid);
      }
      stepCursor = (stepCursor + 1) % piece.steps;
      nextTime += grid;
    }
    timer = window.setTimeout(pump, 50);
  };
  pump();
}

function arm(id: string) {
  if (!enabled) return;
  const token = ++armToken;
  const ctx = context();
  if (!ctx) return;
  if (musicOn && playingId !== id) halt();
  void ctx.resume().then(() => {
    if (token !== armToken || !enabled || ctx.state !== "running") return;
    if (musicOn && playingId === id) return;
    begin(id);
  });
}

function halt() {
  generation += 1;
  musicOn = false;
  window.clearTimeout(timer);
  dropLive();
}

export function cueVoice(id: string, time: number) {
  if (typeof window === "undefined") return;
  focusId = id;
  lastSync = { id, time, playing: true };
  if (!voiceEnabled()) {
    if (musicOn) halt();
    return;
  }
  arm(id);
}

export function unlockVoice() {
  if (!voiceEnabled() || !lastSync?.playing) return;
  if (musicOn && playingId === lastSync.id) return;
  arm(lastSync.id);
}

export function stopVoice() {
  focusId = "";
  lastSync = null;
  halt();
}

export function setVoiceEnabled(on: boolean) {
  loadPreference();
  enabled = on;
  try {
    if (!on) window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode */
  }
  if (!on) halt();
  else if (lastSync?.playing) arm(lastSync.id);
  emit();
}

export function syncVoice(id: string, time: number, playing: boolean) {
  if (typeof window === "undefined") return;
  if (focusId && id !== focusId) return;
  lastSync = { id, time, playing };
  if (!voiceEnabled() || !playing) {
    if (musicOn) halt();
    return;
  }
  if (musicOn && playingId === id) return;
  arm(id);
}

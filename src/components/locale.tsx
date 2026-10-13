"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "bn" | "en";

const ui = {
  bn: {
    inter1: "HSC ১ম",
    inter2: "HSC ২য়",
    ssc: "এসএসসি",
    lang: "English",
    all: "সব",
    scenes: "টি দৃশ্য",
    open: "দৃশ্য চালাও",
    search: "খুঁজো: টর্ক, কপিকল, টান, দোলক…",
    empty: "এই অধ্যায়ে এখনো ত্রিমাত্র দৃশ্য নেই।",
    emptySearch: "এই নামে কোনো দৃশ্য নেই।",
    sscLead: "নবম–দশমের প্রমাণ। অধ্যায় বেছে দৃশ্য খুলো।",
    paper1Lead: "একাদশ–দ্বাদশ, ১ম পত্র। অধ্যায় চাপলে সেই অধ্যায়ের ত্রিমাত্র দৃশ্য।",
    paper2Lead: "একাদশ–দ্বাদশ, ২য় পত্র। অধ্যায় চাপলে সেই অধ্যায়ের ত্রিমাত্র দৃশ্য।",
    sscTitle: "এসএসসি প্রমাণ",
    paper1Title: "HSC ১ম পত্র",
    paper2Title: "HSC ২য় পত্র",
    vectorChapter: "ভেক্টর অধ্যায়",
    prev: "আগের",
    next: "পরের",
    allModels: "অধ্যায়ে ফিরে যাও",
    explain: "ব্যাখ্যা",
    formula: "সূত্র",
    example: "উদাহরণ",
    resetCamera: "ক্যামেরা ফেরাও",
    resetValues: "মান ফেরাও",
    orbit: "টেনে ঘোরাও · স্ক্রলে জুম",
    magnitude: "মান",
    tilt: "তলের কাত φ",
    angle: "θ কোণ",
    playResult: "লব্ধি আঁকো",
    rightHand: "ডান হাতের নিয়ম",
    makeRight: "৯০° করে দেখাও",
    tagline: "এসএসসি ও HSC পদার্থ",
    heroKicker: "এসএসসি · HSC পদার্থবিজ্ঞান",
    heroLead: "সূত্র মুখস্থ না করে সিমুলেশন চালিয়ে দেখো। তরঙ্গ, আলো, ভেক্টর আর প্রমাণ — সব নিজের হাতে।",
    zone1: "HSC ১ম",
    zone1Text: "তরঙ্গ, ভেক্টর ও গতি",
    zone2: "HSC ২য়",
    zone2Text: "তাপগতিবিদ্যা ও আলো",
    zone3: "এসএসসি",
    zone3Text: "নবম–দশমের প্রমাণ",
    play: "চালাও",
    pause: "থামাও",
    replay: "শুরু",
    slow: "ধীরে",
    opticsChapter: "ভৌত আলোকবিজ্ঞান",
    waveChapter: "তরঙ্গ অধ্যায়",
    thermoChapter: "তাপগতিবিদ্যা অধ্যায়",
  },
  en: {
    inter1: "HSC 1st",
    inter2: "HSC 2nd",
    ssc: "SSC",
    lang: "বাংলা",
    all: "All",
    scenes: "scenes",
    open: "Play scene",
    search: "Search: torque, pulley, pendulum…",
    empty: "No 3D scene in this chapter yet.",
    emptySearch: "No scene matches that search.",
    sscLead: "Class 9–10 proofs. Pick a chapter to open its scenes.",
    paper1Lead: "HSC first paper. Pick a chapter to see its 3D scenes.",
    paper2Lead: "HSC second paper. Pick a chapter to see its 3D scenes.",
    sscTitle: "SSC proofs",
    paper1Title: "HSC 1st paper",
    paper2Title: "HSC 2nd paper",
    vectorChapter: "Vectors",
    prev: "Previous",
    next: "Next",
    allModels: "Back to chapter",
    explain: "Explanation",
    formula: "Formula",
    example: "Example",
    resetCamera: "Reset camera",
    resetValues: "Reset values",
    orbit: "Drag to rotate · scroll to zoom",
    magnitude: "Magnitude",
    tilt: "Plane tilt φ",
    angle: "Angle θ",
    playResult: "Draw resultant",
    rightHand: "Right-hand rule",
    makeRight: "Set to 90°",
    tagline: "SSC and HSC physics",
    heroKicker: "SSC · HSC physics",
    heroLead: "Run the simulation instead of memorising the diagram. Waves, light, vectors and proofs, in your own hands.",
    zone1: "HSC 1st",
    zone1Text: "Waves, vectors and motion",
    zone2: "HSC 2nd",
    zone2Text: "Thermodynamics and light",
    zone3: "SSC",
    zone3Text: "Class 9–10 proofs",
    play: "Play",
    pause: "Pause",
    replay: "Reset",
    slow: "Slow",
    opticsChapter: "Physical optics",
    waveChapter: "Waves",
    thermoChapter: "Thermodynamics",
  },
} as const;

export type UiKey = keyof (typeof ui)["bn"];

export const sscChapterEn: Record<string, string> = {
  all: "All",
  motion: "Motion",
  force: "Force",
  energy: "Energy",
  matter: "Pressure",
  heat: "Heat",
  wave: "Waves",
  light: "Light",
  electro: "Electricity",
  modern: "Radioactivity",
};

export const chapterEn: Record<string, string> = {
  all: "All",
  measure: "Physical world",
  vector: "Vectors",
  dynamics: "Dynamics",
  newton: "Newtonian mechanics",
  energy: "Work and energy",
  gravity: "Gravitation",
  matter: "Properties of matter",
  shm: "Periodic motion",
  wave: "Waves",
  gas: "Kinetic theory",
  thermo: "Thermodynamics",
  electrostatics: "Electrostatics",
  current: "Current electricity",
  magnetism: "Magnetism",
  induction: "Induction and AC",
  "geo-optics": "Geometrical optics",
  "phys-optics": "Physical optics",
  modern: "Modern physics",
  nucleus: "Atoms and nuclei",
  electronics: "Electronics",
};

export const demoEn: Record<string, string> = {
  path: "Distance and displacement",
  freefall: "Free fall",
  projectile: "Projectile motion",
  "chase-tiger": "Tiger and deer",
  "traffic-pace": "Car and motorcycle",
  "sprint-race": "Sprint",
  "car-brake": "Braking car",
  "cliff-fall": "Fall from a height",
  "slope-car": "Car on a slope",
  "oval-run": "Oval track",
  "vt-graph": "Velocity–time graph",
  "st-graph": "Displacement–time graph",
  "train-pass": "Train and platform",
  newton1: "Newton’s first law",
  newton2: "Newton’s second law",
  newton3: "Newton’s third law",
  vector: "Parallelogram of forces",
  torque: "Torque",
  tension: "Tension",
  "pulley-fixed": "Fixed pulley",
  "pulley-move": "Movable pulley",
  friction: "Friction",
  inertia: "Inertia",
  reaction: "Action and reaction",
  collision: "Conservation of momentum",
  work: "Work",
  energy: "Energy conversion",
  pressure: "Pressure in a liquid",
  buoyancy: "Archimedes’ principle",
  expansion: "Linear expansion",
  pendulum: "Simple pendulum",
  wave: "Transverse wave",
  sound: "Longitudinal wave",
  reflection: "Law of reflection",
  refraction: "Refraction",
  lens: "Convex lens",
  tir: "Total internal reflection",
  "mirror-concave": "Concave mirror",
  "mirror-convex": "Convex mirror",
  "lens-convex": "Convex lens image",
  "lens-concave": "Concave lens image",
  charge: "Force between charges",
  circuit: "Closed circuit",
  magnet: "Magnetic field",
  halflife: "Half-life",
};

export const vectorEn: Record<string, { title: string; blurb: string; explain: string }> = {
  coordinate: {
    title: "3D coordinate system",
    blurb: "Positive and negative X, Y and Z, and a point anywhere in space.",
    explain: "The three axes are mutually perpendicular. Arrowheads mark the positive directions. A point P(x, y, z) is that far from the origin along each axis. The position vector r is the arrow from the origin to P.",
  },
  parallelogram: {
    title: "Parallelogram law",
    blurb: "A and B from one point. The diagonal is the resultant.",
    explain: "Draw both vectors from the same point and complete the parallelogram. The diagonal from the origin is R = A + B. Changing either vector updates the parallelogram and the resultant.",
  },
  triangle: {
    title: "Triangle law",
    blurb: "Place B at the head of A. The closing side is the resultant.",
    explain: "Vectors are placed head to tail. Draw A, then B from the tip of A. The resultant runs from the start of A to the tip of B. Press the button to draw it again.",
  },
  resolution: {
    title: "Resolution of a vector",
    blurb: "Split one vector into Ax, Ay and Az, then join them back.",
    explain: "Any vector can be split into three perpendicular components. Placing those components head to tail rebuilds the original vector.",
  },
  sum: {
    title: "Addition and subtraction",
    blurb: "A + B and A − B update as you change length or direction.",
    explain: "Add matching components. Subtraction adds the opposite vector: A − B = A + (−B). Both results update as the sliders move.",
  },
  angle: {
    title: "Angle between vectors",
    blurb: "The angle θ, and the cosine in the dot product.",
    explain: "θ is the angle between the two directions. The dot product is |A||B| cosθ. Tilting the plane with φ keeps the same θ in 3D.",
  },
  dot: {
    title: "Dot product",
    blurb: "The result is a number. Perpendicular vectors give zero.",
    explain: "The dot product is a scalar. It is the length of the shadow of B on A. At 90° that shadow disappears, so the product is zero.",
  },
  cross: {
    title: "Cross product",
    blurb: "A × B is perpendicular to both vectors. Direction follows the right-hand rule.",
    explain: "The cross product is a new vector, perpendicular to both A and B. Its magnitude is |A||B| sinθ. Curl the fingers from A toward B and the thumb gives the direction.",
  },
  unit: {
    title: "Unit vector",
    blurb: "î, ĵ and k̂ lie on the axes. Any vector divided by its magnitude has length 1.",
    explain: "A unit vector has magnitude 1 and carries only direction. Divide a vector by its magnitude to get the unit vector along it. A zero vector has no direction.",
  },
  direction: {
    title: "Magnitude and direction",
    blurb: "Change components, length or angles. The model and the numbers update together.",
    explain: "The same vector can be written with components Ax, Ay, Az, or with a magnitude and two angles. Azimuth α is the turn from +X toward +Y. Elevation β is the rise above the horizontal plane.",
  },
};

type LocaleValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: UiKey) => string;
};

const LocaleContext = createContext<LocaleValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("bn");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("3dsciencezone-lang") || window.localStorage.getItem("trimatra-lang");
    if (saved === "en" || saved === "bn") setLang(saved);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("3dsciencezone-lang", lang);
    document.documentElement.lang = lang === "en" ? "en" : "bn";
  }, [lang, ready]);

  const value = useMemo<LocaleValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((current) => (current === "bn" ? "en" : "bn")),
      t: (key) => ui[lang][key],
    }),
    [lang],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLang() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLang needs LocaleProvider");
  return value;
}

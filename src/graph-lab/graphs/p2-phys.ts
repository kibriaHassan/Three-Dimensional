import { bnNum } from "../format";
import { blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

function young(xMm: number, lambdaNm: number, slitMm: number, screenM: number) {
  const betaMm = (lambdaNm * 1e-3 * screenM) / slitMm;
  return Math.cos(Math.PI * xMm / betaMm) ** 2;
}

function slit(thetaDeg: number, widthMm: number, lambdaNm: number) {
  const theta = (thetaDeg * Math.PI) / 180;
  const beta = (Math.PI * widthMm * 1e-3 * Math.sin(theta)) / (lambdaNm * 1e-9);
  if (Math.abs(beta) < 1e-4) return 1;
  return (Math.sin(beta) / beta) ** 2;
}

export const physOpticGraphs: GraphSpec[] = [
  {
    id: "po-young",
    chapter: "phys-optics",
    title: "ইয়ংয়ের দ্বিচিরে উজ্জ্বলতা–অবস্থান",
    source: "book",
    xName: "পর্দার অবস্থান",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "x (mm)",
    ySymbol: "I/Iₘₐₓ",
    formula: "I = 4 I₁ cos²(π d x / λD)",
    condition: "দুই সরু চির, সমান উজ্জ্বলতা। β = λD/d। লেখে I কে সর্বোচ্চ দিয়ে ভাগ।",
    explain: "মধ্যবিন্দুতে উজ্জ্বল ডোরা। তারপর সমান ফাঁকে অন্ধকার ও উজ্জ্বল। ডোরার প্রস্থ β।",
    meaning: "λ বা D বাড়লে ডোরা ছড়ায়। d বাড়লে ডোরা ঘন হয়।",
    slope: "উজ্জ্বল চূড়ায় ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("lambda", "তরঙ্গদৈর্ঘ্য λ", 400, 700, 10, "nm"), knob("slit", "চিরের ব্যবধান d", 0.2, 1, 0.05, "mm"), knob("screen", "পর্দার দূরত্ব D", 0.5, 2, 0.1, "m")],
    base: { lambda: 600, slit: 0.5, screen: 1 },
    steps: [
      { eq: "δ = d sinθ ≈ d x / D", why: "ছোট কোণে পথ পার্থক্য।" },
      { eq: "Δφ = 2π δ / λ", why: "পথ পার্থক্য দশা পার্থক্য করে।" },
      { eq: "I ∝ cos²(Δφ/2)", why: "সমান দুই উৎস। উজ্জ্বল যখন δ = mλ।", tag: "শর্ত" },
    ],
    build(p) {
      const beta = (p.lambda * 1e-3 * p.screen) / p.slit;
      return {
        curves: [curve("main", "দ্বিচির", copper, samples(-4, 4, (position) => young(position, p.lambda, p.slit, p.screen), 240))],
        calc: `β = λD/d = ${bnNum(beta, 2)} mm।`,
      };
    },
  },
  {
    id: "po-path",
    chapter: "phys-optics",
    title: "পথ পার্থক্য–উজ্জ্বলতা",
    source: "book",
    xName: "পথ পার্থক্য",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "δ/λ",
    ySymbol: "I/Iₘₐₓ",
    formula: "I = 4 I₁ cos²(π δ / λ)",
    condition: "সমান বিস্তারের দুই তরঙ্গ। অনুভূমিক অক্ষ তরঙ্গদৈর্ঘ্যের এককে।",
    explain: "δ = 0, λ, 2λ…-এ উজ্জ্বলতা সর্বোচ্চ। δ = λ/2, 3λ/2…-এ অন্ধকার।",
    meaning: "পথ পার্থক্য পূর্ণ তরঙ্গদৈর্ঘ্য হলে গঠনমূলক ব্যতিচার।",
    slope: "চূড়া ও তলানিতে ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "Δφ = 2π δ / λ", why: "এক λ পথ মানে 2π দশা।" },
      { eq: "I = 4 I₁ cos²(Δφ/2)", why: "দুই তরঙ্গের যোগ।" },
      { eq: "δ = mλ → I সর্বোচ্চ", why: "অর্ধ-পূর্ণসাংখ্যিক λ-এ I = 0। δ-এর সরল সমানুপাত নয়।" },
    ],
    build() {
      return {
        curves: [curve("main", "I–δ", copper, samples(0, 3, (ratio) => Math.cos(Math.PI * ratio) ** 2, 180))],
        guides: [
          { x: 1, label: "λ" },
          { x: 0.5, label: "λ/2" },
        ],
        calc: "δ/λ = 0 বা 1 হলে I/Iₘₐₓ = 1। δ/λ = 0.5 হলে 0।",
      };
    },
  },
  {
    id: "po-phase",
    chapter: "phys-optics",
    title: "দশা পার্থক্য–উজ্জ্বলতা",
    source: "book",
    xName: "দশা পার্থক্য",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "Δφ (রেডিয়ান)",
    ySymbol: "I/Iₘₐₓ",
    formula: "I = 4 I₁ cos²(Δφ / 2)",
    condition: "সমান বিস্তার। 2π রেডিয়ান = 360°।",
    explain: "দশা 0 হলে উজ্জ্বল, π হলে অন্ধকার, 2π-এ আবার উজ্জ্বল।",
    meaning: "পথ পার্থক্যের লেখেরই দশা-অক্ষের রূপ।",
    slope: "0, π, 2π-এ ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "I = I₁ + I₁ + 2√(I₁ I₁) cos Δφ", why: "দুই তরঙ্গের উজ্জ্বলতার যোগ।" },
      { eq: "I = 4 I₁ cos²(Δφ/2)", why: "1 + cosΔφ = 2 cos²(Δφ/2)।" },
      { eq: "Δφ = 0 → সর্বোচ্চ", why: "Δφ = π হলে cos শূন্য, অন্ধকার।", tag: "শর্ত" },
    ],
    build() {
      return {
        curves: [curve("main", "I–Δφ", copper, samples(0, 2 * Math.PI, (phase) => Math.cos(phase / 2) ** 2, 160))],
        guides: [{ x: Math.PI, label: "π" }],
        calc: "Δφ = 0-এ I/Iₘₐₓ = 1। Δφ = π-এ 0।",
      };
    },
  },
  {
    id: "po-order",
    chapter: "phys-optics",
    title: "ডোরার অবস্থান–ক্রম",
    source: "book",
    xName: "উজ্জ্বল ডোরার ক্রম",
    yName: "মধ্যবিন্দু থেকে দূরত্ব",
    xSymbol: "m",
    ySymbol: "x (mm)",
    formula: "x = m λ D / d",
    condition: "উজ্জ্বল ডোরা, m = 0, ±1, ±2…। ছোট কোণ।",
    explain: "অবস্থান ক্রমের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল ডোরার প্রস্থ β।",
    meaning: "পরপর দুই উজ্জ্বল ডোরার ফারাক β = λD/d, m-এর ওপর নয়।",
    slope: "ঢাল = β = λD/d।",
    area: noArea,
    origin: "both",
    knobs: [knob("lambda", "λ", 400, 700, 10, "nm"), knob("slit", "d", 0.2, 1, 0.05, "mm"), knob("screen", "D", 0.5, 2, 0.1, "m")],
    base: { lambda: 600, slit: 0.5, screen: 1 },
    steps: [
      { eq: "δ = m λ", why: "উজ্জ্বল ডোরার শর্ত।" },
      { eq: "δ ≈ d x / D", why: "পর্দায় ছোট কোণ।" },
      { eq: "x = m λ D / d", why: "λ, D, d স্থির। অবস্থান ক্রমের সমানুপাতিক।", tag: "সমানুপাত" },
    ],
    build(p) {
      const beta = (p.lambda * 1e-3 * p.screen) / p.slit;
      const points = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((order) => ({ x: order, y: order * beta }));
      return {
        curves: [curve("main", "উজ্জ্বল ডোরা", copper, points)],
        calc: `β = ${bnNum(beta, 2)} mm। তৃতীয় ডোরা x = ${bnNum(3 * beta, 2)} mm।`,
      };
    },
  },
  {
    id: "po-lambda",
    chapter: "phys-optics",
    title: "ডোরার প্রস্থ–তরঙ্গদৈর্ঘ্য",
    source: "book",
    xName: "তরঙ্গদৈর্ঘ্য",
    yName: "ডোরার প্রস্থ",
    xSymbol: "λ (nm)",
    ySymbol: "β (mm)",
    formula: "β = λ D / d",
    condition: "D ও d স্থির। দৃশ্যমান আলো।",
    explain: "লাল আলোতে ডোরা নীলের চেয়ে চওড়া। β তরঙ্গদৈর্ঘ্যের সমানুপাতিক।",
    meaning: "সাদা আলোতে কেন্দ্রের ডোরা সাদা, পাশে রঙ ছড়ায়, কারণ λ আলাদা।",
    slope: "ঢাল = D/d।",
    area: noArea,
    origin: "both",
    knobs: [knob("slit", "d", 0.2, 1, 0.05, "mm"), knob("screen", "D", 0.5, 2, 0.1, "m")],
    base: { slit: 0.5, screen: 1 },
    steps: [
      { eq: "β = λ D / d", why: "পরপর দুই উজ্জ্বল ডোরার দূরত্ব।" },
      { eq: "D, d স্থির  →  β ∝ λ", why: "তরঙ্গদৈর্ঘ্যের সমানুপাত।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "λ = 0 হলে ডোরা জোড়া লাগত। বাস্তব আলোতে λ শূন্য নয়।" },
    ],
    build(p) {
      const slope = (1e-3 * p.screen) / p.slit;
      return {
        curves: [curve("main", "β–λ", copper, samples(400, 700, (lambda) => slope * lambda, 16))],
        calc: `600 nm-এ β = ${bnNum(slope * 600, 2)} mm।`,
      };
    },
  },
  {
    id: "po-slitgap",
    chapter: "phys-optics",
    title: "ডোরার প্রস্থ–চিরের ব্যবধান",
    source: "book",
    xName: "চিরের ব্যবধান",
    yName: "ডোরার প্রস্থ",
    xSymbol: "d (mm)",
    ySymbol: "β (mm)",
    formula: "β = λ D / d",
    condition: "λ ও D স্থির।",
    explain: "চির কাছে আনলে ডোরা ছড়ায়। β ব্যবধানের ব্যাস্তানুপাতিক।",
    meaning: "d দ্বিগুণ হলে β অর্ধেক। ডোরা ঘন হয়ে পড়ে।",
    slope: "ঢাল = −λD/d²।",
    area: noArea,
    knobs: [knob("lambda", "λ", 400, 700, 10, "nm"), knob("screen", "D", 0.5, 2, 0.1, "m")],
    base: { lambda: 600, screen: 1 },
    steps: [
      { eq: "β = λ D / d", why: "ইয়ংয়ের ডোরার প্রস্থ।" },
      { eq: "β ∝ 1/d", why: "λ ও D স্থির। ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ অধিবৃত্ত", why: "d বনাম β সরলরেখা নয়।" },
    ],
    build(p) {
      const scale = p.lambda * 1e-3 * p.screen;
      return {
        curves: [curve("main", "β–d", copper, samples(0.2, 1.2, (gap) => scale / gap))],
        calc: `d = 0.5 mm-এ β = ${bnNum(scale / 0.5, 2)} mm। d = 1 mm-এ β = ${bnNum(scale / 1, 2)} mm।`,
      };
    },
  },
  {
    id: "po-single",
    chapter: "phys-optics",
    title: "একক চির অপবর্তনের উজ্জ্বলতা",
    source: "book",
    xName: "কোণ",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "θ (°)",
    ySymbol: "I/I₀",
    formula: "I = I₀ (sinβ / β)²,   β = π a sinθ / λ",
    condition: "সরু এক চির, প্রস্থ a। প্রথম অন্ধকার a sinθ = λ।",
    explain: "মাঝের চূড়া চওড়া। দুই পাশে ছোট গৌণ চূড়া। দ্বিচিরের সমান উজ্জ্বল-অন্ধকার ডোরা এটা নয়।",
    meaning: "চির সরু হলে প্যাটার্ন ছড়ায়। a কমলে প্রথম অন্ধকার বড় কোণে।",
    slope: "θ = 0-এ ঢাল শূন্য, উজ্জ্বলতা সর্বোচ্চ।",
    area: noArea,
    origin: "both",
    knobs: [knob("width", "চিরের প্রস্থ a", 0.05, 0.3, 0.01, "mm"), knob("lambda", "λ", 400, 700, 10, "nm")],
    base: { width: 0.1, lambda: 600 },
    steps: [
      { eq: "β = π a sinθ / λ", why: "চিরের দুই প্রান্তের দশা পার্থক্যের অর্ধেক।" },
      { eq: "I = I₀ (sinβ / β)²", why: "হাইগেন্স উৎসগুলোর যোগ।" },
      { eq: "a sinθ = mλ → অন্ধকার", why: "m = ±1, ±2…। θ = 0-তে সীমা I = I₀।" },
    ],
    build(p) {
      const first = (Math.asin(Math.min(0.99, (p.lambda * 1e-9) / (p.width * 1e-3))) * 180) / Math.PI;
      return {
        curves: [curve("main", "এক চির", copper, samples(-2.5, 2.5, (angle) => slit(angle, p.width, p.lambda), 220))],
        guides: [{ x: first, label: "প্রথম অন্ধকার" }],
        calc: `প্রথম অন্ধকার θ = ${bnNum(first, 2)}°।`,
      };
    },
  },
  {
    id: "po-compare",
    chapter: "phys-optics",
    title: "ব্যতিচার ও অপবর্তনের তুলনা",
    source: "extra",
    xName: "নিজ নিজ স্কেলের অবস্থান",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "স্কেল",
    ySymbol: "I/Iₘₐₓ",
    formula: "ব্যতিচার: cos²,   অপবর্তন: (sinβ/β)²",
    condition: "সূত্রভিত্তিক তুলনা। অনুভূমিক অক্ষ একই মিটার নয়: ব্যতিচারে এক একক = একটি ডোরার প্রস্থ, অপবর্তনে এক একক = কেন্দ্র থেকে প্রথম অন্ধকারের চার ভাগের এক ভাগ।",
    explain: "ব্যতিচারে অনেক সমান চূড়া। অপবর্তনে একটি বড় কেন্দ্র ও দ্রুত ছোট হয়ে যাওয়া পাশ।",
    meaning: "দুই প্যাটার্ন আলাদা ঘটনা। বাস্তব দ্বিচির সরু হলে ব্যতিচারের ওপর অপবর্তনের খাম বসে।",
    slope: "দুই চূড়ায় ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "ব্যতিচার: দুই উৎসের যোগ", why: "I ∝ cos²(π x / β)। অনেক ডোরা।" },
      { eq: "অপবর্তন: এক চিরের ভেতরের যোগ", why: "I ∝ (sinβ/β)²। একটি প্রধান চূড়া।" },
      { eq: "একই অক্ষে মিটার মিল নয়", why: "তুলনা আকৃতির। দাগের ফাঁক এই লেখে সমান মিটার নয়।", tag: "তুলনা" },
    ],
    build() {
      return {
        curves: [
          curve("main", "ব্যতিচার", copper, samples(-4, 4, (position) => Math.cos(Math.PI * position) ** 2, 240)),
          curve("diff", "অপবর্তন", blue, samples(-4, 4, (position) => {
            const beta = (Math.PI * position) / 2;
            if (Math.abs(beta) < 1e-4) return 1;
            return (Math.sin(beta) / beta) ** 2;
          }, 240)),
        ],
        calc: "ব্যতিচারে ±1, ±2…-এ অন্ধকার। অপবর্তনে ±2 স্কেলে প্রথম অন্ধকার।",
      };
    },
  },
  {
    id: "po-malus",
    chapter: "phys-optics",
    title: "ম্যালুসের সূত্র: উজ্জ্বলতা–কোণ",
    source: "book",
    xName: "পোলারাইজার দুটির কোণ",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "θ (°)",
    ySymbol: "I/I₀",
    formula: "I = I₀ cos²θ",
    condition: "সম্পূর্ণ সমবর্তিত আলো। θ দুই পোলারয়েডের অক্ষের কোণ।",
    explain: "θ = 0° হলে আলো পুরো যায়। θ = 90° হলে অন্ধকার। কোসাইনের বর্গ।",
    meaning: "আলো অনুপ্রস্থ তরঙ্গ, তাই এক তলে আটকানো যায়।",
    slope: "ঢাল = −(I₀/2) sin 2θ। 0° ও 90°-এ শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "E = E₀ cosθ", why: "দ্বিতীয় পোলারয়েড ক্ষেত্রের উপাংশ নেয়।" },
      { eq: "I ∝ E²", why: "উজ্জ্বলতা ক্ষেত্রের বর্গের সমানুপাতিক।", tag: "বর্গ" },
      { eq: "I = I₀ cos²θ", why: "θ = 90° হলে I = 0। θ-এর সরল সমানুপাত নয়।" },
    ],
    build() {
      return {
        curves: [curve("main", "ম্যালুস", copper, samples(0, 90, (angle) => Math.cos((angle * Math.PI) / 180) ** 2, 90))],
        calc: "θ = 60°-এ I/I₀ = 0.25। θ = 45°-এ 0.5।",
      };
    },
  },
  {
    id: "po-condition",
    chapter: "phys-optics",
    title: "গঠনমূলক ও ধ্বংসাত্মক ব্যতিচার",
    source: "book",
    xName: "পথ পার্থক্য",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "δ/λ",
    ySymbol: "I/Iₘₐₓ",
    formula: "গঠন: δ = mλ,   ধ্বংস: δ = (m+½)λ",
    condition: "সমান দুই উৎস। গাইড পূর্ণ সংখ্যায় উজ্জ্বল, অর্ধে পূর্ণে অন্ধকার।",
    explain: "একই কোসাইন-বর্গ লেখ। পূর্ণ তরঙ্গদৈর্ঘ্যে চূড়া, অর্ধে তলানি।",
    meaning: "শর্ত দুটি এক লেখের দুই বিন্দু। আলাদা সরলরেখা নয়।",
    slope: "চূড়া ও তলানিতে ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "I ∝ cos²(π δ / λ)", why: "পথ পার্থক্য থেকে উজ্জ্বলতা।" },
      { eq: "δ = mλ → cos = ±1", why: "গঠনমূলক। উজ্জ্বলতা সর্বোচ্চ।", tag: "গঠন" },
      { eq: "δ = (m+½)λ → cos = 0", why: "ধ্বংসাত্মক। উজ্জ্বলতা শূন্য।", tag: "ধ্বংস" },
    ],
    build() {
      return {
        curves: [curve("main", "I–δ", copper, samples(0, 3, (ratio) => Math.cos(Math.PI * ratio) ** 2, 200))],
        guides: [
          { x: 1, label: "গঠন" },
          { x: 1.5, label: "ধ্বংস" },
        ],
        calc: "m = 0, 1, 2… গঠন। m = 0, 1, 2…-এর অর্ধে ধ্বংস।",
      };
    },
  },
];

import { bnNum } from "../format";
import { blue, copper, curve, gold, green, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const thermal = 0.026;

function shockleyMilliamp(voltage: number) {
  const ratio = voltage / thermal;
  if (ratio > 30) return 1e-9 * Math.exp(30);
  return 1e-9 * (Math.exp(ratio) - 1);
}

function squareWave(high: (time: number) => boolean, offset: number): Point[] {
  const points: Point[] = [];
  const steps = 160;
  let level = high(0);
  points.push({ x: 0, y: (level ? 1 : 0) + offset });
  for (let index = 1; index <= steps; index += 1) {
    const time = (4 * index) / steps;
    const next = high(time - 1e-6);
    if (next !== level) {
      points.push({ x: time, y: (level ? 1 : 0) + offset });
      points.push({ x: time, y: (next ? 1 : 0) + offset });
      level = next;
    }
  }
  points.push({ x: 4, y: (level ? 1 : 0) + offset });
  return points;
}

export const electronicsGraphs: GraphSpec[] = [
  {
    id: "elx-diode",
    chapter: "electronics",
    title: "ডায়োডের V–I বৈশিষ্ট্য",
    source: "book",
    xName: "বিভব",
    yName: "প্রবাহ",
    xSymbol: "V (V)",
    ySymbol: "I (mA)",
    formula: "I = Iₛ (e^(V / ηVₜ) − 1)",
    condition: "শকলি সমীকরণ। Iₛ = 10⁻¹² A, η = 1, Vₜ = 26 mV। রিভার্স প্রবাহ ন্যানোঅ্যাম্পিয়ার, তাই mA অক্ষে শূন্যের ওপর। ব্রেকডাউন আঁকা হয়নি।",
    explain: "ফরোয়ার্ডে প্রায় 0.6 V-এর পর প্রবাহ দ্রুত বাড়ে। রিভার্সে এই স্কেলে প্রবাহ দেখা যায় না।",
    meaning: "ডায়োড একদিকে পরিবাহী। হাঁটু সিলিকনের জন্য প্রায় 0.7 V-এর কাছে।",
    slope: "ফরোয়ার্ডে ঢাল দ্রুত বাড়ে। রিভার্সে এই অক্ষে ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "I = Iₛ (e^(V/ηVₜ) − 1)", why: "আদর্শ ডায়োডের শকলি সমীকরণ।" },
      { eq: "V > 0, সূচকীয় বৃদ্ধি", why: "Vₜ ছোট, তাই অল্প বিভবেই সূচক বড়।" },
      { eq: "V < 0 হলে I ≈ −Iₛ", why: "mA অক্ষে তা শূন্য।", tag: "ধ্রুব" },
    ],
    build() {
      return {
        curves: [curve("main", "ডায়োড", copper, samples(-2, 0.65, shockleyMilliamp, 140))],
        guides: [{ x: 0, label: "0" }],
        calc: `0.6 V-এ I ≈ ${bnNum(shockleyMilliamp(0.6), 1)} mA। 0.65 V-এ ≈ ${bnNum(shockleyMilliamp(0.65), 1)} mA। −1 V-এ প্রবাহ প্রায় −10⁻⁹ mA।`,
      };
    },
  },
  {
    id: "elx-bias",
    chapter: "electronics",
    title: "ফরোয়ার্ড ও রিভার্স বায়াস",
    source: "book",
    xName: "বিভব",
    yName: "প্রবাহ",
    xSymbol: "V (V)",
    ySymbol: "I (mA)",
    formula: "ফরোয়ার্ডে সূচকীয়, রিভার্সে ≈ −Iₛ",
    condition: "একই শকলি সমীকরণ দুই অংশে। নীল ড্যাশ রিভার্স, তামা ফরোয়ার্ড। রিভার্স রেখা অক্ষের ওপর, কারণ Iₛ এই স্কেলে অদৃশ্য।",
    explain: "ফরোয়ার্ড বায়াসে ডায়োড চালু, রিভার্স বায়াসে প্রায় বন্ধ। তুলনাটা এই অসমতা।",
    meaning: "রেকটিফায়ার এই অসমতার ওপর দাঁড়ায়।",
    slope: "ফরোয়ার্ডে ঢাল বাড়ে। রিভার্সে প্রায় শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "V > 0 → ফরোয়ার্ড", why: "p দিক ধনাত্মক। সূচকীয় প্রবাহ।" },
      { eq: "V < 0 → রিভার্স", why: "ডিপ্লিশন চওড়া। প্রবাহ −Iₛ।" },
      { eq: "একই সমীকরণ", why: "দুই রেখা এক সূত্রের দুই দিক।", tag: "ধ্রুব" },
    ],
    build() {
      return {
        curves: [
          curve("rev", "রিভার্স", blue, samples(-3, 0, shockleyMilliamp, 40), { dashed: true }),
          curve("main", "ফরোয়ার্ড", copper, samples(0, 0.65, shockleyMilliamp, 100)),
        ],
        calc: "রিভার্স রেখা mA অক্ষে শূন্য। ফরোয়ার্ড 0.6 V-এর পর মাপা যায় এমন প্রবাহ।",
      };
    },
  },
  {
    id: "elx-temp",
    chapter: "electronics",
    title: "তাপমাত্রায় সেমিকন্ডাক্টরের রোধ",
    source: "extra",
    xName: "তাপমাত্রা",
    yName: "আপেক্ষিক রোধ",
    xSymbol: "T (K)",
    ySymbol: "R / R₃₀₀",
    formula: "R ∝ T^(−3/2) exp(E_g / 2kT)",
    condition: "সূত্রভিত্তিক অতিরিক্ত গ্রাফ। বিশুদ্ধ সেমিকন্ডাক্টর। 300 K-এর রোধকে 1 ধরা। T^(−3/2) সূচকের চেয়ে ছোট, সূচকটাই লেখের আকার।",
    explain: "তাপমাত্রা বাড়লে বাহকের সংখ্যা সূচকীয়ভাবে বাড়ে, তাই রোধ কমে। ধাতুর উল্টো।",
    meaning: "থার্মিস্টর এই পতন ব্যবহার করে। সিলিকনের ব্যান্ড গ্যাপ প্রায় 1.1 eV।",
    slope: "ঢাল ঋণাত্মক। গরম হলে রোধ কমে।",
    area: noArea,
    knobs: [knob("gap", "ব্যান্ড গ্যাপ E_g", 0.67, 1.2, 0.01, "eV")],
    base: { gap: 1.12 },
    steps: [
      { eq: "nᵢ ∝ T^(3/2) e^(−E_g/2kT)", why: "বিশুদ্ধ সেমিকন্ডাক্টরের বাহক।" },
      { eq: "σ ∝ nᵢ", why: "পরিবাহিতা বাহকের সংখ্যায় বাড়ে।" },
      { eq: "R ∝ 1/σ", why: "তাপমাত্রা বাড়লে বাহক বাড়ে, রোধ কমে।" },
    ],
    build(p) {
      const half = p.gap / (2 * 8.617333262145e-5);
      const relative = (temperature: number) => (temperature / 300) ** -1.5 * Math.exp(half * (1 / temperature - 1 / 300));
      return {
        curves: [curve("main", "অন্তর্নিহিত", copper, samples(280, 420, relative, 80))],
        guides: [{ x: 300, label: "300 K" }],
        calc: `350 K-এ R/R₃₀₀ ≈ ${bnNum(relative(350), 3)}। তাপ বাড়লে রোধ কমে।`,
      };
    },
  },
  {
    id: "elx-input",
    chapter: "electronics",
    title: "ট্রানজিস্টরের ইনপুট বৈশিষ্ট্য",
    source: "book",
    xName: "বেস–ইমিটার বিভব",
    yName: "বেস প্রবাহ",
    xSymbol: "V_BE (V)",
    ySymbol: "I_B (μA)",
    formula: "I_B = Iₛ (e^(V_BE / Vₜ) − 1)",
    condition: "CE বিন্যাস। বেস–ইমিটার সংযোগ একটি ডায়োড। Iₛ এমন যে 0.62 V-এর কাছে দশ μA। V_CE স্থির।",
    explain: "V_BE প্রায় 0.5 V পর্যন্ত বেস প্রবাহ নগণ্য। তারপর সূচকীয়ভাবে বাড়ে। ইনপুট বৈশিষ্ট্য ডায়োডের মতো।",
    meaning: "সিলিকন ট্রানজিস্টর চালু হতে V_BE প্রায় 0.7 V লাগে।",
    slope: "ঢাল = dI_B/dV_BE, বিভব বাড়লে বাড়ে। ইনপুট রোধ এই ঢালের উল্টো।",
    area: noArea,
    origin: "y",
    knobs: [],
    base: {},
    steps: [
      { eq: "বেস–ইমিটার একটি ডায়োড", why: "ফরোয়ার্ড বায়াস লাগে।" },
      { eq: "I_B = Iₛ (e^(V/Vₜ) − 1)", why: "শকলি সমীকরণ, প্রবাহ μA-এ।" },
      { eq: "V_BE বাড়লে I_B সূচকীয়", why: "সরলরেখা নয়।", tag: "ধ্রুব" },
    ],
    build() {
      const baseUa = (voltage: number) => {
        const ratio = voltage / thermal;
        if (ratio > 30) return 1e-9 * Math.exp(30);
        return 1e-9 * (Math.exp(ratio) - 1);
      };
      return {
        curves: [curve("main", "ইনপুট", copper, samples(0.45, 0.64, baseUa, 80))],
        calc: `0.60 V-এ I_B ≈ ${bnNum(baseUa(0.6), 1)} μA। 0.62 V-এ ≈ ${bnNum(baseUa(0.62), 1)} μA।`,
      };
    },
  },
  {
    id: "elx-output",
    chapter: "electronics",
    title: "ট্রানজিস্টরের আউটপুট বৈশিষ্ট্য",
    source: "book",
    xName: "কালেক্টর–ইমিটার বিভব",
    yName: "কালেক্টর প্রবাহ",
    xSymbol: "V_CE (V)",
    ySymbol: "I_C (mA)",
    formula: "সক্রিয় অঞ্চলে I_C = β I_B",
    condition: "আদর্শ মডেল। V_CE > 0.3 V হলে I_C প্রায় সমতল, β I_B। আর্লি প্রভাব নেই, তাই ঢাল শূন্য। তিনটি বেস প্রবাহ।",
    explain: "শুরুতে স্যাচুরেশন: V_CE বাড়লে I_C বাড়ে। তারপর সক্রিয় অঞ্চলে বেস প্রবাহই কালেক্টর প্রবাহ ঠিক করে, V_CE নয়।",
    meaning: "বেস প্রবাহ দ্বিগুণ হলে সক্রিয় অঞ্চলের I_C দ্বিগুণ।",
    slope: "সক্রিয় অঞ্চলে আদর্শ ঢাল শূন্য। আউটপুট রোধ খুব বড়।",
    area: noArea,
    origin: "both",
    knobs: [knob("beta", "β", 50, 200, 10, "")],
    base: { beta: 100 },
    steps: [
      { eq: "I_C = β I_B", why: "সক্রিয় অঞ্চলের আদর্শ সম্পর্ক।" },
      { eq: "V_CE এই অঞ্চলে ঢোকে না", why: "সমতল রেখা। I_B আলাদা হলে আলাদা উচ্চতা।" },
      { eq: "V_CE ছোট হলে স্যাচুরেশন", why: "0.3 V-এর আগে I_C শূন্য থেকে β I_B পর্যন্ত ওঠে।", tag: "ধ্রুব" },
    ],
    build(p) {
      const collector = (voltage: number, baseUa: number) => {
        const active = (p.beta * baseUa) / 1000;
        if (voltage <= 0) return 0;
        if (voltage < 0.3) return active * (voltage / 0.3);
        return active;
      };
      const bases = [20, 40, 60];
      return {
        curves: bases.map((baseUa, index) =>
          curve(["low", "main", "high"][index], `I_B = ${bnNum(baseUa, 0)} μA`, [blue, copper, green][index], samples(0, 12, (voltage) => collector(voltage, baseUa), 48)),
        ),
        guides: [{ x: 0.3, label: "স্যাচুরেশন" }],
        calc: `β = ${bnNum(p.beta, 0)}। I_B = 40 μA হলে সক্রিয় অঞ্চলে I_C = ${bnNum((p.beta * 40) / 1000, 1)} mA।`,
      };
    },
  },
  {
    id: "elx-gain",
    chapter: "electronics",
    title: "কারেন্ট গেইন–বেস প্রবাহ",
    source: "book",
    xName: "বেস প্রবাহ",
    yName: "কারেন্ট গেইন",
    xSymbol: "I_B (μA)",
    ySymbol: "β",
    formula: "β = I_C / I_B",
    condition: "আদর্শ সক্রিয় অঞ্চল। β কে I_B-এর ওপর নির্ভর করে না বলে ধরা হয়, তাই রেখা অনুভূমিক। বাস্তব ট্রানজিস্টরে খুব ছোট ও খুব বড় I_B-এ β কমে — সেই বাঁক এখানে নেই।",
    explain: "সিলেবাসের আদর্শ মডেলে β ধ্রুব। বেস প্রবাহ বদলালে গেইন বদলায় না, কালেক্টর প্রবাহ সমানুপাতিক বাড়ে।",
    meaning: "β = 100 মানে বেস প্রবাহের 100 গুণ কালেক্টর প্রবাহ।",
    slope: "আদর্শ ঢাল শূন্য। β ধ্রুব।",
    area: noArea,
    knobs: [knob("beta", "β", 50, 200, 10, "")],
    base: { beta: 100 },
    steps: [
      { eq: "β = I_C / I_B", why: "কারেন্ট গেইনের সংজ্ঞা।" },
      { eq: "আদর্শ মডেলে β ধ্রুব", why: "I_B বদলালে অনুপাত একই থাকে।" },
      { eq: "লেখ অনুভূমিক", why: "ঢাল শূন্য। উচ্চতাই β।", tag: "ধ্রুব" },
    ],
    build(p) {
      return {
        curves: [curve("main", "β", copper, samples(0, 100, () => p.beta, 12))],
        calc: `β = ${bnNum(p.beta, 0)}। I_B = 30 μA হলে I_C = ${bnNum((p.beta * 30) / 1000, 1)} mA।`,
      };
    },
  },
  {
    id: "elx-rectifier",
    chapter: "electronics",
    title: "রেকটিফায়ারের ইনপুট ও আউটপুট",
    source: "book",
    xName: "সময়",
    yName: "বিভব",
    xSymbol: "t (ms)",
    ySymbol: "V (V)",
    formula: "অর্ধতরঙ্গ: V_out = max(Vₘ sin ωt, 0)",
    condition: "50 Hz সাইনের ইনপুট। আদর্শ ডায়োড, ডায়োডের বিভব পতন শূন্য ধরা। দুই চক্র।",
    explain: "ইনপুট ধনাত্মক-ঋণাত্মক দুদিকে দোলে। অর্ধতরঙ্গ আউটপুটে শুধু ধনাত্মক অর্ধেক থাকে, ঋণাত্মক অর্ধেক শূন্য।",
    meaning: "এসি থেকে একমুখী স্পন্দন। মসৃণ করতে পরে ধারক লাগে, সেই ধারক এই লেখে নেই।",
    slope: "ইনপুটের ঢাল কোসাইনের মতো। আউটপুট ঋণাত্মক অর্ধে শূন্য।",
    area: noArea,
    origin: "y",
    knobs: [knob("peak", "শীর্ষ Vₘ", 5, 20, 1, "V")],
    base: { peak: 12 },
    steps: [
      { eq: "V_in = Vₘ sin(2π f t)", why: "সাপ্লাইয়ের সাইন।" },
      { eq: "ডায়োড একদিকে চালু", why: "ঋণাত্মক অর্ধে প্রবাহ বন্ধ।" },
      { eq: "V_out = max(V_in, 0)", why: "অর্ধতরঙ্গ। আদর্শ ডায়োডে পতন শূন্য।", tag: "ধ্রুব" },
    ],
    build(p) {
      const omega = 2 * Math.PI * 0.05;
      const input = (time: number) => p.peak * Math.sin(omega * time);
      return {
        curves: [
          curve("in", "ইনপুট", blue, samples(0, 40, input, 160), { dashed: true }),
          curve("main", "আউটপুট", copper, samples(0, 40, (time) => Math.max(input(time), 0), 160)),
        ],
        calc: `Vₘ = ${bnNum(p.peak, 0)} V। ঋণাত্মক অর্ধচক্রে আউটপুট 0।`,
      };
    },
  },
  {
    id: "elx-wave",
    chapter: "electronics",
    title: "অর্ধতরঙ্গ ও পূর্ণতরঙ্গ",
    source: "book",
    xName: "সময়",
    yName: "আউটপুট বিভব",
    xSymbol: "t (ms)",
    ySymbol: "V (V)",
    formula: "অর্ধ: max(sin, 0)    পূর্ণ: |sin|",
    condition: "একই শীর্ষ, 50 Hz। পূর্ণতরঙ্গে ঋণাত্মক অর্ধেক উল্টে ধনাত্মক করা হয়। ডায়োড পতন শূন্য।",
    explain: "অর্ধতরঙ্গে প্রতি চক্রে একবার স্পন্দন, মাঝে শূন্যের ফাঁক। পূর্ণতরঙ্গে প্রতি চক্রে দুই স্পন্দন, ফাঁক নেই।",
    meaning: "পূর্ণতরঙ্গের গড় বেশি: 2Vₘ/π, অর্ধতরঙ্গের গড় Vₘ/π।",
    slope: "পূর্ণতরঙ্গে শূন্য পার হওয়ার সময় ঢাল হঠাৎ উল্টে।",
    area: noArea,
    origin: "y",
    knobs: [knob("peak", "শীর্ষ Vₘ", 5, 20, 1, "V")],
    base: { peak: 12 },
    steps: [
      { eq: "অর্ধতরঙ্গ একটি ডায়োড", why: "এক অর্ধচক্র কাটে।" },
      { eq: "পূর্ণতরঙ্গ ব্রিজ বা সেন্টার ট্যাপ", why: "দুই অর্ধচক্রই আউটপুটে আসে।" },
      { eq: "গড় দ্বিগুণ", why: "একই Vₘ-এ পূর্ণতরঙ্গের গড় অর্ধতরঙ্গের দ্বিগুণ।", tag: "ধ্রুব" },
    ],
    build(p) {
      const wave = (time: number) => Math.sin(2 * Math.PI * 0.05 * time);
      return {
        curves: [
          curve("half", "অর্ধতরঙ্গ", blue, samples(0, 40, (time) => p.peak * Math.max(wave(time), 0), 160)),
          curve("main", "পূর্ণতরঙ্গ", copper, samples(0, 40, (time) => p.peak * Math.abs(wave(time)), 160)),
        ],
        calc: `গড় অর্ধতরঙ্গ ${bnNum(p.peak / Math.PI, 2)} V, পূর্ণতরঙ্গ ${bnNum((2 * p.peak) / Math.PI, 2)} V।`,
      };
    },
  },
  {
    id: "elx-logic",
    chapter: "electronics",
    title: "লজিক গেটের ইনপুট–আউটপুট",
    source: "book",
    xName: "সময়",
    yName: "স্তর",
    xSymbol: "t",
    ySymbol: "HIGH = 1",
    formula: "AND: Y = A·B    OR: Y = A+B    NOT: Y = Ā",
    condition: "সময়রেখা আলাদা করতে A কে 4-এ, B কে 2-এ, Y কে 0-এ সরানো। এই সংখ্যা ভোল্ট নয়। প্রতিটি ট্রেস নিজে 0 বা 1। নব 0 = AND, 1 = OR, 2 = NOT।",
    explain: "AND দুটো ইনপুটই HIGH হলে HIGH। OR যেকোনো একটি HIGH হলে HIGH। NOT ইনপুট উল্টে দেয়।",
    meaning: "সত্যক সারণির সময়রূপ। AND: 11→1। OR: 01, 10, 11→1। NOT: 1→0, 0→1।",
    slope: "প্রান্তে ঢাল খাড়া। মাঝে ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("gate", "গেট 0 AND, 1 OR, 2 NOT", 0, 2, 1, "")],
    base: { gate: 0 },
    steps: [
      { eq: "A ও B বর্গ তরঙ্গ", why: "ডিজিটাল ইনপুট শুধু HIGH বা LOW।" },
      { eq: "Y গেটের নিয়মে", why: "AND গুণ, OR যোগ, NOT উল্টো।" },
      { eq: "অফসেট শুধু দেখানোর", why: "4, 2, 0 ভোল্ট নয়। প্রতি ট্রেসের উচ্চতা 1।", tag: "ধ্রুব" },
    ],
    build(p) {
      const gate = Math.round(p.gate);
      const inputA = (time: number) => time % 2 < 1;
      const inputB = (time: number) => time % 4 < 2;
      const output = (time: number) => {
        if (gate === 2) return !inputA(time);
        if (gate === 1) return inputA(time) || inputB(time);
        return inputA(time) && inputB(time);
      };
      const name = ["AND", "OR", "NOT"][gate] ?? "AND";
      const curves = [
        curve("a", "A", blue, squareWave(inputA, 4)),
        ...(gate === 2 ? [] : [curve("b", "B", green, squareWave(inputB, 2))]),
        curve("main", name, copper, squareWave(output, 0)),
      ];
      const table = gate === 2 ? "NOT: A=1→0, A=0→1।" : gate === 1 ? "OR: 00→0, 01→1, 10→1, 11→1।" : "AND: 00→0, 01→0, 10→0, 11→1।";
      return { curves, calc: `${name}। ${table} A চার একক ওপরে, B দুই একক ওপরে।` };
    },
  },
  {
    id: "elx-digital",
    chapter: "electronics",
    title: "ডিজিটাল HIGH ও LOW",
    source: "book",
    xName: "সময়",
    yName: "বিভব",
    xSymbol: "t",
    ySymbol: "V (V)",
    formula: "HIGH = 5 V,   LOW = 0 V",
    condition: "TTL-এর পরিচিত স্তর। বাস্তব গেটে HIGH ঠিক 5 না-ও হতে পারে। এখানে আদর্শ বর্গ তরঙ্গ, মাঝের মান নেই।",
    explain: "সংকেত দুই স্তরের মধ্যে লাফায়। HIGH মানে যুক্তি 1, LOW মানে যুক্তি 0। ঢালু মাঝামাঝি অ্যানালগ অংশ এই লেখে নেই।",
    meaning: "সময়ের সাথে 1 ও 0। কম্পাঙ্ক নব দিয়ে স্পন্দন ঘন বা পাতলা হয়।",
    slope: "প্রান্তে ঢাল অসীমের দিকে। স্তরে ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("high", "HIGH বিভব", 3, 5, 0.5, "V"), knob("period", "পর্যায়কাল", 1, 4, 0.5, "")],
    base: { high: 5, period: 2 },
    steps: [
      { eq: "ডিজিটাল সংকেত দুই মান", why: "মাঝের বিভব যুক্তিতে ধরা হয় না।" },
      { eq: "LOW = 0, HIGH = V_H", why: "এখানে V_H = 5 V।" },
      { eq: "সময় বনাম বর্গ তরঙ্গ", why: "পর্যায়কালে একবার HIGH, একবার LOW।", tag: "ধ্রুব" },
    ],
    build(p) {
      const high = (time: number) => time % p.period < p.period / 2;
      const points: Point[] = [];
      const steps = 160;
      const end = p.period * 4;
      let level = high(0);
      points.push({ x: 0, y: level ? p.high : 0 });
      for (let index = 1; index <= steps; index += 1) {
        const time = (end * index) / steps;
        const next = high(time - 1e-6);
        if (next !== level) {
          points.push({ x: time, y: level ? p.high : 0 });
          points.push({ x: time, y: next ? p.high : 0 });
          level = next;
        }
      }
      points.push({ x: end, y: level ? p.high : 0 });
      return {
        curves: [curve("main", "ডিজিটাল", copper, points)],
        guides: [],
        calc: `HIGH = ${bnNum(p.high, 1)} V, LOW = 0। পর্যায়কাল ${bnNum(p.period, 1)} একক সময়ে এক স্পন্দন।`,
      };
    },
  },
];

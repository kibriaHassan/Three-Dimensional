import { bnNum } from "../format";
import { GAS_R, blue, copper, curve, gold, green, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const kelvin = "তাপমাত্রা কেলভিন। আদর্শ গ্যাস; 0 K পর্যন্ত বর্ধিতাংশ বাস্তব গ্যাসের তরল হওয়ার আগের সূত্র।";

function pressure(n: number, temperature: number, volume: number) {
  return (n * GAS_R * temperature) / volume;
}

export const thermoGraphs: GraphSpec[] = [
  {
    id: "th-pv",
    chapter: "thermo",
    title: "চাপ–আয়তন",
    source: "book",
    xName: "আয়তন",
    yName: "চাপ",
    xSymbol: "V (L)",
    ySymbol: "P (kPa)",
    formula: "PV = nRT",
    condition: `${kelvin} তিনটি তাপমাত্রায় একই n।`,
    explain: "প্রতিটি বক্ররেখা একটি সমতাপ। তাপমাত্রা বাড়লে একই আয়তনে চাপ বাড়ে, তাই বক্ররেখা ওপরে ওঠে।",
    meaning: "আদর্শ গ্যাসের অবস্থার সমীকরণের P–V রূপ। একটি বক্ররেখা বয়েলের সূত্র।",
    slope: "স্থানীয় ঢাল = −nRT/V² = −P/V। ধ্রুব নয়।",
    area: "একটি সমতাপের নিচের ক্ষেত্রফল সেই প্রসারণের কাজ।",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 2, 0.1, "mol"), knob("temp", "মাঝের তাপমাত্রা T", 250, 400, 10, "K")],
    base: { n: 1, temp: 300 },
    steps: [
      { eq: "PV = nRT", why: "আদর্শ গ্যাসের মূল সমীকরণ।" },
      { eq: "T স্থির  →  P ∝ 1/V", why: "এক সমতাপে চাপ আয়তনের ব্যাস্তানুপাতিক।", tag: "ব্যাস্তানুপাত" },
      { eq: "তিন বক্ররেখা", why: "T বদলালে ধ্রুব nRT বদলায়, তাই আলাদা অধিবৃত্ত।" },
    ],
    build(p) {
      const temps = [p.temp * 0.8, p.temp, p.temp * 1.25];
      return {
        curves: temps.map((temperature, index) =>
          curve(["low", "main", "high"][index], `T = ${bnNum(temperature, 0)} K`, [blue, copper, green][index], samples(6, 36, (volume) => pressure(p.n, temperature, volume))),
        ),
        calc: `T = ${bnNum(p.temp, 0)} K, V = 10 L-এ P = ${bnNum(pressure(p.n, p.temp, 10), 1)} kPa।`,
      };
    },
  },
  {
    id: "th-pt",
    chapter: "thermo",
    title: "চাপ–তাপমাত্রা",
    source: "book",
    xName: "পরম তাপমাত্রা",
    yName: "চাপ",
    xSymbol: "T (K)",
    ySymbol: "P (kPa)",
    formula: "P = nRT / V",
    condition: `${kelvin} n ও V স্থির, তাই সমআয়তন।`,
    explain: "আয়তন আটকে রাখলে চাপ পরম তাপমাত্রার সমানুপাতিক। রেখা মূলবিন্দুর দিকে যায়।",
    meaning: "গে-লুসাকের চাপ সূত্র। 0 K-তে আদর্শ গ্যাসের চাপ শূন্য।",
    slope: "ঢাল = nR/V, একক kPa/K।",
    area: noArea,
    origin: "both",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 2, 0.1, "mol"), knob("volume", "আয়তন V", 10, 40, 1, "L")],
    base: { n: 1, volume: 20 },
    steps: [
      { eq: "PV = nRT", why: "মূল সমীকরণ।" },
      { eq: "V স্থির  →  P = (nR/V) T", why: "nR/V ধ্রুব। চাপ তাপমাত্রার সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "ঢাল = nR/V। আয়তন কমলে ঢাল বাড়ে।" },
    ],
    build(p) {
      const slope = (p.n * GAS_R) / p.volume;
      return {
        curves: [curve("main", "সমআয়তন", copper, samples(0, 500, (temperature) => slope * temperature, 20))],
        calc: `ঢাল = ${bnNum(slope)} kPa/K। 300 K-এ P = ${bnNum(slope * 300, 1)} kPa।`,
      };
    },
  },
  {
    id: "th-vt",
    chapter: "thermo",
    title: "আয়তন–তাপমাত্রা",
    source: "book",
    xName: "পরম তাপমাত্রা",
    yName: "আয়তন",
    xSymbol: "T (K)",
    ySymbol: "V (L)",
    formula: "V = nRT / P",
    condition: `${kelvin} n ও P স্থির, তাই সমচাপ।`,
    explain: "চাপ স্থির থাকলে আয়তন পরম তাপমাত্রার সমানুপাতিক। চার্লসের সূত্র।",
    meaning: "সমচাপে গ্যাস গরম হলে প্রসারিত হয়। ঢাল nR/P।",
    slope: "ঢাল = nR/P, একক L/K।",
    area: noArea,
    origin: "both",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 2, 0.1, "mol"), knob("press", "চাপ P", 50, 200, 5, "kPa")],
    base: { n: 1, press: 100 },
    steps: [
      { eq: "PV = nRT", why: "মূল সমীকরণ।" },
      { eq: "P স্থির  →  V = (nR/P) T", why: "আয়তন পরম তাপমাত্রার সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "চাপ বাড়লে একই তাপমাত্রায় আয়তন কমে, ঢাল কমে।" },
    ],
    build(p) {
      const slope = (p.n * GAS_R) / p.press;
      return {
        curves: [curve("main", "সমচাপ", copper, samples(0, 500, (temperature) => slope * temperature, 20))],
        calc: `ঢাল = ${bnNum(slope)} L/K। 300 K-এ V = ${bnNum(slope * 300, 1)} L।`,
      };
    },
  },
  {
    id: "th-isothermal",
    chapter: "thermo",
    title: "সমতাপীয় প্রক্রিয়ার P–V",
    source: "book",
    xName: "আয়তন",
    yName: "চাপ",
    xSymbol: "V (L)",
    ySymbol: "P (kPa)",
    formula: "PV = nRT,   W = nRT ln(V₂/V₁)",
    condition: `${kelvin} তাপমাত্রা ধ্রুব। ধীর প্রসারণ, প্রতি মুহূর্তে সাম্যাবস্থা।`,
    explain: "সমতাপে অভ্যন্তরীণ শক্তি বদলায় না। গ্যাস যে কাজ করে তা পুরোটাই নেওয়া তাপ। ক্ষেত্রফল সেই কাজ।",
    meaning: "ΔU = 0, তাই ΔQ = ΔW। কাজ আয়তনের লগারিদমে বাড়ে।",
    slope: "ঢাল = −P/V, ধ্রুব নয়।",
    area: "kPa·L = J। W = nRT ln(V₂/V₁)।",
    fillArea: true,
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 2, 0.1, "mol"), knob("temp", "তাপমাত্রা T", 250, 450, 10, "K")],
    base: { n: 1, temp: 300 },
    steps: [
      { eq: "ΔU = nCv ΔT", why: "আদর্শ গ্যাসে অভ্যন্তরীণ শক্তি শুধু তাপমাত্রায়।", },
      { eq: "ΔT = 0  →  ΔU = 0", why: "সমতাপে শক্তির পরিবর্তন শূন্য।", tag: "ধ্রুব" },
      { eq: "W = ∫ P dV = nRT ln(V₂/V₁)", why: "P = nRT/V বসিয়ে সমাকলন। লেখের ক্ষেত্রফল এই কাজ।" },
    ],
    build(p) {
      const v1 = 8;
      const v2 = 32;
      const work = p.n * GAS_R * p.temp * Math.log(v2 / v1);
      return {
        curves: [curve("main", "সমতাপ", copper, samples(v1, v2, (volume) => pressure(p.n, p.temp, volume)))],
        calc: `${bnNum(v1, 0)} L থেকে ${bnNum(v2, 0)} L-এ কাজ ${bnNum(work, 0)} J। ΔU = 0।`,
      };
    },
  },
  {
    id: "th-isobaric",
    chapter: "thermo",
    title: "সমচাপীয় প্রক্রিয়ার P–V",
    source: "book",
    xName: "আয়তন",
    yName: "চাপ",
    xSymbol: "V (L)",
    ySymbol: "P (kPa)",
    formula: "P = ধ্রুব,   W = P(V₂ − V₁)",
    condition: "চাপ স্থির। আয়তন বাড়লে তাপমাত্রাও বাড়ে, V/T ধ্রুব।",
    explain: "P–V লেখে সমচাপ অনুভূমিক সরলরেখা। উচ্চতা চাপ, প্রস্থ আয়তনের পরিবর্তন, ক্ষেত্রফল কাজ।",
    meaning: "কাজ চাপ ও আয়তন-বৃদ্ধির গুণফল। তাপের একাংশ ΔU, বাকি কাজ।",
    slope: "ঢাল শূন্য, কারণ P বদলায় না।",
    area: "ক্ষেত্রফল = PΔV = কাজ, একক J।",
    fillArea: true,
    origin: "both",
    knobs: [knob("press", "চাপ P", 40, 180, 5, "kPa")],
    base: { press: 100 },
    steps: [
      { eq: "W = ∫ P dV", why: "কাজ চাপ–আয়তন লেখের ক্ষেত্রফল।" },
      { eq: "P ধ্রুব", why: "সমাকলন থেকে W = P(V₂ − V₁)। চাপ আয়তনের সমানুপাতিক নয়।", tag: "ধ্রুব" },
      { eq: "অনুভূমিক রেখা", why: "চাপ বাড়ালে রেখা ওপরে ওঠে, একই ΔV-তে কাজ বাড়ে।" },
    ],
    build(p) {
      const v1 = 8;
      const v2 = 28;
      return {
        curves: [curve("main", "সমচাপ", copper, samples(v1, v2, () => p.press, 12))],
        calc: `W = PΔV = ${bnNum(p.press * (v2 - v1), 0)} J।`,
      };
    },
  },
  {
    id: "th-isochoric",
    chapter: "thermo",
    title: "সমআয়তন প্রক্রিয়ার P–T",
    source: "book",
    xName: "পরম তাপমাত্রা",
    yName: "চাপ",
    xSymbol: "T (K)",
    ySymbol: "P (kPa)",
    formula: "P/T = nR/V = ধ্রুব",
    condition: `${kelvin} আয়তন ও মোল সংখ্যা স্থির। কাজ শূন্য।`,
    explain: "সমআয়তনে পিস্টন নড়ে না, তাই কাজ শূন্য। দেওয়া তাপ পুরোটা অভ্যন্তরীণ শক্তি বাড়ায়, চাপ তাপমাত্রার সাথে বাড়ে।",
    meaning: "ΔW = 0, ΔQ = ΔU = nCv ΔT। P–T রেখা মূলবিন্দুগামী।",
    slope: "ঢাল = nR/V।",
    area: noArea,
    origin: "both",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 2, 0.1, "mol"), knob("volume", "আয়তন V", 10, 40, 1, "L")],
    base: { n: 1, volume: 20 },
    steps: [
      { eq: "ΔW = ∫ P dV", why: "আয়তন না বদলালে dV = 0, তাই কাজ শূন্য।" },
      { eq: "P/T = nR/V", why: "V স্থির। চাপ পরম তাপমাত্রার সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ΔQ = nCv ΔT", why: "প্রথম সূত্রে ΔW = 0, তাই তাপ শুধু ΔU।" },
    ],
    build(p) {
      const slope = (p.n * GAS_R) / p.volume;
      const cv = GAS_R / 0.4;
      return {
        curves: [curve("main", "সমআয়তন", copper, samples(0, 500, (temperature) => slope * temperature, 16))],
        calc: `300 K থেকে 400 K-এ ΔU = ${bnNum(p.n * cv * 100, 0)} J (দ্বিপরমাণুক Cv = ${(5 / 2).toFixed(1)} R)। কাজ 0।`,
      };
    },
  },
  {
    id: "th-adiabatic",
    chapter: "thermo",
    title: "রুদ্ধতাপীয় প্রক্রিয়ার P–V",
    source: "book",
    xName: "আয়তন",
    yName: "চাপ",
    xSymbol: "V (L)",
    ySymbol: "P (kPa)",
    formula: "PVᵞ = ধ্রুব,   γ = Cp/Cv",
    condition: "তাপের আদানপ্রদান নেই। γ > 1, তাই সমতাপের চেয়ে খাড়া। ড্যাশ রেখা একই বিন্দু দিয়ে সমতাপ।",
    explain: "রুদ্ধতাপীয় প্রসারণে তাপমাত্রা কমে, তাই চাপ শুধু আয়তন বাড়ার জন্য নয়, ঠান্ডা হওয়ার জন্যও কমে।",
    meaning: "ΔQ = 0, তাই ΔU = −ΔW। কাজ অভ্যন্তরীণ শক্তি থেকে আসে।",
    slope: "রুদ্ধতাপের স্থানীয় ঢাল = −γ P/V। সমতাপের ঢাল −P/V।",
    area: "ক্ষেত্রফল কাজ, W = (nR(T₁ − T₂))/(γ − 1)।",
    knobs: [knob("gamma", "γ = Cp/Cv", 1.3, 1.67, 0.01, ""), knob("temp", "আদি তাপমাত্রা T", 250, 400, 10, "K")],
    base: { gamma: 1.4, temp: 300 },
    steps: [
      { eq: "ΔQ = 0", why: "রুদ্ধতাপের সংজ্ঞা। প্রথম সূত্রে ΔU = −W।" },
      { eq: "PVᵞ = ধ্রুব", why: "আদর্শ গ্যাস ও প্রত্যাবর্তী প্রক্রিয়ায়। γ = Cp/Cv > 1।" },
      { eq: "P ∝ 1/Vᵞ", why: "ঘাত 1-এর বেশি, তাই সমতাপের চেয়ে দ্রুত নামে।", tag: "ব্যাস্তানুপাত" },
    ],
    build(p) {
      const n = 1;
      const v1 = 8;
      const v2 = 28;
      const p1 = pressure(n, p.temp, v1);
      const constant = p1 * v1 ** p.gamma;
      const t2 = p.temp * (v1 / v2) ** (p.gamma - 1);
      const work = (n * GAS_R * (p.temp - t2)) / (p.gamma - 1);
      return {
        curves: [
          curve("main", "রুদ্ধতাপ", copper, samples(v1, v2, (volume) => constant / volume ** p.gamma)),
          curve("iso", "সমতাপ", blue, samples(v1, v2, (volume) => pressure(n, p.temp, volume)), { dashed: true }),
        ],
        calc: `প্রসারণে শেষ তাপমাত্রা ${bnNum(t2, 0)} K। কাজ ${bnNum(work, 0)} J।`,
      };
    },
  },
  {
    id: "th-carnot",
    chapter: "thermo",
    title: "কার্নো চক্রের P–V",
    source: "book",
    xName: "আয়তন",
    yName: "চাপ",
    xSymbol: "V (L)",
    ySymbol: "P (kPa)",
    formula: "η = 1 − T₂/T₁",
    condition: "দুই সমতাপ ও দুই রুদ্ধতাপ। T₁ > T₂, দুইই কেলভিন। আদর্শ গ্যাস, প্রত্যাবর্তী।",
    explain: "ওপরের বক্ররেখা গরম সমতাপ, নিচেরটা ঠান্ডা সমতাপ। দুই পাশ রুদ্ধতাপ। ঘড়ির কাঁটার দিকে ঘুরলে গ্যাস নেট কাজ করে।",
    meaning: "কার্নো দক্ষতা শুধু দুই তাপমাত্রায়। একই তাপমাত্রায় এর চেয়ে বেশি দক্ষতা সম্ভব নয়।",
    slope: "সমতাপে ঢাল −P/V, রুদ্ধতাপে −γP/V।",
    area: "লুপের ক্ষেত্রফল = নেট কাজ = nR(T₁ − T₂) ln(V₂/V₁)।",
    knobs: [knob("t1", "উষ্ণ তাপমাত্রা T₁", 450, 900, 10, "K"), knob("t2", "শীতল তাপমাত্রা T₂", 250, 420, 10, "K"), knob("ratio", "প্রসারণ V₂/V₁", 1.4, 2.6, 0.1, "")],
    base: { t1: 600, t2: 300, ratio: 2 },
    steps: [
      { eq: "η = W/Q₁", why: "দক্ষতা নেট কাজ ভাগ নেওয়া তাপ।" },
      { eq: "Q₁ = nRT₁ ln(V₂/V₁)", why: "গরম সমতাপে ΔU = 0, তাই তাপ = কাজ।" },
      { eq: "Q₂ = nRT₂ ln(V₂/V₁)", why: "রুদ্ধতাপে তাপ নেই। তাই |Q₂/Q₁| = T₂/T₁।" },
      { eq: "η = 1 − T₂/T₁", why: "দক্ষতা আয়তনের ওপর নয়, শুধু দুই কেলভিন তাপমাত্রার।", tag: "ধ্রুব" },
    ],
    build(p) {
      const n = 1;
      const hot = Math.max(p.t1, p.t2 + 30);
      const cold = Math.min(p.t2, hot - 30);
      const gamma = 1.4;
      const v1 = 5;
      const v2 = v1 * p.ratio;
      const v3 = v2 * (hot / cold) ** (1 / (gamma - 1));
      const v4 = v3 * (v1 / v2);
      const pAt = (temperature: number, volume: number) => pressure(n, temperature, volume);
      const adiabat = (fromV: number, fromT: number, toV: number): Point[] => {
        const fromP = pAt(fromT, fromV);
        const constant = fromP * fromV ** gamma;
        return samples(fromV, toV, (volume) => constant / volume ** gamma, 48);
      };
      const work = n * GAS_R * (hot - cold) * Math.log(v2 / v1);
      const efficiency = 1 - cold / hot;
      return {
        curves: [
          curve("hot", "গরম সমতাপ", copper, samples(v1, v2, (volume) => pAt(hot, volume), 48)),
          curve("ad1", "রুদ্ধতাপ প্রসারণ", gold, adiabat(v2, hot, v3)),
          curve("cold", "শীতল সমতাপ", blue, samples(v3, v4, (volume) => pAt(cold, volume), 48)),
          curve("ad2", "রুদ্ধতাপ সংকোচন", green, adiabat(v4, cold, v1)),
        ],
        calc: `T₁ = ${bnNum(hot, 0)} K, T₂ = ${bnNum(cold, 0)} K। η = ${bnNum(efficiency * 100, 1)}%। নেট কাজ ${bnNum(work, 0)} J।`,
      };
    },
  },
  {
    id: "th-energy",
    chapter: "thermo",
    title: "অভ্যন্তরীণ শক্তি–তাপমাত্রা",
    source: "book",
    xName: "পরম তাপমাত্রা",
    yName: "অভ্যন্তরীণ শক্তি",
    xSymbol: "T (K)",
    ySymbol: "U (kJ)",
    formula: "U = n Cv T,   Cv = R/(γ − 1)",
    condition: `${kelvin} আদর্শ গ্যাস। U = 0 ধরা হয়েছে 0 K-তে। আয়তনের ওপর U নির্ভর করে না।`,
    explain: "γ কমলে Cv বাড়ে, একই তাপমাত্রায় অভ্যন্তরীণ শক্তি বেশি। দ্বিপরমাণুকে γ = 1.40, একপরমাণুকে 1.67।",
    meaning: "আদর্শ গ্যাসের অভ্যন্তরীণ শক্তি শুধু তাপমাত্রার সমানুপাতিক।",
    slope: "ঢাল = nCv।",
    area: noArea,
    origin: "both",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 3, 0.1, "mol"), knob("gamma", "γ", 1.3, 1.67, 0.01, "")],
    base: { n: 1, gamma: 1.4 },
    steps: [
      { eq: "ΔU = n Cv ΔT", why: "আদর্শ গ্যাসে অভ্যন্তরীণ শক্তি তাপমাত্রার সাথে বদলায়।" },
      { eq: "Cv = R / (γ − 1)", why: "Cp − Cv = R এবং γ = Cp/Cv থেকে।" },
      { eq: "U ∝ T", why: "n ও γ স্থির রাখলে শক্তি পরম তাপমাত্রার সমানুপাতিক।", tag: "সমানুপাত" },
    ],
    build(p) {
      const cv = GAS_R / (p.gamma - 1);
      return {
        curves: [curve("main", "U–T", copper, samples(0, 500, (temperature) => (p.n * cv * temperature) / 1000, 20))],
        calc: `Cv = ${bnNum(cv, 2)} J/mol·K। 300 K-এ U = ${bnNum((p.n * cv * 300) / 1000, 2)} kJ।`,
      };
    },
  },
  {
    id: "th-efficiency",
    chapter: "thermo",
    title: "তাপ ইঞ্জিনের দক্ষতা–তাপমাত্রা",
    source: "book",
    xName: "উষ্ণ তাপমাত্রা",
    yName: "কার্নো দক্ষতা",
    xSymbol: "T₁ (K)",
    ySymbol: "η",
    formula: "η = 1 − T₂/T₁",
    condition: "কার্নো ইঞ্জিন। T₁ > T₂, দুইই কেলভিন। η ভগ্নাংশ, 1 মানে 100%।",
    explain: "শীতল তাপমাত্রা স্থির রেখে উষ্ণ তাপমাত্রা বাড়ালে দক্ষতা বাড়ে, কিন্তু 1-এ পৌঁছায় না। T₁ = T₂ হলে দক্ষতা শূন্য।",
    meaning: "100% দক্ষতা চাইলে T₂ = 0 K, যা পাওয়া যায় না। দ্বিতীয় সূত্রের সীমা।",
    slope: "ঢাল = T₂/T₁²। তাপমাত্রা বাড়লে ঢাল কমে।",
    area: noArea,
    origin: "y",
    knobs: [knob("t2", "শীতল তাপমাত্রা T₂", 250, 400, 10, "K")],
    base: { t2: 300 },
    steps: [
      { eq: "η = 1 − |Q₂|/Q₁", why: "নেট কাজ Q₁ − |Q₂|, দক্ষতা সেই কাজ ভাগ Q₁।" },
      { eq: "|Q₂|/Q₁ = T₂/T₁", why: "কার্নো চক্রে তাপ পরম তাপমাত্রার সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "η = 1 − T₂/T₁", why: "T₂ স্থির রাখলে T₁ বাড়লে η বাড়ে। T₁-এর সাথে সরলরেখা নয়।" },
    ],
    build(p) {
      const start = p.t2 + 40;
      const end = 1400;
      return {
        curves: [curve("main", "কার্নো", copper, samples(start, end, (temperature) => 1 - p.t2 / temperature, 80))],
        calc: `T₂ = ${bnNum(p.t2, 0)} K। T₁ = 600 K-এ η = ${bnNum((1 - p.t2 / 600) * 100, 1)}%।`,
      };
    },
  },
];

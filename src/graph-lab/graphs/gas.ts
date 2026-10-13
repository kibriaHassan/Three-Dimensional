import { bnNum } from "../format";
import { GAS_R, blue, copper, curve, green, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const ideal = "আদর্শ গ্যাস। তাপমাত্রা কেলভিন। বাস্তব গ্যাস 0 K-এর আগেই তরল হয়; মূলবিন্দু পর্যন্ত রেখা আদর্শ সূত্রের বর্ধিতাংশ।";

function pressure(n: number, temperature: number, volumeL: number) {
  return (n * GAS_R * temperature) / volumeL;
}

export const gasGraphs: GraphSpec[] = [
  {
    id: "gas-pv",
    chapter: "gas",
    title: "চাপ–আয়তন",
    source: "book",
    xName: "আয়তন",
    yName: "চাপ",
    xSymbol: "V (L)",
    ySymbol: "P (kPa)",
    formula: "PV = nRT",
    condition: `${ideal} এই লেখে T ও n স্থির, তাই সমতাপীয়।`,
    explain: "তাপমাত্রা স্থির থাকলে চাপ আয়তনের ব্যস্তানুপাতিক। লেখ অধিবৃত্ত। আয়তন কমলে চাপ বাড়ে, গুণফল nRT ধ্রুব।",
    meaning: "বয়েলের সূত্রের লেখ। বক্ররেখার নিচের ক্ষেত্রফল সমতাপীয়ে গ্যাসের কৃত কাজ।",
    slope: "স্থানীয় ঢাল = −P/V। ঢাল ধ্রুব নয়।",
    area: "kPa·L = J। ক্ষেত্রফল = সমতাপীয়ে কাজ W = nRT ln(V₂/V₁)।",
    fillArea: true,
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 3, 0.1, "mol"), knob("temp", "তাপমাত্রা T", 250, 400, 5, "K")],
    base: { n: 1, temp: 300 },
    build(p) {
      const v1 = 8;
      const v2 = 40;
      const work = p.n * GAS_R * p.temp * Math.log(v2 / v1);
      return {
        curves: [curve("main", "সমতাপীয় P–V", copper, samples(v1, v2, (volume) => pressure(p.n, p.temp, volume)))],
        calc: `nRT = ${bnNum(p.n * GAS_R * p.temp, 0)} J। V = 8 L-এ P = ${bnNum(pressure(p.n, p.temp, 8), 1)} kPa। 8 L থেকে 40 L প্রসারণে কাজ ${bnNum(work, 0)} J।`,
      };
    },
  },
  {
    id: "gas-pt",
    chapter: "gas",
    title: "চাপ–পরম তাপমাত্রা",
    source: "book",
    xName: "পরম তাপমাত্রা",
    yName: "চাপ",
    xSymbol: "T (K)",
    ySymbol: "P (kPa)",
    formula: "P = nRT / V",
    condition: `${ideal} V ও n স্থির। অক্ষ কেলভিন, তাই রেখা মূলবিন্দু দিয়ে যায়।`,
    explain: "আয়তন স্থির থাকলে চাপ পরম তাপমাত্রার সমানুপাতিক। 0 K-এ আদর্শ গ্যাসের চাপ শূন্য। সেলসিয়াস অক্ষ হলে এই রেখা মূলবিন্দু দিয়ে যেত না।",
    meaning: "গে-লুসাকের চাপ সূত্র। ঢাল nR/V।",
    slope: "ঢাল = nR/V।",
    area: noArea,
    origin: "both",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 3, 0.1, "mol"), knob("volume", "আয়তন V", 10, 40, 1, "L")],
    base: { n: 1, volume: 20 },
    build(p) {
      const slope = (p.n * GAS_R) / p.volume;
      return {
        curves: [curve("main", "P–T", copper, samples(0, 500, (temperature) => slope * temperature, 40))],
        calc: `ঢাল = nR/V = ${bnNum(slope)} kPa/K। T = 300 K-এ P = ${bnNum(slope * 300, 1)} kPa।`,
      };
    },
  },
  {
    id: "gas-vt",
    chapter: "gas",
    title: "আয়তন–পরম তাপমাত্রা",
    source: "book",
    xName: "পরম তাপমাত্রা",
    yName: "আয়তন",
    xSymbol: "T (K)",
    ySymbol: "V (L)",
    formula: "V = nRT / P",
    condition: `${ideal} P ও n স্থির, তাই সমচাপীয়।`,
    explain: "চাপ স্থির থাকলে আয়তন পরম তাপমাত্রার সমানুপাতিক। রেখা মূলবিন্দু দিয়ে যায়। চার্লসের সূত্র।",
    meaning: "তাপমাত্রা বাড়লে সমচাপে গ্যাস প্রসারিত হয়। ঢাল nR/P।",
    slope: "ঢাল = nR/P।",
    area: noArea,
    origin: "both",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 3, 0.1, "mol"), knob("pressure", "চাপ P", 50, 200, 5, "kPa")],
    base: { n: 1, pressure: 100 },
    build(p) {
      const slope = (p.n * GAS_R) / p.pressure;
      return {
        curves: [curve("main", "V–T", green, samples(0, 400, (temperature) => slope * temperature, 40))],
        calc: `ঢাল = nR/P = ${bnNum(slope)} L/K। T = 300 K-এ V = ${bnNum(slope * 300, 1)} L।`,
      };
    },
  },
  {
    id: "gas-p-inv-v",
    chapter: "gas",
    title: "চাপ–ব্যস্তানুপাতিক আয়তন",
    source: "book",
    xName: "আয়তনের বিপরীত",
    yName: "চাপ",
    xSymbol: "1/V (L⁻¹)",
    ySymbol: "P (kPa)",
    formula: "P = (nRT) × (1/V)",
    condition: `${ideal} T স্থির। বয়েলের সূত্র যাচাইয়ের সরলরেখা।`,
    explain: "P বনাম 1/V মূলবিন্দু দিয়ে সরলরেখা। অধিবৃত্তকে সরলরেখায় আনলে ঢাল থেকে nRT পড়া যায়।",
    meaning: "পরীক্ষায় এই লেখ সরল হলে বয়েলের সূত্র মানা হচ্ছে। ঢাল nRT।",
    slope: "ঢাল = nRT, একক J, কারণ kPa·L = J।",
    area: noArea,
    origin: "both",
    knobs: [knob("n", "মোল সংখ্যা n", 0.5, 3, 0.1, "mol"), knob("temp", "তাপমাত্রা T", 250, 400, 5, "K")],
    base: { n: 1, temp: 300 },
    build(p) {
      const slope = p.n * GAS_R * p.temp;
      return {
        curves: [curve("main", "P–1/V", copper, samples(0, 0.2, (inverse) => slope * inverse, 20))],
        calc: `ঢাল = nRT = ${bnNum(slope, 0)} J। 1/V = 0.05 L⁻¹ মানে V = 20 L, P = ${bnNum(slope * 0.05, 1)} kPa।`,
      };
    },
  },
  {
    id: "gas-vrms2",
    chapter: "gas",
    title: "RMS বেগের বর্গ–পরম তাপমাত্রা",
    source: "book",
    xName: "পরম তাপমাত্রা",
    yName: "RMS বেগের বর্গ",
    xSymbol: "T (K)",
    ySymbol: "vᵣₘₛ² (m²/s²)",
    formula: "vᵣₘₛ² = 3RT / M",
    condition: `${ideal} M মোলার ভর, kg/mol। একই গ্যাসে M স্থির।`,
    explain: "RMS বেগের বর্গ পরম তাপমাত্রার সমানুপাতিক। লেখ মূলবিন্দু দিয়ে সরলরেখা। ঢাল 3R/M।",
    meaning: "তাপমাত্রা অণুর গড় গতিশক্তির মাপ। ভারী গ্যাসের ঢাল ছোট, একই তাপমাত্রায় RMS বেগ কম।",
    slope: "ঢাল = 3R/M।",
    area: noArea,
    origin: "both",
    knobs: [knob("molar", "মোলার ভর M", 0.002, 0.04, 0.001, "kg/mol")],
    base: { molar: 0.028 },
    build(p) {
      const slope = (3 * GAS_R) / p.molar;
      return {
        curves: [curve("main", "vᵣₘₛ²–T", copper, samples(0, 400, (temperature) => slope * temperature, 20))],
        calc: `ঢাল = 3R/M = ${bnNum(slope, 0)} m²/s² per K। T = 300 K-এ vᵣₘₛ² = ${bnNum(slope * 300, 0)} m²/s²।`,
      };
    },
  },
  {
    id: "gas-vrms",
    chapter: "gas",
    title: "RMS বেগ–পরম তাপমাত্রা",
    source: "extra",
    xName: "পরম তাপমাত্রা",
    yName: "RMS বেগ",
    xSymbol: "T (K)",
    ySymbol: "vᵣₘₛ (m/s)",
    formula: "vᵣₘₛ = √(3RT / M)",
    condition: `${ideal} এটি সূত্রভিত্তিক অতিরিক্ত লেখ। সরলরেখাটি vᵣₘₛ²–T।`,
    explain: "RMS বেগ তাপমাত্রার বর্গমূলের সঙ্গে বাড়ে। 0 K-এ শূন্য। রেখা সরল নয়; তাপমাত্রা চার গুণ হলে বেগ দ্বিগুণ।",
    meaning: "একই তাপমাত্রায় হালকা অণু দ্রুত। হাইড্রোজেনের M ছোট বলে বেগ বড়।",
    slope: "ঢাল ধ্রুব নয়। T বাড়লে ঢাল কমে।",
    area: noArea,
    origin: "both",
    knobs: [knob("molar", "মোলার ভর M", 0.002, 0.04, 0.001, "kg/mol")],
    base: { molar: 0.028 },
    build(p) {
      const at300 = Math.sqrt((3 * GAS_R * 300) / p.molar);
      const at1200 = Math.sqrt((3 * GAS_R * 1200) / p.molar);
      return {
        curves: [curve("main", "vᵣₘₛ–T", blue, samples(0, 600, (temperature) => Math.sqrt((3 * GAS_R * temperature) / p.molar)))],
        calc: `T = 300 K-এ vᵣₘₛ = ${bnNum(at300, 0)} m/s। T = 1200 K-এ ${bnNum(at1200, 0)} m/s, প্রায় দ্বিগুণ।`,
      };
    },
  },
  {
    id: "gas-processes",
    chapter: "gas",
    title: "সমতাপীয় ও সমচাপীয় প্রক্রিয়া",
    source: "book",
    xName: "আয়তন",
    yName: "চাপ",
    xSymbol: "V (L)",
    ySymbol: "P (kPa)",
    formula: "সমতাপীয়: PV = nRT,    সমচাপীয়: P = ধ্রুব",
    condition: `${ideal} সমতাপীয়ে তাপমাত্রা স্থির। সমচাপীয়ে চাপ স্থির, আয়তন বদলাতে তাপমাত্রা বদলায়।`,
    explain: "সমতাপীয় লেখ অধিবৃত্ত। সমচাপীয় লেখ অনুভূমিক সরলরেখা। একই আয়তন-সীমায় দুই প্রক্রিয়ার কাজ আলাদা, কারণ ক্ষেত্রফল আলাদা।",
    meaning: "P–V লেখের নিচের ক্ষেত্রফল গ্যাসের কৃত কাজ। সমচাপে কাজ PΔV। সমতাপে কাজ nRT ln(V₂/V₁)।",
    slope: "সমচাপীয় ঢাল শূন্য। সমতাপীয় ঢাল −P/V।",
    area: "8 L থেকে 40 L পর্যন্ত ক্ষেত্রফলই ওই প্রসারণে কাজ, একক J।",
    knobs: [
      knob("n", "মোল সংখ্যা n", 0.5, 3, 0.1, "mol"),
      knob("temp", "সমতাপীয় T", 250, 400, 5, "K"),
      knob("pressure", "সমচাপীয় P", 50, 250, 5, "kPa"),
    ],
    base: { n: 1, temp: 300, pressure: 125 },
    build(p) {
      const v1 = 8;
      const v2 = 40;
      const isothermal = p.n * GAS_R * p.temp * Math.log(v2 / v1);
      const isobaric = p.pressure * (v2 - v1);
      return {
        curves: [
          curve("main", "সমতাপীয়", copper, samples(v1, v2, (volume) => pressure(p.n, p.temp, volume))),
          curve("isobaric", "সমচাপীয়", green, samples(v1, v2, () => p.pressure, 20)),
        ],
        calc: `8 L থেকে 40 L। সমতাপীয় কাজ ${bnNum(isothermal, 0)} J। সমচাপীয় কাজ PΔV = ${bnNum(isobaric, 0)} J।`,
      };
    },
  },
];

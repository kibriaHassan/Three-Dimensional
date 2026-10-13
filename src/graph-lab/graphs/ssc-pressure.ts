import { bnNum } from "../format";
import { G_ACC, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const sscPressureGraphs: GraphSpec[] = [
  {
    id: "sp-pf",
    chapter: "ssc-pressure",
    title: "চাপ–বল",
    source: "book",
    xName: "বল",
    yName: "চাপ",
    xSymbol: "F (N)",
    ySymbol: "P (Pa)",
    formula: "P = F/A",
    condition: "ক্ষেত্রফল স্থির। বল তলের ওপর লম্ব।",
    explain: "একই ক্ষেত্রফলে চাপ বলের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল 1/A।",
    meaning: "জোরে চাপলে চাপ বাড়ে।",
    slope: "ঢাল = 1/A।",
    area: noArea,
    origin: "both",
    knobs: [knob("area", "ক্ষেত্রফল A", 0.01, 0.1, 0.01, "m²")],
    base: { area: 0.02 },
    steps: [
      { eq: "P = F/A", why: "চাপের সংজ্ঞা।" },
      { eq: "A স্থির  →  P ∝ F", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = 1/A", why: "ক্ষেত্রফল কমলে ঢাল বাড়ে।" },
    ],
    build(p) {
      const slope = 1 / p.area;
      return {
        curves: [curve("main", "P–F", copper, samples(0, 40, (force) => slope * force, 17))],
        calc: `A = ${bnNum(p.area, 2)} m²। ২০ N-এ P = ${bnNum(slope * 20, 0)} Pa।`,
      };
    },
  },
  {
    id: "sp-pa",
    chapter: "ssc-pressure",
    title: "চাপ–ক্ষেত্রফল",
    source: "book",
    xName: "ক্ষেত্রফল",
    yName: "চাপ",
    xSymbol: "A (m²)",
    ySymbol: "P (Pa)",
    formula: "P = F/A",
    condition: "বল স্থির।",
    explain: "ক্ষেত্রফল বাড়লে চাপ কমে। চাপ ক্ষেত্রফলের ব্যাস্তানুপাতিক।",
    meaning: "একই বল সূঁচের ডগায় বেশি চাপ দেয়, চ্যাপটা তলে কম।",
    slope: "ঢাল = −F/A²।",
    area: noArea,
    knobs: [knob("force", "বল F", 10, 80, 5, "N")],
    base: { force: 40 },
    steps: [
      { eq: "P = F/A", why: "চাপের সংজ্ঞা।" },
      { eq: "F স্থির  →  P ∝ 1/A", why: "ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ বক্র", why: "A দ্বিগুণ হলে P অর্ধেক।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "P–A", copper, samples(0.01, 0.1, (area) => p.force / area))],
        calc: `A = 0.02 m²-এ P = ${bnNum(p.force / 0.02, 0)} Pa। A = 0.04 m²-এ ${bnNum(p.force / 0.04, 0)} Pa।`,
      };
    },
  },
  {
    id: "sp-hp",
    chapter: "ssc-pressure",
    title: "গভীরতা–চাপ",
    source: "book",
    xName: "গেজ চাপ",
    yName: "গভীরতা",
    xSymbol: "P (kPa)",
    ySymbol: "h (m)",
    formula: "h = P / (ρg)",
    condition: "খোলা তলের বাড়তি চাপ, মানে গেজ চাপ। ρ ও g স্থির। P = hρg-এর উল্টো লেখ: অনুভূমিক চাপ, খাড়া গভীরতা।",
    explain: "গভীরতা চাপের সমানুপাতিক। জলের চেয়ে ঘন তরলে একই চাপে গভীরতা কম।",
    meaning: "বাঁধের নিচে চাপ বেশি, কারণ গভীরতা বেশি।",
    slope: "ঢাল = 1/(ρg)। এই অক্ষে P কিলোপাস্কালে।",
    area: noArea,
    origin: "both",
    knobs: [knob("density", "ঘনত্ব ρ", 800, 13600, 100, "kg/m³")],
    base: { density: 1000 },
    steps: [
      { eq: "P = hρg", why: "তরলের গভীরতার চাপ। গেজ চাপ।" },
      { eq: "h = P / (ρg)", why: "গভীরতা চাপের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = 1/(ρg)", why: "ঘনত্ব বাড়লে একই চাপে গভীরতা কমে।" },
    ],
    build(p) {
      const depth = (pressure: number) => (pressure * 1000) / (p.density * G_ACC);
      return {
        curves: [curve("main", "h–P", copper, samples(0, 100, depth, 17))],
        calc: `৫০ kPa-এ h = ${bnNum(depth(50), 2)} m।`,
      };
    },
  },
  {
    id: "sp-density",
    chapter: "ssc-pressure",
    title: "ঘনত্ব–গভীরতা",
    source: "book",
    xName: "গভীরতা",
    yName: "ঘনত্ব",
    xSymbol: "h (m)",
    ySymbol: "ρ (kg/m³)",
    formula: "ρ = ধ্রুব",
    condition: "সমঘনত্বের তরল। সংকোচন ধরা হয়নি।",
    explain: "গভীরে চাপ বাড়ে, ঘনত্ব নয়। লেখ অনুভূমিক। জলের ঘনত্ব প্রায় 1000 kg/m³।",
    meaning: "একই তরল ওপরে ও নিচে সমান ঘন। চাপের লেখ আলাদা, সেটি বাড়ে।",
    slope: "ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("density", "ঘনত্ব ρ", 800, 13600, 100, "kg/m³")],
    base: { density: 1000 },
    steps: [
      { eq: "সমঘনত্ব মানে ρ একই", why: "তরলকে অসংকোচনীয় ধরা।" },
      { eq: "h বদলালে ρ বদলায় না", why: "গভীরতা ঘনত্বের সূত্রে ঢোকে না।" },
      { eq: "লেখ অনুভূমিক", why: "ঢাল শূন্য। উচ্চতাই ঘনত্ব।", tag: "ধ্রুব" },
    ],
    build(p) {
      return {
        curves: [curve("main", "ρ", copper, samples(0, 10, () => p.density, 12))],
        calc: `ρ = ${bnNum(p.density, 0)} kg/m³, ০ m থেকে ১০ m পর্যন্ত একই।`,
      };
    },
  },
  {
    id: "sp-atmo",
    chapter: "ssc-pressure",
    title: "বায়ুমণ্ডলীয় চাপ–উচ্চতা",
    source: "schematic",
    xName: "উচ্চতা",
    yName: "চাপ",
    xSymbol: "h (km)",
    ySymbol: "P (kPa)",
    formula: "P ≈ P₀ e^(−h/H)",
    condition: "পাঠ্যবইয়ের নকশা। সমুদ্রপৃষ্ঠে প্রায় 101 kPa। স্কেল উচ্চতা H ≈ 8.4 km, আনুমানিক। তাপমাত্রা ও আবহাওয়া এই মসৃণ লেখে নেই।",
    explain: "ওপরে উঠলে বাতাস পাতলা, চাপ কমে। শুরুতে দ্রুত, পরে ধীরে। সরলরেখা নয়।",
    meaning: "পাহাড়ে বায়ুমণ্ডলীয় চাপ কম। জলের ফুটন্ত তাপমাত্রাও কমে, সেটি এই লেখের অক্ষে নেই।",
    slope: "ঢাল ঋণাত্মক। উচ্চতা বাড়লে ঢালের মান কমে।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "ওপরে বায়ুর স্তম্ভ খাটো", why: "চাপ কমে।" },
      { eq: "ঘনত্বও কমে", why: "তাই পতন সরলরেখায় নয়।" },
      { eq: "P ≈ P₀ e^(−h/H)", why: "ধারণার নকশা। H একটি গড় স্কেল।", tag: "ধ্রুব" },
    ],
    build() {
      const pressure = (height: number) => 101 * Math.exp(-height / 8.4);
      return {
        curves: [curve("main", "বায়ুমণ্ডল", copper, samples(0, 20, pressure, 60))],
        calc: `০ km-এ ${bnNum(pressure(0), 0)} kPa। ৮.৪ km-এ প্রায় ${bnNum(pressure(8.4), 0)} kPa।`,
      };
    },
  },
];

import { bnNum } from "../format";
import { ELECTRON, MU0, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const sscMagnetGraphs: GraphSpec[] = [
  {
    id: "sg-bi",
    chapter: "ssc-magnet",
    title: "চৌম্বক ক্ষেত্র–তড়িৎ প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "চৌম্বক ক্ষেত্র",
    xSymbol: "I (A)",
    ySymbol: "B (μT)",
    formula: "B = μ₀ I / (2πr)",
    condition: "লম্বা সোজা তার। দূরত্ব স্থির। μ₀ = 4π×10⁻⁷।",
    explain: "একই দূরত্বে ক্ষেত্র প্রবাহের সমানুপাতিক। রেখা মূলবিন্দুগামী।",
    meaning: "প্রবাহ বন্ধ হলে এই ক্ষেত্র থাকে না।",
    slope: "ঢাল = μ₀/(2πr)। অক্ষ মাইক্রোটেসলায়।",
    area: noArea,
    origin: "both",
    knobs: [knob("distance", "দূরত্ব r", 0.02, 0.2, 0.01, "m")],
    base: { distance: 0.05 },
    steps: [
      { eq: "B = μ₀ I / (2πr)", why: "লম্বা সোজা তার।" },
      { eq: "r স্থির  →  B ∝ I", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = μ₀/(2πr)", why: "কাছে এলে ঢাল বাড়ে।" },
    ],
    build(p) {
      const slope = (MU0 / (2 * Math.PI * p.distance)) * 1e6;
      return {
        curves: [curve("main", "B–I", copper, samples(0, 10, (current) => slope * current, 17))],
        calc: `r = ${bnNum(p.distance, 2)} m। 5 A-এ B = ${bnNum(slope * 5, 1)} μT।`,
      };
    },
  },
  {
    id: "sg-fi",
    chapter: "ssc-magnet",
    title: "চৌম্বক বল–তড়িৎ প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "বল",
    xSymbol: "I (A)",
    ySymbol: "F (N)",
    formula: "F = BILsinθ",
    condition: "B, L ও θ স্থির। θ = 90° হলে F = BIL।",
    explain: "বল প্রবাহের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল BL sinθ।",
    meaning: "তার ক্ষেত্রের সমান্তরাল হলে θ = 0, বল শূন্য।",
    slope: "ঢাল = BL sinθ।",
    area: noArea,
    origin: "both",
    knobs: [knob("field", "ক্ষেত্র B", 0.05, 0.5, 0.05, "T"), knob("length", "দৈর্ঘ্য L", 0.1, 1, 0.1, "m"), knob("angle", "কোণ θ", 0, 90, 5, "°")],
    base: { field: 0.2, length: 0.5, angle: 90 },
    steps: [
      { eq: "F = BIL sinθ", why: "চৌম্বক ক্ষেত্রে তড়িৎবাহী তার।" },
      { eq: "B, L, θ স্থির  →  F ∝ I", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "θ = 90° হলে F = BIL", why: "সাইন 1। ঢাল BL।" },
    ],
    build(p) {
      const slope = p.field * p.length * Math.sin((p.angle * Math.PI) / 180);
      return {
        curves: [curve("main", "F–I", copper, samples(0, 8, (current) => slope * current, 17))],
        calc: `ঢাল = ${bnNum(slope, 3)} N/A। 4 A-এ F = ${bnNum(slope * 4, 2)} N।`,
      };
    },
  },
  {
    id: "sg-fl",
    chapter: "ssc-magnet",
    title: "চৌম্বক বল–দৈর্ঘ্য",
    source: "book",
    xName: "দৈর্ঘ্য",
    yName: "বল",
    xSymbol: "L (m)",
    ySymbol: "F (N)",
    formula: "F = BIL",
    condition: "তার ক্ষেত্রের লম্ব, θ = 90°। B ও I স্থির।",
    explain: "লম্বা তারে বল বেশি। রেখা মূলবিন্দুগামী, ঢাল BI।",
    meaning: "ক্ষেত্রের ভেতর যতটুকু তার, বল ততটুকুর ওপর।",
    slope: "ঢাল = BI।",
    area: noArea,
    origin: "both",
    knobs: [knob("field", "ক্ষেত্র B", 0.05, 0.5, 0.05, "T"), knob("current", "প্রবাহ I", 0.5, 8, 0.5, "A")],
    base: { field: 0.2, current: 3 },
    steps: [
      { eq: "F = BIL sinθ", why: "তড়িৎবাহী তারের বল।" },
      { eq: "θ = 90°, B ও I স্থির", why: "sinθ = 1।" },
      { eq: "F ∝ L", why: "মূলবিন্দুগামী সরলরেখা। ঢাল BI।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = p.field * p.current;
      return {
        curves: [curve("main", "F–L", copper, samples(0, 1, (length) => slope * length, 17))],
        calc: `BI = ${bnNum(slope, 2)} N/m। 0.4 m-এ F = ${bnNum(slope * 0.4, 2)} N।`,
      };
    },
  },
  {
    id: "sg-fv",
    chapter: "ssc-magnet",
    title: "চৌম্বক বল–বেগ",
    source: "book",
    xName: "বেগ",
    yName: "বল",
    xSymbol: "v (m/s)",
    ySymbol: "F (10⁻¹⁴ N)",
    formula: "F = qvB sinθ",
    condition: "একটি ইলেকট্রন। θ স্থির। অক্ষে বলকে 10⁻¹⁴ দিয়ে ভাগ।",
    explain: "নির্দিষ্ট কোণে বল বেগের সমানুপাতিক। θ = 90° হলে বল সবচেয়ে বড়।",
    meaning: "থেকে থাকা আধানে চৌম্বক বল নেই। বেগ ক্ষেত্রের সমান্তরাল হলেও বল শূন্য।",
    slope: "ঢাল = qB sinθ।",
    area: noArea,
    origin: "both",
    knobs: [knob("field", "ক্ষেত্র B", 0.02, 0.4, 0.02, "T"), knob("angle", "কোণ θ", 0, 90, 5, "°")],
    base: { field: 0.1, angle: 90 },
    steps: [
      { eq: "F = qvB sinθ", why: "গতিশীল আধানের চৌম্বক বল।" },
      { eq: "q, B, θ স্থির  →  F ∝ v", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ইলেকট্রনের q ছোট", why: "বল 10⁻¹⁴ N-এর ঘরে।" },
    ],
    build(p) {
      const slope = (ELECTRON * p.field * Math.sin((p.angle * Math.PI) / 180)) / 1e-14;
      return {
        curves: [curve("main", "ইলেকট্রন", copper, samples(0, 2e6, (speed) => slope * speed, 20))],
        calc: `10⁶ m/s-এ F = ${bnNum(slope * 1e6, 2)} × 10⁻¹⁴ N।`,
      };
    },
  },
];

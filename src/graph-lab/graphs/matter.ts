import { bnNum } from "../format";
import { copper, curve, green, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const proportional = 0.0012;
const elastic = 0.0022;
const ultimate = 0.15;
const breaking = 0.25;

function ductile(strain: number, youngGPa: number) {
  const peak = youngGPa * proportional * 1000;
  if (strain <= proportional) return youngGPa * strain * 1000;
  if (strain <= elastic) {
    const t = (strain - proportional) / (elastic - proportional);
    return peak * (1 + 0.08 * t);
  }
  const yieldStress = peak * 1.08;
  if (strain <= ultimate) {
    const t = (strain - elastic) / (ultimate - elastic);
    const ease = t * t * (3 - 2 * t);
    return yieldStress + ease * (peak * 1.55 - yieldStress);
  }
  const top = peak * 1.55;
  const t = Math.min(1, (strain - ultimate) / (breaking - ultimate));
  return top - t * (top - peak * 1.15);
}

export const matterGraphs: GraphSpec[] = [
  {
    id: "matter-stress",
    chapter: "matter",
    title: "পীড়ন–বিকৃতি, সীমা ও ভাঙন",
    source: "schematic",
    xName: "বিকৃতি",
    yName: "পীড়ন",
    xSymbol: "ε",
    ySymbol: "σ (MPa)",
    formula: "হুকের অংশে σ = Yε",
    condition: "সমমানুপাতিক সীমা পর্যন্ত σ = Yε সঠিক। তার পরের বাঁক নমনীয় ধাতুর পাঠ্যবইয়ের নকশা; ভাঙনের বিকৃতি পদার্থভেদে বদলায়। এই নকশায় ভাঙন ε = 0.25।",
    explain: "শুরুতে খাড়া সরলরেখা হুকের সীমা। সমানুপাতিক সীমার পর স্থিতিস্থাপক সীমা, তারপর স্থায়ী বিকৃতি, শীর্ষে পরম সহন, শেষে ভাঙন। অক্ষের সীমা কমিয়ে হুকের সরলরেখা বড় করে দেখা যায়।",
    meaning: "ইয়ং গুণাঙ্ক হুকের অংশের ঢাল। স্থিতিস্থাপক সীমা পেরোলে বল সরিয়ে নিলে বস্তু আগের দৈর্ঘ্যে ফেরে না।",
    slope: "সমমানুপাতিক অংশে ঢাল = Y। Y = 200 GPa হলে প্রতি একক বিকৃতিতে পীড়ন 200000 MPa, যদি রেখা হুকের সীমায় থাকত।",
    area: "হুকের অংশের নিচের ক্ষেত্রফল একক আয়তনে সঞ্চিত স্থিতিস্থাপক শক্তি। প্লাস্টিক অংশের ক্ষেত্রফল এই নকশা থেকে মাপা হয় না।",
    origin: "both",
    knobs: [knob("young", "ইয়ং গুণাঙ্ক Y", 50, 400, 10, "GPa"), knob("limit", "অক্ষের বিকৃতি সীমা", 0.004, 0.25, 0.001, "")],
    base: { young: 200, limit: 0.25 },
    build(p) {
      const guides = [
        { x: proportional, label: "সমমানুপাতিক" },
        { x: elastic, label: "স্থিতিস্থাপক" },
        { x: breaking, label: "ভাঙন" },
      ].filter((guide) => guide.x <= p.limit + 1e-6);
      return {
        curves: [curve("main", "পীড়ন–বিকৃতি", copper, samples(0, p.limit, (strain) => ductile(strain, p.young), 160))],
        guides,
        calc: `Y = ${bnNum(p.young, 0)} GPa। সমমানুপাতিক সীমায় σ = ${bnNum(p.young * proportional * 1000, 0)} MPa। ভাঙনের বিকৃতি এই নকশায় 0.25।`,
      };
    },
  },
  {
    id: "matter-extension",
    chapter: "matter",
    title: "বল–দৈর্ঘ্য বৃদ্ধি",
    source: "book",
    xName: "দৈর্ঘ্য বৃদ্ধি",
    yName: "বল",
    xSymbol: "ΔL (mm)",
    ySymbol: "F (N)",
    formula: "F = (YA / L₀) ΔL",
    condition: "হুকের সীমার মধ্যে। দেখানো সর্বোচ্চ প্রসারণ ε = 0.001 পর্যন্ত। প্রস্থচ্ছেদ প্রায় স্থির।",
    explain: "দৈর্ঘ্য, ক্ষেত্রফল ও উপাদান স্থির থাকলে বল প্রসারণের সমানুপাতিক। লেখ মূলবিন্দু দিয়ে সরলরেখা। SI-তে ঢাল k = YA/L₀।",
    meaning: "একই বলে লম্বা তার বেশি বাড়ে, মোটা তার কম বাড়ে, শক্ত উপাদানের তার কম বাড়ে।",
    slope: "SI ঢাল k = YA/L₀, একক N/m। অক্ষ মিলিমিটারে, তাই চোখে দেখা ঢাল k/1000 নিউটন প্রতি মিলিমিটার।",
    area: "SI-তে ক্ষেত্রফল = স্থিতিশক্তি ½k(ΔL)²। অক্ষ মিলিমিটারে থাকায় N·mm-কে 1000 দিয়ে ভাগ করলে জুল।",
    fillArea: true,
    origin: "both",
    knobs: [
      knob("young", "ইয়ং গুণাঙ্ক Y", 50, 400, 10, "GPa"),
      knob("area", "প্রস্থচ্ছেদ A", 0.2, 4, 0.1, "mm²"),
      knob("length", "আদি দৈর্ঘ্য L₀", 0.5, 4, 0.1, "m"),
    ],
    base: { young: 200, area: 1, length: 2 },
    build(p) {
      const xMax = p.length;
      const stiffness = (p.young * p.area * 1000) / p.length;
      return {
        curves: [curve("main", "F–ΔL", copper, samples(0, xMax, (mm) => (stiffness * mm) / 1000, 40))],
        calc: `k = YA/L₀ = ${bnNum(stiffness, 0)} N/m। গ্রাফের ঢাল = ${bnNum(stiffness / 1000, 1)} N/mm। ΔL = ${bnNum(xMax, 1)} mm-এ F = ${bnNum((stiffness * xMax) / 1000, 1)} N, U = ${bnNum(0.5 * stiffness * (xMax / 1000) * (xMax / 1000))} J।`,
      };
    },
  },
  {
    id: "matter-hooke",
    chapter: "matter",
    title: "হুকের সূত্র: বল–বিকৃতি",
    source: "book",
    xName: "বিকৃতি",
    yName: "বল",
    xSymbol: "ε",
    ySymbol: "F (N)",
    formula: "F = YAε",
    condition: "হুকের সীমার মধ্যে। বিকৃতি অনুদৈর্ঘ্য। ε = 0 থেকে 0.002। পীড়ন = F/A = Yε।",
    explain: "হুকের সূত্রে বল বিকৃতির সমানুপাতিক। লেখ মূলবিন্দু দিয়ে সরলরেখা। ঢাল YA।",
    meaning: "বিকৃতি দ্বিগুণ হলে বল দ্বিগুণ, যতক্ষণ হুকের সীমা পার হওয়া না যায়।",
    slope: "ঢাল = YA। Y প্যাসকালে ও A বর্গমিটারে নিলে এই ঢাল নিউটন প্রতি একক বিকৃতি।",
    area: noArea,
    origin: "both",
    knobs: [knob("young", "ইয়ং গুণাঙ্ক Y", 50, 400, 10, "GPa"), knob("area", "প্রস্থচ্ছেদ A", 0.2, 4, 0.1, "mm²")],
    base: { young: 200, area: 1 },
    build(p) {
      const slope = p.young * p.area * 1000;
      return {
        curves: [curve("main", "F = YAε", green, samples(0, 0.002, (strain) => slope * strain, 40))],
        calc: `ঢাল = YA = ${bnNum(slope, 0)} N। ε = 0.001-এ F = ${bnNum(slope * 0.001, 1)} N, পীড়ন = ${bnNum(p.young * 0.001 * 1000, 0)} MPa।`,
      };
    },
  },
];

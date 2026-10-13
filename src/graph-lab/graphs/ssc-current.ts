import { bnNum } from "../format";
import { copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const sscCurrentGraphs: GraphSpec[] = [
  {
    id: "sc-vi",
    chapter: "ssc-current",
    title: "বিভব পার্থক্য–তড়িৎ প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "বিভব পার্থক্য",
    xSymbol: "I (A)",
    ySymbol: "V (V)",
    formula: "V = IR",
    condition: "তাপমাত্রা স্থির, ওহমীয় রোধক।",
    explain: "বিভব প্রবাহের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল রোধ।",
    meaning: "ওহমের সূত্র। ঢাল বড় মানে রোধ বড়।",
    slope: "ঢাল = R।",
    area: noArea,
    origin: "both",
    knobs: [knob("ohm", "রোধ R", 2, 20, 1, "Ω")],
    base: { ohm: 5 },
    steps: [
      { eq: "V = IR", why: "ওহমের সূত্র।" },
      { eq: "R স্থির  →  V ∝ I", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = R", why: "মূলবিন্দুগামী সরলরেখা।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "V–I", copper, samples(0, 4, (current) => p.ohm * current, 17))],
        calc: `R = ${bnNum(p.ohm, 0)} Ω। I = 2 A-এ V = ${bnNum(p.ohm * 2, 0)} V।`,
      };
    },
  },
  {
    id: "sc-iv",
    chapter: "ssc-current",
    title: "তড়িৎ প্রবাহ–বিভব পার্থক্য",
    source: "book",
    xName: "বিভব পার্থক্য",
    yName: "তড়িৎ প্রবাহ",
    xSymbol: "V (V)",
    ySymbol: "I (A)",
    formula: "I = V/R",
    condition: "তাপমাত্রা স্থির। আগের লেখের অক্ষ বদল।",
    explain: "প্রবাহ বিভবের সমানুপাতিক। ঢাল 1/R। রোধ বাড়লে লেখ চ্যাপটা হয়।",
    meaning: "একই ব্যাটারিতে বড় রোধে প্রবাহ কম।",
    slope: "ঢাল = 1/R।",
    area: noArea,
    origin: "both",
    knobs: [knob("ohm", "রোধ R", 2, 20, 1, "Ω")],
    base: { ohm: 5 },
    steps: [
      { eq: "V = IR", why: "ওহমের সূত্র।" },
      { eq: "I = V/R", why: "R স্থির।" },
      { eq: "I ∝ V", why: "ঢাল 1/R।", tag: "সমানুপাত" },
    ],
    build(p) {
      return {
        curves: [curve("main", "I–V", copper, samples(0, 20, (voltage) => voltage / p.ohm, 17))],
        calc: `ঢাল = ${bnNum(1 / p.ohm, 3)} A/V। 10 V-এ I = ${bnNum(10 / p.ohm, 2)} A।`,
      };
    },
  },
  {
    id: "sc-rl",
    chapter: "ssc-current",
    title: "রোধ–দৈর্ঘ্য",
    source: "book",
    xName: "দৈর্ঘ্য",
    yName: "রোধ",
    xSymbol: "L (m)",
    ySymbol: "R (Ω)",
    formula: "R = ρL/A",
    condition: "উপাদান ও প্রস্থচ্ছেদ স্থির। ρ 10⁻⁸ Ω·m এককে, তামার কাছে 1.7। A = 0.5 mm²।",
    explain: "লম্বা তারের রোধ বেশি। রেখা মূলবিন্দুগামী, ঢাল ρ/A।",
    meaning: "একই তার দ্বিগুণ লম্বা হলে রোধ দ্বিগুণ।",
    slope: "ঢাল = ρ/A।",
    area: noArea,
    origin: "both",
    knobs: [knob("rho", "রোধকতা ρ", 1, 10, 0.1, "×10⁻⁸ Ω·m")],
    base: { rho: 1.7 },
    steps: [
      { eq: "R = ρL/A", why: "তারের রোধ।" },
      { eq: "ρ ও A স্থির  →  R ∝ L", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "দৈর্ঘ্য শূন্য হলে রোধ শূন্য।" },
    ],
    build(p) {
      const area = 0.5e-6;
      const slope = (p.rho * 1e-8) / area;
      return {
        curves: [curve("main", "R–L", copper, samples(0, 10, (length) => slope * length, 17))],
        calc: `A = 0.5 mm²। ২ m-এ R = ${bnNum(slope * 2, 3)} Ω।`,
      };
    },
  },
  {
    id: "sc-ra",
    chapter: "ssc-current",
    title: "রোধ–প্রস্থচ্ছেদ",
    source: "book",
    xName: "প্রস্থচ্ছেদের ক্ষেত্রফল",
    yName: "রোধ",
    xSymbol: "A (mm²)",
    ySymbol: "R (Ω)",
    formula: "R = ρL/A",
    condition: "দৈর্ঘ্য 2 m, উপাদান স্থির। মোটা তারের রোধ কম।",
    explain: "রোধ ক্ষেত্রফলের ব্যাস্তানুপাতিক। ক্ষেত্রফল দ্বিগুণ হলে রোধ অর্ধেক।",
    meaning: "সরু তার বেশি বাধা দেয়।",
    slope: "ঢাল = −ρL/A²।",
    area: noArea,
    knobs: [knob("rho", "রোধকতা ρ", 1, 10, 0.1, "×10⁻⁸ Ω·m")],
    base: { rho: 1.7 },
    steps: [
      { eq: "R = ρL/A", why: "তারের রোধ।" },
      { eq: "ρ ও L স্থির  →  R ∝ 1/A", why: "ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ বক্র", why: "A বনাম R সোজা নয়।" },
    ],
    build(p) {
      const length = 2;
      const resistance = (area: number) => (p.rho * 1e-8 * length) / (area * 1e-6);
      return {
        curves: [curve("main", "R–A", copper, samples(0.2, 2, resistance))],
        calc: `A = 0.5 mm²-এ R = ${bnNum(resistance(0.5), 3)} Ω। A = 1 mm²-এ ${bnNum(resistance(1), 3)} Ω।`,
      };
    },
  },
  {
    id: "sc-pi",
    chapter: "ssc-current",
    title: "তড়িৎ ক্ষমতা–প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "ক্ষমতা",
    xSymbol: "I (A)",
    ySymbol: "P (W)",
    formula: "P = VI",
    condition: "বিভব স্থির। এটি I²R নয়। I²R তখন, যখন রোধ স্থির আর বিভব প্রবাহের সাথে বাড়ে।",
    explain: "বিভব আটকে রাখলে ক্ষমতা প্রবাহের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল V।",
    meaning: "একই বাল্বে বেশি প্রবাহ মানে বেশি ক্ষমতা, বিভব না বদলালে।",
    slope: "ঢাল = V।",
    area: noArea,
    origin: "both",
    knobs: [knob("volt", "বিভব V", 2, 24, 1, "V")],
    base: { volt: 12 },
    steps: [
      { eq: "P = VI", why: "তড়িৎ ক্ষমতা।" },
      { eq: "V স্থির  →  P ∝ I", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = V", why: "মূলবিন্দুগামী সরলরেখা।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "P–I", copper, samples(0, 5, (current) => p.volt * current, 17))],
        calc: `V = ${bnNum(p.volt, 0)} V। I = 2 A-এ P = ${bnNum(p.volt * 2, 0)} W।`,
      };
    },
  },
  {
    id: "sc-ht",
    chapter: "ssc-current",
    title: "জুলের তাপ–সময়",
    source: "book",
    xName: "সময়",
    yName: "তাপ",
    xSymbol: "t (s)",
    ySymbol: "H (J)",
    formula: "H = I²Rt",
    condition: "প্রবাহ ও রোধ স্থির।",
    explain: "তাপ সময়ের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল I²R।",
    meaning: "হিটার যতক্ষণ চলে, তত তাপ বেরোয়, প্রবাহ না বদলালে।",
    slope: "ঢাল = I²R।",
    area: noArea,
    origin: "both",
    knobs: [knob("current", "প্রবাহ I", 0.5, 5, 0.5, "A"), knob("ohm", "রোধ R", 2, 20, 1, "Ω")],
    base: { current: 2, ohm: 5 },
    steps: [
      { eq: "H = I²Rt", why: "জুলের সূত্র।" },
      { eq: "I ও R স্থির  →  I²R ধ্রুব", why: "ঢাল।" },
      { eq: "H ∝ t", why: "মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = p.current * p.current * p.ohm;
      return {
        curves: [curve("main", "H–t", copper, samples(0, 60, (time) => slope * time, 17))],
        calc: `I²R = ${bnNum(slope, 1)} W। ৬০ s-এ H = ${bnNum(slope * 60, 0)} J।`,
      };
    },
  },
];

import { bnNum } from "../format";
import { EPS0, K_COULOMB, blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const point = "বিন্দু আধান, শূন্য মাধ্যম। k = 9×10⁹ N m²/C²।";

export const electroGraphs: GraphSpec[] = [
  {
    id: "el-fqq",
    chapter: "electrostatics",
    title: "তড়িৎ বল–আধানের গুণফল",
    source: "book",
    xName: "আধানের গুণফল",
    yName: "বল",
    xSymbol: "q₁q₂ (μC²)",
    ySymbol: "F (N)",
    formula: "F = k q₁q₂ / r²",
    condition: `${point} দূরত্ব স্থির। ধনাত্মক F বিকর্ষণ, ঋণাত্মক F আকর্ষণ।`,
    explain: "দূরত্ব না বদলালে বল আধান দুটির গুণফলের সমানুপাতিক। গুণফল ঋণাত্মক হলে বল আকর্ষণ।",
    meaning: "কুলম্বের সূত্রের সরলরৈখিক রূপ। ঢাল k/r²।",
    slope: "ঢাল = k/r²।",
    area: noArea,
    origin: "both",
    knobs: [knob("distance", "দূরত্ব r", 0.05, 0.3, 0.01, "m")],
    base: { distance: 0.1 },
    steps: [
      { eq: "F = k q₁q₂ / r²", why: "কুলম্বের সূত্র।" },
      { eq: "r স্থির  →  k/r² ধ্রুব", why: "বল গুণফলের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "গুণফল শূন্য হলে বল শূন্য।" },
    ],
    build(p) {
      const slope = (K_COULOMB * 1e-12) / (p.distance * p.distance);
      return {
        curves: [curve("main", "F–q₁q₂", copper, samples(-4, 4, (product) => slope * product, 20))],
        calc: `r = ${bnNum(p.distance, 2)} m। ঢাল = ${bnNum(slope)} N/μC²। 1 μC × 1 μC-এ F = ${bnNum(slope)} N।`,
      };
    },
  },
  {
    id: "el-fr",
    chapter: "electrostatics",
    title: "তড়িৎ বল–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "বল",
    xSymbol: "r (m)",
    ySymbol: "F (N)",
    formula: "F = k q₁q₂ / r²",
    condition: `${point} আধান দুটির চিহ্ন এক হলে বিকর্ষণ।`,
    explain: "দূরত্ব দ্বিগুণ হলে বল চার ভাগের এক ভাগ। লেখ অধিবৃত্তের মতো নামে, সরলরেখা নয়।",
    meaning: "বল দূরত্বের বর্গের ব্যাস্তানুপাতিক।",
    slope: "ঢাল = −2k q₁q₂/r³। দূরত্ব বাড়লে ঢালের মান কমে।",
    area: noArea,
    knobs: [knob("q1", "আধান q₁", 0.5, 3, 0.1, "μC"), knob("q2", "আধান q₂", 0.5, 3, 0.1, "μC")],
    base: { q1: 1, q2: 1 },
    steps: [
      { eq: "F = k q₁q₂ / r²", why: "কুলম্বের সূত্র। q₁ ও q₂ স্থির।" },
      { eq: "F ∝ 1/r²", why: "বর্গের ব্যাস্তানুপাত। দ্বিগুণ দূরত্বে বল ১/৪।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ বক্র", why: "F বনাম r সরলরেখা নয়। F বনাম 1/r² হলে সোজা হত।" },
    ],
    build(p) {
      const scale = K_COULOMB * p.q1 * p.q2 * 1e-12;
      return {
        curves: [curve("main", "F–r", copper, samples(0.04, 0.4, (distance) => scale / (distance * distance)))],
        calc: `r = 0.10 m-এ F = ${bnNum(scale / 0.01)} N। r = 0.20 m-এ F = ${bnNum(scale / 0.04)} N।`,
      };
    },
  },
  {
    id: "el-er",
    chapter: "electrostatics",
    title: "তড়িৎ ক্ষেত্র প্রাবল্য–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "ক্ষেত্র প্রাবল্য",
    xSymbol: "r (m)",
    ySymbol: "E (kN/C)",
    formula: "E = k q / r²",
    condition: `${point} বিন্দু আধানের ক্ষেত্র। দিক আধান থেকে বাইরে, আধান ধনাত্মক হলে।`,
    explain: "ক্ষেত্র বলকে আধান দিয়ে ভাগ। তাই দূরত্বের সাথে বলের মতোই বর্গের ব্যাস্তানুপাতে কমে।",
    meaning: "একক ধনাত্মক আধানের ওপর বল। q দ্বিগুণ হলে E দ্বিগুণ।",
    slope: "ঢাল = −2kq/r³।",
    area: noArea,
    knobs: [knob("charge", "আধান q", 0.5, 3, 0.1, "μC")],
    base: { charge: 1 },
    steps: [
      { eq: "E = F / q₀", why: "ক্ষেত্র প্রাবল্যের সংজ্ঞা।" },
      { eq: "F = k q q₀ / r²", why: "পরীক্ষা আধান q₀ কাটা যায়।" },
      { eq: "E ∝ 1/r²", why: "উৎস আধান স্থির। বর্গের ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
    ],
    build(p) {
      const scale = (K_COULOMB * p.charge * 1e-6) / 1000;
      return {
        curves: [curve("main", "E–r", copper, samples(0.05, 0.5, (distance) => scale / (distance * distance)))],
        calc: `r = 0.10 m-এ E = ${bnNum((K_COULOMB * p.charge * 1e-6) / 0.01 / 1000, 0)} kN/C।`,
      };
    },
  },
  {
    id: "el-vr",
    chapter: "electrostatics",
    title: "তড়িৎ বিভব–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "বিভব",
    xSymbol: "r (m)",
    ySymbol: "V (kV)",
    formula: "V = k q / r",
    condition: `${point} অসীমে বিভব শূন্য। ধনাত্মক আধানে বিভব ধনাত্মক।`,
    explain: "বিভব দূরত্বের ব্যাস্তানুপাতিক, বর্গের নয়। তাই বলের চেয়ে ধীরে কমে।",
    meaning: "একক ধনাত্মক আধানকে অসীম থেকে আনতে কাজ। E = −dV/dr।",
    slope: "ঢাল = −kq/r² = −E।",
    area: noArea,
    knobs: [knob("charge", "আধান q", 0.5, 3, 0.1, "μC")],
    base: { charge: 1 },
    steps: [
      { eq: "V = k q / r", why: "অসীমে শূন্য ধরে বিন্দু আধানের বিভব।" },
      { eq: "V ∝ 1/r", why: "q স্থির। ব্যাস্তানুপাত, ঘাত 1।", tag: "ব্যাস্তানুপাত" },
      { eq: "E = −dV/dr", why: "বিভবের ঢালের উল্টোই ক্ষেত্র। ধনাত্মক আধানে dV/dr ঋণাত্মক।" },
    ],
    build(p) {
      const scale = (K_COULOMB * p.charge * 1e-6) / 1000;
      return {
        curves: [curve("main", "V–r", copper, samples(0.05, 0.5, (distance) => scale / distance))],
        calc: `r = 0.10 m-এ V = ${bnNum(scale / 0.1, 1)} kV। r = 0.20 m-এ V = ${bnNum(scale / 0.2, 1)} kV।`,
      };
    },
  },
  {
    id: "el-eq",
    chapter: "electrostatics",
    title: "তড়িৎ ক্ষেত্র প্রাবল্য–আধান",
    source: "book",
    xName: "আধান",
    yName: "ক্ষেত্র প্রাবল্য",
    xSymbol: "q (μC)",
    ySymbol: "E (kN/C)",
    formula: "E = k q / r²",
    condition: `${point} দূরত্ব স্থির। ঋণাত্মক আধানে ক্ষেত্রের দিক উল্টো, এখানে মান ঋণাত্মক দেখানো।`,
    explain: "একই জায়গায় ক্ষেত্র আধানের সমানুপাতিক। রেখা মূলবিন্দু দিয়ে যায়।",
    meaning: "আধান শূন্য হলে ক্ষেত্র শূন্য। ঢাল k/r²।",
    slope: "ঢাল = k/r²।",
    area: noArea,
    origin: "both",
    knobs: [knob("distance", "দূরত্ব r", 0.05, 0.3, 0.01, "m")],
    base: { distance: 0.1 },
    steps: [
      { eq: "E = k q / r²", why: "বিন্দু আধানের ক্ষেত্র।" },
      { eq: "r স্থির  →  E ∝ q", why: "k/r² ধ্রুব। ক্ষেত্র আধানের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "দূরত্ব কমলে ঢাল বাড়ে।" },
    ],
    build(p) {
      const slope = (K_COULOMB * 1e-6) / (p.distance * p.distance) / 1000;
      return {
        curves: [curve("main", "E–q", copper, samples(-2, 3, (charge) => slope * charge, 20))],
        calc: `r = ${bnNum(p.distance, 2)} m-এ 1 μC-এর E = ${bnNum(slope, 1)} kN/C।`,
      };
    },
  },
  {
    id: "el-qv",
    chapter: "electrostatics",
    title: "ধারকের আধান–বিভব",
    source: "book",
    xName: "বিভব পার্থক্য",
    yName: "আধান",
    xSymbol: "V (V)",
    ySymbol: "Q (μC)",
    formula: "Q = CV",
    condition: "ধারকত্ব C স্থির। রৈখিক ডাইইলেকট্রিক, ভেঙে যাওয়ার আগে।",
    explain: "আধান বিভবের সমানুপাতিক। ঢালই ধারকত্ব।",
    meaning: "C বড় হলে একই বিভবে বেশি আধান জমে।",
    slope: "ঢাল = C।",
    area: noArea,
    origin: "both",
    knobs: [knob("cap", "ধারকত্ব C", 1, 40, 1, "μF")],
    base: { cap: 10 },
    steps: [
      { eq: "C = Q / V", why: "ধারকত্বের সংজ্ঞা।" },
      { eq: "C স্থির  →  Q ∝ V", why: "আধান বিভবের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = C", why: "রেখা খাড়া হলে ধারকত্ব বেশি।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "Q–V", copper, samples(0, 12, (voltage) => p.cap * voltage, 16))],
        calc: `12 V-এ Q = ${bnNum(p.cap * 12, 0)} μC।`,
      };
    },
  },
  {
    id: "el-vq",
    chapter: "electrostatics",
    title: "বিভব পার্থক্য–আধান",
    source: "book",
    xName: "আধান",
    yName: "বিভব পার্থক্য",
    xSymbol: "Q (μC)",
    ySymbol: "V (V)",
    formula: "V = Q / C",
    condition: "একই ধারক, C স্থির। আগের লেখের অক্ষ উল্টো।",
    explain: "আধান বাড়লে বিভব বাড়ে। ধারকত্ব বেশি হলে একই আধানে বিভব কম, রেখা কম খাড়া।",
    meaning: "ঢাল = 1/C। Q–V লেখের ঢালের উল্টো।",
    slope: "ঢাল = 1/C।",
    area: noArea,
    origin: "both",
    knobs: [knob("cap", "ধারকত্ব C", 1, 40, 1, "μF")],
    base: { cap: 10 },
    steps: [
      { eq: "Q = CV", why: "ধারকের মূল সম্পর্ক।" },
      { eq: "V = Q / C", why: "C স্থির থাকলে বিভব আধানের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = 1/C", why: "C বাড়লে একই আধানে বিভব কমে।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "V–Q", copper, samples(0, 120, (charge) => charge / p.cap, 16))],
        calc: `100 μC-এ V = ${bnNum(100 / p.cap, 1)} V।`,
      };
    },
  },
  {
    id: "el-uv",
    chapter: "electrostatics",
    title: "সঞ্চিত শক্তি–বিভব",
    source: "book",
    xName: "বিভব পার্থক্য",
    yName: "সঞ্চিত শক্তি",
    xSymbol: "V (V)",
    ySymbol: "U (mJ)",
    formula: "U = ½ C V²",
    condition: "C স্থির। শক্তি মিলিজুলে।",
    explain: "শক্তি বিভবের বর্গের সমানুপাতিক। বিভব দ্বিগুণ হলে শক্তি চারগুণ। লেখ পরাবৃত্ত।",
    meaning: "ধারক চার্জ করতে ব্যাটারি এই শক্তি জমায়।",
    slope: "স্থানীয় ঢাল = CV। বিভব বাড়লে ঢাল বাড়ে।",
    area: noArea,
    origin: "both",
    knobs: [knob("cap", "ধারকত্ব C", 2, 40, 1, "μF")],
    base: { cap: 10 },
    steps: [
      { eq: "U = ∫ V dQ", why: "আধান আনতে কাজের যোগ।" },
      { eq: "Q = CV", why: "বসিয়ে U = ∫ (Q/C) dQ।" },
      { eq: "U = ½ C V²", why: "C স্থির। শক্তি বিভবের বর্গের সমানুপাতিক।", tag: "বর্গ" },
    ],
    build(p) {
      return {
        curves: [curve("main", "U–V", copper, samples(0, 20, (voltage) => 0.5 * p.cap * voltage * voltage * 1e-3, 40))],
        calc: `C = ${bnNum(p.cap, 0)} μF। 12 V-এ U = ${bnNum(0.5 * p.cap * 144 * 1e-3, 2)} mJ।`,
      };
    },
  },
  {
    id: "el-uq",
    chapter: "electrostatics",
    title: "সঞ্চিত শক্তি–আধান",
    source: "book",
    xName: "আধান",
    yName: "সঞ্চিত শক্তি",
    xSymbol: "Q (μC)",
    ySymbol: "U (mJ)",
    formula: "U = Q² / (2C)",
    condition: "C স্থির। Q মাইক্রোকুলম্ব, U মিলিজুল।",
    explain: "একই ধারকে আধানের বর্গের সাথে শক্তি বাড়ে। C বড় হলে একই আধানে শক্তি কম।",
    meaning: "U = ½QV = Q²/(2C) = ½CV² — তিন রূপ এক শক্তি।",
    slope: "ঢাল = Q/C = V। আধান বাড়লে ঢাল বাড়ে।",
    area: noArea,
    origin: "both",
    knobs: [knob("cap", "ধারকত্ব C", 2, 40, 1, "μF")],
    base: { cap: 10 },
    steps: [
      { eq: "U = ½ C V²", why: "বিভব দিয়ে লেখা শক্তি।" },
      { eq: "V = Q / C", why: "বসিয়ে V উঠে যায়।" },
      { eq: "U ∝ Q²", why: "C স্থির। বর্গের সমানুপাত, সরলরেখা নয়।", tag: "বর্গ" },
    ],
    build(p) {
      return {
        curves: [curve("main", "U–Q", copper, samples(0, 150, (charge) => (charge * charge) / (2 * p.cap) * 1e-3, 40))],
        calc: `100 μC-এ U = ${bnNum((100 * 100) / (2 * p.cap) * 1e-3, 2)} mJ।`,
      };
    },
  },
  {
    id: "el-cd",
    chapter: "electrostatics",
    title: "ধারকত্ব–পাতের দূরত্ব",
    source: "book",
    xName: "পাতের দূরত্ব",
    yName: "ধারকত্ব",
    xSymbol: "d (mm)",
    ySymbol: "C (pF)",
    formula: "C = ε₀ A / d",
    condition: "সমান্তরাল পাত, মাঝে শূন্য বা বায়ু। ক্ষেত্রফল স্থির। প্রান্তের ছড়ানো উপেক্ষা।",
    explain: "দূরত্ব কমলে ধারকত্ব বাড়ে। C দূরত্বের ব্যাস্তানুপাতিক। দ্বিগুণ ফাঁকে ধারকত্ব অর্ধেক।",
    meaning: "পাত কাছে আনলে একই বিভবে বেশি আধান ধরে।",
    slope: "ঢাল = −ε₀ A/d²। ধ্রুব নয়।",
    area: noArea,
    knobs: [knob("area", "ক্ষেত্রফল A", 20, 200, 5, "cm²")],
    base: { area: 100 },
    steps: [
      { eq: "C = ε₀ A / d", why: "সমান্তরাল পাতের ধারকত্ব। ε₀ = 8.854×10⁻¹² F/m।" },
      { eq: "A স্থির  →  C ∝ 1/d", why: "ধারকত্ব দূরত্বের ব্যাস্তানুপাতিক।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ অধিবৃত্ত", why: "d বনাম C সরলরেখা নয়। C বনাম 1/d হলে সোজা।" },
    ],
    build(p) {
      const area = p.area * 1e-4;
      const pf = (gapMm: number) => (EPS0 * area) / (gapMm * 1e-3) * 1e12;
      return {
        curves: [curve("main", "C–d", copper, samples(0.4, 5, pf))],
        calc: `A = ${bnNum(p.area, 0)} cm²। d = 1 mm-এ C = ${bnNum(pf(1), 1)} pF। d = 2 mm-এ C = ${bnNum(pf(2), 1)} pF।`,
      };
    },
  },
];

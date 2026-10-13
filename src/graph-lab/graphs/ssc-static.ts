import { bnNum } from "../format";
import { K_COULOMB, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const point = "বিন্দু আধান, শূন্য মাধ্যম। k = 9×10⁹ N m²/C²।";

export const sscStaticGraphs: GraphSpec[] = [
  {
    id: "ss-fq",
    chapter: "ssc-static",
    title: "তড়িৎ বল–আধান",
    source: "book",
    xName: "আধান",
    yName: "বল",
    xSymbol: "q (μC)",
    ySymbol: "F (N)",
    formula: "F = k q Q / r²",
    condition: `${point} অন্য আধান Q ও দূরত্ব r স্থির। ধনাত্মক F বিকর্ষণ।`,
    explain: "দূরত্ব ও একটি আধান না বদলালে বল অন্য আধানের সমানুপাতিক। রেখা মূলবিন্দু দিয়ে যায়।",
    meaning: "আধান উল্টো চিহ্নের হলে বল আকর্ষণ, লেখ ঋণাত্মক দিকে।",
    slope: "ঢাল = kQ/r²।",
    area: noArea,
    origin: "both",
    knobs: [knob("other", "অন্য আধান Q", 0.5, 3, 0.1, "μC"), knob("distance", "দূরত্ব r", 0.05, 0.3, 0.01, "m")],
    base: { other: 1, distance: 0.1 },
    steps: [
      { eq: "F = k q Q / r²", why: "কুলম্বের সূত্র।" },
      { eq: "Q ও r স্থির", why: "kQ/r² ধ্রুব।" },
      { eq: "F ∝ q", why: "মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = (K_COULOMB * p.other * 1e-12) / (p.distance * p.distance);
      return {
        curves: [curve("main", "F–q", copper, samples(-3, 3, (charge) => slope * charge, 20))],
        calc: `r = ${bnNum(p.distance, 2)} m, Q = ${bnNum(p.other, 1)} μC। q = 1 μC-এ F = ${bnNum(slope, 2)} N।`,
      };
    },
  },
  {
    id: "ss-fr",
    chapter: "ssc-static",
    title: "তড়িৎ বল–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "বল",
    xSymbol: "r (m)",
    ySymbol: "F (N)",
    formula: "F = k q₁q₂ / r²",
    condition: `${point} দুটি ধনাত্মক আধান, বিকর্ষণ।`,
    explain: "দূরত্ব দ্বিগুণ হলে বল চার ভাগের এক ভাগ। লেখ বক্র।",
    meaning: "বল দূরত্বের বর্গের ব্যাস্তানুপাতিক।",
    slope: "ঢাল = −2k q₁q₂/r³।",
    area: noArea,
    knobs: [knob("q1", "আধান q₁", 0.5, 3, 0.1, "μC"), knob("q2", "আধান q₂", 0.5, 3, 0.1, "μC")],
    base: { q1: 1, q2: 1 },
    steps: [
      { eq: "F = k q₁q₂ / r²", why: "কুলম্বের সূত্র।" },
      { eq: "F ∝ 1/r²", why: "বর্গের ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ বক্র", why: "F বনাম r সোজা নয়।" },
    ],
    build(p) {
      const scale = K_COULOMB * p.q1 * p.q2 * 1e-12;
      return {
        curves: [curve("main", "F–r", copper, samples(0.05, 0.4, (distance) => scale / (distance * distance)))],
        calc: `r = 0.10 m-এ F = ${bnNum(scale / 0.01, 2)} N। r = 0.20 m-এ ${bnNum(scale / 0.04, 2)} N।`,
      };
    },
  },
  {
    id: "ss-er",
    chapter: "ssc-static",
    title: "তড়িৎ ক্ষেত্র–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "ক্ষেত্র প্রাবল্য",
    xSymbol: "r (m)",
    ySymbol: "E (kN/C)",
    formula: "E = k q / r²",
    condition: `${point} একটি ধনাত্মক বিন্দু আধান।`,
    explain: "ক্ষেত্র প্রাবল্য দূরত্বের বর্গের ব্যাস্তানুপাতে কমে। বলের মতোই আকৃতি।",
    meaning: "E = F/q₀। উৎস থেকে দূরে ক্ষেত্র দুর্বল।",
    slope: "ঢাল = −2kq/r³।",
    area: noArea,
    knobs: [knob("charge", "আধান q", 0.5, 3, 0.1, "μC")],
    base: { charge: 1 },
    steps: [
      { eq: "E = F/q₀", why: "ক্ষেত্র প্রাবল্য।" },
      { eq: "F = k q q₀ / r²", why: "q₀ কাটা যায়।" },
      { eq: "E ∝ 1/r²", why: "বর্গের ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
    ],
    build(p) {
      const scale = (K_COULOMB * p.charge * 1e-6) / 1000;
      return {
        curves: [curve("main", "E–r", copper, samples(0.05, 0.5, (distance) => scale / (distance * distance)))],
        calc: `r = 0.10 m-এ E = ${bnNum(scale / 0.01, 1)} kN/C।`,
      };
    },
  },
  {
    id: "ss-vr",
    chapter: "ssc-static",
    title: "তড়িৎ বিভব–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "বিভব",
    xSymbol: "r (m)",
    ySymbol: "V (kV)",
    formula: "V = k q / r",
    condition: `${point} অসীমে বিভব শূন্য।`,
    explain: "বিভব দূরত্বের ব্যাস্তানুপাতিক, বর্গের নয়। তাই ক্ষেত্রের চেয়ে ধীরে কমে।",
    meaning: "ধনাত্মক আধানের কাছে বিভব বেশি।",
    slope: "ঢাল = −kq/r² = −E।",
    area: noArea,
    knobs: [knob("charge", "আধান q", 0.5, 3, 0.1, "μC")],
    base: { charge: 1 },
    steps: [
      { eq: "V = k q / r", why: "অসীমে শূন্য ধরে।" },
      { eq: "V ∝ 1/r", why: "ব্যাস্তানুপাত, ঘাত 1।", tag: "ব্যাস্তানুপাত" },
      { eq: "E বর্গের সাথে কমে", why: "বিভব শুধু দূরত্বের সাথে। দুই লেখ এক নয়।" },
    ],
    build(p) {
      const scale = (K_COULOMB * p.charge * 1e-6) / 1000;
      return {
        curves: [curve("main", "V–r", copper, samples(0.05, 0.5, (distance) => scale / distance))],
        calc: `r = 0.10 m-এ V = ${bnNum(scale / 0.1, 1)} kV। r = 0.20 m-এ ${bnNum(scale / 0.2, 1)} kV।`,
      };
    },
  },
];

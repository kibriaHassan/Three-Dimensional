import { bnNum } from "../format";
import { G_ACC, blue, copper, curve, knob, noArea, piecewise, samples } from "../curves";
import type { GraphSpec } from "../types";

const trip = "০–৪ সেকেন্ডে বেগ +২ m/s, তারপর ৪–৮ সেকেন্ডে বেগ −২ m/s। একই যাত্রা দুই লেখে।";

export const sscMotionGraphs: GraphSpec[] = [
  {
    id: "sm-distance",
    chapter: "ssc-motion",
    title: "দূরত্ব–সময়",
    source: "book",
    xName: "সময়",
    yName: "দূরত্ব",
    xSymbol: "t (s)",
    ySymbol: "s (m)",
    formula: "দূরত্ব = অতিক্রান্ত পথ",
    condition: trip,
    explain: "ফিরে এলেও পথ কমে না। ৪ সেকেন্ডে ঢাল একই থাকে, কারণ প্রতি সেকেন্ডে ২ মিটার পথই বাড়ছে।",
    meaning: "দূরত্ব স্কেলার। লেখ কখনো নিচে নামে না।",
    slope: "ঢাল = দ্রুতি। এখানে দুই অংশেই ২ m/s।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "দূরত্ব = পথের যোগ", why: "দিক ধরা হয় না।" },
      { eq: "ফেরার সময়ও দূরত্ব বাড়ে", why: "পিছিয়ে আসাও অতিক্রান্ত পথ।" },
      { eq: "ঢাল = দ্রুতি", why: "দুই অংশে দ্রুতি ২ m/s, তাই ঢাল সমান।", tag: "সমানুপাত" },
    ],
    build() {
      const path = (time: number) => (time <= 4 ? 2 * time : 8 + 2 * (time - 4));
      return {
        curves: [curve("main", "দূরত্ব", copper, piecewise(0, 4, 8, path, 17, 17))],
        guides: [{ x: 4, label: "ফেরা" }],
        calc: "৮ সেকেন্ডে দূরত্ব ১৬ m। সরণ তখন ০।",
      };
    },
  },
  {
    id: "sm-displacement",
    chapter: "ssc-motion",
    title: "সরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "s (m)",
    formula: "s = vt, দিকসহ",
    condition: `${trip} ধনাত্মক দিক সামনে।`,
    explain: "সামনে গেলে সরণ বাড়ে, ফিরলে কমে। ৮ সেকেন্ডে আবার শুরুর বিন্দু, সরণ শূন্য। দূরত্ব তখন ১৬ m।",
    meaning: "সরণ ভেক্টর। লেখ নিচে নামতে পারে।",
    slope: "ঢাল = বেগ। ০–৪ s-এ +২, ৪–৮ s-এ −২ m/s।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "সরণ = শেষ অবস্থান − আদি অবস্থান", why: "পথ নয়, সোজা পরিবর্তন।" },
      { eq: "সামনে s = +2t", why: "বেগ ধনাত্মক।" },
      { eq: "ফেরার পর s = 16 − 2t", why: "বেগ ঋণাত্মক, ঢাল নিচের দিকে।", tag: "রৈখিক" },
    ],
    build() {
      const shift = (time: number) => (time <= 4 ? 2 * time : 16 - 2 * time);
      return {
        curves: [curve("main", "সরণ", copper, piecewise(0, 4, 8, shift, 17, 17))],
        guides: [{ x: 4, label: "ফেরা" }],
        calc: "৪ s-এ সরণ ৮ m। ৮ s-এ সরণ ০।",
      };
    },
  },
  {
    id: "sm-vt",
    chapter: "ssc-motion",
    title: "বেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "বেগ",
    xSymbol: "t (s)",
    ySymbol: "v (m/s)",
    formula: "v = u + at",
    condition: "সুষম ত্বরণ। ঢাল ত্বরণ, রেখার নিচের ক্ষেত্রফল সরণ।",
    explain: "বেগ সময়ের সাথে সরলরেখায় বদলায়। ত্বরণ ধনাত্মক হলে ওপরে ওঠে, ঋণাত্মক হলে নামে।",
    meaning: "সমবেগে a = 0, লেখ অনুভূমিক।",
    slope: "ঢাল = a।",
    area: "ক্ষেত্রফল = সরণ।",
    fillArea: true,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u", 0, 20, 1, "m/s"), knob("a", "ত্বরণ a", -4, 6, 0.5, "m/s²")],
    base: { u: 4, a: 2 },
    steps: [
      { eq: "a = Δv / Δt", why: "সুষম ত্বরণের সংজ্ঞা।" },
      { eq: "v = u + at", why: "u আদি বেগ।" },
      { eq: "ঢাল = a", why: "t-এর সহগই ত্বরণ। ক্ষেত্রফল সরণ।", tag: "রৈখিক" },
    ],
    build(p) {
      const velocity = (time: number) => p.u + p.a * time;
      return {
        curves: [curve("main", "v–t", copper, samples(0, 8, velocity, 17))],
        calc: `৮ s-এ v = ${bnNum(velocity(8), 1)} m/s। সরণ = ${bnNum(p.u * 8 + 0.5 * p.a * 64, 1)} m।`,
      };
    },
  },
  {
    id: "sm-at",
    chapter: "ssc-motion",
    title: "ত্বরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "ত্বরণ",
    xSymbol: "t (s)",
    ySymbol: "a (m/s²)",
    formula: "a = ধ্রুব",
    condition: "সুষম ত্বরণ। লেখ অনুভূমিক। নিচের ক্ষেত্রফল বেগের পরিবর্তন।",
    explain: "ত্বরণ সময়ের সাথে বদলায় না, তাই ঢাল শূন্য। ঋণাত্মক ত্বরণ মানে মন্দন, রেখা সময়-অক্ষের নিচে।",
    meaning: "সুষম ত্বরণের ছবি একটি সমতল রেখা।",
    slope: "ঢাল শূন্য।",
    area: "ক্ষেত্রফল = Δv = at।",
    fillArea: true,
    origin: "y",
    knobs: [knob("a", "ত্বরণ a", -6, 8, 0.5, "m/s²")],
    base: { a: 3 },
    steps: [
      { eq: "সুষম ত্বরণে a স্থির", why: "প্রতি সেকেন্ডে বেগ সমান পরিমাণ বদলায়।" },
      { eq: "a–t লেখ অনুভূমিক", why: "t বদলালে a বদলায় না।", tag: "ধ্রুব" },
      { eq: "ক্ষেত্রফল = at", why: "বেগের পরিবর্তন।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "a–t", copper, samples(0, 8, () => p.a, 12))],
        calc: `৮ s-এ Δv = ${bnNum(p.a * 8, 1)} m/s।`,
      };
    },
  },
  {
    id: "sm-uniform",
    chapter: "ssc-motion",
    title: "সমবেগের গতি",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "s (m)",
    formula: "s = vt",
    condition: "বেগের মান ও দিক দুইই স্থির। আদি সরণ শূন্য। v–t লেখ হলে সেটি অনুভূমিক হত।",
    explain: "সমান সময়ে সমান সরণ। s–t লেখ মূলবিন্দুগামী সরলরেখা, ঢালই বেগ।",
    meaning: "ত্বরণ শূন্য। দূরত্ব ও সরণের মান এখানে সমান, কারণ দিক বদলায় না।",
    slope: "ঢাল = v।",
    area: noArea,
    origin: "both",
    knobs: [knob("v", "বেগ v", 1, 12, 0.5, "m/s")],
    base: { v: 4 },
    steps: [
      { eq: "a = 0", why: "সমবেগ।" },
      { eq: "v = s/t", why: "সরণ সময়ের সমানুপাতিক।" },
      { eq: "s = vt", why: "মূলবিন্দুগামী সরলরেখা। ঢাল v।", tag: "সমানুপাত" },
    ],
    build(p) {
      return {
        curves: [curve("main", "সমবেগ", copper, samples(0, 8, (time) => p.v * time, 17))],
        calc: `ঢাল = ${bnNum(p.v, 1)} m/s। ৮ s-এ সরণ ${bnNum(p.v * 8, 1)} m।`,
      };
    },
  },
  {
    id: "sm-accel",
    chapter: "ssc-motion",
    title: "সুষম ত্বরণ ও সুষম মন্দন",
    source: "book",
    xName: "সময়",
    yName: "বেগ",
    xSymbol: "t (s)",
    ySymbol: "v (m/s)",
    formula: "v = u + at    এবং    v = u − at",
    condition: "দুটি আলাদা গতি। ত্বরণে আদি বেগ ০। মন্দনে আদি বেগ এমন যে একই সময়ে বেগ শূন্য হয়। |a| একই।",
    explain: "ত্বরণে বেগ ওপরে ওঠে, মন্দনে নামে। দুই ঢালের মান সমান, চিহ্ন উল্টো।",
    meaning: "মন্দন ঋণাত্মক ত্বরণ। গতি থামতে সময় লাগে u/|a|।",
    slope: "ত্বরণের ঢাল +a, মন্দনের ঢাল −a।",
    area: "প্রতিটি রেখার নিচের ক্ষেত্রফল সেই গতির সরণ।",
    origin: "both",
    knobs: [knob("a", "ত্বরণের মান |a|", 1, 5, 0.5, "m/s²")],
    base: { a: 2 },
    steps: [
      { eq: "সুষম ত্বরণ: v = at", why: "আদি বেগ শূন্য। ঢাল ধনাত্মক।" },
      { eq: "সুষম মন্দন: v = v₀ − at", why: "বেগ কমে। ঢাল ঋণাত্মক।" },
      { eq: "|ঢাল| সমান", why: "ত্বরণের মান এক, দিক উল্টো।", tag: "রৈখিক" },
    ],
    build(p) {
      const top = p.a * 6;
      return {
        curves: [
          curve("main", "ত্বরণ", copper, samples(0, 6, (time) => p.a * time, 13)),
          curve("retard", "মন্দন", blue, samples(0, 6, (time) => top - p.a * time, 13)),
        ],
        calc: `|a| = ${bnNum(p.a, 1)} m/s²। ৬ s-এ ত্বরণে বেগ ${bnNum(top, 1)} m/s, মন্দনে ০।`,
      };
    },
  },
  {
    id: "sm-fall",
    chapter: "ssc-motion",
    title: "মুক্ত পতনের বেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "বেগ",
    xSymbol: "t (s)",
    ySymbol: "v (m/s)",
    formula: "v = gt",
    condition: "আদি বেগ শূন্য। নিচের দিক ধনাত্মক। বাধাহীন পতন, g = 9.8 m/s²।",
    explain: "বেগ সময়ের সমানুপাতিক। লেখ মূলবিন্দু দিয়ে যায়, ঢাল g।",
    meaning: "প্রতি সেকেন্ডে বেগ 9.8 m/s বাড়ে। ক্ষেত্রফল পতনের দূরত্ব।",
    slope: "ঢাল = g = 9.8 m/s²।",
    area: "ক্ষেত্রফল = ½gt², পতনের দূরত্ব।",
    fillArea: true,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "v = u + gt", why: "নিচের দিকে ত্বরণ g।" },
      { eq: "u = 0  →  v = gt", why: "স্থির থেকে ছাড়া।" },
      { eq: "v ∝ t", why: "মূলবিন্দুগামী সরলরেখা। ঢাল g।", tag: "সমানুপাত" },
    ],
    build() {
      return {
        curves: [curve("main", "মুক্ত পতন", copper, samples(0, 4, (time) => G_ACC * time, 17))],
        calc: `৪ s-এ v = ${bnNum(G_ACC * 4, 1)} m/s। দূরত্ব = ${bnNum(0.5 * G_ACC * 16, 1)} m।`,
      };
    },
  },
  {
    id: "sm-v2s",
    chapter: "ssc-motion",
    title: "বেগের বর্গ–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "বেগের বর্গ",
    xSymbol: "s (m)",
    ySymbol: "v² (m²/s²)",
    formula: "v² = u² + 2as",
    condition: "সুষম ত্বরণ। a ঋণাত্মক হলে বেগ শূন্য হওয়া পর্যন্ত লেখ।",
    explain: "v² সরণের সাথে সরলরেখায় বদলায়। ছেদ u², ঢাল 2a।",
    meaning: "u = 0 হলে রেখা মূলবিন্দু দিয়ে যায়। মন্দনে ঢাল ঋণাত্মক।",
    slope: "ঢাল = 2a।",
    area: noArea,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u", 0, 12, 1, "m/s"), knob("a", "ত্বরণ a", -3, 5, 0.5, "m/s²")],
    base: { u: 4, a: 2 },
    steps: [
      { eq: "v² = u² + 2as", why: "সুষম ত্বরণের তৃতীয় সমীকরণ।" },
      { eq: "u² ধ্রুব", why: "ছেদ।" },
      { eq: "v² ∝ s নয় পুরোপুরি", why: "ঢাল 2a-এর সরলরেখা। u = 0 হলে তবেই মূলবিন্দুগামী।", tag: "রৈখিক" },
    ],
    build(p) {
      const speed2 = (shift: number) => {
        const value = p.u * p.u + 2 * p.a * shift;
        return value >= 0 ? value : Number.NaN;
      };
      return {
        curves: [curve("main", "v²–s", copper, samples(0, 20, speed2, 41))],
        calc: `ছেদ u² = ${bnNum(p.u * p.u, 0)}। ঢাল 2a = ${bnNum(2 * p.a, 1)}।`,
      };
    },
  },
];

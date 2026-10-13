import { bnNum } from "../format";
import { copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const sscForceGraphs: GraphSpec[] = [
  {
    id: "sf-fa",
    chapter: "ssc-force",
    title: "বল–ত্বরণ",
    source: "book",
    xName: "ত্বরণ",
    yName: "বল",
    xSymbol: "a (m/s²)",
    ySymbol: "F (N)",
    formula: "F = ma",
    condition: "ভর স্থির। বল গতির অভিমুখে।",
    explain: "একই ভরে বল ত্বরণের সমানুপাতিক। রেখা মূলবিন্দু দিয়ে যায়, ঢাল ভর।",
    meaning: "নিউটনের দ্বিতীয় সূত্রের সরলরৈখিক রূপ। a = 0 হলে F = 0।",
    slope: "ঢাল = m।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ভর m", 0.5, 8, 0.5, "kg")],
    base: { mass: 2 },
    steps: [
      { eq: "F = ma", why: "নিউটনের দ্বিতীয় সূত্র।" },
      { eq: "m স্থির  →  F ∝ a", why: "বল ত্বরণের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = m", why: "মূলবিন্দুগামী সরলরেখা।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "F–a", copper, samples(0, 8, (accel) => p.mass * accel, 17))],
        calc: `m = ${bnNum(p.mass, 1)} kg। a = 3 m/s²-এ F = ${bnNum(p.mass * 3, 1)} N।`,
      };
    },
  },
  {
    id: "sf-pt",
    chapter: "ssc-force",
    title: "ভরবেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "ভরবেগ",
    xSymbol: "t (s)",
    ySymbol: "p (kg m/s)",
    formula: "p = p₀ + Ft",
    condition: "বল স্থির। ঢাল সেই বল, কারণ F = Δp/Δt।",
    explain: "স্থির বলে ভরবেগ সমান হারে বাড়ে। আদি ভরবেগ শূন্য হলে রেখা মূলবিন্দু দিয়ে যায়।",
    meaning: "ধাক্কা Ft ভরবেগের পরিবর্তন।",
    slope: "ঢাল = F।",
    area: noArea,
    origin: "both",
    knobs: [knob("force", "বল F", 1, 12, 0.5, "N"), knob("p0", "আদি ভরবেগ p₀", 0, 20, 1, "kg m/s")],
    base: { force: 4, p0: 0 },
    steps: [
      { eq: "F = Δp / Δt", why: "বল ভরবেগের পরিবর্তনের হার।" },
      { eq: "F স্থির  →  Δp = Ft", why: "সময়ে সমান বাড়ে।" },
      { eq: "p = p₀ + Ft", why: "ঢাল F। p₀ = 0 হলে মূলবিন্দুগামী।", tag: "রৈখিক" },
    ],
    build(p) {
      return {
        curves: [curve("main", "p–t", copper, samples(0, 8, (time) => p.p0 + p.force * time, 17))],
        calc: `ঢাল = ${bnNum(p.force, 1)} N। ৫ s-এ p = ${bnNum(p.p0 + p.force * 5, 1)} kg m/s।`,
      };
    },
  },
  {
    id: "sf-friction",
    chapter: "ssc-force",
    title: "ঘর্ষণ–অভিলম্ব প্রতিক্রিয়া",
    source: "book",
    xName: "অভিলম্ব প্রতিক্রিয়া",
    yName: "ঘর্ষণ বল",
    xSymbol: "N (N)",
    ySymbol: "f (N)",
    formula: "f = μN",
    condition: "সীমিত ঘর্ষণ বা গতি ঘর্ষণ। μ স্থির। স্থির ঘর্ষণ এর চেয়ে কমও হতে পারে, সেই অঞ্চল এই সরলরেখায় নেই।",
    explain: "ঘর্ষণ অভিলম্ব বলের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল μ।",
    meaning: "ভারী বস্তুতে অভিলম্ব বল বেশি, সীমিত ঘর্ষণও বেশি।",
    slope: "ঢাল = μ।",
    area: noArea,
    origin: "both",
    knobs: [knob("mu", "ঘর্ষণ গুণাঙ্ক μ", 0.1, 0.8, 0.05, "")],
    base: { mu: 0.3 },
    steps: [
      { eq: "f = μN", why: "সীমিত বা গতি ঘর্ষণ।" },
      { eq: "μ স্থির  →  f ∝ N", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = μ", why: "মূলবিন্দুগামী সরলরেখা।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "f–N", copper, samples(0, 40, (normal) => p.mu * normal, 17))],
        calc: `μ = ${bnNum(p.mu, 2)}। N = 20 N হলে f = ${bnNum(p.mu * 20, 1)} N।`,
      };
    },
  },
  {
    id: "sf-spring",
    chapter: "ssc-force",
    title: "স্প্রিংয়ের বল–প্রসারণ",
    source: "book",
    xName: "প্রসারণ",
    yName: "বল",
    xSymbol: "x (cm)",
    ySymbol: "F (N)",
    formula: "F = kx",
    condition: "স্থিতিস্থাপক সীমার ভেতর। x স্বাভাবিক দৈর্ঘ্য থেকে বাড়তি অংশ।",
    explain: "হুকের সূত্র: বল প্রসারণের সমানুপাতিক। ঢাল স্প্রিং ধ্রুবক। সীমার বাইরে এই সরলরেখা থাকে না।",
    meaning: "দ্বিগুণ টানলে দ্বিগুণ বাড়ে, যতক্ষণ স্প্রিং নষ্ট না হয়।",
    slope: "এই অক্ষে ঢাল = k, যেখানে x সেন্টিমিটারে। k নিউটন প্রতি মিটারে দিলে ঢাল = k/100।",
    area: noArea,
    origin: "both",
    knobs: [knob("k", "স্প্রিং ধ্রুবক k", 50, 400, 10, "N/m")],
    base: { k: 200 },
    steps: [
      { eq: "F = kx", why: "হুকের সূত্র। x মিটারে।" },
      { eq: "k স্থির  →  F ∝ x", why: "স্থিতিস্থাপক সীমায় সমানুপাত।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "প্রসারণ শূন্য হলে বল শূন্য।" },
    ],
    build(p) {
      const force = (cm: number) => p.k * (cm / 100);
      return {
        curves: [curve("main", "F–x", copper, samples(0, 12, force, 17))],
        calc: `k = ${bnNum(p.k, 0)} N/m। 5 cm-এ F = ${bnNum(force(5), 1)} N।`,
      };
    },
  },
];

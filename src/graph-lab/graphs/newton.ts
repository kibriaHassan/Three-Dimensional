import { bnNum } from "../format";
import { blue, copper, curve, green, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const newtonGraphs: GraphSpec[] = [
  {
    id: "newton-fa",
    chapter: "newton",
    title: "বল–ত্বরণ, ভর স্থির",
    source: "book",
    xName: "ত্বরণ",
    yName: "নিট বল",
    xSymbol: "a (m/s²)",
    ySymbol: "F (N)",
    formula: "F = ma",
    condition: "ভর ধ্রুব। F নিট বল, ত্বরণের দিকে ধনাত্মক।",
    explain: "ভর না বদলালে বল ও ত্বরণ সরলরেখায় বাড়ে। রেখা মূলবিন্দু দিয়ে যায়: বল শূন্য হলে ত্বরণ শূন্য।",
    meaning: "নিউটনের দ্বিতীয় সূত্রের লেখ। ঢাল থেকে ভর পাওয়া যায়।",
    slope: "ঢাল = ভর m, একক kg।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ভর m", 0.5, 8, 0.1, "kg")],
    base: { mass: 2 },
    build(p) {
      return {
        curves: [curve("main", "F = ma", copper, samples(0, 10, (a) => p.mass * a, 40))],
        calc: `ঢাল = m = ${bnNum(p.mass, 1)} kg। a = 10 m/s² হলে F = ${bnNum(p.mass * 10, 1)} N।`,
      };
    },
  },
  {
    id: "newton-pt",
    chapter: "newton",
    title: "ভরবেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "ভরবেগ",
    xSymbol: "t (s)",
    ySymbol: "p (kg m/s)",
    formula: "p = p₀ + Ft",
    condition: "নিট বল F ধ্রুব। একমাত্রিক। ভর স্থির থাকলে F = ma-এর সঙ্গে মিলে যায়।",
    explain: "ধ্রুব বলে ভরবেগ সময়ের সঙ্গে সরলরেখায় বদলায়। ঢালই নিট বল, কারণ F = Δp/Δt।",
    meaning: "দ্বিতীয় সূত্রের মূল কথা ত্বরণ নয়, ভরবেগের পরিবর্তনের হার।",
    slope: "ঢাল = নিট বল F।",
    area: noArea,
    origin: "both",
    knobs: [knob("p0", "আদি ভরবেগ p₀", -10, 20, 1, "kg m/s"), knob("force", "নিট বল F", -8, 12, 0.5, "N")],
    base: { p0: 4, force: 3 },
    build(p) {
      const time = 6;
      return {
        curves: [curve("main", "p–t", copper, samples(0, time, (t) => p.p0 + p.force * t, 40))],
        calc: `ঢাল = F = ${bnNum(p.force, 1)} N। t = ${bnNum(time, 0)} s-এ p = ${bnNum(p.p0 + p.force * time, 1)} kg m/s।`,
      };
    },
  },
  {
    id: "newton-ft",
    chapter: "newton",
    title: "বল–সময়",
    source: "book",
    xName: "সময়",
    yName: "বল",
    xSymbol: "t (s)",
    ySymbol: "F (N)",
    formula: "J = FΔt = Δp",
    condition: "দেখানো সময়ে বল ধ্রুব। ঘাত বলের সময়-সমাকলন।",
    explain: "ধ্রুব বল সময়-অক্ষের সমান্তরাল। আয়তক্ষেত্রের ক্ষেত্রফল ঘাত, আর ঘাত ভরবেগের পরিবর্তনের সমান।",
    meaning: "অল্প সময়ে বড় বল আর দীর্ঘ সময়ে ছোট বল একই ঘাত দিতে পারে, যদি ক্ষেত্রফল সমান হয়।",
    slope: "ধ্রুব বলের ঢাল শূন্য। ভৌত তথ্য ঢালে নয়, ক্ষেত্রফলে।",
    area: "ক্ষেত্রফল = ঘাত J = Δp, একক N·s।",
    fillArea: true,
    origin: "both",
    knobs: [knob("force", "বল F", 1, 20, 0.5, "N"), knob("time", "সময় Δt", 1, 8, 0.5, "s")],
    base: { force: 6, time: 4 },
    build(p) {
      return {
        curves: [curve("main", "F–t", copper, samples(0, p.time, () => p.force, 20))],
        calc: `ঘাত J = FΔt = ${bnNum(p.force * p.time, 1)} N·s = ভরবেগের পরিবর্তন।`,
      };
    },
  },
  {
    id: "newton-friction",
    chapter: "newton",
    title: "ঘর্ষণ বল–অভিলম্ব প্রতিক্রিয়া",
    source: "book",
    xName: "অভিলম্ব প্রতিক্রিয়া",
    yName: "ঘর্ষণ বল",
    xSymbol: "N (N)",
    ySymbol: "f (N)",
    formula: "fₛ(max) = μₛN,   fₖ = μₖN",
    condition: "শুষ্ক ঘর্ষণ। সীমিত স্থিতিঘর্ষ ও গতিঘর্ষ অভিলম্ব প্রতিক্রিয়ার সমানুপাতিক। সাধারণত μₖ ≤ μₛ।",
    explain: "দুটোই মূলবিন্দু দিয়ে সরলরেখা। ঢাল ঘর্ষণ গুণাঙ্ক। স্থিতিঘর্ষের রেখা সীমার সর্বোচ্চ মান; আসল স্থিতিঘর্ষ তার চেয়ে কম হতে পারে।",
    meaning: "একই চাপে গতিঘর্ষ সাধারণত সীমিত স্থিতিঘর্ষের চেয়ে ছোট। ভর বাড়লে ওজন বাড়ে, N বাড়ে, ঘর্ষণ বাড়ে।",
    slope: "সীমিত স্থিতিঘর্ষের ঢাল μₛ, গতিঘর্ষের ঢাল μₖ।",
    area: noArea,
    origin: "both",
    knobs: [knob("us", "স্থিতিঘর্ষ গুণাঙ্ক μₛ", 0.1, 0.9, 0.05, ""), knob("uk", "গতিঘর্ষ গুণাঙ্ক μₖ", 0.05, 0.8, 0.05, "")],
    base: { us: 0.5, uk: 0.3 },
    build(p) {
      const warn = p.uk > p.us ? " μₖ > μₛ, এই জোড়া সাধারণ উপরিভাগে বাস্তব নয়।" : "";
      return {
        curves: [
          curve("main", "fₛ সর্বোচ্চ", copper, samples(0, 40, (normal) => p.us * normal, 20)),
          curve("kinetic", "fₖ", green, samples(0, 40, (normal) => p.uk * normal, 20)),
        ],
        calc: `μₛ = ${bnNum(p.us, 2)}, μₖ = ${bnNum(p.uk, 2)}। N = 20 N হলে fₛ(max) = ${bnNum(p.us * 20, 1)} N, fₖ = ${bnNum(p.uk * 20, 1)} N।${warn}`,
      };
    },
  },
  {
    id: "newton-centripetal",
    chapter: "newton",
    title: "কেন্দ্রাভিমুখী বল–বেগের বর্গ",
    source: "book",
    xName: "বেগের বর্গ",
    yName: "কেন্দ্রাভিমুখী বল",
    xSymbol: "v² (m²/s²)",
    ySymbol: "F꜀ (N)",
    formula: "F꜀ = mv² / r",
    condition: "সমবৃত্তীয় গতি। ভর m ও ব্যাসার্ধ r ধ্রুব। বল বৃত্তের কেন্দ্রের দিকে।",
    explain: "m ও r স্থির থাকলে F꜀ বনাম v² মূলবিন্দু দিয়ে সরলরেখা। বেগ দ্বিগুণ হলে v² চার গুণ, বলও চার গুণ।",
    meaning: "কেন্দ্রাভিমুখী বল বেগের বর্গের সঙ্গে বাড়ে। ঢাল m/r।",
    slope: "ঢাল = m/r।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ভর m", 0.2, 5, 0.1, "kg"), knob("radius", "ব্যাসার্ধ r", 0.2, 4, 0.1, "m")],
    base: { mass: 1, radius: 2 },
    build(p) {
      const slope = p.mass / p.radius;
      return {
        curves: [curve("main", "F꜀–v²", blue, samples(0, 25, (v2) => slope * v2, 20))],
        calc: `ঢাল = m/r = ${bnNum(slope)} kg/m। v² = 16 m²/s² হলে F꜀ = ${bnNum(slope * 16)} N।`,
      };
    },
  },
];

import { bnNum } from "../format";
import { G_ACC, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const deg = Math.PI / 180;

function projectile(speed: number, angle: number): Point[] {
  const theta = angle * deg;
  const cosine = Math.cos(theta);
  const range = (speed * speed * Math.sin(2 * theta)) / G_ACC;
  const out: Point[] = [];
  const count = 90;
  for (let i = 0; i < count; i++) {
    const x = (range * i) / (count - 1);
    const y = x * Math.tan(theta) - (G_ACC * x * x) / (2 * speed * speed * cosine * cosine);
    if (i > 2 && y < -1e-4) break;
    out.push({ x, y: Math.max(0, y) });
  }
  return out;
}

export const dynamicsGraphs: GraphSpec[] = [
  {
    id: "dynamics-st",
    chapter: "dynamics",
    title: "সরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "s (m)",
    formula: "s = ut + ½at²",
    condition: "একমাত্রিক গতি। t = 0-এ s = 0। ত্বরণ a ধ্রুব। ধনাত্মক দিক আগে থেকে ঠিক করা।",
    explain: "a = 0 হলে লেখ সরলরেখা। a ধ্রুব ও অশূন্য হলে পরাবৃত্ত। যেকোনো মুহূর্তের বেগ সেই বিন্দুর স্পর্শকের ঢাল।",
    meaning: "সরণ–সময় লেখ গতির ধরন চেনায়: সমবেগে সরলরেখা, সমত্বরণে বাঁকা রেখা।",
    slope: "যেকোনো বিন্দুতে ঢাল = সেই মুহূর্তের বেগ, v = u + at।",
    area: noArea,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u", -4, 12, 0.5, "m/s"), knob("a", "ত্বরণ a", -3, 4, 0.1, "m/s²")],
    base: { u: 2, a: 1 },
    build(p) {
      const time = 5;
      return {
        curves: [curve("main", "s–t", copper, samples(0, time, (t) => p.u * t + 0.5 * p.a * t * t))],
        calc: `t = ${bnNum(time, 0)} s-এ s = ${bnNum(p.u * time + 0.5 * p.a * time * time)} m, v = ${bnNum(p.u + p.a * time)} m/s।`,
      };
    },
  },
  {
    id: "dynamics-vt",
    chapter: "dynamics",
    title: "বেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "বেগ",
    xSymbol: "t (s)",
    ySymbol: "v (m/s)",
    formula: "v = u + at",
    condition: "ত্বরণ ধ্রুব। বেগের চিহ্ন দিক বোঝায়।",
    explain: "সমত্বরণে বেগ–সময় লেখ সরলরেখা। ঢাল ত্বরণ। সময়-অক্ষের সঙ্গে ঘেরা ক্ষেত্রফল ওই সময়ে সরণ।",
    meaning: "বেগ বাড়ছে না কমছে, আর কতটা সরণ হলো, দুটোই এই এক লেখ থেকে পড়া যায়।",
    slope: "ঢাল = ত্বরণ a।",
    area: "ক্ষেত্রফল (চিহ্নসহ) = সরণ। রেখা সময়-অক্ষের নিচে নামলে সরণ ঋণাত্মক।",
    fillArea: true,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u", -4, 12, 0.5, "m/s"), knob("a", "ত্বরণ a", -3, 4, 0.1, "m/s²")],
    base: { u: 2, a: 1 },
    build(p) {
      const time = 5;
      const displacement = p.u * time + 0.5 * p.a * time * time;
      return {
        curves: [curve("main", "v–t", copper, samples(0, time, (t) => p.u + p.a * t, 40))],
        calc: `ঢাল a = ${bnNum(p.a, 1)} m/s²। 0 থেকে ${bnNum(time, 0)} s পর্যন্ত ক্ষেত্রফল = সরণ = ${bnNum(displacement)} m।`,
      };
    },
  },
  {
    id: "dynamics-at",
    chapter: "dynamics",
    title: "ত্বরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "ত্বরণ",
    xSymbol: "t (s)",
    ySymbol: "a (m/s²)",
    formula: "a = ধ্রুব",
    condition: "সুষম ত্বরণ। ত্বরণ সময়ের সঙ্গে বদলাচ্ছে না।",
    explain: "ধ্রুব ত্বরণ সময়-অক্ষের সমান্তরাল সরলরেখা। রেখার নিচের ক্ষেত্রফল ওই সময়ে বেগের পরিবর্তন।",
    meaning: "ত্বরণ ধ্রুব কি না, এই লেখ সোজা দেখায়। ক্ষেত্রফল বেগের পরিবর্তন দেয়, বেগ নিজে নয়।",
    slope: "ঢাল শূন্য, কারণ a সময়ের ওপর নির্ভর করছে না।",
    area: "ক্ষেত্রফল = Δv = aΔt।",
    fillArea: true,
    origin: "both",
    knobs: [knob("a", "ত্বরণ a", -4, 6, 0.1, "m/s²")],
    base: { a: 2 },
    build(p) {
      const time = 5;
      return {
        curves: [curve("main", "a–t", copper, samples(0, time, () => p.a, 20))],
        calc: `Δv = aΔt = ${bnNum(p.a * time)} m/s। এটা বেগের পরিবর্তন; আদি বেগ আলাদা করে যোগ করতে হয়।`,
      };
    },
  },
  {
    id: "dynamics-v2s",
    chapter: "dynamics",
    title: "বেগের বর্গ–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "বেগের বর্গ",
    xSymbol: "s (m)",
    ySymbol: "v² (m²/s²)",
    formula: "v² = u² + 2as",
    condition: "সমত্বরণ। v² ঋণাত্মক হতে পারে না, তাই a ঋণাত্মক হলে সরণ u²/(2|a|)-এর বেশি আঁকা হয় না।",
    explain: "v² বনাম s সরলরেখা। ঢাল 2a, অন্তঃখণ্ড u²। ত্বরণ ঋণাত্মক হলে রেখা নেমে শূন্যে থামে।",
    meaning: "সময় না জেনেও বেগ ও সরণের সম্পর্ক এই সমীকরণ। ঢাল থেকে ত্বরণ পাওয়া যায়, কিন্তু ঢাল নিজে a নয়।",
    slope: "ঢাল = 2a। তাই a = ঢাল / 2।",
    area: noArea,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u", 0, 12, 0.5, "m/s"), knob("a", "ত্বরণ a", -3, 4, 0.1, "m/s²")],
    base: { u: 4, a: 2 },
    build(p) {
      const limit = p.a < 0 ? (p.u * p.u) / (2 * Math.abs(p.a)) : 20;
      const points = samples(0, Math.max(limit, 0), (s) => p.u * p.u + 2 * p.a * s, 60).filter((point) => point.y >= -1e-8);
      return {
        curves: [curve("main", "v²–s", copper, points.length > 1 ? points : [{ x: 0, y: Math.max(0, p.u * p.u) }])],
        calc: `ঢাল = 2a = ${bnNum(2 * p.a)} m/s²। a = ${bnNum(p.a, 1)} m/s²। u² = ${bnNum(p.u * p.u)} m²/s²।`,
      };
    },
  },
  {
    id: "dynamics-uniform-v",
    chapter: "dynamics",
    title: "সমবেগে গতি",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "s (m)",
    formula: "s = vt",
    condition: "ত্বরণ শূন্য। বেগের মান ও দিক দুটোই ধ্রুব। t = 0-এ s = 0।",
    explain: "সমবেগে সরণ সময়ের সমানুপাতিক, তাই লেখ মূলবিন্দু দিয়ে সরলরেখা। প্রতি সেকেন্ডে সরণ সমান, সেটাই বেগ।",
    meaning: "সরলরেখা ও ধ্রুব ঢাল সমবেগের চিহ্ন। ঢাল যত বড়, বেগ তত বেশি।",
    slope: "ঢাল = বেগ v।",
    area: noArea,
    origin: "both",
    knobs: [knob("u", "বেগ v", 0, 12, 0.5, "m/s")],
    base: { u: 3 },
    build(p) {
      const time = 5;
      return {
        curves: [curve("main", "সমবেগ", copper, samples(0, time, (t) => p.u * t, 40))],
        calc: `v = ${bnNum(p.u, 1)} m/s। ${bnNum(time, 0)} s-এ সরণ ${bnNum(p.u * time, 1)} m। a = 0।`,
      };
    },
  },
  {
    id: "dynamics-uniform-a",
    chapter: "dynamics",
    title: "সুষম ত্বরণে বেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "বেগ",
    xSymbol: "t (s)",
    ySymbol: "v (m/s)",
    formula: "v = u + at,   a ≠ 0",
    condition: "ত্বরণ ধ্রুব এবং শূন্য নয়। এই কার্ডে a কমপক্ষে 0.5 m/s², যাতে সুষম ত্বরণ স্পষ্ট থাকে।",
    explain: "সুষম ত্বরণে বেগ সময়ের সঙ্গে সরলরেখায় বাড়ে। ঢাল সব জায়গায় একই, সেটাই a। রেখার নিচের ক্ষেত্রফল সরণ।",
    meaning: "ঢাল থেকে ত্বরণ, ক্ষেত্রফল থেকে সরণ। দুটো রাশি এক লেখে আলাদা করে পড়া যায়।",
    slope: "ঢাল = a, সব বিন্দুতে সমান।",
    area: "0 থেকে t পর্যন্ত ক্ষেত্রফল = সরণ = ut + ½at²।",
    fillArea: true,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u", 0, 12, 0.5, "m/s"), knob("a", "ত্বরণ a", 0.5, 6, 0.1, "m/s²")],
    base: { u: 0, a: 2 },
    build(p) {
      const time = 5;
      const displacement = p.u * time + 0.5 * p.a * time * time;
      return {
        curves: [curve("main", "সুষম ত্বরণ", copper, samples(0, time, (t) => p.u + p.a * t, 40))],
        calc: `a = ${bnNum(p.a, 1)} m/s²। t = ${bnNum(time, 0)} s-এ v = ${bnNum(p.u + p.a * time)} m/s, s = ${bnNum(displacement)} m।`,
      };
    },
  },
  {
    id: "dynamics-freefall",
    chapter: "dynamics",
    title: "মুক্তভাবে পড়ন্ত বস্তুর বেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "বেগ",
    xSymbol: "t (s)",
    ySymbol: "v (m/s)",
    formula: "v = u + gt,   g = 9.8 m/s²",
    condition: "বাধাহীন পতন। নিচের দিক ধনাত্মক। g = 9.8 m/s² ধ্রুব। ঋণাত্মক u মানে ওপরের দিকে ছোঁড়া।",
    explain: "মুক্ত পতনে বেগ প্রতি সেকেন্ডে 9.8 m/s করে বাড়ে। লেখের ঢাল g। u = 0 হলে রেখা মূলবিন্দু থেকে ওঠে। ওপরে ছুড়লে বেগ আগে ঋণাত্মক, তারপর শূন্য ছাড়িয়ে ধনাত্মক।",
    meaning: "বাধা না থাকলে ভারী-হালকা নির্বিশেষে বেগের পরিবর্তনের হার একই। ক্ষেত্রফল নিচের দিকে সরণ।",
    slope: "ঢাল = g = 9.8 m/s²।",
    area: "ক্ষেত্রফল = নিচের দিকে সরণ, s = ut + ½gt²।",
    fillArea: true,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u (নিচের দিকে ধনাত্মক)", -15, 20, 0.5, "m/s")],
    base: { u: 0 },
    build(p) {
      const time = 4;
      const displacement = p.u * time + 0.5 * G_ACC * time * time;
      return {
        curves: [curve("main", "মুক্ত পতন", copper, samples(0, time, (t) => p.u + G_ACC * t, 40))],
        calc: `g = ${bnNum(G_ACC, 1)} m/s²। t = ${bnNum(time, 0)} s-এ v = ${bnNum(p.u + G_ACC * time)} m/s, নিচের দিকে সরণ ${bnNum(displacement)} m।`,
      };
    },
  },
  {
    id: "dynamics-projectile",
    chapter: "dynamics",
    title: "প্রক্ষেপকের গতিপথ",
    source: "book",
    xName: "অনুভূমিক দূরত্ব",
    yName: "উচ্চতা",
    xSymbol: "x (m)",
    ySymbol: "y (m)",
    formula: "y = x tanθ − gx² / (2u² cos²θ)",
    condition: "বাধাহীন। g = 9.8 m/s² নিচের দিকে ধ্রুব। নিক্ষেপ ও পতন একই উচ্চতায়। θ আনুভূমিক থেকে।",
    explain: "আনুভূমিক বেগ ধ্রুব, খাড়া বেগ g হারে কমে। পথ পরাবৃত্ত। u বা θ বদলালে পাল্লা ও সর্বোচ্চ উচ্চতা বদলায়। তুলনা চাপলে শুরুর u ও θ-এর পথ ড্যাশ রেখায় থাকে।",
    meaning: "45°-এ একই দ্রুতির পাল্লা সবচেয়ে বড়। সর্বোচ্চ উচ্চতা u² sin²θ / (2g), পাল্লা u² sin2θ / g।",
    slope: "পথের ঢাল = vᵧ / vₓ। চূড়ায় ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("u", "আদি বেগ u", 8, 40, 1, "m/s"), knob("angle", "নিক্ষেপ কোণ θ", 15, 75, 1, "°")],
    base: { u: 20, angle: 45 },
    build(p) {
      const theta = p.angle * deg;
      const range = (p.u * p.u * Math.sin(2 * theta)) / G_ACC;
      const height = (p.u * p.u * Math.sin(theta) * Math.sin(theta)) / (2 * G_ACC);
      return {
        curves: [curve("main", "গতিপথ", copper, projectile(p.u, p.angle))],
        calc: `পাল্লা R = ${bnNum(range, 1)} m। সর্বোচ্চ উচ্চতা H = ${bnNum(height, 1)} m। g = ${bnNum(G_ACC, 1)} m/s²।`,
      };
    },
  },
];

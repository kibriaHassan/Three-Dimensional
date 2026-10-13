import { bnNum } from "../format";
import { blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const sign = "নতুন কার্তেসীয় চিহ্ন: আলো বাঁ থেকে ডানে। বস্তু বাঁয়ে, তাই u ঋণাত্মক। দূরত্ব সেন্টিমিটারে।";

function lensV(focal: number, object: number) {
  const inverse = 1 / focal + 1 / object;
  if (Math.abs(inverse) < 1e-6) return Number.NaN;
  return 1 / inverse;
}

function mirrorV(focal: number, object: number) {
  const inverse = 1 / focal - 1 / object;
  if (Math.abs(inverse) < 1e-6) return Number.NaN;
  return 1 / inverse;
}

function branch(focal: number, map: (object: number) => number, ranges: [number, number][]): Point[] {
  return ranges.flatMap(([start, end]) => samples(start, end, map, 48).filter((point) => Math.abs(point.y) < Math.abs(focal) * 12));
}

export const geoGraphs: GraphSpec[] = [
  {
    id: "go-lens-uv",
    chapter: "geo-optics",
    title: "লেন্সে বস্তু দূরত্ব–প্রতিবিম্ব দূরত্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "প্রতিবিম্ব দূরত্ব",
    xSymbol: "u (cm)",
    ySymbol: "v (cm)",
    formula: "1/v − 1/u = 1/f",
    condition: `${sign} উত্তল লেন্সে f ধনাত্মক। u = −f-এ প্রতিবিম্ব অসীমে, তাই সেখানে লেখ ভাঙা।`,
    explain: "ফোকাসের বাইরে বাস্তব উল্টো প্রতিবিম্ব, v ধনাত্মক। ফোকাসের ভেতরে অবাস্তব সোজা প্রতিবিম্ব, v ঋণাত্মক।",
    meaning: "u = −2f হলে v = +2f, বিবর্ধন −1।",
    slope: "ঢাল ধ্রুব নয়। u = −2f-এর কাছে প্রতিবিম্ব দ্রুত সরে।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাস দূরত্ব f", 10, 30, 1, "cm")],
    base: { focal: 20 },
    steps: [
      { eq: "1/v − 1/u = 1/f", why: "পাতলা লেন্সের সূত্র।" },
      { eq: "1/v = 1/f + 1/u", why: "u ও f জানা থাকলে v বের হয়।" },
      { eq: "u → −f হলে v → ∞", why: "হর শূন্যের দিকে। তাই লেখ দুই শাখায় ভাঙে।" },
    ],
    build(p) {
      const f = p.focal;
      const points = branch(f, (object) => lensV(f, object), [[-5 * f, -1.08 * f], [-0.92 * f, -0.25 * f]]);
      return {
        curves: [curve("main", "উত্তল লেন্স", copper, points)],
        guides: [{ x: -f, label: "u = −f" }],
        calc: `f = ${bnNum(f, 0)} cm। u = ${bnNum(-2 * f, 0)} cm হলে v = ${bnNum(lensV(f, -2 * f), 1)} cm।`,
      };
    },
  },
  {
    id: "go-mirror-uv",
    chapter: "geo-optics",
    title: "দর্পণে বস্তু দূরত্ব–প্রতিবিম্ব দূরত্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "প্রতিবিম্ব দূরত্ব",
    xSymbol: "u (cm)",
    ySymbol: "v (cm)",
    formula: "1/v + 1/u = 1/f",
    condition: `${sign} অবতল দর্পণে f ঋণাত্মক। স্লাইডার ফোকাসের মান দেয়, সূত্রে চিহ্ন বসানো হয়।`,
    explain: "অবতল দর্পণে ফোকাসের বাইরে বাস্তব প্রতিবিম্ব দর্পণের সামনে, v ঋণাত্মক। ফোকাসের ভেতরে অবাস্তব প্রতিবিম্ব পেছনে।",
    meaning: "লেন্সের সূত্রে বিয়োগ, দর্পণে যোগ। চিহ্ন না মিললে উত্তর উল্টো হয়।",
    slope: "ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাসের মান |f|", 10, 30, 1, "cm")],
    base: { focal: 20 },
    steps: [
      { eq: "1/v + 1/u = 1/f", why: "গোলীয় দর্পণের সূত্র।" },
      { eq: "f < 0 অবতলে", why: "কার্তেসীয় চিহ্নে সামনের ফোকাস ঋণাত্মক।" },
      { eq: "u = −2|f| হলে v = u", why: "বক্রতার কেন্দ্রে বস্তু থাকলে প্রতিবিম্ব সেখানেই, উল্টো।" },
    ],
    build(p) {
      const f = -p.focal;
      const points = branch(f, (object) => mirrorV(f, object), [[5 * f, 1.08 * f], [0.92 * f, 0.25 * f]]);
      return {
        curves: [curve("main", "অবতল দর্পণ", copper, points)],
        guides: [{ x: f, label: "u = f" }],
        calc: `|f| = ${bnNum(p.focal, 0)} cm। u = ${bnNum(2 * f, 0)} cm হলে v = ${bnNum(mirrorV(f, 2 * f), 1)} cm।`,
      };
    },
  },
  {
    id: "go-mag",
    chapter: "geo-optics",
    title: "বিবর্ধন–বস্তু দূরত্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "রৈখিক বিবর্ধন",
    xSymbol: "u (cm)",
    ySymbol: "m",
    formula: "m = v / u",
    condition: `${sign} উত্তল লেন্স। ঋণাত্মক m মানে উল্টো।`,
    explain: "ফোকাসের বাইরে m ঋণাত্মক। |u| কমতে থাকলে |m| বাড়ে। ফোকাসের ভেতরে m ধনাত্মক, প্রতিবিম্ব সোজা।",
    meaning: "u = −2f-এ m = −1। দূরের বস্তুতে |m| ছোট।",
    slope: "ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাস দূরত্ব f", 10, 30, 1, "cm")],
    base: { focal: 20 },
    steps: [
      { eq: "1/v = 1/f + 1/u", why: "আগে প্রতিবিম্বের জায়গা।" },
      { eq: "m = v / u", why: "রৈখিক বিবর্ধন। কার্তেসীয় চিহ্নে এই ভাগই।" },
      { eq: "u = −2f → m = −1", why: "সমআকার উল্টো। |u| কমা মানে |m| বাড়া, সরলরেখা নয়।" },
    ],
    build(p) {
      const f = p.focal;
      const points = branch(f, (object) => lensV(f, object) / object, [[-5 * f, -1.08 * f], [-0.92 * f, -0.3 * f]]);
      return {
        curves: [curve("main", "m–u", copper, points)],
        guides: [{ x: -2 * f, label: "−2f" }],
        calc: `u = ${bnNum(-2 * f, 0)} cm-এ m = ${bnNum(lensV(f, -2 * f) / (-2 * f), 2)}।`,
      };
    },
  },
  {
    id: "go-mu",
    chapter: "geo-optics",
    title: "প্রতিসরাঙ্ক–আপতন কোণ",
    source: "book",
    xName: "আপতন কোণ",
    yName: "প্রতিসরাঙ্ক",
    xSymbol: "i (°)",
    ySymbol: "μ",
    formula: "μ = sin i / sin r",
    condition: "এক জোড়া মাধ্যম, এক রঙ। i ক্রান্তি কোণের নিচে, যাতে প্রতিসরণ থাকে।",
    explain: "স্নেলের সূত্রে sin i / sin r ধ্রুব। আপতন কোণ বদলালেও μ বদলায় না। লেখ অনুভূমিক।",
    meaning: "μ মাধ্যমের ধর্ম, কোণের নয়। কোণ বদলে μ বদলালে মাপা ভুল বা ভিন্ন রঙ।",
    slope: "ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("mu", "প্রতিসরাঙ্ক μ", 1.3, 1.8, 0.05, "")],
    base: { mu: 1.5 },
    steps: [
      { eq: "n₁ sin i = n₂ sin r", why: "স্নেলের সূত্র।" },
      { eq: "μ = n₂/n₁ = sin i / sin r", why: "বায়ু থেকে মাধ্যমে আপতনে এই ভাগ।" },
      { eq: "μ ∝ i নয়", why: "i বদলালে r এমন বদলায় যে ভাগ একই থাকে।", tag: "ধ্রুব" },
    ],
    build(p) {
      return {
        curves: [curve("main", "μ", copper, samples(0, 70, () => p.mu, 12))],
        calc: `μ = ${bnNum(p.mu, 2)}। 40°-এ sin r = sin 40° / μ, r = ${bnNum((Math.asin(Math.sin((40 * Math.PI) / 180) / p.mu) * 180) / Math.PI, 1)}°।`,
      };
    },
  },
  {
    id: "go-ir",
    chapter: "geo-optics",
    title: "আপতন কোণ–প্রতিসরণ কোণ",
    source: "book",
    xName: "আপতন কোণ",
    yName: "প্রতিসরণ কোণ",
    xSymbol: "i (°)",
    ySymbol: "r (°)",
    formula: "sin r = sin i / μ",
    condition: "বায়ু থেকে কাচে। μ > 1, তাই r < i। ড্যাশ রেখা r = i, যদি না বাঁকত।",
    explain: "ঘন মাধ্যমে আলো অভিলম্বের দিকে বাঁকে। কোণ ছোট থাকলে r ≈ i/μ, বড় কোণে সাইন সূত্র, সরলরেখা নয়।",
    meaning: "i = 0 হলে r = 0। কোণ বাড়লে পার্থক্য i − r বাড়ে।",
    slope: "ছোট কোণে ঢাল ≈ 1/μ।",
    area: noArea,
    origin: "both",
    knobs: [knob("mu", "প্রতিসরাঙ্ক μ", 1.3, 1.8, 0.05, "")],
    base: { mu: 1.5 },
    steps: [
      { eq: "sin i = μ sin r", why: "বায়ু (n ≈ 1) থেকে মাধ্যমে।" },
      { eq: "r = arcsin(sin i / μ)", why: "μ > 1, তাই r < i।" },
      { eq: "ছোট কোণে r ≈ i/μ", why: "তখন প্রায় সমানুপাত। বড় কোণে সাইন, রেখা বেঁকে।", tag: "সমানুপাত" },
    ],
    build(p) {
      const refract = (angle: number) => (Math.asin(Math.sin((angle * Math.PI) / 180) / p.mu) * 180) / Math.PI;
      return {
        curves: [
          curve("main", "r", copper, samples(0, 80, refract, 80)),
          curve("equal", "r = i", blue, samples(0, 80, (angle) => angle, 20), { dashed: true }),
        ],
        calc: `μ = ${bnNum(p.mu, 2)}। i = 45°-এ r = ${bnNum(refract(45), 1)}°।`,
      };
    },
  },
  {
    id: "go-prism",
    chapter: "geo-optics",
    title: "প্রিজমে আপতন–বিচ্যুতি",
    source: "book",
    xName: "আপতন কোণ",
    yName: "বিচ্যুতি",
    xSymbol: "i (°)",
    ySymbol: "δ (°)",
    formula: "δ = i + e − A",
    condition: "প্রতিসম প্রিজম। r₁ + r₂ = A। যেখানে প্রতিসরণ সম্ভব শুধু সেই i।",
    explain: "বিচ্যুতি আগে কমে, একটি কোণে সর্বনিম্ন, তারপর বাড়ে। সরলরেখা নয়।",
    meaning: "ন্যূনতম বিচ্যুতিতে i = e। পরের লেখে সেই বিন্দু থেকে μ।",
    slope: "ন্যূনতমে ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("angle", "প্রিজম কোণ A", 40, 70, 2, "°"), knob("mu", "প্রতিসরাঙ্ক μ", 1.4, 1.7, 0.02, "")],
    base: { angle: 60, mu: 1.5 },
    steps: [
      { eq: "r₁ + r₂ = A", why: "প্রিজমের ভেতরে দুই প্রতিসরণ কোণের যোগ প্রিজম কোণ।" },
      { eq: "δ = i + e − A", why: "বাইরের দুই কোণ থেকে প্রিজম কোণ বাদ।" },
      { eq: "একটি i-তে δ সর্বনিম্ন", why: "সেখানে i = e। δ, i-এর সমানুপাতিক নয়।" },
    ],
    build(p) {
      const apex = (p.angle * Math.PI) / 180;
      const deviate = (degree: number) => {
        const incident = (degree * Math.PI) / 180;
        const sine = Math.sin(incident) / p.mu;
        if (sine <= 0 || sine >= 1) return Number.NaN;
        const r1 = Math.asin(sine);
        const r2 = apex - r1;
        if (r2 <= 0 || p.mu * Math.sin(r2) >= 1) return Number.NaN;
        const emerge = Math.asin(p.mu * Math.sin(r2));
        return ((incident + emerge) * 180) / Math.PI - p.angle;
      };
      return {
        curves: [curve("main", "δ–i", copper, samples(20, 85, deviate, 140))],
        calc: `A = ${bnNum(p.angle, 0)}°, μ = ${bnNum(p.mu, 2)}। ন্যূনতম বিচ্যুতির কাছে i = e।`,
      };
    },
  },
  {
    id: "go-minimum",
    chapter: "geo-optics",
    title: "প্রিজমের ন্যূনতম বিচ্যুতি",
    source: "book",
    xName: "আপতন কোণ",
    yName: "বিচ্যুতি",
    xSymbol: "i (°)",
    ySymbol: "δ (°)",
    formula: "μ = sin((A + δₘ)/2) / sin(A/2)",
    condition: "ন্যূনতমে i = e এবং r = A/2। গাইড সেই আপতন কোণে।",
    explain: "বক্ররেখার সবচেয়ে নিচু বিন্দু δₘ। সেখান থেকে মাধ্যমের μ বের হয়।",
    meaning: "i বাড়ালে বা কমালে δ বাড়ে। পরীক্ষায় কাঁটা উল্টে একই δ দুইবার পাওয়া যায়, মাঝখানে ন্যূনতম।",
    slope: "δₘ-এ ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("angle", "প্রিজম কোণ A", 40, 70, 2, "°"), knob("mu", "প্রতিসরাঙ্ক μ", 1.4, 1.7, 0.02, "")],
    base: { angle: 60, mu: 1.5 },
    steps: [
      { eq: "ন্যূনতমে i = e", why: "প্রিজম প্রতিসমভাবে আলো ভাঙে।" },
      { eq: "r = A/2", why: "দুই প্রতিসরণ কোণ সমান।" },
      { eq: "μ = sin((A+δₘ)/2) / sin(A/2)", why: "স্নেল থেকে। δₘ মেপে μ পাওয়া যায়।" },
    ],
    build(p) {
      const apex = (p.angle * Math.PI) / 180;
      const deltaM = (2 * Math.asin(p.mu * Math.sin(apex / 2)) * 180) / Math.PI - p.angle;
      const iMin = (p.angle + deltaM) / 2;
      const deviate = (degree: number) => {
        const incident = (degree * Math.PI) / 180;
        const sine = Math.sin(incident) / p.mu;
        if (sine <= 0 || sine >= 1) return Number.NaN;
        const r1 = Math.asin(sine);
        const r2 = apex - r1;
        if (r2 <= 0 || p.mu * Math.sin(r2) >= 1) return Number.NaN;
        const emerge = Math.asin(p.mu * Math.sin(r2));
        return ((incident + emerge) * 180) / Math.PI - p.angle;
      };
      const fromFormula = Math.sin(((p.angle + deltaM) * Math.PI) / 360) / Math.sin(apex / 2);
      return {
        curves: [curve("main", "δ–i", copper, samples(20, 85, deviate, 140))],
        guides: [{ x: iMin, label: "δₘ" }],
        calc: `δₘ = ${bnNum(deltaM, 2)}°, i = ${bnNum(iMin, 2)}°। সূত্র থেকে μ = ${bnNum(fromFormula, 3)}।`,
      };
    },
  },
  {
    id: "go-lenses",
    chapter: "geo-optics",
    title: "উত্তল ও অবতল লেন্সের প্রতিবিম্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "প্রতিবিম্ব দূরত্ব",
    xSymbol: "u (cm)",
    ySymbol: "v (cm)",
    formula: "1/v − 1/u = 1/f",
    condition: `${sign} একই |f|। উত্তলের f ধনাত্মক, অবতলের ঋণাত্মক।`,
    explain: "অবতল লেন্সে বাস্তব বস্তুর প্রতিবিম্ব সব সময় অবাস্তব, সোজা, লেন্সের দিকে। v ঋণাত্মকই থাকে। উত্তলের লেখ ফোকাসে ভাঙে।",
    meaning: "অবতল লেন্স অপসারী। উত্তল লেন্স ফোকাসের বাইরে অভিসারী।",
    slope: "দুই লেখের ঢাল আলাদা।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাসের মান |f|", 10, 30, 1, "cm")],
    base: { focal: 20 },
    steps: [
      { eq: "1/v = 1/f + 1/u", why: "একই লেন্স সূত্র, f-এর চিহ্ন আলাদা।" },
      { eq: "উত্তল: f > 0", why: "u < −f হলে v > 0, বাস্তব প্রতিবিম্ব।" },
      { eq: "অবতল: f < 0", why: "বাস্তব বস্তুতে v সব সময় ঋণাত্মক। অবাস্তব প্রতিবিম্ব।" },
    ],
    build(p) {
      const f = p.focal;
      const convex = branch(f, (object) => lensV(f, object), [[-4 * f, -1.1 * f], [-0.9 * f, -0.3 * f]]);
      const concave = samples(-4 * f, -0.3 * f, (object) => lensV(-f, object), 80);
      return {
        curves: [
          curve("main", "উত্তল", copper, convex),
          curve("concave", "অবতল", blue, concave),
        ],
        calc: `u = ${bnNum(-2 * f, 0)} cm। উত্তলে v = ${bnNum(lensV(f, -2 * f), 1)} cm, অবতলে v = ${bnNum(lensV(-f, -2 * f), 1)} cm।`,
      };
    },
  },
  {
    id: "go-power",
    chapter: "geo-optics",
    title: "লেন্সের ক্ষমতা–ফোকাস দূরত্ব",
    source: "book",
    xName: "ফোকাস দূরত্ব",
    yName: "ক্ষমতা",
    xSymbol: "f (m)",
    ySymbol: "P (D)",
    formula: "P = 1/f",
    condition: "f মিটারে, P ডায়প্টারে। f = 0 সম্ভব নয়, তাই শূন্যের দুই পাশ আলাদা।",
    explain: "ক্ষমতা ফোকাস দূরত্বের ব্যাস্তানুপাতিক। উত্তল লেন্সের ক্ষমতা ধনাত্মক, অবতলের ঋণাত্মক।",
    meaning: "কাছাকাছি ফোকাস মানে বেশি ক্ষমতা। +2 D মানে f = 0.5 m।",
    slope: "ঢাল = −1/f²।",
    area: noArea,
    origin: "y",
    knobs: [],
    base: {},
    steps: [
      { eq: "P = 1/f", why: "ফোকাস দূরত্ব মিটারে।" },
      { eq: "P ∝ 1/f", why: "ব্যাস্তানুপাত। f দ্বিগুণ হলে ক্ষমতা অর্ধেক।", tag: "ব্যাস্তানুপাত" },
      { eq: "চিহ্ন ফোকাসের চিহ্ন", why: "উত্তল ধনাত্মক, অবতল ঋণাত্মক।" },
    ],
    build() {
      return {
        curves: [
          curve("main", "উত্তল", copper, samples(0.1, 1, (focal) => 1 / focal, 40)),
          curve("neg", "অবতল", blue, samples(-1, -0.1, (focal) => 1 / focal, 40)),
        ],
        calc: "f = 0.5 m হলে P = 2 D। f = −0.5 m হলে P = −2 D।",
      };
    },
  },
  {
    id: "go-tir",
    chapter: "geo-optics",
    title: "পূর্ণ অভ্যন্তরীণ প্রতিফলন",
    source: "book",
    xName: "আপতন কোণ",
    yName: "প্রতিসরণ কোণ",
    xSymbol: "i (°)",
    ySymbol: "r (°)",
    formula: "sin i꜀ = 1/μ",
    condition: "কাচ থেকে বায়ু। i ক্রান্তি কোণের কম থাকলে প্রতিসরণ আছে। i = i꜀ হলে r = 90°। তার পর প্রতিসৃত রশ্মি নেই।",
    explain: "i বাড়লে r আরও দ্রুত বাড়ে এবং 90°-এ থেমে যায়। তার পরের কোণে এই বক্ররেখা আঁকা হয় না, আলো সম্পূর্ণ ফেরে।",
    meaning: "আলোক তন্তু ও মরীচিকা এই সীমা ব্যবহার করে।",
    slope: "i꜀-এর কাছে ঢাল খুব বড়।",
    area: noArea,
    origin: "both",
    knobs: [knob("mu", "কাচের μ", 1.4, 1.8, 0.05, "")],
    base: { mu: 1.5 },
    steps: [
      { eq: "μ sin i = sin r", why: "ঘন থেকে লঘুতে। বায়ুর n ≈ 1।" },
      { eq: "r = 90° হলে sin i꜀ = 1/μ", why: "প্রতিসৃত রশ্মি তল ঘেঁষে।" },
      { eq: "i > i꜀ হলে প্রতিসরণ নেই", why: "sin r > 1 হত, বাস্তব কোণ নয়। পূর্ণ প্রতিফলন।", tag: "সীমা" },
    ],
    build(p) {
      const critical = (Math.asin(1 / p.mu) * 180) / Math.PI;
      const refract = (angle: number) => {
        const sine = p.mu * Math.sin((angle * Math.PI) / 180);
        if (sine >= 1) return Number.NaN;
        return (Math.asin(sine) * 180) / Math.PI;
      };
      return {
        curves: [curve("main", "কাচ → বায়ু", copper, samples(0, critical - 0.2, refract, 80))],
        guides: [{ x: critical, label: "i꜀" }],
        calc: `i꜀ = ${bnNum(critical, 2)}°। এর বেশি আপতনে প্রতিসরণ কোণ নেই।`,
      };
    },
  },
];

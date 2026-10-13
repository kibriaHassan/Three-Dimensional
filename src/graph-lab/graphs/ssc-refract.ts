import { bnNum } from "../format";
import { blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const sign = "নতুন কার্তেসীয় চিহ্ন: আলো বাঁ থেকে ডানে। বস্তু বাঁয়ে, তাই u ঋণাত্মক। দূরত্ব সেন্টিমিটারে।";

function lensV(focal: number, object: number) {
  const inverse = 1 / focal + 1 / object;
  if (Math.abs(inverse) < 1e-6) return Number.NaN;
  return 1 / inverse;
}

function branch(focal: number, map: (object: number) => number, ranges: [number, number][]): Point[] {
  return ranges.flatMap(([start, end]) => samples(start, end, map, 48).filter((point) => Math.abs(point.y) < Math.abs(focal) * 12));
}

export const sscRefractGraphs: GraphSpec[] = [
  {
    id: "sn-ir",
    chapter: "ssc-refract",
    title: "আপতন কোণ–প্রতিসরণ কোণ",
    source: "book",
    xName: "আপতন কোণ",
    yName: "প্রতিসরণ কোণ",
    xSymbol: "i (°)",
    ySymbol: "r (°)",
    formula: "sin r = sin i / μ",
    condition: "বায়ু থেকে কাচে। μ > 1, তাই r < i। ড্যাশ রেখা r = i।",
    explain: "ঘন মাধ্যমে আলো অভিলম্বের দিকে বাঁকে। ছোট কোণে প্রায় সরল, বড় কোণে সাইন সূত্র স্পষ্ট।",
    meaning: "i = 0 হলে r = 0। লম্ব রশ্মি বেঁকে না।",
    slope: "ছোট কোণে ঢাল ≈ 1/μ।",
    area: noArea,
    origin: "both",
    knobs: [knob("mu", "প্রতিসরাঙ্ক μ", 1.3, 1.8, 0.05, "")],
    base: { mu: 1.5 },
    steps: [
      { eq: "sin i / sin r = μ", why: "বায়ু থেকে মাধ্যমে স্নেলের সূত্র।" },
      { eq: "r = sin⁻¹(sin i / μ)", why: "μ > 1 বলে r < i।" },
      { eq: "লেখ পুরোপুরি সোজা নয়", why: "কোণের সাইন রৈখিক নয়।" },
    ],
    build(p) {
      const refraction = (angle: number) => (Math.asin(Math.sin((angle * Math.PI) / 180) / p.mu) * 180) / Math.PI;
      return {
        curves: [
          curve("main", "r", copper, samples(0, 80, refraction, 40)),
          curve("equal", "r = i", blue, samples(0, 80, (angle) => angle, 16), { dashed: true }),
        ],
        calc: `μ = ${bnNum(p.mu, 2)}। i = 45° হলে r = ${bnNum(refraction(45), 1)}°।`,
      };
    },
  },
  {
    id: "sn-sini",
    chapter: "ssc-refract",
    title: "sin i–sin r",
    source: "book",
    xName: "প্রতিসরণ কোণের সাইন",
    yName: "আপতন কোণের সাইন",
    xSymbol: "sin r",
    ySymbol: "sin i",
    formula: "sin i = μ sin r",
    condition: "বায়ু থেকে একই মাধ্যমে। i ক্রান্তি কোণের আলোচনা এখানে নেই, r এমন যে sin i ≤ 1।",
    explain: "সাইন দুটির লেখ সরলরেখা। ঢাল প্রতিসরাঙ্ক। কোণের লেখ বাঁকা হলেও সাইনের লেখ সোজা।",
    meaning: "μ = ঢাল। কাচের জন্য প্রায় 1.5।",
    slope: "ঢাল = μ।",
    area: noArea,
    origin: "both",
    knobs: [knob("mu", "প্রতিসরাঙ্ক μ", 1.3, 1.8, 0.05, "")],
    base: { mu: 1.5 },
    steps: [
      { eq: "sin i / sin r = μ", why: "স্নেলের সূত্র।" },
      { eq: "sin i = μ sin r", why: "y = μx।" },
      { eq: "ঢাল = μ", why: "মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const limit = 1 / p.mu;
      return {
        curves: [curve("main", "sin i–sin r", copper, samples(0, limit * 0.98, (sine) => p.mu * sine, 20))],
        calc: `ঢাল μ = ${bnNum(p.mu, 2)}। sin r = 0.5 হলে sin i = ${bnNum(p.mu * 0.5, 2)}।`,
      };
    },
  },
  {
    id: "sn-uv",
    chapter: "ssc-refract",
    title: "উত্তল লেন্সে বস্তু–প্রতিবিম্ব দূরত্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "প্রতিবিম্ব দূরত্ব",
    xSymbol: "u (cm)",
    ySymbol: "v (cm)",
    formula: "1/v − 1/u = 1/f",
    condition: `${sign} উত্তল লেন্সে f ধনাত্মক। u = −f-এ প্রতিবিম্ব অসীমে।`,
    explain: "ফোকাসের বাইরে বাস্তব উল্টো প্রতিবিম্ব, v ধনাত্মক। ফোকাসের ভেতরে অবাস্তব সোজা প্রতিবিম্ব, v ঋণাত্মক।",
    meaning: "u = −2f হলে v = +2f।",
    slope: "ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাস দূরত্ব f", 10, 30, 1, "cm")],
    base: { focal: 15 },
    steps: [
      { eq: "1/v − 1/u = 1/f", why: "পাতলা লেন্সের সূত্র।" },
      { eq: "f > 0 উত্তলে", why: "অভিসারী লেন্স।" },
      { eq: "1/v = 1/f + 1/u", why: "u = −f হলে হর শূন্য, v অসীম।" },
    ],
    build(p) {
      const f = p.focal;
      return {
        curves: [curve("main", "উত্তল লেন্স", copper, branch(f, (object) => lensV(f, object), [[-5 * f, -1.08 * f], [-0.92 * f, -0.25 * f]]))],
        guides: [{ x: -f, label: "u = −f" }],
        calc: `f = ${bnNum(f, 0)} cm। u = ${bnNum(-2 * f, 0)} cm হলে v = ${bnNum(lensV(f, -2 * f), 1)} cm।`,
      };
    },
  },
  {
    id: "sn-mag",
    chapter: "ssc-refract",
    title: "বিবর্ধন–বস্তু দূরত্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "রৈখিক বিবর্ধন",
    xSymbol: "u (cm)",
    ySymbol: "m",
    formula: "m = v/u",
    condition: `${sign} উত্তল লেন্স। ঋণাত্মক m উল্টো।`,
    explain: "ফোকাসের বাইরে m ঋণাত্মক। u = −2f-এ m = −1। ফোকাসের ভেতরে m ধনাত্মক, প্রতিবিম্ব সোজা।",
    meaning: "দূরের বস্তুতে |m| ছোট। ফোকাসের কাছে |m| বড়।",
    slope: "ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাস দূরত্ব f", 10, 30, 1, "cm")],
    base: { focal: 15 },
    steps: [
      { eq: "1/v = 1/f + 1/u", why: "লেন্স সূত্র।" },
      { eq: "m = v/u", why: "রৈখিক বিবর্ধন।" },
      { eq: "u = −2f → m = −1", why: "সমআকার উল্টো।" },
    ],
    build(p) {
      const f = p.focal;
      const magnify = (object: number) => lensV(f, object) / object;
      return {
        curves: [curve("main", "m–u", copper, branch(f, magnify, [[-5 * f, -1.08 * f], [-0.92 * f, -0.3 * f]]))],
        guides: [{ x: -2 * f, label: "−2f" }],
        calc: `u = ${bnNum(-2 * f, 0)} cm-এ m = ${bnNum(magnify(-2 * f), 2)}।`,
      };
    },
  },
  {
    id: "sn-power",
    chapter: "ssc-refract",
    title: "লেন্সের ক্ষমতা–ফোকাস দূরত্ব",
    source: "book",
    xName: "ফোকাস দূরত্ব",
    yName: "ক্ষমতা",
    xSymbol: "f (m)",
    ySymbol: "P (D)",
    formula: "P = 1/f",
    condition: "f মিটারে, P ডায়প্টারে। f = 0 সম্ভব নয়।",
    explain: "ক্ষমতা ফোকাস দূরত্বের ব্যাস্তানুপাতিক। উত্তল লেন্সের ক্ষমতা ধনাত্মক, অবতলের ঋণাত্মক।",
    meaning: "+2 D মানে f = 0.5 m। কাছাকাছি ফোকাস মানে বেশি ক্ষমতা।",
    slope: "ঢাল = −1/f²।",
    area: noArea,
    origin: "y",
    knobs: [],
    base: {},
    steps: [
      { eq: "P = 1/f", why: "ফোকাস দূরত্ব মিটারে।" },
      { eq: "P ∝ 1/f", why: "ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
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
];

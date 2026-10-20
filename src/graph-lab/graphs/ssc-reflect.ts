import { bnNum } from "../format";
import { copper, curve, knob, noArea, samples } from "../curves";
import type { ConcavePlace, GraphSpec, Point, RayVerdict } from "../types";

const mirrorOpen = "মনে করি MOM′ একটি অবতল দর্পণ। XX′ প্রধান অক্ষ। P দর্পণের মেরু, F ফোকাস এবং C বক্রতার কেন্দ্র। F, PC-এর মধ্যবিন্দু।";

function rayDiagram(place: ConcavePlace, title: string, explain: string, verdict: RayVerdict): GraphSpec {
  return {
    id: `sr-ray-${place}`,
    chapter: "ssc-reflect",
    title,
    source: "schematic",
    xName: "প্রধান অক্ষ",
    yName: "অবতল দর্পণ",
    xSymbol: "XX′",
    ySymbol: "P",
    formula: "1/v + 1/u = 1/f",
    condition: "অবতল দর্পণ। P মেরু, F ফোকাস, C বক্রতার কেন্দ্র।",
    explain,
    meaning: `${verdict.position}। ${verdict.shape}। ${verdict.nature}।`,
    slope: "",
    area: noArea,
    knobs: [],
    base: {},
    ray: place,
    verdict,
    build: () => ({ curves: [], calc: verdict.position }),
  };
}

const sign = "নতুন কার্তেসীয় চিহ্ন: আলো বাঁ থেকে ডানে। বস্তু বাঁয়ে, তাই u ঋণাত্মক। দূরত্ব সেন্টিমিটারে।";

function mirrorV(focal: number, object: number) {
  const inverse = 1 / focal - 1 / object;
  if (Math.abs(inverse) < 1e-6) return Number.NaN;
  return 1 / inverse;
}

function branch(focal: number, map: (object: number) => number, ranges: [number, number][]): Point[] {
  return ranges.flatMap(([start, end]) => samples(start, end, map, 48).filter((point) => Math.abs(point.y) < Math.abs(focal) * 12));
}

export const sscReflectGraphs: GraphSpec[] = [
  rayDiagram(
    "infinity",
    "অবতল দর্পণ: বস্তু অসীমে",
    `${mirrorOpen} লক্ষ্যবস্তু অসীমে। তাই আলো প্রধান অক্ষের সমান্তরালে এসে দর্পণে পড়ে। প্রতিফলিত রশ্মি ফোকাস F দিয়ে যায়। রশ্মিগুলি F বিন্দুতে মিলিত হয়। এই বিন্দুই প্রতিবিম্ব।`,
    { position: "ফোকাস F-এ", shape: "অতি খর্ব, উল্টো", nature: "বাস্তব" },
  ),
  rayDiagram(
    "beyond",
    "অবতল দর্পণ: কেন্দ্রের বাইরে",
    `${mirrorOpen} লক্ষ্যবস্তু AB কেন্দ্র C-এর বাইরে, প্রধান অক্ষের উপর লম্ব। B বিন্দু থেকে প্রধান অক্ষের সমান্তরাল একটি আলোকরশ্মি দর্পণে আপতিত হয়। প্রতিফলিত রশ্মি ফোকাস F দিয়ে যায়। আবার B থেকে দ্বিতীয় রশ্মি বক্রতার কেন্দ্র C দিয়ে দর্পণে লম্বভাবে পড়ে, তাই নিজের পথেই ফিরে আসে। প্রতিফলিত রশ্মিদ্বয় B′ বিন্দুতে মিলিত হয়। B′ থেকে প্রধান অক্ষের উপর লম্ব A′B′ লক্ষ্যবস্তু AB-এর প্রতিবিম্ব।`,
    { position: "F ও C-এর মাঝে", shape: "খর্ব, উল্টো", nature: "বাস্তব" },
  ),
  rayDiagram(
    "center",
    "অবতল দর্পণ: কেন্দ্রের উপর",
    `${mirrorOpen} লক্ষ্যবস্তু AB বক্রতার কেন্দ্র C-এর উপর। B বিন্দু থেকে প্রধান অক্ষের সমান্তরাল একটি আলোকরশ্মি দর্পণে আপতিত হয়। প্রতিফলিত রশ্মি ফোকাস F দিয়ে যায়। আবার B বিন্দু থেকে দ্বিতীয় আলোকরশ্মি ফোকাস F দিয়ে গিয়ে দর্পণে পড়ে। প্রতিফলিত রশ্মি প্রধান অক্ষের সমান্তরালে যায়। প্রতিফলিত রশ্মিদ্বয় B′ বিন্দুতে মিলিত হয়। B′ থেকে প্রধান অক্ষের উপর লম্ব টানলে A′B′ পাওয়া যায়। এটি লক্ষ্যবস্তু AB-এর প্রতিবিম্ব।`,
    { position: "C-এর উপর", shape: "সমান, উল্টো", nature: "বাস্তব" },
  ),
  rayDiagram(
    "between",
    "অবতল দর্পণ: ফোকাস ও কেন্দ্রের মাঝে",
    `${mirrorOpen} লক্ষ্যবস্তু AB ফোকাস F ও কেন্দ্র C-এর মাঝে, প্রধান অক্ষের উপর লম্ব। B বিন্দু থেকে প্রধান অক্ষের সমান্তরাল একটি আলোকরশ্মি দর্পণে আপতিত হয়। প্রতিফলিত রশ্মি ফোকাস F দিয়ে যায়। আবার B বিন্দু থেকে দ্বিতীয় আলোকরশ্মি ফোকাস F দিয়ে গিয়ে দর্পণে পড়ে। প্রতিফলিত রশ্মি প্রধান অক্ষের সমান্তরালে যায়। প্রতিফলিত রশ্মিদ্বয় B′ বিন্দুতে মিলিত হয়। B′ থেকে প্রধান অক্ষের উপর লম্ব টানলে A′B′ পাওয়া যায়। A′B′ লক্ষ্যবস্তু AB-এর প্রতিবিম্ব।`,
    { position: "C-এর বাইরে", shape: "বিবর্ধিত, উল্টো", nature: "বাস্তব" },
  ),
  rayDiagram(
    "focus",
    "অবতল দর্পণ: ফোকাসের উপর",
    `${mirrorOpen} লক্ষ্যবস্তু AB ফোকাস F-এর উপর। B থেকে প্রধান অক্ষের সমান্তরাল রশ্মি দর্পণে পড়ে এবং প্রতিফলনের পর F-এর দিকে যায়। আরেকটি রশ্মি প্রতিফলনের পর প্রধান অক্ষের সমান্তরালে চলে যায়। দুই প্রতিফলিত রশ্মি পরস্পর সমান্তরাল, সামনে মিলিত হয় না।`,
    { position: "অসীমে", shape: "অতি বিবর্ধিত, উল্টো", nature: "বাস্তব" },
  ),
  rayDiagram(
    "inside",
    "অবতল দর্পণ: ফোকাস ও মেরুর মাঝে",
    `${mirrorOpen} লক্ষ্যবস্তু AB ফোকাস F ও মেরু P-এর মাঝে। B থেকে প্রধান অক্ষের সমান্তরাল রশ্মি প্রতিফলনের পর F-এর দিকে যায়। B থেকে C-এর দিকে যাওয়া রশ্মি দর্পণে পড়ে নিজের পথে ফেরে। এই প্রতিফলিত রশ্মি দুটি দর্পণের সামনে মিলিত হয় না। পেছনের দিকে ড্যাশ রেখায় বাড়ালে B′ বিন্দুতে মেশে। সেখান থেকে প্রধান অক্ষের উপর লম্ব A′B′। এটি দর্পণের পেছনে।`,
    { position: "দর্পণের পেছনে", shape: "বিবর্ধিত, সোজা", nature: "অবাস্তব" },
  ),
  {
    id: "sr-ir",
    chapter: "ssc-reflect",
    title: "আপতন কোণ–প্রতিফলন কোণ",
    source: "book",
    xName: "আপতন কোণ",
    yName: "প্রতিফলন কোণ",
    xSymbol: "i (°)",
    ySymbol: "r (°)",
    formula: "r = i",
    condition: "সমতল বা গোলীয় দর্পণ, মসৃণ তল। কোণ অভিলম্ব থেকে।",
    explain: "প্রতিফলন কোণ আপতন কোণের সমান। লেখ 45°-এর সরলরেখা, মূলবিন্দু দিয়ে যায়।",
    meaning: "আলো যে কোণে পড়ে, সেই কোণে ফেরে।",
    slope: "ঢাল = 1।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "প্রতিফলনের সূত্র", why: "আপতন কোণ = প্রতিফলন কোণ।" },
      { eq: "r = i", why: "সমান, সমানুপাতের ঢাল 1।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "লম্বভাবে পড়লে লম্বভাবে ফেরে।" },
    ],
    build() {
      return {
        curves: [curve("main", "r = i", copper, samples(0, 90, (angle) => angle, 16))],
        calc: "i = 40° হলে r = 40°।",
      };
    },
  },
  {
    id: "sr-uv",
    chapter: "ssc-reflect",
    title: "অবতল দর্পণে বস্তু–প্রতিবিম্ব দূরত্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "প্রতিবিম্ব দূরত্ব",
    xSymbol: "u (cm)",
    ySymbol: "v (cm)",
    formula: "1/v + 1/u = 1/f",
    condition: `${sign} অবতল দর্পণে f ঋণাত্মক। স্লাইডার ফোকাসের মান দেয়।`,
    explain: "ফোকাসের বাইরে বাস্তব প্রতিবিম্ব দর্পণের সামনে, v ঋণাত্মক। ফোকাসের ভেতরে অবাস্তব প্রতিবিম্ব পেছনে, v ধনাত্মক।",
    meaning: "u = −2|f| হলে বস্তু বক্রতার কেন্দ্রে, v = u।",
    slope: "ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাসের মান |f|", 10, 30, 1, "cm")],
    base: { focal: 15 },
    steps: [
      { eq: "1/v + 1/u = 1/f", why: "গোলীয় দর্পণের সূত্র।" },
      { eq: "f < 0 অবতলে", why: "কার্তেসীয় চিহ্নে সামনের ফোকাস ঋণাত্মক।" },
      { eq: "u = f হলে v অসীম", why: "সেই বিন্দুতে লেখ ভাঙা।" },
    ],
    build(p) {
      const f = -p.focal;
      return {
        curves: [curve("main", "অবতল দর্পণ", copper, branch(f, (object) => mirrorV(f, object), [[5 * f, 1.08 * f], [0.92 * f, 0.25 * f]]))],
        guides: [{ x: f, label: "u = f" }],
        calc: `|f| = ${bnNum(p.focal, 0)} cm। u = ${bnNum(2 * f, 0)} cm হলে v = ${bnNum(mirrorV(f, 2 * f), 1)} cm।`,
      };
    },
  },
  {
    id: "sr-mag",
    chapter: "ssc-reflect",
    title: "বিবর্ধন–বস্তু দূরত্ব",
    source: "book",
    xName: "বস্তু দূরত্ব",
    yName: "রৈখিক বিবর্ধন",
    xSymbol: "u (cm)",
    ySymbol: "m",
    formula: "m = −v/u",
    condition: `${sign} অবতল দর্পণ। ঋণাত্মক m উল্টো, ধনাত্মক m সোজা।`,
    explain: "ফোকাসের বাইরে প্রতিবিম্ব উল্টো। বক্রতার কেন্দ্রে m = −1। ফোকাসের ভেতরে সোজা ও বড়।",
    meaning: "দূরের বস্তু ছোট দেখায়। খুব কাছে আনলে সোজা বড় প্রতিবিম্ব।",
    slope: "ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("focal", "ফোকাসের মান |f|", 10, 30, 1, "cm")],
    base: { focal: 15 },
    steps: [
      { eq: "1/v + 1/u = 1/f", why: "আগে প্রতিবিম্বের জায়গা।" },
      { eq: "m = −v/u", why: "দর্পণে এই চিহ্নে উল্টো ঋণাত্মক হয়।" },
      { eq: "u = −2|f| → m = −1", why: "সমআকার উল্টো।" },
    ],
    build(p) {
      const f = -p.focal;
      const magnify = (object: number) => -mirrorV(f, object) / object;
      return {
        curves: [curve("main", "m–u", copper, branch(f, magnify, [[5 * f, 1.08 * f], [0.92 * f, 0.3 * f]]))],
        guides: [{ x: 2 * f, label: "−2|f|" }],
        calc: `u = ${bnNum(2 * f, 0)} cm-এ m = ${bnNum(magnify(2 * f), 2)}।`,
      };
    },
  },
  {
    id: "sr-fr",
    chapter: "ssc-reflect",
    title: "ফোকাস দূরত্ব–বক্রতার ব্যাসার্ধ",
    source: "book",
    xName: "বক্রতার ব্যাসার্ধ",
    yName: "ফোকাস দূরত্ব",
    xSymbol: "R (cm)",
    ySymbol: "f (cm)",
    formula: "f = R/2",
    condition: "গোলীয় দর্পণ। চিহ্নসহ: অবতলে R ও f ঋণাত্মক, উত্তলে ধনাত্মক।",
    explain: "ফোকাস বক্রতার ব্যাসার্ধের অর্ধেক। রেখা মূলবিন্দুগামী, ঢাল 1/2।",
    meaning: "বক্রতার কেন্দ্র ফোকাসের দ্বিগুণ দূরে।",
    slope: "ঢাল = 1/2।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "f = R/2", why: "গোলীয় দর্পণের জ্যামিতি।" },
      { eq: "f ∝ R", why: "সমানুপাত, ঢাল 1/2।", tag: "সমানুপাত" },
      { eq: "চিহ্ন একই দিকে", why: "অবতল ঋণাত্মক, উত্তল ধনাত্মক।" },
    ],
    build() {
      return {
        curves: [curve("main", "f = R/2", copper, samples(-40, 40, (radius) => radius / 2, 17))],
        calc: "R = −20 cm হলে f = −10 cm। R = 20 cm হলে f = 10 cm।",
      };
    },
  },
];

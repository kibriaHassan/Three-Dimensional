import { bnNum } from "../format";
import { copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const ice = 2100;
const water = 4200;
const melt = 3.34e5;
const vapor = 2.26e6;

export const sscHeatGraphs: GraphSpec[] = [
  {
    id: "sh-tt",
    chapter: "ssc-heat",
    title: "তাপমাত্রা–সময়",
    source: "book",
    xName: "সময়",
    yName: "তাপমাত্রা",
    xSymbol: "t (s)",
    ySymbol: "T (°C)",
    formula: "ΔT = Pt / (mc)",
    condition: "দশা বদলায় না। জল, স্থির হারে তাপ। তাপ হারানো ধরা হয়নি।",
    explain: "তাপমাত্রা সময়ের সাথে সরলরেখায় বাড়ে। ঢাল P/(mc)। ভর বা আপেক্ষিক তাপ বেশি হলে ঢাল কম।",
    meaning: "একই হিটারে কম জল দ্রুত গরম হয়।",
    slope: "ঢাল = P/(mc), একক °C/s।",
    area: noArea,
    knobs: [knob("mass", "ভর m", 0.2, 2, 0.1, "kg"), knob("power", "তাপের হার P", 100, 800, 50, "W")],
    base: { mass: 0.5, power: 400 },
    steps: [
      { eq: "Q = mcΔT", why: "দশা না বদলালে।" },
      { eq: "Q = Pt", why: "স্থির হারে তাপ।" },
      { eq: "ΔT ∝ t", why: "ঢাল P/(mc)। সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const rate = p.power / (p.mass * water);
      const temperature = (time: number) => 25 + rate * time;
      return {
        curves: [curve("main", "T–t", copper, samples(0, 300, temperature, 20))],
        calc: `ঢাল = ${bnNum(rate, 3)} °C/s। ৩০০ s-এ T = ${bnNum(temperature(300), 1)} °C।`,
      };
    },
  },
  {
    id: "sh-qt",
    chapter: "ssc-heat",
    title: "তাপ গ্রহণ–তাপমাত্রা",
    source: "book",
    xName: "তাপমাত্রা",
    yName: "গৃহীত তাপ",
    xSymbol: "T (°C)",
    ySymbol: "Q (kJ)",
    formula: "Q = mc(T − T₀)",
    condition: "দশা বদলায় না। জল, T₀ = 20 °C থেকে। Q সেই তাপমাত্রা থেকে নেওয়া তাপ।",
    explain: "তাপমাত্রা যত বাড়ে, গৃহীত তাপ তত বাড়ে। ঢাল mc। 20 °C-এ Q শূন্য।",
    meaning: "আপেক্ষিক তাপ ঢাল থেকে বের হয়: c = ঢাল/m।",
    slope: "ঢাল = mc। অক্ষ কিলোজুলে, তাই ঢাল mc/1000।",
    area: noArea,
    knobs: [knob("mass", "ভর m", 0.2, 2, 0.1, "kg")],
    base: { mass: 1 },
    steps: [
      { eq: "Q = mcΔT", why: "দশা স্থির।" },
      { eq: "ΔT = T − 20", why: "শুরু 20 °C।" },
      { eq: "Q ∝ (T − 20)", why: "সরলরেখা, 20 °C-এ শূন্য।", tag: "রৈখিক" },
    ],
    build(p) {
      const heat = (temperature: number) => (p.mass * water * (temperature - 20)) / 1000;
      return {
        curves: [curve("main", "Q–T", copper, samples(20, 80, heat, 20))],
        calc: `m = ${bnNum(p.mass, 1)} kg। 80 °C-এ Q = ${bnNum(heat(80), 1)} kJ।`,
      };
    },
  },
  {
    id: "sh-phase",
    chapter: "ssc-heat",
    title: "গলন ও স্ফুটনের তাপমাত্রা–সময়",
    source: "book",
    xName: "সময়",
    yName: "তাপমাত্রা",
    xSymbol: "t (s)",
    ySymbol: "T (°C)",
    formula: "গলনে ও স্ফুটনে T স্থির",
    condition: "১ kg বরফ −10 °C থেকে, স্থির হারে তাপ। বরফের c = 2100, জলের 4200 J/kg·K। গলনের লীন তাপ 3.34×10⁵, বাষ্পীভবনের 2.26×10⁶ J/kg। সময় স্কেল বাস্তব।",
    explain: "−10 থেকে ০ পর্যন্ত তাপমাত্রা বাড়ে, গলনে ০-এ থেমে থাকে, তারপর ১০০ পর্যন্ত বাড়ে, স্ফুটনে আবার থামে। স্ফুটনের মঞ্চ সবচেয়ে লম্বা।",
    meaning: "মঞ্চে তাপ নষ্ট হয় না। তাপ দশা বদলায়, তাপমাত্রা নয়।",
    slope: "ঢালু অংশে P/(mc)। সমতলে ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("power", "তাপের হার P", 500, 4000, 100, "W")],
    base: { power: 2000 },
    steps: [
      { eq: "Q = mcΔT", why: "দশা না বদলালে তাপমাত্রা বাড়ে।" },
      { eq: "Q = mL", why: "গলন ও স্ফুটনে তাপমাত্রা স্থির।" },
      { eq: "t = Q/P", why: "স্থির হারে সময় তাপের সমানুপাতিক। L বড় বলে মঞ্চ লম্বা।", tag: "ধ্রুব" },
    ],
    build(p) {
      const mass = 1;
      const spans = [
        (mass * ice * 10) / p.power,
        (mass * melt) / p.power,
        (mass * water * 100) / p.power,
        (mass * vapor) / p.power,
      ];
      const points: Point[] = [];
      let time = 0;
      const ramp = (duration: number, from: number, to: number) => {
        for (let index = 0; index <= 16; index += 1) {
          if (points.length > 0 && index === 0) continue;
          points.push({ x: time + (duration * index) / 16, y: from + ((to - from) * index) / 16 });
        }
        time += duration;
      };
      const flat = (duration: number, temperature: number) => {
        points.push({ x: time + duration, y: temperature });
        time += duration;
      };
      ramp(spans[0], -10, 0);
      flat(spans[1], 0);
      ramp(spans[2], 0, 100);
      flat(spans[3], 100);
      return {
        curves: [curve("main", "বরফ থেকে বাষ্প", copper, points)],
        calc: `গলন ${bnNum(spans[1], 0)} s, স্ফুটন ${bnNum(spans[3], 0)} s। P = ${bnNum(p.power, 0)} W।`,
      };
    },
  },
  {
    id: "sh-dl",
    chapter: "ssc-heat",
    title: "দৈর্ঘ্য বৃদ্ধি–তাপমাত্রা পরিবর্তন",
    source: "book",
    xName: "তাপমাত্রা পরিবর্তন",
    yName: "দৈর্ঘ্য বৃদ্ধি",
    xSymbol: "ΔT (°C)",
    ySymbol: "ΔL (mm)",
    formula: "ΔL = α L₀ ΔT",
    condition: "দৈর্ঘ্য প্রসারণ গুণাঙ্ক স্থির। ইস্পাতের কাছাকাছি α = 1.2×10⁻⁵ /°C। সীমিত তাপমাত্রায়।",
    explain: "দৈর্ঘ্য বৃদ্ধি তাপমাত্রা পরিবর্তনের সমানুপাতিক। রেখা মূলবিন্দুগামী। লম্বা দণ্ডে ঢাল বেশি।",
    meaning: "রেলের ফাঁক এই প্রসারণের জন্য।",
    slope: "ঢাল = α L₀। অক্ষ মিলিমিটারে, তাই α L₀ × 1000।",
    area: noArea,
    origin: "both",
    knobs: [knob("length", "আদি দৈর্ঘ্য L₀", 0.5, 4, 0.5, "m")],
    base: { length: 1 },
    steps: [
      { eq: "ΔL = α L₀ ΔT", why: "দৈর্ঘ্য প্রসারণ।" },
      { eq: "α ও L₀ স্থির  →  ΔL ∝ ΔT", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "তাপমাত্রা না বদলালে দৈর্ঘ্য বাড়ে না।" },
    ],
    build(p) {
      const alpha = 1.2e-5;
      const growth = (delta: number) => alpha * p.length * delta * 1000;
      return {
        curves: [curve("main", "ΔL–ΔT", copper, samples(0, 100, growth, 17))],
        calc: `α = 1.2×10⁻⁵ /°C। 100 °C-এ ΔL = ${bnNum(growth(100), 2)} mm।`,
      };
    },
  },
  {
    id: "sh-dv",
    chapter: "ssc-heat",
    title: "আয়তন বৃদ্ধি–তাপমাত্রা পরিবর্তন",
    source: "book",
    xName: "তাপমাত্রা পরিবর্তন",
    yName: "আয়তন বৃদ্ধি",
    xSymbol: "ΔT (°C)",
    ySymbol: "ΔV (cm³)",
    formula: "ΔV = γ V₀ ΔT",
    condition: "আয়তন প্রসারণ গুণাঙ্ক স্থির। আদি আয়তন 1000 cm³। γ নবে।",
    explain: "আয়তন বৃদ্ধি তাপমাত্রা পরিবর্তনের সমানুপাতিক। তরলের γ কঠিনের চেয়ে বড়, ঢাল বেশি।",
    meaning: "পারদ থার্মোমিটারে এই প্রসারণই স্তম্ভ তোলে।",
    slope: "ঢাল = γ V₀।",
    area: noArea,
    origin: "both",
    knobs: [knob("gamma", "γ", 1, 10, 0.2, "×10⁻⁴ /°C")],
    base: { gamma: 1.8 },
    steps: [
      { eq: "ΔV = γ V₀ ΔT", why: "আয়তন প্রসারণ।" },
      { eq: "γ ≈ 3α কঠিনে", why: "তিন দিকে দৈর্ঘ্য বাড়ে।" },
      { eq: "ΔV ∝ ΔT", why: "V₀ ও γ স্থির। মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const growth = (delta: number) => p.gamma * 1e-4 * 1000 * delta;
      return {
        curves: [curve("main", "ΔV–ΔT", copper, samples(0, 80, growth, 17))],
        calc: `γ = ${bnNum(p.gamma, 1)}×10⁻⁴ /°C। V₀ = 1000 cm³। 50 °C-এ ΔV = ${bnNum(growth(50), 2)} cm³।`,
      };
    },
  },
];

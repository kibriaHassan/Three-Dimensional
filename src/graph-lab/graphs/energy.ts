import { bnNum } from "../format";
import { blue, copper, curve, green, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const energyGraphs: GraphSpec[] = [
  {
    id: "energy-force",
    chapter: "energy",
    title: "ধ্রুব বলের বল–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "বল",
    xSymbol: "x (m)",
    ySymbol: "F (N)",
    formula: "W = Fx  (θ = 0°)",
    condition: "বল ধ্রুব এবং সরণের দিকে। কোণ শূন্য, তাই cosθ = 1।",
    explain: "ধ্রুব বল সরণ-অক্ষের সমান্তরাল সরলরেখা। রেখার নিচের আয়তক্ষেত্রের ক্ষেত্রফল কাজ।",
    meaning: "কাজ বল–সরণ লেখের ক্ষেত্রফল। বল স্থির থাকলে কাজ সরণের সমানুপাতিক।",
    slope: "ধ্রুব বলের ঢাল শূন্য। কাজ ঢাল থেকে নয়, ক্ষেত্রফল থেকে।",
    area: "ক্ষেত্রফল = কাজ W = Fx।",
    fillArea: true,
    origin: "both",
    knobs: [knob("force", "বল F", 2, 30, 1, "N"), knob("span", "দেখানো সরণ", 1, 8, 0.5, "m")],
    base: { force: 10, span: 4 },
    build(p) {
      return {
        curves: [curve("main", "ধ্রুব বল", copper, samples(0, p.span, () => p.force, 20))],
        calc: `W = Fx = ${bnNum(p.force * p.span, 1)} J।`,
      };
    },
  },
  {
    id: "energy-work",
    chapter: "energy",
    title: "কাজ–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "কাজ",
    xSymbol: "x (m)",
    ySymbol: "W (J)",
    formula: "W = Fx",
    condition: "বল ধ্রুব, সরণের অভিমুখে। t = 0-এর মতো x = 0-এ কাজ শূন্য।",
    explain: "ধ্রুব বলে কাজ সরণের সঙ্গে সরলরেখায় বাড়ে। রেখা মূলবিন্দু দিয়ে যায়। ঢাল বলের সমান।",
    meaning: "একই বলে দ্বিগুণ সরণে দ্বিগুণ কাজ। ঢাল থেকে বল পড়া যায়।",
    slope: "ঢাল = বল F।",
    area: noArea,
    origin: "both",
    knobs: [knob("force", "বল F", 2, 30, 1, "N")],
    base: { force: 10 },
    build(p) {
      return {
        curves: [curve("main", "W–x", copper, samples(0, 5, (x) => p.force * x, 40))],
        calc: `ঢাল = F = ${bnNum(p.force, 0)} N। x = 5 m-এ W = ${bnNum(p.force * 5, 0)} J।`,
      };
    },
  },
  {
    id: "energy-spring-f",
    chapter: "energy",
    title: "স্প্রিংয়ের বল–প্রসারণ",
    source: "book",
    xName: "প্রসারণ",
    yName: "প্রযুক্ত বল",
    xSymbol: "x (m)",
    ySymbol: "F (N)",
    formula: "F = kx",
    condition: "স্থিতিস্থাপক সীমার মধ্যে। x স্বাভাবিক দৈর্ঘ্য থেকে প্রসারণ। দেখানো F স্প্রিং টানতে প্রযুক্ত বল; পুনরুদ্ধার বল এর বিপরীত।",
    explain: "হুকের সূত্রে প্রযুক্ত বল প্রসারণের সমানুপাতিক। লেখ মূলবিন্দু দিয়ে সরলরেখা। ঢাল স্প্রিং ধ্রুবক। ক্ষেত্রফল সঞ্চিত স্থিতিশক্তি।",
    meaning: "স্প্রিং যত শক্ত, একই প্রসারণে বল তত বেশি, ঢাল তত বড়।",
    slope: "ঢাল = k, একক N/m।",
    area: "মূলবিন্দু থেকে x পর্যন্ত ক্ষেত্রফল = স্থিতিশক্তি ½kx²।",
    fillArea: true,
    origin: "both",
    knobs: [knob("k", "স্প্রিং ধ্রুবক k", 20, 200, 5, "N/m"), knob("span", "প্রসারণের সীমা", 0.05, 0.3, 0.01, "m")],
    base: { k: 100, span: 0.2 },
    build(p) {
      const energy = 0.5 * p.k * p.span * p.span;
      return {
        curves: [curve("main", "F = kx", copper, samples(0, p.span, (x) => p.k * x, 40))],
        calc: `k = ${bnNum(p.k, 0)} N/m। x = ${bnNum(p.span, 2)} m-এ F = ${bnNum(p.k * p.span, 1)} N, U = ${bnNum(energy)} J।`,
      };
    },
  },
  {
    id: "energy-spring-u",
    chapter: "energy",
    title: "স্প্রিংয়ের স্থিতিশক্তি–প্রসারণ",
    source: "book",
    xName: "প্রসারণ",
    yName: "স্থিতিশক্তি",
    xSymbol: "x (m)",
    ySymbol: "U (J)",
    formula: "U = ½kx²",
    condition: "স্থিতিস্থাপক সীমার মধ্যে। x স্বাভাবিক দৈর্ঘ্য থেকে, দুই দিকেই।",
    explain: "স্থিতিশক্তি প্রসারণের বর্গের সঙ্গে বাড়ে, তাই পরাবৃত্ত। স্বাভাবিক দৈর্ঘ্যে শক্তি শূন্য। দুই দিকে সমান প্রসারণে সমান শক্তি।",
    meaning: "দ্বিগুণ প্রসারণে স্থিতিশক্তি চার গুণ। বল–প্রসারণ লেখের ক্ষেত্রফল এই শক্তি।",
    slope: "ঢাল = kx। স্বাভাবিক দৈর্ঘ্যে ঢাল শূন্য; প্রান্তে সবচেয়ে খাড়া।",
    area: noArea,
    origin: "both",
    knobs: [knob("k", "স্প্রিং ধ্রুবক k", 20, 200, 5, "N/m"), knob("amp", "দেখানো প্রসারণ", 0.05, 0.3, 0.01, "m")],
    base: { k: 100, amp: 0.2 },
    build(p) {
      const peak = 0.5 * p.k * p.amp * p.amp;
      return {
        curves: [curve("main", "U = ½kx²", green, samples(-p.amp, p.amp, (x) => 0.5 * p.k * x * x))],
        calc: `x = ±${bnNum(p.amp, 2)} m-এ U = ${bnNum(peak)} J। x = 0-এ U = 0।`,
      };
    },
  },
  {
    id: "energy-kv",
    chapter: "energy",
    title: "গতিশক্তি–বেগ",
    source: "book",
    xName: "বেগ",
    yName: "গতিশক্তি",
    xSymbol: "v (m/s)",
    ySymbol: "K (J)",
    formula: "K = ½mv²",
    condition: "ভর ধ্রুব। v দ্রুতি, তাই অক্ষ ধনাত্মক।",
    explain: "গতিশক্তি বেগের বর্গের সঙ্গে বাড়ে। লেখ পরাবৃত্ত। বেগ দ্বিগুণ হলে গতিশক্তি চার গুণ, তিন গুণ হলে নয় গুণ।",
    meaning: "একই ভরে দ্রুত বস্তুর শক্তি বেগের তুলনায় অনেক দ্রুত বাড়ে। থামাতে সেই শক্তি খরচ করতে হয়।",
    slope: "যেকোনো বেগে ঢাল = mv। ঢাল ধ্রুব নয়; বেগ বাড়লে ঢাল বাড়ে।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ভর m", 0.5, 8, 0.1, "kg")],
    base: { mass: 2 },
    build(p) {
      const speed = 8;
      return {
        curves: [curve("main", "K–v", copper, samples(0, speed, (v) => 0.5 * p.mass * v * v))],
        calc: `v = ${bnNum(speed, 0)} m/s-এ K = ${bnNum(0.5 * p.mass * speed * speed, 1)} J। 2v হলে K চার গুণ, ${bnNum(0.5 * p.mass * 16 * 16, 1)} J।`,
      };
    },
  },
  {
    id: "energy-km",
    chapter: "energy",
    title: "গতিশক্তি–ভর, বেগ স্থির",
    source: "book",
    xName: "ভর",
    yName: "গতিশক্তি",
    xSymbol: "m (kg)",
    ySymbol: "K (J)",
    formula: "K = ½mv²",
    condition: "বেগ স্থির। ভর ধনাত্মক।",
    explain: "বেগ না বদলালে গতিশক্তি ভরের সমানুপাতিক। লেখ মূলবিন্দু দিয়ে সরলরেখা। ঢাল ½v²।",
    meaning: "একই গতিতে ভারী বস্তুর গতিশক্তি বেশি। ঢাল থেকে বেগ বের করা যায়।",
    slope: "ঢাল = ½v²।",
    area: noArea,
    origin: "both",
    knobs: [knob("speed", "বেগ v", 1, 12, 0.5, "m/s")],
    base: { speed: 4 },
    build(p) {
      const slope = 0.5 * p.speed * p.speed;
      return {
        curves: [curve("main", "K–m", copper, samples(0, 8, (mass) => slope * mass, 20))],
        calc: `v = ${bnNum(p.speed, 1)} m/s স্থির। ঢাল = ½v² = ${bnNum(slope)} J/kg। m = 4 kg-এ K = ${bnNum(slope * 4, 1)} J।`,
      };
    },
  },
  {
    id: "energy-power",
    chapter: "energy",
    title: "ক্ষমতা–সময়, দুই পরিস্থিতি",
    source: "extra",
    xName: "সময়",
    yName: "ক্ষমতা",
    xSymbol: "t (s)",
    ySymbol: "P (W)",
    formula: "P = ধ্রুব,   অথবা P = (F²/m) t",
    condition: "প্রথম ক্ষেত্রে ক্ষমতা ধ্রুব। দ্বিতীয় ক্ষেত্রে বল ধ্রুব, বস্তু স্থির থেকে চলতে শুরু করে, তাই v = (F/m)t এবং P = Fv। এটি সূত্রভিত্তিক অতিরিক্ত লেখ।",
    explain: "ধ্রুব ক্ষমতা অনুভূমিক সরলরেখা। স্থির থেকে ধ্রুব বলে ত্বরান্বিত হলে বেগ সময়ের সঙ্গে বাড়ে, তাই তাৎক্ষণিক ক্ষমতাও মূলবিন্দু দিয়ে সরলরেখায় বাড়ে।",
    meaning: "ক্ষমতা সব সময় সমান থাকে না। সময়-অক্ষের সঙ্গে ক্ষেত্রফল ওই সময়ে কৃত কাজ।",
    slope: "ধ্রুব ক্ষমতার ঢাল শূন্য। ত্বরান্বিত ক্ষেত্রে ঢাল = F²/m।",
    area: "ক্ষেত্রফল = কাজ। ধ্রুব ক্ষমতায় W = Pt। ত্বরান্বিত ক্ষেত্রে W = ½(F²/m)t², যা ½mv²-এর সমান।",
    origin: "both",
    knobs: [
      knob("power", "ধ্রুব ক্ষমতা P₀", 5, 80, 1, "W"),
      knob("force", "ধ্রুব বল F", 2, 20, 1, "N"),
      knob("mass", "ভর m", 0.5, 8, 0.1, "kg"),
    ],
    base: { power: 20, force: 6, mass: 2 },
    build(p) {
      const time = 5;
      const slope = (p.force * p.force) / p.mass;
      const workConstant = p.power * time;
      const workAccel = 0.5 * slope * time * time;
      return {
        curves: [
          curve("main", "ধ্রুব ক্ষমতা", copper, samples(0, time, () => p.power, 20)),
          curve("accel", "স্থির থেকে ধ্রুব বল", blue, samples(0, time, (t) => slope * t, 40)),
        ],
        calc: `${bnNum(time, 0)} s-এ ধ্রুব ক্ষমতার কাজ ${bnNum(workConstant, 1)} J। ত্বরান্বিত ক্ষেত্রে শেষ ক্ষমতা ${bnNum(slope * time, 1)} W, কাজ ${bnNum(workAccel, 1)} J।`,
      };
    },
  },
];

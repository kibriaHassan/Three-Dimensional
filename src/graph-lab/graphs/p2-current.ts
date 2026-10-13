import { bnNum } from "../format";
import { blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const currentGraphs: GraphSpec[] = [
  {
    id: "cu-vi",
    chapter: "current",
    title: "বিভব পার্থক্য–তড়িৎ প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "বিভব পার্থক্য",
    xSymbol: "I (A)",
    ySymbol: "V (V)",
    formula: "V = IR",
    condition: "ওহমীয় রোধ। তাপমাত্রা স্থির, তাই R ধ্রুব।",
    explain: "বিভব প্রবাহের সমানুপাতিক। ঢাল রোধ। মূলবিন্দু দিয়ে সরলরেখা।",
    meaning: "ওহমের সূত্র। রোধ বাড়লে একই প্রবাহে বিভব বেশি লাগে।",
    slope: "ঢাল = R, একক Ω।",
    area: noArea,
    origin: "both",
    knobs: [knob("resistance", "রোধ R", 2, 30, 1, "Ω")],
    base: { resistance: 10 },
    steps: [
      { eq: "V = IR", why: "ওহমের সূত্র।" },
      { eq: "R স্থির  →  V ∝ I", why: "বিভব প্রবাহের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = R", why: "রেখা খাড়া হলে রোধ বেশি।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "V–I", copper, samples(0, 2, (current) => p.resistance * current, 16))],
        calc: `1 A-এ V = ${bnNum(p.resistance, 0)} V।`,
      };
    },
  },
  {
    id: "cu-iv",
    chapter: "current",
    title: "তড়িৎ প্রবাহ–বিভব পার্থক্য",
    source: "book",
    xName: "বিভব পার্থক্য",
    yName: "তড়িৎ প্রবাহ",
    xSymbol: "V (V)",
    ySymbol: "I (A)",
    formula: "I = V / R",
    condition: "ওহমীয় পরিবাহী। অক্ষ আগের লেখের উল্টো।",
    explain: "প্রবাহ বিভবের সমানুপাতিক। ঢাল 1/R, অর্থাৎ পরিবাহকত্ব।",
    meaning: "একই বিভবে রোধ কমলে প্রবাহ বাড়ে।",
    slope: "ঢাল = 1/R।",
    area: noArea,
    origin: "both",
    knobs: [knob("resistance", "রোধ R", 2, 30, 1, "Ω")],
    base: { resistance: 10 },
    steps: [
      { eq: "V = IR", why: "ওহমের সূত্র।" },
      { eq: "I = V / R", why: "R স্থির। প্রবাহ বিভবের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = 1/R", why: "V–I লেখের ঢালের উল্টো।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "I–V", copper, samples(0, 20, (voltage) => voltage / p.resistance, 16))],
        calc: `10 V-এ I = ${bnNum(10 / p.resistance, 2)} A।`,
      };
    },
  },
  {
    id: "cu-rt",
    chapter: "current",
    title: "রোধ–তাপমাত্রা",
    source: "book",
    xName: "তাপমাত্রা",
    yName: "রোধ",
    xSymbol: "T (°C)",
    ySymbol: "R (Ω)",
    formula: "R = R₀ [1 + α(T − T₀)]",
    condition: "ধাতব পরিবাহী, সীমিত তাপমাত্রায় α ধ্রুব। T₀ = 20°C। α তামার কাছাকাছি শুরু, স্লাইডারে বদলানো যায়।",
    explain: "তাপমাত্রা বাড়লে ধাতুর রোধ বাড়ে। রেখা সরল, কিন্তু 0°C-তে রোধ শূন্য নয়।",
    meaning: "α ধনাত্মক হলে ঢাল ধনাত্মক। সেমিকন্ডাক্টরে উল্টো হয়, সেটা এই লেখ নয়।",
    slope: "ঢাল = R₀ α।",
    area: noArea,
    knobs: [knob("r0", "20°C-এ রোধ R₀", 5, 40, 1, "Ω"), knob("alpha", "α", 0.002, 0.006, 0.0005, "/°C")],
    base: { r0: 10, alpha: 0.0039 },
    steps: [
      { eq: "R = R₀ [1 + α(T − T₀)]", why: "ধাতুর রোধের তাপমাত্রা সূত্র। α ধ্রুব ধরা।" },
      { eq: "R − R₀ = R₀ α (T − T₀)", why: "রোধের বাড়া তাপমাত্রার বাড়ার সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "সরলরেখা, ছেদ শূন্য নয়", why: "0°C-তেও রোধ থাকে। মূলবিন্দুগামী নয়।" },
    ],
    build(p) {
      const at = (temperature: number) => p.r0 * (1 + p.alpha * (temperature - 20));
      return {
        curves: [curve("main", "ধাতু", copper, samples(0, 120, at, 24))],
        calc: `100°C-এ R = ${bnNum(at(100), 2)} Ω। ঢাল = ${bnNum(p.r0 * p.alpha, 3)} Ω/°C।`,
      };
    },
  },
  {
    id: "cu-rhot",
    chapter: "current",
    title: "রোধকতা–তাপমাত্রা",
    source: "book",
    xName: "তাপমাত্রা",
    yName: "রোধকতা",
    xSymbol: "T (°C)",
    ySymbol: "ρ (10⁻⁸ Ω·m)",
    formula: "ρ = ρ₀ [1 + α(T − T₀)]",
    condition: "একই α রোধ ও রোধকতায়। T₀ = 20°C। অক্ষে ρ-কে 10⁻⁸ দিয়ে ভাগ, তামার ρ₀ ≈ 1.7।",
    explain: "রোধকতা পদার্থের নিজস্ব। দৈর্ঘ্য-ক্ষেত্রফল বদলালে রোধ বদলায়, রোধকতার এই লেখ বদলায় না।",
    meaning: "R = ρL/A। তাপমাত্রায় ρ যে হারে বাড়ে, R-ও সেই হারে বাড়ে।",
    slope: "ঢাল = ρ₀ α।",
    area: noArea,
    knobs: [knob("rho", "20°C-এ ρ₀", 1, 10, 0.1, "10⁻⁸ Ω·m"), knob("alpha", "α", 0.002, 0.006, 0.0005, "/°C")],
    base: { rho: 1.7, alpha: 0.0039 },
    steps: [
      { eq: "R = ρ L / A", why: "রোধ জ্যামিতি আর রোধকতায় ভাগ।" },
      { eq: "ρ = ρ₀ [1 + α(T − T₀)]", why: "L ও A স্থির থাকলে R আর ρ একই α মানে।" },
      { eq: "Δρ ∝ ΔT", why: "রোধকতার বাড়া তাপমাত্রার বাড়ার সমানুপাতিক।", tag: "সমানুপাত" },
    ],
    build(p) {
      const at = (temperature: number) => p.rho * (1 + p.alpha * (temperature - 20));
      return {
        curves: [curve("main", "ρ–T", copper, samples(0, 120, at, 24))],
        calc: `100°C-এ ρ = ${bnNum(at(100), 2)} × 10⁻⁸ Ω·m।`,
      };
    },
  },
  {
    id: "cu-it",
    chapter: "current",
    title: "তড়িৎ প্রবাহ–সময়",
    source: "book",
    xName: "সময়",
    yName: "তড়িৎ প্রবাহ",
    xSymbol: "t (s)",
    ySymbol: "I (A)",
    formula: "I = ধ্রুব,   Q = It",
    condition: "স্থির প্রবাহ। প্রবাহ সময়ের সাথে বদলায় না।",
    explain: "লেখ অনুভূমিক। ক্ষেত্রফল আধান। প্রবাহ বেশি হলে একই সময়ে আধান বেশি।",
    meaning: "I = dQ/dt। স্থির প্রবাহে আধান সময়ের সমানুপাতিক, প্রবাহ নিজে নয়।",
    slope: "ঢাল শূন্য।",
    area: "ক্ষেত্রফল = আধান Q = It, একক কুলম্ব।",
    fillArea: true,
    origin: "both",
    knobs: [knob("current", "প্রবাহ I", 0.2, 4, 0.1, "A")],
    base: { current: 1.5 },
    steps: [
      { eq: "I = dQ/dt", why: "প্রবাহ আধানের হার।" },
      { eq: "I ধ্রুব", why: "সময়ের সাথে সমানুপাত নেই। লেখ অনুভূমিক।", tag: "ধ্রুব" },
      { eq: "Q = It", why: "ক্ষেত্রফল আধান। আধান সময়ের সমানুপাতিক।", tag: "সমানুপাত" },
    ],
    build(p) {
      const time = 8;
      return {
        curves: [curve("main", "স্থির প্রবাহ", copper, samples(0, time, () => p.current, 12))],
        calc: `${bnNum(time, 0)} s-এ আধান Q = ${bnNum(p.current * time, 1)} C।`,
      };
    },
  },
  {
    id: "cu-pi",
    chapter: "current",
    title: "তড়িৎ ক্ষমতা–প্রবাহ, বিভব স্থির",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "ক্ষমতা",
    xSymbol: "I (A)",
    ySymbol: "P (W)",
    formula: "P = VI",
    condition: "বিভব পার্থক্য স্থির। এটি I²R রূপ নয়: সেখানে R স্থির আর V = IR বদলায়।",
    explain: "বিভব আটকে রাখলে ক্ষমতা প্রবাহের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল V।",
    meaning: "একই ব্যাটারি ভোল্টেজে বেশি প্রবাহ মানে বেশি ক্ষমতা।",
    slope: "ঢাল = V।",
    area: noArea,
    origin: "both",
    knobs: [knob("voltage", "বিভব V", 2, 24, 1, "V")],
    base: { voltage: 12 },
    steps: [
      { eq: "P = VI", why: "তড়িৎ ক্ষমতার সংজ্ঞা।" },
      { eq: "V স্থির  →  P ∝ I", why: "ক্ষমতা প্রবাহের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = V", why: "বিভব বেশি হলে রেখা খাড়া।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "P = VI", copper, samples(0, 3, (current) => p.voltage * current, 16))],
        calc: `2 A-এ P = ${bnNum(p.voltage * 2, 0)} W।`,
      };
    },
  },
  {
    id: "cu-pr",
    chapter: "current",
    title: "তড়িৎ ক্ষমতা–রোধ, আদর্শ বিভব উৎস",
    source: "book",
    xName: "রোধ",
    yName: "ক্ষমতা",
    xSymbol: "R (Ω)",
    ySymbol: "P (W)",
    formula: "P = V² / R",
    condition: "আদর্শ উৎস: টার্মিনাল বিভব ভারসাপেক্ষ নয়। উৎসের অভ্যন্তরীণ রোধ শূন্য ধরা।",
    explain: "বিভব স্থির থাকলে রোধ বাড়লে প্রবাহ কমে, ক্ষমতা কমে। P রোধের ব্যাস্তানুপাতিক।",
    meaning: "একই ভোল্টেজে ছোট রোধে বেশি তাপ বা ক্ষমতা। শর্ট সার্কিটে R → 0, সূত্রে P অনেক বড় — বাস্তবে উৎসের অভ্যন্তরীণ রোধ আটকায়।",
    slope: "ঢাল = −V²/R²।",
    area: noArea,
    knobs: [knob("voltage", "উৎসের বিভব V", 6, 24, 1, "V")],
    base: { voltage: 12 },
    steps: [
      { eq: "P = VI এবং I = V/R", why: "আদর্শ উৎসে V ধ্রুব।" },
      { eq: "P = V² / R", why: "V² স্থির। ক্ষমতা রোধের ব্যাস্তানুপাতিক।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ অধিবৃত্ত", why: "রোধ দ্বিগুণ হলে ক্ষমতা অর্ধেক।" },
    ],
    build(p) {
      const power = (resistance: number) => (p.voltage * p.voltage) / resistance;
      return {
        curves: [curve("main", "P–R", copper, samples(2, 40, power))],
        calc: `10 Ω-এ P = ${bnNum(power(10), 1)} W। 20 Ω-এ P = ${bnNum(power(20), 1)} W।`,
      };
    },
  },
  {
    id: "cu-terminal",
    chapter: "current",
    title: "টার্মিনাল বিভব–তড়িৎ প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "টার্মিনাল বিভব",
    xSymbol: "I (A)",
    ySymbol: "V (V)",
    formula: "V = ε − Ir",
    condition: "উৎসের তড়িচ্চালক বল ε ও অভ্যন্তরীণ রোধ r ধ্রুব। বাইরের বর্তনীতে প্রবাহ বাইরে দেওয়া হচ্ছে।",
    explain: "প্রবাহ বাড়লে অভ্যন্তরীণ রোধে বিভব পড়ে, টার্মিনাল বিভব কমে। ছেদ ε, ঢাল −r।",
    meaning: "প্রবাহ শূন্য হলে ভোল্টমিটার ε পড়ে। প্রবাহ ε/r হলে টার্মিনাল বিভব শূন্য।",
    slope: "ঢাল = −r।",
    area: noArea,
    origin: "both",
    knobs: [knob("emf", "তড়িচ্চালক বল ε", 6, 24, 1, "V"), knob("internal", "অভ্যন্তরীণ রোধ r", 0.2, 3, 0.1, "Ω")],
    base: { emf: 12, internal: 1 },
    steps: [
      { eq: "ε = V + Ir", why: "তড়িচ্চালক বল = টার্মিনাল বিভব + অভ্যন্তরীণ পতন।" },
      { eq: "V = ε − Ir", why: "r স্থির। প্রবাহ বাড়লে V কমে।", tag: "রৈখিক" },
      { eq: "ছেদ = ε, ঢাল = −r", why: "I = 0-তে V = ε।" },
    ],
    build(p) {
      const limit = p.emf / p.internal;
      return {
        curves: [curve("main", "V = ε − Ir", copper, samples(0, limit, (current) => p.emf - p.internal * current, 20))],
        calc: `I = 2 A-এ V = ${bnNum(p.emf - p.internal * 2, 2)} V। শর্ট প্রবাহ ε/r = ${bnNum(limit, 2)} A।`,
      };
    },
  },
  {
    id: "cu-series",
    chapter: "current",
    title: "শ্রেণি ও সমান্তরাল তুল্য রোধ",
    source: "book",
    xName: "একই রোধের সংখ্যা",
    yName: "তুল্য রোধ",
    xSymbol: "n",
    ySymbol: "Rₑq (Ω)",
    formula: "শ্রেণি: nR,   সমান্তরাল: R/n",
    condition: "প্রতিটি রোধ R সমান। n পূর্ণসংখ্যা; লেখ সেই বিন্দুগুলো জুড়ে।",
    explain: "শ্রেণিতে তুল্য রোধ সংখ্যার সমানুপাতিক। সমান্তরালে সংখ্যার ব্যাস্তানুপাতিক।",
    meaning: "একই যন্ত্র শ্রেণিতে বাড়ালে মোট রোধ বাড়ে, সমান্তরালে কমে।",
    slope: "শ্রেণির ঢাল = R। সমান্তরাল সরলরেখা নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("resistance", "প্রতিটির রোধ R", 2, 20, 1, "Ω")],
    base: { resistance: 10 },
    steps: [
      { eq: "শ্রেণি: Rₑq = R + R + … = nR", why: "একই প্রবাহ, বিভব যোগ হয়।" },
      { eq: "Rₑq ∝ n", why: "শ্রেণিতে সংখ্যার সমানুপাত।", tag: "সমানুপাত" },
      { eq: "সমান্তরাল: 1/Rₑq = n/R", why: "Rₑq = R/n। সংখ্যার ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
    ],
    build(p) {
      const counts = [1, 2, 3, 4, 5, 6, 7, 8].map((count) => ({ x: count, y: 0 }));
      return {
        curves: [
          curve("main", "শ্রেণি nR", copper, counts.map((point) => ({ x: point.x, y: point.x * p.resistance }))),
          curve("parallel", "সমান্তরাল R/n", blue, counts.map((point) => ({ x: point.x, y: p.resistance / point.x }))),
        ],
        calc: `4টি ${bnNum(p.resistance, 0)} Ω: শ্রেণি ${bnNum(4 * p.resistance, 0)} Ω, সমান্তরাল ${bnNum(p.resistance / 4, 2)} Ω।`,
      };
    },
  },
  {
    id: "cu-heat",
    chapter: "current",
    title: "জুলের তাপ–সময়",
    source: "book",
    xName: "সময়",
    yName: "উৎপন্ন তাপ",
    xSymbol: "t (s)",
    ySymbol: "H (J)",
    formula: "H = I² R t",
    condition: "প্রবাহ ও রোধ স্থির। তাপ জুলে।",
    explain: "তাপ সময়ের সমানুপাতিক। ঢাল I²R, যা ক্ষমতা। প্রবাহ দ্বিগুণ হলে ঢাল চারগুণ।",
    meaning: "জুলের সূত্র। স্থির প্রবাহে তাপ সময়ের সাথে সরলরেখায় বাড়ে।",
    slope: "ঢাল = I²R = P।",
    area: noArea,
    origin: "both",
    knobs: [knob("current", "প্রবাহ I", 0.2, 3, 0.1, "A"), knob("resistance", "রোধ R", 2, 30, 1, "Ω")],
    base: { current: 1, resistance: 10 },
    steps: [
      { eq: "P = I² R", why: "রোধে ক্ষমতা। V = IR বসিয়ে।" },
      { eq: "H = P t", why: "ক্ষমতা স্থির থাকলে তাপ সময়ের গুণ।" },
      { eq: "H ∝ t", why: "I ও R স্থির। মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = p.current * p.current * p.resistance;
      return {
        curves: [curve("main", "H–t", copper, samples(0, 20, (time) => slope * time, 16))],
        calc: `I²R = ${bnNum(slope, 1)} W। 10 s-এ H = ${bnNum(slope * 10, 0)} J।`,
      };
    },
  },
];

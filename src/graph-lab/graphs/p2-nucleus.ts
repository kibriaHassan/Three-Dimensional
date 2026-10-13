import { bnNum } from "../format";
import { EV_PER_U, blue, copper, curve, gold, green, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const rydberg = 13.6;

function level(n: number) {
  return -rydberg / (n * n);
}

function binding(mass: number) {
  const rise = 8.8 * (1 - Math.exp(-(mass - 1) / 7));
  const fall = mass > 56 ? 0.0075 * (mass - 56) : 0;
  return Math.max(0, rise - fall);
}

export const nucleusGraphs: GraphSpec[] = [
  {
    id: "nu-levels",
    chapter: "nucleus",
    title: "পরমাণুর শক্তিস্তর",
    source: "book",
    xName: "প্রধান কোয়ান্টাম সংখ্যা",
    yName: "শক্তি",
    xSymbol: "n",
    ySymbol: "E (eV)",
    formula: "Eₙ = −13.6 / n²",
    condition: "হাইড্রোজেন। n = 1, 2, 3… শূন্য রেখা আয়নীকরণের সীমা।",
    explain: "নিচের স্তরগুলোর ফাঁক বড়, ওপরের স্তরগুলো ঘন হয়ে শূন্যের কাছে জমে। ঋণাত্মক শক্তি মানে ইলেকট্রন বাঁধা।",
    meaning: "n = 1 নিম্নতম স্তর, −13.6 eV। n বাড়লে শক্তি বাড়ে, মানে কম ঋণাত্মক হয়।",
    slope: "স্তরগুলো সমান ফাঁকে নয়। ΔE ছোট হয় n বাড়লে।",
    area: noArea,
    origin: "x",
    knobs: [],
    base: {},
    steps: [
      { eq: "Eₙ = −13.6 / n²", why: "বোর মডেলের হাইড্রোজেন স্তর।" },
      { eq: "E ∝ 1/n²", why: "n-এর বর্গের ব্যাস্তানুপাত। চিহ্ন ঋণাত্মক।", tag: "ব্যাস্তানুপাত" },
      { eq: "n → ∞ হলে E → 0", why: "আয়নীকরণ সীমা। ড্যাশ রেখা সেই শূন্য।" },
    ],
    build() {
      const points = [1, 2, 3, 4, 5, 6].map((n) => ({ x: n, y: level(n) }));
      return {
        curves: [
          curve("main", "শক্তিস্তর", copper, points, { dots: true }),
          curve("zero", "আয়নীকরণ", blue, [{ x: 1, y: 0 }, { x: 6, y: 0 }], { dashed: true }),
        ],
        calc: `n = 1 → ${bnNum(level(1), 1)} eV। n = 2 → ${bnNum(level(2), 1)} eV। n = 3 → ${bnNum(level(3), 2)} eV।`,
      };
    },
  },
  {
    id: "nu-photon",
    chapter: "nucleus",
    title: "শক্তিস্তর বদলে ফোটনের শক্তি",
    source: "book",
    xName: "ওপরের স্তর",
    yName: "ফোটনের শক্তি",
    xSymbol: "n₂",
    ySymbol: "ΔE (eV)",
    formula: "ΔE = 13.6 (1/n₁² − 1/n₂²)",
    condition: "n₂ > n₁, দুটোই পূর্ণসংখ্যা। নিঃসরণে এই শক্তির ফোটন বেরোয়। শোষণে একই শক্তি লাগে।",
    explain: "নিচের স্তর আটকে রাখলে ওপরের স্তর যত দূরে, ফোটনের শক্তি তত বেশি। অনেক দূরে গেলে শক্তি 13.6/n₁²-এর দিকে থেমে যায়।",
    meaning: "লাইমানে n₁ = 1, বামারে n₁ = 2, পাশে n₁ = 3।",
    slope: "n₂ বাড়লে ΔE বাড়ে, কিন্তু ধাপে ধাপে কম বাড়ে।",
    area: noArea,
    knobs: [knob("lower", "নিচের স্তর n₁", 1, 3, 1, "")],
    base: { lower: 1 },
    steps: [
      { eq: "E = −13.6 / n²", why: "প্রতিটি স্তরের শক্তি।" },
      { eq: "ΔE = E₂ − E₁", why: "ফোটন দুই স্তরের পার্থক্য নেয়।" },
      { eq: "ΔE = 13.6 (1/n₁² − 1/n₂²)", why: "n₂ > n₁ হলে ΔE ধনাত্মক।" },
    ],
    build(p) {
      const lower = Math.round(p.lower);
      const points: Point[] = [];
      for (let upper = lower + 1; upper <= 8; upper += 1) points.push({ x: upper, y: rydberg * (1 / (lower * lower) - 1 / (upper * upper)) });
      const limit = rydberg / (lower * lower);
      return {
        curves: [curve("main", "ফোটন", copper, points, { dots: true })],
        calc: `n₁ = ${bnNum(lower, 0)}। n₂ = ${bnNum(lower + 1, 0)} হলে ΔE = ${bnNum(points[0]?.y ?? 0, 2)} eV। আয়নীকরণ সীমা ${bnNum(limit, 2)} eV।`,
      };
    },
  },
  {
    id: "nu-nt",
    chapter: "nucleus",
    title: "তেজস্ক্রিয় নিউক্লিয়াসের সংখ্যা–সময়",
    source: "book",
    xName: "সময়",
    yName: "অক্ষয় নিউক্লিয়াস",
    xSymbol: "t",
    ySymbol: "N",
    formula: "N = N₀ e^(−λt)",
    condition: "λ ক্ষয় ধ্রুবক। একই সূত্র অর্ধায়ু দিয়ে N = N₀ / 2^(t/T), T = ln2 / λ।",
    explain: "সংখ্যা সময়ের সাথে সূচকীয়ভাবে কমে। অর্ধায়ুতে ঠিক অর্ধেক থাকে, তারপর আবার অর্ধেক।",
    meaning: "ক্ষয়ের হার অবশিষ্ট সংখ্যার সমানুপাতিক, তাই লেখ সরলরেখা নয়।",
    slope: "স্থানীয় ঢাল = −λN। ঢালের মান কমতে থাকে।",
    area: noArea,
    origin: "both",
    knobs: [knob("n0", "শুরুর সংখ্যা N₀", 100, 1000, 50, ""), knob("half", "অর্ধায়ু T", 1, 8, 0.5, "")],
    base: { n0: 800, half: 2 },
    steps: [
      { eq: "dN/dt = −λ N", why: "ক্ষয়ের হার অবশিষ্ট সংখ্যার সমানুপাতিক।" },
      { eq: "N = N₀ e^(−λt)", why: "সমাধান। সূচকীয় ক্ষয়।" },
      { eq: "t = T হলে N = N₀/2", why: "T = ln2 / λ। অর্ধায়ুর সংজ্ঞা।", tag: "ধ্রুব" },
    ],
    build(p) {
      const lambda = Math.LN2 / p.half;
      const count = (time: number) => p.n0 * Math.exp(-lambda * time);
      return {
        curves: [curve("main", "N–t", copper, samples(0, p.half * 4, count, 80))],
        guides: [
          { x: p.half, label: "T" },
          { x: p.half * 2, label: "2T" },
        ],
        calc: `λ = ${bnNum(lambda, 3)}। T-তে N = ${bnNum(count(p.half), 0)}, 2T-তে ${bnNum(count(p.half * 2), 0)}।`,
      };
    },
  },
  {
    id: "nu-lambda",
    chapter: "nucleus",
    title: "ক্ষয় ধ্রুবক ও ক্ষয়ের হার",
    source: "book",
    xName: "ক্ষয় ধ্রুবক",
    yName: "ক্ষয়ের হার",
    xSymbol: "λ",
    ySymbol: "|dN/dt|",
    formula: "|dN/dt| = λ N",
    condition: "একটি নির্দিষ্ট মুহূর্তে N আটকে রাখা। λ বদলালে হার কীভাবে বদলায়, সেই লেখ।",
    explain: "সংখ্যা স্থির থাকলে ক্ষয়ের হার λ-এর সমানুপাতিক। রেখা মূলবিন্দু দিয়ে যায়, ঢাল N।",
    meaning: "অর্ধায়ু কম মানে λ বড়, মানে একই সংখ্যায় ক্ষয় দ্রুত।",
    slope: "ঢাল = N।",
    area: noArea,
    origin: "both",
    knobs: [knob("count", "অবশিষ্ট N", 100, 1000, 50, "")],
    base: { count: 400 },
    steps: [
      { eq: "dN/dt = −λ N", why: "ক্ষয় সূত্র।" },
      { eq: "|dN/dt| = λ N", why: "হার ধনাত্মক রাশি।" },
      { eq: "N স্থির  →  হার ∝ λ", why: "মূলবিন্দুগামী সরলরেখা। ঢাল N।", tag: "সমানুপাত" },
    ],
    build(p) {
      return {
        curves: [curve("main", "হার", copper, samples(0, 1, (lambda) => lambda * p.count, 16))],
        calc: `N = ${bnNum(p.count, 0)}। λ = 0.5 হলে হার = ${bnNum(0.5 * p.count, 0)} প্রতি একক সময়ে।`,
      };
    },
  },
  {
    id: "nu-activity",
    chapter: "nucleus",
    title: "সক্রিয়তা–সময়",
    source: "book",
    xName: "সময়",
    yName: "সক্রিয়তা",
    xSymbol: "t",
    ySymbol: "A",
    formula: "A = A₀ e^(−λt)",
    condition: "A = λN। N যেমন কমে, সক্রিয়তাও তেমন কমে। একই অর্ধায়ু।",
    explain: "সক্রিয়তা প্রতি সেকেন্ডে ক্ষয়ের সংখ্যা। লেখ N–t-এর মতো সূচকীয়, অর্ধায়ুতে অর্ধেক।",
    meaning: "বেকারেল এই হারের একক। নমুনা পুরোনো হলে সক্রিয়তা কমে।",
    slope: "স্থানীয় ঢাল = −λA।",
    area: noArea,
    origin: "both",
    knobs: [knob("a0", "শুরুর সক্রিয়তা A₀", 100, 1000, 50, ""), knob("half", "অর্ধায়ু T", 1, 8, 0.5, "")],
    base: { a0: 600, half: 2 },
    steps: [
      { eq: "A = λ N", why: "সক্রিয়তার সংজ্ঞা।" },
      { eq: "N = N₀ e^(−λt)", why: "সংখ্যার ক্ষয়।" },
      { eq: "A = A₀ e^(−λt)", why: "λ স্থির, তাই A-ও একই হারে কমে।", tag: "ধ্রুব" },
    ],
    build(p) {
      const lambda = Math.LN2 / p.half;
      const activity = (time: number) => p.a0 * Math.exp(-lambda * time);
      return {
        curves: [curve("main", "A–t", copper, samples(0, p.half * 4, activity, 80))],
        guides: [{ x: p.half, label: "T" }],
        calc: `T-তে A = ${bnNum(activity(p.half), 0)}। A₀-এর অর্ধেক।`,
      };
    },
  },
  {
    id: "nu-half",
    chapter: "nucleus",
    title: "অর্ধায়ুর ক্ষয় বক্ররেখা",
    source: "book",
    xName: "অর্ধায়ুর গুণিতক",
    yName: "অবশিষ্ট ভগ্নাংশ",
    xSymbol: "t/T",
    ySymbol: "N/N₀",
    formula: "N/N₀ = (1/2)^(t/T)",
    condition: "অক্ষ অর্ধায়ু দিয়ে মাপা, তাই যেকোনো পদার্থের লেখ একই। ড্যাশ রেখা N₀/2, N₀/4, N₀/8।",
    explain: "এক অর্ধায়ুতে অর্ধেক, দুইয়ে এক-চতুর্থাংশ, তিনে এক-অষ্টমাংশ। শূন্যে কখনো পৌঁছায় না।",
    meaning: "অর্ধায়ু গড় আয়ু নয়। গড় আয়ু 1/λ = T/ln2 ≈ 1.44 T।",
    slope: "ঢাল ক্রমে শূন্যের দিকে।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "λ T = ln 2", why: "অর্ধায়ুর সংজ্ঞা।" },
      { eq: "N/N₀ = e^(−λt) = 2^(−t/T)", why: "সময়কে T দিয়ে ভাগ।" },
      { eq: "প্রতি T-তে অর্ধেক", why: "১, ২, ৩ অর্ধায়ুতে ১/২, ১/৪, ১/৮।", tag: "ধ্রুব" },
    ],
    build() {
      const fraction = (ratio: number) => 0.5 ** ratio;
      return {
        curves: [
          curve("main", "ক্ষয়", copper, samples(0, 4, fraction, 80)),
          curve("h1", "১/২", blue, [{ x: 0, y: 0.5 }, { x: 4, y: 0.5 }], { dashed: true }),
          curve("h2", "১/৪", green, [{ x: 0, y: 0.25 }, { x: 4, y: 0.25 }], { dashed: true }),
          curve("h3", "১/৮", gold, [{ x: 0, y: 0.125 }, { x: 4, y: 0.125 }], { dashed: true }),
        ],
        guides: [
          { x: 1, label: "T" },
          { x: 2, label: "2T" },
          { x: 3, label: "3T" },
        ],
        calc: "T-তে ০.৫, 2T-তে ০.২৫, 3T-তে ০.১২৫।",
      };
    },
  },
  {
    id: "nu-binding",
    chapter: "nucleus",
    title: "ভর সংখ্যা–প্রতি নিউক্লিয়নের বন্ধনশক্তি",
    source: "schematic",
    xName: "ভর সংখ্যা",
    yName: "প্রতি নিউক্লিয়নে বন্ধনশক্তি",
    xSymbol: "A",
    ySymbol: "BE/A (MeV)",
    formula: "আকারের নকশা, পরিমাপের সারণি নয়",
    condition: "পাঠ্যবইয়ের নকশা। হালকা নিউক্লিয়াসে দ্রুত ওঠে, লোহার কাছে শিখর, তারপর ধীরে নামে। কোনো একটি নিউক্লিয়াসের মাপা মান দাবি করে না।",
    explain: "শিখরের কাছে নিউক্লিয়াস সবচেয়ে দৃঢ়। হালকা দিক থেকে শিখরের দিকে গেলে সংযোজন, ভারী দিক থেকে এলে বিভাজন — দুটোতেই শক্তি বেরোয়।",
    meaning: "BE/A প্রায় 8 MeV-এর কাছে। লোহা-নিকেল অঞ্চলে সবচেয়ে বেশি।",
    slope: "শিখরের আগে ঢাল ধনাত্মক, পরে ঋণাত্মক ও ছোট।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "BE = Δm c²", why: "ভর ত্রুটিই বন্ধনশক্তি।" },
      { eq: "BE/A", why: "প্রতি নিউক্লিয়নে ভাগ করলে নিউক্লিয়াস তুলনীয় হয়।" },
      { eq: "শিখর A ≈ 56", why: "নকশায় লোহার কাছে সর্বোচ্চ, তারপর ধীর পতন।", tag: "ধ্রুব" },
    ],
    build() {
      return {
        curves: [curve("main", "BE/A", copper, samples(2, 250, binding, 120))],
        guides: [{ x: 56, label: "শিখর" }],
        calc: `নকশায় A = 56-এ BE/A ≈ ${bnNum(binding(56), 2)} MeV। A = 238-এ ≈ ${bnNum(binding(238), 2)} MeV।`,
      };
    },
  },
  {
    id: "nu-defect",
    chapter: "nucleus",
    title: "ভর ত্রুটি–বন্ধনশক্তি",
    source: "book",
    xName: "ভর ত্রুটি",
    yName: "বন্ধনশক্তি",
    xSymbol: "Δm (u)",
    ySymbol: "BE (MeV)",
    formula: "BE = 931.5 Δm",
    condition: "Δm পারমাণবিক ভর এককে। 1 u ↔ 931.5 MeV।",
    explain: "বন্ধনশক্তি ভর ত্রুটির সমানুপাতিক। রেখা মূলবিন্দুগামী। অল্প ভর ত্রুটিতেই শত শত মেগা ইলেকট্রনভোল্ট।",
    meaning: "নিউক্লিয়াসের ভর তার প্রোটন ও নিউট্রনের যোগফলের চেয়ে কম। সেই ঘাটতিই বন্ধন।",
    slope: "ঢাল = 931.5 MeV/u।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "E = Δm c²", why: "ভর–শক্তি।" },
      { eq: "1 u = 931.5 MeV/c²", why: "পারমাণবিক একক।" },
      { eq: "BE ∝ Δm", why: "মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build() {
      return {
        curves: [curve("main", "BE", copper, samples(0, 0.2, (defect) => EV_PER_U * defect, 16))],
        calc: `0.1 u-এ BE = ${bnNum(EV_PER_U * 0.1, 1)} MeV।`,
      };
    },
  },
  {
    id: "nu-fission",
    chapter: "nucleus",
    title: "বিভাজন ও সংযোজনের শক্তি",
    source: "schematic",
    xName: "ভর সংখ্যা",
    yName: "প্রতি নিউক্লিয়নে বন্ধনশক্তি",
    xSymbol: "A",
    ySymbol: "BE/A (MeV)",
    formula: "শিখরের দিকে গেলে শক্তি বেরোয়",
    condition: "পাঠ্যবইয়ের নকশা, আগের BE/A লেখেরই ব্যাখ্যা। বাঁ দিকের গাইড সংযোজন, ডান দিকের গাইড বিভাজন। মাপা বিক্রিয়ার শক্তি নয়।",
    explain: "হালকা নিউক্লিয়াস জুড়ে শিখরের দিকে গেলে প্রতি নিউক্লিয়নে বন্ধন বাড়ে — সংযোজন। ভারী নিউক্লিয়াস ভেঙে মাঝামাঝি এলেও বন্ধন বাড়ে — বিভাজন। বাড়তি বন্ধনশক্তি বেরিয়ে আসে।",
    meaning: "সূর্যে সংযোজন, চুল্লিতে বিভাজন। দুটোই BE/A বক্ররেখার ঢালের দিক।",
    slope: "সংযোজন অঞ্চলে ঢাল ধনাত্মক। বিভাজন অঞ্চলে ঋণাত্মক, তাই A কমলে BE/A বাড়ে।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "BE/A শিখরের দিকে বাড়ে", why: "লোহার কাছে নিউক্লিয়াস সবচেয়ে দৃঢ়।" },
      { eq: "সংযোজন: ছোট A → শিখর", why: "BE/A বাড়ে, পার্থক্য শক্তি হয়ে বেরোয়।" },
      { eq: "বিভাজন: বড় A → শিখর", why: "ভেঙে মাঝামাঝি এলেও BE/A বাড়ে।", tag: "ধ্রুব" },
    ],
    build() {
      return {
        curves: [curve("main", "BE/A", copper, samples(2, 250, binding, 120))],
        guides: [
          { x: 4, label: "সংযোজন" },
          { x: 56, label: "শিখর" },
          { x: 235, label: "বিভাজন" },
        ],
        calc: `নকশায় A = 4 থেকে 56-এ BE/A প্রায় ${bnNum(binding(4), 1)} থেকে ${bnNum(binding(56), 1)} MeV। A = 235-এ প্রায় ${bnNum(binding(235), 1)} MeV।`,
      };
    },
  },
  {
    id: "nu-radius",
    chapter: "nucleus",
    title: "নিউক্লিয়াসের ব্যাসার্ধ–ভর সংখ্যা",
    source: "book",
    xName: "ভর সংখ্যা",
    yName: "ব্যাসার্ধ",
    xSymbol: "A",
    ySymbol: "R (fm)",
    formula: "R = R₀ A^(1/3)",
    condition: "R₀ = 1.2 fm। নিউক্লিয়াসের ঘনত্ব প্রায় স্থির, তাই আয়তন A-এর সমানুপাতিক।",
    explain: "ব্যাসার্ধ ভর সংখ্যার ঘনমূলের সমানুপাতিক। A আট গুণ হলে ব্যাসার্ধ দ্বিগুণ।",
    meaning: "নিউক্লিয় ঘনত্ব মোটামুটি সব নিউক্লিয়াসে এক।",
    slope: "ঢাল = R₀ / (3 A^(2/3)), A বাড়লে ঢাল কমে।",
    area: noArea,
    origin: "both",
    knobs: [knob("r0", "R₀", 1.1, 1.4, 0.05, "fm")],
    base: { r0: 1.2 },
    steps: [
      { eq: "আয়তন ∝ A", why: "ঘনত্ব প্রায় ধ্রুব।" },
      { eq: "R³ ∝ A", why: "গোলকের আয়তন।" },
      { eq: "R = R₀ A^(1/3)", why: "ব্যাসার্ধ ঘনমূলের সমানুপাতিক।", tag: "ঘনমূল" },
    ],
    build(p) {
      const radius = (mass: number) => p.r0 * Math.cbrt(mass);
      return {
        curves: [curve("main", "R–A", copper, samples(1, 250, radius, 80))],
        calc: `A = 27 হলে R = ${bnNum(radius(27), 2)} fm। A = 216 হলে R = ${bnNum(radius(216), 2)} fm, আট গুণ ভরে দ্বিগুণ ব্যাসার্ধ।`,
      };
    },
  },
];

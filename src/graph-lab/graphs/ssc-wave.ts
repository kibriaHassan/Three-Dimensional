import { bnNum } from "../format";
import { copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const sscWaveGraphs: GraphSpec[] = [
  {
    id: "sw-yt",
    chapter: "ssc-wave",
    title: "সরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "y (cm)",
    formula: "y = A sin(2πt/T)",
    condition: "মাধ্যমের একটি কণা। আদি দশা শূন্য।",
    explain: "কণা সাম্যাবস্থানের দুই পাশে দোলে। এক পর্যায়কালে একবার পুরো চক্র। বিস্তার শীর্ষ সরণ।",
    meaning: "তরঙ্গের শক্তি এগোয়, এই কণা নিজ জায়গায় দোলে।",
    slope: "ঢাল সময়ের সাথে বদলায়। সাম্যাবস্থানে সবচেয়ে খাড়া।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 1, 5, 0.5, "cm"), knob("period", "পর্যায়কাল T", 0.5, 3, 0.1, "s")],
    base: { amp: 2, period: 2 },
    steps: [
      { eq: "সরল ছন্দিত গতি", why: "তরঙ্গের একটি কণা এভাবে দোলে।" },
      { eq: "y = A sin(2πt/T)", why: "আদি দশা শূন্য।" },
      { eq: "শীর্ষ = A", why: "সাইন 1-এর বেশি হয় না। T-তে চক্র শেষ।", tag: "ধ্রুব" },
    ],
    build(p) {
      const end = p.period * 2;
      return {
        curves: [curve("main", "y–t", copper, samples(0, end, (time) => p.amp * Math.sin((2 * Math.PI * time) / p.period), 160))],
        calc: `A = ${bnNum(p.amp, 1)} cm, T = ${bnNum(p.period, 1)} s। দুই চক্র।`,
      };
    },
  },
  {
    id: "sw-yx",
    chapter: "ssc-wave",
    title: "সরণ–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "সরণ",
    xSymbol: "x (m)",
    ySymbol: "y (cm)",
    formula: "y = A sin(2πx/λ)",
    condition: "এক মুহূর্তের ছবি। তরঙ্গ ডানদিকে এগোচ্ছে, এই লেখে সময় থেমে আছে।",
    explain: "এক তরঙ্গদৈর্ঘ্যে আকৃতি একবার পুনরাবৃত্তি হয়। পাশের কণাদের সরণ আলাদা।",
    meaning: "y–t একটি কণার ইতিহাস। y–x পুরো তরঙ্গের এক ঝলক।",
    slope: "স্থানীয় ঢাল তরঙ্গের হেলান।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 1, 5, 0.5, "cm"), knob("lambda", "তরঙ্গদৈর্ঘ্য λ", 0.5, 3, 0.1, "m")],
    base: { amp: 2, lambda: 2 },
    steps: [
      { eq: "λ দূরত্বে দশা 2π বাড়ে", why: "এক পূর্ণ তরঙ্গ।" },
      { eq: "y = A sin(2πx/λ)", why: "এক মুহূর্তের সরণ।" },
      { eq: "x = λ হলে y আবার ০", why: "পরের চক্র শুরু।", tag: "ধ্রুব" },
    ],
    build(p) {
      return {
        curves: [curve("main", "y–x", copper, samples(0, p.lambda * 2, (position) => p.amp * Math.sin((2 * Math.PI * position) / p.lambda), 160))],
        calc: `λ = ${bnNum(p.lambda, 1)} m। দুই তরঙ্গদৈর্ঘ্য দেখানো।`,
      };
    },
  },
  {
    id: "sw-amp",
    chapter: "ssc-wave",
    title: "বিস্তার–সময়",
    source: "book",
    xName: "সময়",
    yName: "বিস্তার",
    xSymbol: "t (s)",
    ySymbol: "A (cm)",
    formula: "A = ধ্রুব",
    condition: "আদর্শ অবিরত তরঙ্গ। শক্তি ক্ষয় বা স্পন্দনের খাম এই লেখে নেই।",
    explain: "বিস্তার সময়ের সাথে বদলায় না। লেখ অনুভূমিক। কণার সরণ দোলে, বিস্তার নয়।",
    meaning: "সরণ–সময় লেখের শীর্ষ এই উচ্চতায় থাকে।",
    slope: "ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("amp", "বিস্তার A", 1, 5, 0.5, "cm")],
    base: { amp: 2 },
    steps: [
      { eq: "y = A sin(2πt/T)", why: "A সামনে গুণ, সময়ের ফাংশন নয়।" },
      { eq: "আদর্শ তরঙ্গে A স্থির", why: "শক্তি একই থাকে।" },
      { eq: "লেখ অনুভূমিক", why: "t বদলালে A বদলায় না।", tag: "ধ্রুব" },
    ],
    build(p) {
      return {
        curves: [curve("main", "A", copper, samples(0, 8, () => p.amp, 12))],
        calc: `A = ${bnNum(p.amp, 1)} cm, পুরো সময়ে।`,
      };
    },
  },
  {
    id: "sw-ft",
    chapter: "ssc-wave",
    title: "কম্পাঙ্ক–পর্যায়কাল",
    source: "book",
    xName: "পর্যায়কাল",
    yName: "কম্পাঙ্ক",
    xSymbol: "T (s)",
    ySymbol: "f (Hz)",
    formula: "f = 1/T",
    condition: "T শূন্য নয়।",
    explain: "কম্পাঙ্ক পর্যায়কালের ব্যাস্তানুপাতিক। পর্যায়কাল দ্বিগুণ হলে কম্পাঙ্ক অর্ধেক।",
    meaning: "প্রতি সেকেন্ডে যত চক্র, সেটিই কম্পাঙ্ক।",
    slope: "ঢাল = −1/T²।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "f = 1/T", why: "কম্পাঙ্কের সংজ্ঞা।" },
      { eq: "f ∝ 1/T", why: "ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ অধিবৃত্ত", why: "সরলরেখা নয়।" },
    ],
    build() {
      return {
        curves: [curve("main", "f–T", copper, samples(0.25, 4, (period) => 1 / period))],
        calc: "T = 1 s হলে f = 1 Hz। T = 0.5 s হলে f = 2 Hz।",
      };
    },
  },
  {
    id: "sw-lf",
    chapter: "ssc-wave",
    title: "তরঙ্গদৈর্ঘ্য–কম্পাঙ্ক",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "তরঙ্গদৈর্ঘ্য",
    xSymbol: "f (Hz)",
    ySymbol: "λ (m)",
    formula: "λ = v/f",
    condition: "তরঙ্গের বেগ স্থির। বাতাসে শব্দের কাছাকাছি মান নবে।",
    explain: "বেগ না বদলালে তরঙ্গদৈর্ঘ্য কম্পাঙ্কের ব্যাস্তানুপাতিক। চড়া স্বরের তরঙ্গদৈর্ঘ্য খাটো।",
    meaning: "v = fλ। বেগ দুইয়ের গুণফল।",
    slope: "ঢাল = −v/f²।",
    area: noArea,
    knobs: [knob("speed", "বেগ v", 300, 400, 5, "m/s")],
    base: { speed: 340 },
    steps: [
      { eq: "v = fλ", why: "তরঙ্গের বেগ।" },
      { eq: "v স্থির  →  λ = v/f", why: "কম্পাঙ্ক হর।" },
      { eq: "λ ∝ 1/f", why: "ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
    ],
    build(p) {
      return {
        curves: [curve("main", "λ–f", copper, samples(50, 800, (frequency) => p.speed / frequency))],
        calc: `v = ${bnNum(p.speed, 0)} m/s। 340 Hz-এ λ = ${bnNum(p.speed / 340, 2)} m।`,
      };
    },
  },
  {
    id: "sw-intensity",
    chapter: "ssc-wave",
    title: "শব্দের তীব্রতা–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "তীব্রতা",
    xSymbol: "r (m)",
    ySymbol: "I (W/m²)",
    formula: "I = P / (4πr²)",
    condition: "বিন্দু উৎস। শক্তি সবদিকে সমান ছড়ায়। শোষণ নেই।",
    explain: "তীব্রতা দূরত্বের বর্গের ব্যাস্তানুপাতিক। দূরত্ব দ্বিগুণ হলে তীব্রতা এক-চতুর্থাংশ।",
    meaning: "কাছে শব্দ জোরালো, দূরে ক্ষীণ। কম্পাঙ্ক এই লেখে বদলায় না।",
    slope: "ঢাল = −2P/(4πr³)।",
    area: noArea,
    knobs: [knob("power", "উৎসের ক্ষমতা P", 1, 20, 1, "W")],
    base: { power: 10 },
    steps: [
      { eq: "ক্ষমতা গোলকের তলে ছড়ায়", why: "বিন্দু উৎস।" },
      { eq: "ক্ষেত্রফল = 4πr²", why: "গোলকের পৃষ্ঠ।" },
      { eq: "I ∝ 1/r²", why: "বর্গের ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
    ],
    build(p) {
      const intensity = (distance: number) => p.power / (4 * Math.PI * distance * distance);
      return {
        curves: [curve("main", "I–r", copper, samples(1, 12, intensity))],
        calc: `১ m-এ I = ${bnNum(intensity(1), 3)} W/m²। ২ m-এ ${bnNum(intensity(2), 3)}।`,
      };
    },
  },
  {
    id: "sw-pitch",
    chapter: "ssc-wave",
    title: "কম্পাঙ্ক–তীক্ষ্ণতা",
    source: "schematic",
    xName: "কম্পাঙ্ক",
    yName: "তীক্ষ্ণতা",
    xSymbol: "f (Hz)",
    ySymbol: "আপেক্ষিক",
    formula: "তীক্ষ্ণতা কম্পাঙ্কের সাথে বাড়ে",
    condition: "পাঠ্যবইয়ের নকশা। খাড়া অক্ষ মাপা তীক্ষ্ণতা নয়, শুধু বাড়ার দিক। মানুষের কান লগারিদমে শোনে, এই সরলরেখা সেই বক্রতা দেখায় না।",
    explain: "কম্পাঙ্ক বাড়লে স্বর তীক্ষ্ণ হয়। খাটো তরঙ্গদৈর্ঘ্যের শব্দ চড়া শোনায়, বেগ এক থাকলে।",
    meaning: "তীব্রতা জোর, তীক্ষ্ণতা চড়া-খাদ। দুটো আলাদা।",
    slope: "নকশায় ঢাল ধনাত্মক ও স্থির।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "তীক্ষ্ণতা কম্পাঙ্কের অনুভূতি", why: "জোর তীব্রতার অনুভূতি।" },
      { eq: "f বাড়লে স্বর চড়ে", why: "একই বেগে λ কমে।" },
      { eq: "এই লেখ শুধু দিক", why: "সংখ্যাটি মেল বা ফোনের স্কেল নয়।", tag: "ধ্রুব" },
    ],
    build() {
      return {
        curves: [curve("main", "তীক্ষ্ণতা", copper, samples(100, 2000, (frequency) => (frequency - 100) / 190, 20))],
        calc: "100 Hz নিচু প্রান্ত, 2000 Hz উঁচু প্রান্ত। মাঝের সংখ্যা আপেক্ষিক।",
      };
    },
  },
];

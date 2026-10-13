import { bnNum } from "../format";
import { blue, copper, curve, gold, green, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

function omegaOf(frequency: number) {
  return 2 * Math.PI * frequency;
}

function energyOf(mass: number, frequency: number, amplitude: number) {
  const omega = omegaOf(frequency);
  return 0.5 * mass * omega * omega * amplitude * amplitude;
}

const motion = "সরল ছন্দিত গতি। সাম্যাবস্থা x = 0। x = A sin(ωt + φ), ω = 2πf, T = 1/f।";

export const shmGraphs: GraphSpec[] = [
  {
    id: "shm-xt",
    chapter: "shm",
    title: "সরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "x (m)",
    formula: "x = A sin(ωt + φ)",
    condition: motion,
    explain: "সরণ সাইন তরঙ্গ। বিস্তার A লেখের উচ্চতা। কম্পাঙ্ক বাড়লে একই সময়ে বেশি দোলন, অর্থাৎ পর্যায়কাল T = 1/f কমে। দশা φ লেখকে পাশাপাশি সরায়।",
    meaning: "সরল ছন্দিত গতির সরণ সময়ের সঙ্গে সাইন বা কোসাইনের মতো। বিস্তার, কম্পাঙ্ক ও দশা তিনটেই এই লেখে দেখা যায়।",
    slope: "যেকোনো মুহূর্তে ঢাল = বেগ v = Aω cos(ωt + φ)।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"), knob("phase", "দশা φ", -180, 180, 15, "°")],
    base: { amp: 0.2, freq: 1, phase: 0 },
    build(p) {
      const period = 1 / p.freq;
      const phase = (p.phase * Math.PI) / 180;
      const omega = omegaOf(p.freq);
      return {
        curves: [curve("main", "x–t", copper, samples(0, 2 * period, (t) => p.amp * Math.sin(omega * t + phase)))],
        calc: `T = 1/f = ${bnNum(period)} s। ω = ${bnNum(omega)} rad/s। দুই পূর্ণ দোলন দেখানো।`,
      };
    },
  },
  {
    id: "shm-vt",
    chapter: "shm",
    title: "বেগ–সময়",
    source: "book",
    xName: "সময়",
    yName: "বেগ",
    xSymbol: "t (s)",
    ySymbol: "v (m/s)",
    formula: "v = Aω cos(ωt + φ)",
    condition: motion,
    explain: "বেগও সাইন-জাতীয়, কিন্তু সরণের চেয়ে দশায় 90° এগিয়ে। সাম্যাবস্থায় বেগের মান সবচেয়ে বেশি, Aω। প্রান্তে বেগ শূন্য।",
    meaning: "বিস্তার বা কম্পাঙ্ক বাড়লে সর্বোচ্চ বেগ বাড়ে। কম্পাঙ্কের প্রভাব দ্বিগুণ, কারণ ω = 2πf।",
    slope: "ঢাল = ত্বরণ a = −Aω² sin(ωt + φ)।",
    area: "ক্ষেত্রফল = সরণের পরিবর্তন।",
    fillArea: true,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"), knob("phase", "দশা φ", -180, 180, 15, "°")],
    base: { amp: 0.2, freq: 1, phase: 0 },
    build(p) {
      const period = 1 / p.freq;
      const phase = (p.phase * Math.PI) / 180;
      const omega = omegaOf(p.freq);
      return {
        curves: [curve("main", "v–t", blue, samples(0, 2 * period, (t) => p.amp * omega * Math.cos(omega * t + phase)))],
        calc: `সর্বোচ্চ বেগ Aω = ${bnNum(p.amp * omega)} m/s। T = ${bnNum(period)} s।`,
      };
    },
  },
  {
    id: "shm-at",
    chapter: "shm",
    title: "ত্বরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "ত্বরণ",
    xSymbol: "t (s)",
    ySymbol: "a (m/s²)",
    formula: "a = −Aω² sin(ωt + φ)",
    condition: motion,
    explain: "ত্বরণ সরণের বিপরীত দশায়। সরণ ধনাত্মক সর্বোচ্চ হলে ত্বরণ ঋণাত্মক সর্বোচ্চ। মান Aω²।",
    meaning: "ত্বরণ সব সময় সাম্যাবস্থার দিকে। এটাই সরল ছন্দিত গতির চিহ্ন: a = −ω²x।",
    slope: "এই লেখ থেকে ত্বরণ পড়া যায়। সরণের সঙ্গে সম্পর্ক a = −ω²x।",
    area: "ক্ষেত্রফল = বেগের পরিবর্তন।",
    fillArea: true,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"), knob("phase", "দশা φ", -180, 180, 15, "°")],
    base: { amp: 0.2, freq: 1, phase: 0 },
    build(p) {
      const period = 1 / p.freq;
      const phase = (p.phase * Math.PI) / 180;
      const omega = omegaOf(p.freq);
      return {
        curves: [curve("main", "a–t", green, samples(0, 2 * period, (t) => -p.amp * omega * omega * Math.sin(omega * t + phase)))],
        calc: `সর্বোচ্চ ত্বরণ Aω² = ${bnNum(p.amp * omega * omega)} m/s²। ω² = ${bnNum(omega * omega)} s⁻²।`,
      };
    },
  },
  {
    id: "shm-vx",
    chapter: "shm",
    title: "বেগ–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "বেগ",
    xSymbol: "x (m)",
    ySymbol: "v (m/s)",
    formula: "v² = ω²(A² − x²)",
    condition: motion,
    explain: "সরণ ও বেগ একসঙ্গে একটি উপবৃত্ত আঁকে। প্রান্তে x = ±A, বেগ শূন্য। মাঝখানে x = 0, বেগ ±Aω।",
    meaning: "একই সরণে দুই দিকেই বেগ সমান মানের। শক্তি সংরক্ষণ থেকে এই উপবৃত্ত আসে।",
    slope: "এটি একক সরলরেখা নয়। সম্পর্ক v² = ω²(A² − x²)।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz")],
    base: { amp: 0.2, freq: 1 },
    build(p) {
      const omega = omegaOf(p.freq);
      const points: Point[] = [];
      const count = 120;
      for (let i = 0; i <= count; i++) {
        const phase = (2 * Math.PI * i) / count;
        points.push({ x: p.amp * Math.sin(phase), y: p.amp * omega * Math.cos(phase) });
      }
      return {
        curves: [curve("main", "v–x উপবৃত্ত", blue, points)],
        calc: `A = ${bnNum(p.amp, 2)} m। সর্বোচ্চ বেগ ±${bnNum(p.amp * omega)} m/s।`,
      };
    },
  },
  {
    id: "shm-ax",
    chapter: "shm",
    title: "ত্বরণ–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "ত্বরণ",
    xSymbol: "x (m)",
    ySymbol: "a (m/s²)",
    formula: "a = −ω²x",
    condition: motion,
    explain: "ত্বরণ সরণের ঋণাত্মক সমানুপাতিক। লেখ দ্বিতীয় ও চতুর্থ চতুর্ভাগ দিয়ে সরলরেখা। ঢাল −ω²।",
    meaning: "এই সরলরেখাই সরল ছন্দিত গতির সংজ্ঞা। সরণ যত প্রান্তে, টান তত বেশি।",
    slope: "ঢাল = −ω²।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz")],
    base: { amp: 0.2, freq: 1 },
    build(p) {
      const omega = omegaOf(p.freq);
      return {
        curves: [curve("main", "a = −ω²x", green, samples(-p.amp, p.amp, (x) => -omega * omega * x, 40))],
        calc: `ঢাল = −ω² = ${bnNum(-omega * omega)} s⁻²। x = A-এ a = ${bnNum(-omega * omega * p.amp)} m/s²।`,
      };
    },
  },
  {
    id: "shm-kx",
    chapter: "shm",
    title: "গতিশক্তি–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "গতিশক্তি",
    xSymbol: "x (m)",
    ySymbol: "K (J)",
    formula: "K = ½mω²(A² − x²)",
    condition: `${motion} কোনো অনিতিশক্তি নেই।`,
    explain: "গতিশক্তি মাঝখানে সবচেয়ে বেশি, প্রান্তে শূন্য। লেখ উল্টো পরাবৃত্ত। সর্বোচ্চ মান মোট শক্তি E।",
    meaning: "বেগ মাঝখানে বেশি বলে গতিশক্তিও মাঝখানে বেশি। প্রান্তে পুরো শক্তি বিভবে থাকে।",
    slope: "ঢাল = −mω²x। সাম্যাবস্থায় শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"), knob("mass", "ভর m", 0.2, 4, 0.1, "kg")],
    base: { amp: 0.2, freq: 1, mass: 1 },
    build(p) {
      const total = energyOf(p.mass, p.freq, p.amp);
      return {
        curves: [curve("main", "K–x", copper, samples(-p.amp, p.amp, (x) => total * (1 - (x * x) / (p.amp * p.amp))))],
        calc: `K সর্বোচ্চ = E = ${bnNum(total)} J। x = ±A-এ K = 0।`,
      };
    },
  },
  {
    id: "shm-ux",
    chapter: "shm",
    title: "বিভবশক্তি–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "বিভবশক্তি",
    xSymbol: "x (m)",
    ySymbol: "U (J)",
    formula: "U = ½mω²x²",
    condition: `${motion} বিভব সাম্যাবস্থায় শূন্য।`,
    explain: "বিভবশক্তি সরণের বর্গের সঙ্গে বাড়ে। সাম্যাবস্থায় শূন্য, দুই প্রান্তে E। লেখ পরাবৃত্ত।",
    meaning: "স্প্রিং বা সমতুল্য বল সরণের বিরুদ্ধে শক্তি সঞ্চয় করে। ঢালের ঋণাত্মক মান পুনরুদ্ধার বল।",
    slope: "ঢাল = mω²x = −F, যেখানে F পুনরুদ্ধার বল।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"), knob("mass", "ভর m", 0.2, 4, 0.1, "kg")],
    base: { amp: 0.2, freq: 1, mass: 1 },
    build(p) {
      const total = energyOf(p.mass, p.freq, p.amp);
      return {
        curves: [curve("main", "U–x", green, samples(-p.amp, p.amp, (x) => total * ((x * x) / (p.amp * p.amp))))],
        calc: `x = ±A-এ U = E = ${bnNum(total)} J। x = A/2-এ U = ${bnNum(total / 4)} J।`,
      };
    },
  },
  {
    id: "shm-ex",
    chapter: "shm",
    title: "মোট শক্তি–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "শক্তি",
    xSymbol: "x (m)",
    ySymbol: "E, K, U (J)",
    formula: "E = ½mω²A² = K + U",
    condition: `${motion} ঘর্ষণ বা অন্য অপচয় নেই, তাই মোট যান্ত্রিক শক্তি ধ্রুব।`,
    explain: "মোট শক্তি সরণের ওপর নির্ভর করে না, তাই অনুভূমিক সরলরেখা। গতিশক্তি ও বিভবশক্তি পরস্পর বদলালেও যোগফল এই রেখায় থাকে।",
    meaning: "সরল ছন্দিত গতিতে যান্ত্রিক শক্তি সংরক্ষিত। বিস্তার ও কম্পাঙ্ক মোট শক্তি ঠিক করে, সরণ করে না।",
    slope: "মোট শক্তির ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("amp", "বিস্তার A", 0.05, 0.4, 0.01, "m"), knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"), knob("mass", "ভর m", 0.2, 4, 0.1, "kg")],
    base: { amp: 0.2, freq: 1, mass: 1 },
    build(p) {
      const total = energyOf(p.mass, p.freq, p.amp);
      const half = p.amp / 2;
      const potential = total * 0.25;
      return {
        curves: [
          curve("kinetic", "K", copper, samples(-p.amp, p.amp, (x) => total * (1 - (x * x) / (p.amp * p.amp)))),
          curve("potential", "U", green, samples(-p.amp, p.amp, (x) => total * ((x * x) / (p.amp * p.amp)))),
          curve("main", "E", gold, samples(-p.amp, p.amp, () => total, 20)),
        ],
        calc: `E = ${bnNum(total)} J, সব সরণে। x = A/2 = ${bnNum(half, 2)} m-এ U = ${bnNum(potential)} J, K = ${bnNum(total - potential)} J, যোগফল ${bnNum(potential + (total - potential))} J।`,
      };
    },
  },
];

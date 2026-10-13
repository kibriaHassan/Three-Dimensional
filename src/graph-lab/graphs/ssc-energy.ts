import { bnNum } from "../format";
import { G_ACC, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const sscEnergyGraphs: GraphSpec[] = [
  {
    id: "se-fs",
    chapter: "ssc-energy",
    title: "বল–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "বল",
    xSymbol: "s (m)",
    ySymbol: "F (N)",
    formula: "F = ধ্রুব",
    condition: "বল সরণের দিকে এবং মানে স্থির। নিচের ক্ষেত্রফল কাজ।",
    explain: "স্থির বলের F–s লেখ অনুভূমিক। যতদূর সরবে, কাজ তত বাড়বে, বল নয়।",
    meaning: "ক্ষেত্রফল W = Fs।",
    slope: "ঢাল শূন্য।",
    area: "ক্ষেত্রফল = কাজ = Fs।",
    fillArea: true,
    origin: "y",
    knobs: [knob("force", "বল F", 2, 20, 1, "N")],
    base: { force: 8 },
    steps: [
      { eq: "W = Fs cosθ", why: "কাজের সংজ্ঞা।" },
      { eq: "θ = 0, F স্থির", why: "বল সরণের দিকে।" },
      { eq: "F–s অনুভূমিক", why: "উচ্চতা F, প্রস্থ s, ক্ষেত্রফল Fs।", tag: "ধ্রুব" },
    ],
    build(p) {
      return {
        curves: [curve("main", "F–s", copper, samples(0, 10, () => p.force, 12))],
        calc: `১০ m-এ কাজ = ${bnNum(p.force * 10, 0)} J।`,
      };
    },
  },
  {
    id: "se-ws",
    chapter: "ssc-energy",
    title: "কাজ–সরণ",
    source: "book",
    xName: "সরণ",
    yName: "কাজ",
    xSymbol: "s (m)",
    ySymbol: "W (J)",
    formula: "W = Fs",
    condition: "বল স্থির, সরণের অভিমুখে।",
    explain: "কাজ সরণের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল বল।",
    meaning: "সরণ শূন্য হলে কাজ শূন্য, বল থাকলেও।",
    slope: "ঢাল = F।",
    area: noArea,
    origin: "both",
    knobs: [knob("force", "বল F", 2, 20, 1, "N")],
    base: { force: 8 },
    steps: [
      { eq: "W = Fs", why: "বল ও সরণ এক দিকে।" },
      { eq: "F স্থির  →  W ∝ s", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = F", why: "মূলবিন্দুগামী সরলরেখা।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "W–s", copper, samples(0, 10, (shift) => p.force * shift, 17))],
        calc: `ঢাল = ${bnNum(p.force, 0)} N। ৬ m-এ W = ${bnNum(p.force * 6, 0)} J।`,
      };
    },
  },
  {
    id: "se-kv",
    chapter: "ssc-energy",
    title: "গতিশক্তি–বেগ",
    source: "book",
    xName: "বেগ",
    yName: "গতিশক্তি",
    xSymbol: "v (m/s)",
    ySymbol: "K (J)",
    formula: "K = ½mv²",
    condition: "ভর স্থির। বেগ দ্বিগুণ হলে গতিশক্তি চার গুণ।",
    explain: "গতিশক্তি বেগের বর্গের সমানুপাতিক। লেখ বক্র, মূলবিন্দু দিয়ে যায়।",
    meaning: "ধীর বস্তুর গতিশক্তি কম। থেমে গেলে K = 0।",
    slope: "ঢাল = mv। বেগ বাড়লে ঢাল বাড়ে।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ভর m", 0.5, 6, 0.5, "kg")],
    base: { mass: 2 },
    steps: [
      { eq: "K = ½mv²", why: "গতিশক্তির সংজ্ঞা।" },
      { eq: "m স্থির  →  K ∝ v²", why: "বর্গের সমানুপাত।", tag: "বর্গ" },
      { eq: "লেখ বক্র", why: "v বনাম K সরলরেখা নয়।" },
    ],
    build(p) {
      const energy = (speed: number) => 0.5 * p.mass * speed * speed;
      return {
        curves: [curve("main", "K–v", copper, samples(0, 8, energy, 33))],
        calc: `v = 4 m/s-এ K = ${bnNum(energy(4), 1)} J। v = 8 m/s-এ ${bnNum(energy(8), 1)} J।`,
      };
    },
  },
  {
    id: "se-km",
    chapter: "ssc-energy",
    title: "গতিশক্তি–ভর",
    source: "book",
    xName: "ভর",
    yName: "গতিশক্তি",
    xSymbol: "m (kg)",
    ySymbol: "K (J)",
    formula: "K = ½mv²",
    condition: "বেগ স্থির।",
    explain: "একই বেগে ভারী বস্তুর গতিশক্তি বেশি। রেখা মূলবিন্দুগামী, ঢাল ½v²।",
    meaning: "ভর দ্বিগুণ হলে গতিশক্তি দ্বিগুণ, বেগ না বদলালে।",
    slope: "ঢাল = ½v²।",
    area: noArea,
    origin: "both",
    knobs: [knob("speed", "বেগ v", 1, 10, 0.5, "m/s")],
    base: { speed: 4 },
    steps: [
      { eq: "K = ½mv²", why: "গতিশক্তি।" },
      { eq: "v স্থির  →  ½v² ধ্রুব", why: "ঢাল।" },
      { eq: "K ∝ m", why: "মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = 0.5 * p.speed * p.speed;
      return {
        curves: [curve("main", "K–m", copper, samples(0, 8, (mass) => slope * mass, 17))],
        calc: `v = ${bnNum(p.speed, 1)} m/s। ঢাল = ${bnNum(slope, 1)} J/kg।`,
      };
    },
  },
  {
    id: "se-uh",
    chapter: "ssc-energy",
    title: "বিভবশক্তি–উচ্চতা",
    source: "book",
    xName: "উচ্চতা",
    yName: "বিভবশক্তি",
    xSymbol: "h (m)",
    ySymbol: "U (J)",
    formula: "U = mgh",
    condition: "মাটির কাছে g স্থির। উচ্চতা সেই তল থেকে যেখানে U = 0 ধরা হয়েছে।",
    explain: "বিভবশক্তি উচ্চতার সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল mg।",
    meaning: "ওপরে তুললে শক্তি বাড়ে। ভর বেশি হলে একই উচ্চতায় শক্তি বেশি।",
    slope: "ঢাল = mg।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ভর m", 0.5, 8, 0.5, "kg")],
    base: { mass: 2 },
    steps: [
      { eq: "U = mgh", why: "অভিকর্ষজ বিভবশক্তি।" },
      { eq: "m ও g স্থির  →  U ∝ h", why: "সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = mg", why: "মূলবিন্দুগামী সরলরেখা।" },
    ],
    build(p) {
      const slope = p.mass * G_ACC;
      return {
        curves: [curve("main", "U–h", copper, samples(0, 10, (height) => slope * height, 17))],
        calc: `mg = ${bnNum(slope, 1)} N। ৫ m-এ U = ${bnNum(slope * 5, 1)} J।`,
      };
    },
  },
  {
    id: "se-pt",
    chapter: "ssc-energy",
    title: "ক্ষমতা–সময়",
    source: "book",
    xName: "সময়",
    yName: "ক্ষমতা",
    xSymbol: "t (s)",
    ySymbol: "P (W)",
    formula: "P = Fv = ma²t",
    condition: "নির্দিষ্ট পরিস্থিতি: স্থির বল, সুষম ত্বরণ, আদি বেগ শূন্য। তাই বেগ at, ক্ষমতা সময়ের সাথে বাড়ে।",
    explain: "বেগ বাড়ছে, বল একই, তাই প্রতি সেকেন্ডে কাজ বাড়ছে। ক্ষমতা সময়ের সমানুপাতিক।",
    meaning: "সমবেগে স্থির বলে ক্ষমতা স্থির হত। এখানে ত্বরণ আছে বলে ক্ষমতা বাড়ে।",
    slope: "ঢাল = ma² = Fa।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ভর m", 0.5, 6, 0.5, "kg"), knob("a", "ত্বরণ a", 0.5, 4, 0.5, "m/s²")],
    base: { mass: 2, a: 2 },
    steps: [
      { eq: "P = Fv", why: "তাৎক্ষণিক ক্ষমতা।" },
      { eq: "F = ma, v = at", why: "আদি বেগ শূন্য, বল স্থির।" },
      { eq: "P = ma² t", why: "P ∝ t। মূলবিন্দুগামী সরলরেখা।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = p.mass * p.a * p.a;
      return {
        curves: [curve("main", "P–t", copper, samples(0, 8, (time) => slope * time, 17))],
        calc: `F = ${bnNum(p.mass * p.a, 1)} N। ৪ s-এ v = ${bnNum(p.a * 4, 1)} m/s, P = ${bnNum(slope * 4, 1)} W।`,
      };
    },
  },
];

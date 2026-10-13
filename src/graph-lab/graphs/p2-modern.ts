import { bnNum } from "../format";
import { ELECTRON_MASS, EV_PER_U, PLANCK, PLANCK_EV, blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const photo = "ফোটন শক্তি hf। কাজ অপেক্ষক φ ইলেকট্রন বের করতেই খরচ। তার বেশি গতিশক্তি।";

export const modernGraphs: GraphSpec[] = [
  {
    id: "md-iv",
    chapter: "modern",
    title: "ফটোতড়িৎ প্রবাহ–বিভব",
    source: "schematic",
    xName: "অ্যানোড বিভব",
    yName: "ফটোতড়িৎ প্রবাহ",
    xSymbol: "V (V)",
    ySymbol: "I (μA)",
    formula: "V ≤ −V₀ হলে I = 0,   বড় ধনাত্মক V-এ I → Iₛ",
    condition: "হাঁটু থেকে স্যাচুরেশন পর্যন্ত বাঁক নকশা। থামানো বিভব V₀ ও স্যাচুরেশন প্রবাহ Iₛ পরীক্ষার রাশি। কম্পাঙ্ক সূচনার ওপরে।",
    explain: "ঋণাত্মক বিভব ইলেকট্রনকে ফেরায়। −V₀-এর বাঁয়ে প্রবাহ শূন্য। ধনাত্মক বিভবে প্রায় সব ইলেকট্রন পৌঁছায়, প্রবাহ আর বাড়ে না।",
    meaning: "V₀ থেকে Kₘₐₓ = eV₀। Iₛ আলোর তীব্রতায় বাড়ে, V₀ বাড়ে না।",
    slope: "স্যাচুরেশনে ঢাল প্রায় শূন্য। −V₀-এর আগে ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("stop", "থামানো বিভব V₀", 0.4, 2.5, 0.1, "V"), knob("sat", "স্যাচুরেশন Iₛ", 2, 12, 0.5, "μA")],
    base: { stop: 1.2, sat: 8 },
    steps: [
      { eq: "Kₘₐₓ = e V₀", why: "যে বিভব দ্রুততম ইলেকট্রনকেও থামায়।" },
      { eq: "V ≤ −V₀ → I = 0", why: "কোনো ইলেকট্রন অ্যানোডে পৌঁছায় না।" },
      { eq: "V বড় হলে I → Iₛ", why: "স্যাচুরেশন। বাঁকটা নকশা, দুই সীমা সূত্রের।" },
    ],
    build(p) {
      const current = (voltage: number) => {
        if (voltage <= -p.stop) return 0;
        return p.sat * (1 - Math.exp(-(voltage + p.stop) / 0.7));
      };
      return {
        curves: [curve("main", "I–V", copper, samples(-3, 4, current, 120))],
        guides: [{ x: -p.stop, label: "−V₀" }],
        calc: `V₀ = ${bnNum(p.stop, 1)} V, তাই Kₘₐₓ = ${bnNum(p.stop, 1)} eV। Iₛ = ${bnNum(p.sat, 1)} μA।`,
      };
    },
  },
  {
    id: "md-fk",
    chapter: "modern",
    title: "কম্পাঙ্ক–সর্বোচ্চ গতিশক্তি",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "সর্বোচ্চ গতিশক্তি",
    xSymbol: "f (10¹⁴ Hz)",
    ySymbol: "Kₘₐₓ (eV)",
    formula: "Kₘₐₓ = h f − φ",
    condition: `${photo} নিরেট রেখা শুধু f ≥ φ/h। ড্যাশ রেখা সূচনার নিচে, সেখানে নিঃসরণ নেই।`,
    explain: "গতিশক্তি কম্পাঙ্কের সাথে সরলরেখায় বাড়ে। ঢাল h, ছেদ −φ। তীব্রতা এই রেখা সরায় না।",
    meaning: "আইনস্টাইনের ফটোতড়িৎ সমীকরণ। ঢাল থেকে প্ল্যাঙ্ক ধ্রুবক।",
    slope: "ঢাল = h। এই অক্ষে h × 10¹⁴, একক eV।",
    area: noArea,
    origin: "both",
    knobs: [knob("work", "কাজ অপেক্ষক φ", 1.5, 3.5, 0.1, "eV")],
    base: { work: 2.2 },
    steps: [
      { eq: "E = h f", why: "এক ফোটনের শক্তি।" },
      { eq: "Kₘₐₓ = h f − φ", why: "φ খরচের পর যা থাকে।" },
      { eq: "Kₘₐₓ ∝ f নয় পুরোপুরি", why: "সরলরেখা, কিন্তু ছেদ −φ। f ≥ φ/h না হলে Kₘₐₓ ধরা হয় না।", tag: "রৈখিক" },
    ],
    build(p) {
      const slope = PLANCK_EV * 1e14;
      const threshold = p.work / slope;
      const line = (frequency: number) => slope * frequency - p.work;
      return {
        curves: [
          curve("main", "নিঃসরণ", copper, samples(threshold, 12, line, 40)),
          curve("below", "সূচনার নিচে", blue, samples(Math.max(0.5, threshold - 2), threshold, line, 20), { dashed: true }),
        ],
        guides: [{ x: threshold, label: "f₀" }],
        calc: `f₀ = ${bnNum(threshold, 2)} × 10¹⁴ Hz। ঢাল = ${bnNum(slope, 3)} eV / 10¹⁴ Hz।`,
      };
    },
  },
  {
    id: "md-fv",
    chapter: "modern",
    title: "কম্পাঙ্ক–নিরোধী বিভব",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "নিরোধী বিভব",
    xSymbol: "f (10¹⁴ Hz)",
    ySymbol: "V₀ (V)",
    formula: "e V₀ = h f − φ",
    condition: `${photo} Kₘₐₓ ইলেকট্রনভোল্টে সংখ্যায় V₀ ভোল্টের সমান।`,
    explain: "নিরোধী বিভব কম্পাঙ্কের সাথে সরলরেখা। ঢাল h/e। কাজ অপেক্ষক বদলালে রেখা সমান্তরাল সরে।",
    meaning: "তীব্রতা বাড়ালে এই রেখা নড়ে না। শুধু প্রবাহের স্যাচুরেশন বাড়ে।",
    slope: "ঢাল = h/e।",
    area: noArea,
    origin: "both",
    knobs: [knob("work", "কাজ অপেক্ষক φ", 1.5, 3.5, 0.1, "eV")],
    base: { work: 2.2 },
    steps: [
      { eq: "Kₘₐₓ = h f − φ", why: "ফটোতড়িৎ সমীকরণ।" },
      { eq: "Kₘₐₓ = e V₀", why: "নিরোধী বিভবের সংজ্ঞা।" },
      { eq: "V₀ = (h/e) f − φ/e", why: "f-এর সাথে রৈখিক। ঢাল h/e, ছেদ −φ/e।", tag: "রৈখিক" },
    ],
    build(p) {
      const slope = PLANCK_EV * 1e14;
      const threshold = p.work / slope;
      return {
        curves: [curve("main", "V₀–f", copper, samples(threshold, 12, (frequency) => slope * frequency - p.work, 40))],
        guides: [{ x: threshold, label: "f₀" }],
        calc: `φ = ${bnNum(p.work, 1)} eV। 8×10¹⁴ Hz-এ V₀ = ${bnNum(slope * 8 - p.work, 2)} V।`,
      };
    },
  },
  {
    id: "md-intensity",
    chapter: "modern",
    title: "তীব্রতা–ফটোতড়িৎ প্রবাহ",
    source: "book",
    xName: "আপেক্ষিক তীব্রতা",
    yName: "স্যাচুরেশন প্রবাহ",
    xSymbol: "তীব্রতা",
    ySymbol: "Iₛ",
    formula: "Iₛ ∝ তীব্রতা",
    condition: "কম্পাঙ্ক সূচনার ওপরে, স্থির। বিভব স্যাচুরেশন অঞ্চলে। তীব্রতা আপেক্ষিক, 1 মানে একটি নির্দিষ্ট আলো।",
    explain: "তীব্রতা বাড়লে প্রতি সেকেন্ডে ফোটন বাড়ে, ইলেকট্রন বাড়ে, প্রবাহ বাড়ে। Kₘₐₓ বদলায় না।",
    meaning: "প্রবাহ ফোটনের সংখ্যায়, গতিশক্তি ফোটনের কম্পাঙ্কে।",
    slope: "ঢাল ধ্রুব। এই অক্ষে 1 তীব্রতায় যে প্রবাহ, সেটাই ঢাল।",
    area: noArea,
    origin: "both",
    knobs: [knob("scale", "একক তীব্রতায় Iₛ", 1, 8, 0.5, "μA")],
    base: { scale: 4 },
    steps: [
      { eq: "তীব্রতা ∝ ফোটন/সেকেন্ড", why: "একই কম্পাঙ্কে প্রতি ফোটনের শক্তি সমান।" },
      { eq: "নিঃসৃত ইলেকট্রন ∝ ফোটন", why: "সূচনার ওপরে প্রতিটি যোগ্য ফোটন একটি ইলেকট্রন ছাড়াতে পারে।" },
      { eq: "Iₛ ∝ তীব্রতা", why: "স্যাচুরেশন প্রবাহ সেই ইলেকট্রনের হার।", tag: "সমানুপাত" },
    ],
    build(p) {
      return {
        curves: [curve("main", "Iₛ", copper, samples(0, 5, (intensity) => p.scale * intensity, 12))],
        calc: `তীব্রতা দ্বিগুণ হলে Iₛ দ্বিগুণ: ${bnNum(p.scale, 1)} μA থেকে ${bnNum(p.scale * 2, 1)} μA। Kₘₐₓ একই।`,
      };
    },
  },
  {
    id: "md-lp",
    chapter: "modern",
    title: "ডি ব্রগলি তরঙ্গদৈর্ঘ্য–ভরবেগ",
    source: "book",
    xName: "ভরবেগ",
    yName: "তরঙ্গদৈর্ঘ্য",
    xSymbol: "p (10⁻²⁴ kg m/s)",
    ySymbol: "λ (nm)",
    formula: "λ = h / p",
    condition: "h = 6.626×10⁻³⁴ J s। অক্ষে ভরবেগ 10⁻²⁴ দিয়ে ভাগ।",
    explain: "তরঙ্গদৈর্ঘ্য ভরবেগের ব্যাস্তানুপাতিক। ভরবেগ দ্বিগুণ হলে তরঙ্গদৈর্ঘ্য অর্ধেক।",
    meaning: "ইলেকট্রন, প্রোটন, বল — সবার জন্য এক সূত্র। ভর আলাদাভাবে ঢোকে না, ঢোকে ভরবেগে।",
    slope: "ঢাল = −h/p²।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "λ = h / p", why: "ডি ব্রগলির সম্পর্ক।" },
      { eq: "λ ∝ 1/p", why: "h ধ্রুব। ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ অধিবৃত্ত", why: "p বনাম λ সরলরেখা নয়।" },
    ],
    build() {
      const scale = (PLANCK / 1e-24) * 1e9;
      return {
        curves: [curve("main", "λ–p", copper, samples(0.3, 3, (momentum) => scale / momentum))],
        calc: `p = 10⁻²⁴ kg m/s হলে λ = ${bnNum(scale, 2)} nm।`,
      };
    },
  },
  {
    id: "md-lv",
    chapter: "modern",
    title: "ডি ব্রগলি তরঙ্গদৈর্ঘ্য–বেগ",
    source: "book",
    xName: "বেগ",
    yName: "তরঙ্গদৈর্ঘ্য",
    xSymbol: "v (m/s)",
    ySymbol: "λ (nm)",
    formula: "λ = h / (m v)",
    condition: "একটি ইলেকট্রন, ভর স্থির। আলোর বেগের কাছাকাছি নয়, তাই আপেক্ষিক ভর নেই।",
    explain: "বেগ বাড়লে তরঙ্গদৈর্ঘ্য কমে। λ বেগের ব্যাস্তানুপাতিক।",
    meaning: "একই বেগে ভারী কণার তরঙ্গদৈর্ঘ্য ছোট, কারণ p = mv বড়।",
    slope: "ঢাল = −h/(m v²)।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "p = m v", why: "অনাপেক্ষিক ভরবেগ। m স্থির।" },
      { eq: "λ = h / p", why: "ডি ব্রগলি।" },
      { eq: "λ ∝ 1/v", why: "ইলেকট্রনের জন্য ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
    ],
    build() {
      const scale = (PLANCK / ELECTRON_MASS) * 1e9;
      return {
        curves: [curve("main", "ইলেকট্রন", copper, samples(2e5, 2e6, (speed) => scale / speed))],
        calc: `10⁶ m/s-এ λ = ${bnNum(scale / 1e6, 3)} nm।`,
      };
    },
  },
  {
    id: "md-ef",
    chapter: "modern",
    title: "ফোটনের শক্তি–কম্পাঙ্ক",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "শক্তি",
    xSymbol: "f (10¹⁴ Hz)",
    ySymbol: "E (eV)",
    formula: "E = h f",
    condition: "একটি ফোটন। ঢাল প্ল্যাঙ্ক ধ্রুবক।",
    explain: "শক্তি কম্পাঙ্কের সমানুপাতিক। রেখা মূলবিন্দু দিয়ে যায়। লালের চেয়ে নীল ফোটনের শক্তি বেশি।",
    meaning: "E = hc/λ-ও একই কথা। কম্পাঙ্ক বাড়লে শক্তি বাড়ে।",
    slope: "ঢাল = h = 4.136×10⁻¹⁵ eV/Hz।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "E = h f", why: "প্ল্যাঙ্ক–আইনস্টাইন।" },
      { eq: "E ∝ f", why: "h ধ্রুব। সমানুপাত।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "কম্পাঙ্ক শূন্য হলে ফোটনের শক্তি শূন্য।" },
    ],
    build() {
      const slope = PLANCK_EV * 1e14;
      return {
        curves: [curve("main", "E = hf", copper, samples(0, 15, (frequency) => slope * frequency, 16))],
        calc: `5×10¹⁴ Hz (লালের কাছে) E = ${bnNum(slope * 5, 2)} eV। 10×10¹⁴ Hz-এ ${bnNum(slope * 10, 2)} eV।`,
      };
    },
  },
  {
    id: "md-em",
    chapter: "modern",
    title: "ভর–শক্তি",
    source: "book",
    xName: "ভর",
    yName: "শক্তি",
    xSymbol: "m (u)",
    ySymbol: "E (MeV)",
    formula: "E = m c²",
    condition: "1 u = 931.5 MeV/c²। নিউক্লিয় বিক্রিয়ায় এই ভর ত্রুটির শক্তি।",
    explain: "শক্তি ভরের সমানুপাতিক। রেখা মূলবিন্দুগামী, ঢাল 931.5 MeV/u।",
    meaning: "অল্প ভর ত্রুটিতেই মেগা ইলেকট্রনভোল্ট শক্তি। রাসায়নিক বিক্রিয়ায় ভর ত্রুটি অতিক্ষুদ্র।",
    slope: "ঢাল = 931.5 MeV/u।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "E = m c²", why: "ভর–শক্তির সম্পর্ক।" },
      { eq: "1 u ↔ 931.5 MeV", why: "পারমাণবিক এককে ঢাল।" },
      { eq: "E ∝ m", why: "c² ধ্রুব। সমানুপাত।", tag: "সমানুপাত" },
    ],
    build() {
      return {
        curves: [curve("main", "E = mc²", copper, samples(0, 0.1, (mass) => EV_PER_U * mass, 16))],
        calc: `0.05 u-এ E = ${bnNum(EV_PER_U * 0.05, 1)} MeV।`,
      };
    },
  },
  {
    id: "md-uncertainty",
    chapter: "modern",
    title: "অবস্থান ও ভরবেগের অনিশ্চয়তা",
    source: "book",
    xName: "অবস্থানের অনিশ্চয়তা",
    yName: "ভরবেগের ন্যূনতম অনিশ্চয়তা",
    xSymbol: "Δx (nm)",
    ySymbol: "Δpₘᵢₙ (10⁻²⁴ kg m/s)",
    formula: "Δx Δp ≥ h / 4π",
    condition: "লেখটি সমতার সীমা: Δp = h/(4π Δx)। আসল গুণফল এই বক্ররেখার ওপরে বা ওপরেই থাকতে পারে, নিচে নয়।",
    explain: "অবস্থান যত জোর করে জানা যায়, ভরবেগ তত অনিশ্চিত। ব্যাস্তানুপাতের সীমা। এটি কোনো কণার পথ নয়।",
    meaning: "হাইজেনবার্গের অনিশ্চয়তা। সমান চিহ্ন ন্যূনতম গুণফল।",
    slope: "ঢাল ঋণাত্মক ও বদলায়।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "Δx Δp ≥ h/4π", why: "অনিশ্চয়তা নীতি।" },
      { eq: "Δpₘᵢₙ = h / (4π Δx)", why: "সীমার সমতা।" },
      { eq: "Δpₘᵢₙ ∝ 1/Δx", why: "ব্যাস্তানুপাত। ছোট ফাঁকে আটকালে ভরবেগ ছড়ায়।", tag: "ব্যাস্তানুপাত" },
    ],
    build() {
      const scale = PLANCK / (4 * Math.PI) / 1e-9 / 1e-24;
      return {
        curves: [curve("main", "ন্যূনতম সীমা", copper, samples(0.05, 1, (position) => scale / position))],
        calc: `Δx = 0.1 nm হলে Δpₘᵢₙ = ${bnNum(scale / 0.1, 2)} × 10⁻²⁴ kg m/s।`,
      };
    },
  },
];

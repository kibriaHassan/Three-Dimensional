import { bnNum } from "../format";
import { blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const thermal = 0.026;

function shockleyMilliamp(voltage: number) {
  const ratio = voltage / thermal;
  if (ratio > 30) return 1e-9 * Math.exp(30);
  return 1e-9 * (Math.exp(ratio) - 1);
}

export const sscModernGraphs: GraphSpec[] = [
  {
    id: "so-iv",
    chapter: "ssc-modern",
    title: "ফটোতড়িৎ প্রবাহ–বিভব",
    source: "schematic",
    xName: "অ্যানোড বিভব",
    yName: "ফটোতড়িৎ প্রবাহ",
    xSymbol: "V (V)",
    ySymbol: "I (μA)",
    formula: "V ≤ −V₀ হলে I = 0,   বড় V-এ I → Iₛ",
    condition: "পাঠ্যবইয়ের নকশা। হাঁটু থেকে স্যাচুরেশন পর্যন্ত বাঁক আঁকা। থামানো বিভব V₀ ও স্যাচুরেশন প্রবাহ Iₛ পরীক্ষার রাশি। কম্পাঙ্ক সূচনার ওপরে।",
    explain: "ঋণাত্মক বিভব ইলেকট্রনকে ফেরায়। −V₀-এর বাঁয়ে প্রবাহ শূন্য। ধনাত্মক বিভবে প্রবাহ একটি মানে থেমে যায়।",
    meaning: "V₀ থেকে সর্বোচ্চ গতিশক্তি eV₀। আলোর তীব্রতা Iₛ বাড়ায়, V₀ বাড়ায় না।",
    slope: "স্যাচুরেশনে ঢাল প্রায় শূন্য। −V₀-এর আগে ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("stop", "থামানো বিভব V₀", 0.4, 2.5, 0.1, "V"), knob("sat", "স্যাচুরেশন Iₛ", 2, 12, 0.5, "μA")],
    base: { stop: 1.2, sat: 8 },
    steps: [
      { eq: "Kₘₐₓ = eV₀", why: "যে বিভব দ্রুততম ইলেকট্রনকে থামায়।" },
      { eq: "V ≤ −V₀ → I = 0", why: "কোনো ইলেকট্রন পৌঁছায় না।" },
      { eq: "V বড় হলে I → Iₛ", why: "স্যাচুরেশন। বাঁকটা নকশা।", tag: "ধ্রুব" },
    ],
    build(p) {
      const current = (voltage: number) => {
        if (voltage <= -p.stop) return 0;
        return p.sat * (1 - Math.exp(-(voltage + p.stop) / 0.7));
      };
      return {
        curves: [curve("main", "I–V", copper, samples(-3, 4, current, 120))],
        guides: [{ x: -p.stop, label: "−V₀" }],
        calc: `V₀ = ${bnNum(p.stop, 1)} V। Iₛ = ${bnNum(p.sat, 1)} μA।`,
      };
    },
  },
  {
    id: "so-diode",
    chapter: "ssc-modern",
    title: "ডায়োডের V–I বৈশিষ্ট্য",
    source: "book",
    xName: "বিভব",
    yName: "প্রবাহ",
    xSymbol: "V (V)",
    ySymbol: "I (mA)",
    formula: "I = Iₛ (e^(V/ηVₜ) − 1)",
    condition: "শকলি সমীকরণ। Iₛ = 10⁻¹² A, η = 1, Vₜ = 26 mV। রিভার্স প্রবাহ ন্যানোঅ্যাম্পিয়ার, mA অক্ষে শূন্যের ওপর। ব্রেকডাউন আঁকা হয়নি।",
    explain: "ফরোয়ার্ডে প্রায় 0.6 V-এর পর প্রবাহ দ্রুত বাড়ে। রিভার্সে এই স্কেলে প্রবাহ দেখা যায় না।",
    meaning: "ডায়োড একদিকে পরিবাহী।",
    slope: "ফরোয়ার্ডে ঢাল দ্রুত বাড়ে। রিভার্সে এই অক্ষে ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    steps: [
      { eq: "I = Iₛ (e^(V/ηVₜ) − 1)", why: "ডায়োডের শকলি সমীকরণ।" },
      { eq: "V > 0 হলে সূচকীয় বৃদ্ধি", why: "Vₜ ছোট।" },
      { eq: "V < 0 হলে I ≈ −Iₛ", why: "mA অক্ষে তা শূন্য।", tag: "ধ্রুব" },
    ],
    build() {
      return {
        curves: [curve("main", "ডায়োড", copper, samples(-2, 0.65, shockleyMilliamp, 140))],
        guides: [{ x: 0, label: "0" }],
        calc: `0.6 V-এ I ≈ ${bnNum(shockleyMilliamp(0.6), 1)} mA। 0.65 V-এ ≈ ${bnNum(shockleyMilliamp(0.65), 1)} mA।`,
      };
    },
  },
  {
    id: "so-rt",
    chapter: "ssc-modern",
    title: "অর্ধপরিবাহীর রোধ–তাপমাত্রা",
    source: "extra",
    xName: "তাপমাত্রা",
    yName: "আপেক্ষিক রোধ",
    xSymbol: "T (K)",
    ySymbol: "R/R₃₀₀",
    formula: "R ∝ T^(−3/2) exp(E_g / 2kT)",
    condition: "সূত্রভিত্তিক অতিরিক্ত গ্রাফ। বিশুদ্ধ সেমিকন্ডাক্টর। 300 K-এর রোধকে 1 ধরা। সূচকটাই লেখের আকার।",
    explain: "তাপমাত্রা বাড়লে বাহক বাড়ে, রোধ কমে। ধাতুর উল্টো।",
    meaning: "গরম সেমিকন্ডাক্টর বেশি পরিবাহী।",
    slope: "ঢাল ঋণাত্মক।",
    area: noArea,
    knobs: [knob("gap", "ব্যান্ড গ্যাপ E_g", 0.67, 1.2, 0.01, "eV")],
    base: { gap: 1.12 },
    steps: [
      { eq: "nᵢ ∝ T^(3/2) e^(−E_g/2kT)", why: "বিশুদ্ধ সেমিকন্ডাক্টরের বাহক।" },
      { eq: "রোধ বাহকের উল্টো", why: "বাহক বাড়লে রোধ কমে।" },
      { eq: "গরমে R কমে", why: "ধাতুতে রোধ বাড়ে। এখানে উল্টো।", tag: "ধ্রুব" },
    ],
    build(p) {
      const half = p.gap / (2 * 8.617333262145e-5);
      const relative = (temperature: number) => (temperature / 300) ** -1.5 * Math.exp(half * (1 / temperature - 1 / 300));
      return {
        curves: [curve("main", "অর্ধপরিবাহী", copper, samples(280, 420, relative, 80))],
        guides: [{ x: 300, label: "300 K" }],
        calc: `350 K-এ R/R₃₀₀ ≈ ${bnNum(relative(350), 3)}।`,
      };
    },
  },
  {
    id: "so-rect",
    chapter: "ssc-modern",
    title: "রেকটিফায়ারের ইনপুট–আউটপুট",
    source: "book",
    xName: "সময়",
    yName: "বিভব",
    xSymbol: "t (ms)",
    ySymbol: "V (V)",
    formula: "অর্ধতরঙ্গ: V_out = max(Vₘ sin ωt, 0)",
    condition: "50 Hz সাইনের ইনপুট। আদর্শ ডায়োড, বিভব পতন শূন্য ধরা। দুই চক্র।",
    explain: "ইনপুট দুদিকে দোলে। আউটপুটে শুধু ধনাত্মক অর্ধেক থাকে, ঋণাত্মক অর্ধেক শূন্য।",
    meaning: "এসি থেকে একমুখী স্পন্দন। মসৃণকারী ধারক এই লেখে নেই।",
    slope: "ঋণাত্মক অর্ধে আউটপুটের ঢাল শূন্য।",
    area: noArea,
    origin: "y",
    knobs: [knob("peak", "শীর্ষ Vₘ", 5, 20, 1, "V")],
    base: { peak: 12 },
    steps: [
      { eq: "V_in = Vₘ sin(2πft)", why: "সাপ্লাইয়ের সাইন।" },
      { eq: "ডায়োড একদিকে চালু", why: "ঋণাত্মক অর্ধে প্রবাহ বন্ধ।" },
      { eq: "V_out = max(V_in, 0)", why: "অর্ধতরঙ্গ।", tag: "ধ্রুব" },
    ],
    build(p) {
      const input = (time: number) => p.peak * Math.sin(2 * Math.PI * 0.05 * time);
      return {
        curves: [
          curve("in", "ইনপুট", blue, samples(0, 40, input, 160), { dashed: true }),
          curve("main", "আউটপুট", copper, samples(0, 40, (time) => Math.max(input(time), 0), 160)),
        ],
        calc: `Vₘ = ${bnNum(p.peak, 0)} V। ঋণাত্মক অর্ধচক্রে আউটপুট 0।`,
      };
    },
  },
];

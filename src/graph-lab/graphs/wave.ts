import { bnNum } from "../format";
import { blue, copper, curve, green, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const windowM = 8;

function waveY(x: number, time: number, amplitude: number, lambda: number, frequency: number, phaseRad: number) {
  return amplitude * Math.sin(2 * Math.PI * (x / lambda - frequency * time) + phaseRad);
}

export const waveGraphs: GraphSpec[] = [
  {
    id: "wave-yx",
    chapter: "wave",
    title: "সরণ–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "সরণ",
    xSymbol: "x (m)",
    ySymbol: "y (m)",
    formula: "y = A sin 2π(x/λ − ft)",
    condition: "অনুপ্রস্থ সাইন তরঙ্গ। মাধ্যম x-অক্ষ বরাবর। কণা y-অক্ষে দোলে। দেখানো জানালা 0 থেকে 8 m স্থির।",
    explain: "এক মুহূর্তে মাধ্যমের আকৃতি এই লেখ। λ বাড়ালে একই দূরত্বে তরঙ্গের সংখ্যা কমে। A বাড়ালে শিখর উঁচু হয়। সময়ের স্লাইডার তরঙ্গকে সামনে সরায়।",
    meaning: "তরঙ্গদৈর্ঘ্য দুই পরপর শিখরের দূরত্ব। তরঙ্গবেগ v = fλ। স্থির t-তে কম্পাঙ্ক আকৃতি বদলায় না, এগোনোর বেগ বদলায়।",
    slope: "এই লেখ দূরত্বের সাপেক্ষে, তাই ঢাল ∂y/∂x। কণাবেগ সময়ের সাপেক্ষে ঢাল, সেটা y–t লেখে।",
    area: noArea,
    origin: "y",
    knobs: [
      knob("amp", "বিস্তার A", 0.02, 0.3, 0.01, "m"),
      knob("lambda", "তরঙ্গদৈর্ঘ্য λ", 1, 4, 0.1, "m"),
      knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"),
      knob("time", "সময় t", 0, 4, 0.05, "s"),
    ],
    base: { amp: 0.1, lambda: 2, freq: 0.5, time: 0 },
    build(p) {
      return {
        curves: [curve("main", "y–x", copper, samples(0, windowM, (x) => waveY(x, p.time, p.amp, p.lambda, p.freq, 0)))],
        calc: `v = fλ = ${bnNum(p.freq * p.lambda)} m/s। T = ${bnNum(1 / p.freq)} s। t = ${bnNum(p.time)} s।`,
      };
    },
  },
  {
    id: "wave-yt",
    chapter: "wave",
    title: "সরণ–সময়",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "y (m)",
    formula: "y = A sin 2π(x/λ − ft)",
    condition: "একটি নির্দিষ্ট x-এ কণার দোলন। জানালা 0 থেকে 4 s।",
    explain: "এক জায়গায় দাঁড়িয়ে দেখলে কণা সাইনের মতো দোলে। f বাড়লে একই সময়ে বেশি দোলন। x বদলালে দশা সরে, বিস্তার একই থাকে।",
    meaning: "কম্পাঙ্ক সময়-লেখ থেকে পড়া যায়। কণাবেগ এই লেখের ঢাল।",
    slope: "যেকোনো মুহূর্তে ঢাল = কণাবেগ ∂y/∂t।",
    area: noArea,
    origin: "both",
    knobs: [
      knob("amp", "বিস্তার A", 0.02, 0.3, 0.01, "m"),
      knob("lambda", "তরঙ্গদৈর্ঘ্য λ", 1, 4, 0.1, "m"),
      knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"),
      knob("place", "কণার অবস্থান x", 0, 4, 0.1, "m"),
    ],
    base: { amp: 0.1, lambda: 2, freq: 0.5, place: 0 },
    build(p) {
      return {
        curves: [curve("main", "y–t", blue, samples(0, 4, (t) => waveY(p.place, t, p.amp, p.lambda, p.freq, 0)))],
        calc: `x = ${bnNum(p.place, 1)} m। সর্বোচ্চ কণাবেগ 2πfA = ${bnNum(2 * Math.PI * p.freq * p.amp)} m/s।`,
      };
    },
  },
  {
    id: "wave-travel",
    chapter: "wave",
    title: "অগ্রগামী সাইন তরঙ্গ",
    source: "book",
    xName: "দূরত্ব",
    yName: "সরণ",
    xSymbol: "x (m)",
    ySymbol: "y (m)",
    formula: "y = A sin 2π(x/λ − ft)",
    condition: "তরঙ্গ +x দিকে এগোয়। জানালা 0 থেকে 8 m স্থির, যাতে λ বদলালে তরঙ্গের সংখ্যা বদলায়। চালাও চাপলে সময় বাড়ে।",
    explain: "শিখর ডান দিকে সরে। λ বাড়ালে 8 m-এ তরঙ্গ কমে। A বাড়ালে শিখর উঁচু হয়। বেগ v = fλ; f বা λ বাড়লে শিখর দ্রুত এগোয়।",
    meaning: "কণা দোলে, তরঙ্গরূপ এগোয়। শক্তি তরঙ্গের দিকে যায়, মাধ্যমের কণা সঙ্গে ভেসে যায় না।",
    slope: "দূরত্ব-লেখের ঢাল ∂y/∂x। তরঙ্গবেগ আলাদা রাশি, v = fλ।",
    area: noArea,
    origin: "y",
    animate: true,
    knobs: [
      knob("amp", "বিস্তার A", 0.02, 0.3, 0.01, "m"),
      knob("lambda", "তরঙ্গদৈর্ঘ্য λ", 1, 4, 0.1, "m"),
      knob("freq", "কম্পাঙ্ক f", 0.25, 2, 0.05, "Hz"),
    ],
    base: { amp: 0.1, lambda: 2, freq: 0.5 },
    build(p, time) {
      return {
        curves: [curve("main", "অগ্রগামী তরঙ্গ", copper, samples(0, windowM, (x) => waveY(x, time, p.amp, p.lambda, p.freq, 0)))],
        calc: `v = fλ = ${bnNum(p.freq * p.lambda)} m/s। t = ${bnNum(time)} s। 8 m-এ তরঙ্গসংখ্যা ${bnNum(windowM / p.lambda, 2)}।`,
      };
    },
  },
  {
    id: "wave-longitudinal",
    chapter: "wave",
    title: "অনুদৈর্ঘ্য তরঙ্গ: সংকোচন ও প্রসারণ",
    source: "book",
    xName: "দূরত্ব",
    yName: "আপেক্ষিক মান",
    xSymbol: "x (m)",
    ySymbol: "s/A , ঘনত্ব",
    formula: "s = A sin(kx − ωt),   ঘনত্বের পরিবর্তন ∝ −∂s/∂x",
    condition: "ক্ষুদ্র বিস্তার, A λ-এর চেয়ে অনেক ছোট। দুই লেখকে আপেক্ষিক স্কেলে রাখা হয়েছে, যাতে দশা দেখা যায়। ঘনত্বের প্রকৃত পরিবর্তন 2πA/λ-এর সমানুপাতিক।",
    explain: "সরণ শূন্যের কাছে ঘনত্বের পরিবর্তন চরমে। সরণের ঢাল ঋণাত্মক হলে কণা জড়ো হয়, সেটা সংকোচন। ঢাল ধনাত্মক হলে প্রসারণ। দশা পার্থক্য π/2।",
    meaning: "অনুদৈর্ঘ্য তরঙ্গে সংকোচন ও প্রসারণ পর্যায়ক্রমে এগোয়। শব্দ এই ধরনের তরঙ্গ।",
    slope: "সরণ লেখের ঢাল ঋণাত্মক হলে ঘনত্ব বাড়ে। ঘনত্ব লেখ সরণের চেয়ে দশায় π/2 এগিয়ে।",
    area: noArea,
    origin: "both",
    animate: true,
    knobs: [knob("amp", "বিস্তার A", 0.02, 0.4, 0.01, "m"), knob("lambda", "তরঙ্গদৈর্ঘ্য λ", 1, 4, 0.1, "m")],
    base: { amp: 0.05, lambda: 2 },
    build(p, time) {
      const steep = (2 * Math.PI * p.amp) / p.lambda;
      const warn = steep > 0.3 ? " ক্ষুদ্র-বিস্তারের শর্ত দুর্বল; আপেক্ষিক লেখ তখন শুধু দশা দেখায়।" : "";
      return {
        curves: [
          curve("main", "সরণ / A", copper, samples(0, windowM, (x) => Math.sin(2 * Math.PI * (x / p.lambda - time)))),
          curve("density", "ঘনত্বের আপেক্ষিক পরিবর্তন", blue, samples(0, windowM, (x) => -Math.cos(2 * Math.PI * (x / p.lambda - time)))),
        ],
        calc: `2πA/λ = ${bnNum(steep)}।${warn}`,
      };
    },
  },
  {
    id: "wave-phase",
    chapter: "wave",
    title: "দশা পার্থক্যে দুটি তরঙ্গ",
    source: "book",
    xName: "দূরত্ব",
    yName: "সরণ",
    xSymbol: "x (m)",
    ySymbol: "y (m)",
    formula: "y₂ = A sin(2πx/λ + Δφ)",
    condition: "দুই তরঙ্গের বিস্তার, তরঙ্গদৈর্ঘ্য ও কম্পাঙ্ক সমান। Δφ দ্বিতীয় তরঙ্গের অতিরিক্ত দশা। t = 0।",
    explain: "Δφ = 0 হলে দুই লেখ মিলে যায়। 180° হলে একটা ওপরে গেলে অন্যটা নিচে। 90° হলে একটার শিখরে অন্যটার সরণ শূন্য।",
    meaning: "দশা পার্থক্য নির্দেশ করে একই মুহূর্তে দুই কণা দোলনের কোন ধাপে আছে। ব্যতিচার এই পার্থক্যের ওপর দাঁড়ায়।",
    slope: "প্রতিটি লেখের ঢাল নিজের ∂y/∂x।",
    area: noArea,
    origin: "y",
    knobs: [knob("amp", "বিস্তার A", 0.02, 0.3, 0.01, "m"), knob("lambda", "তরঙ্গদৈর্ঘ্য λ", 1, 4, 0.1, "m"), knob("delta", "দশা পার্থক্য Δφ", 0, 360, 15, "°")],
    base: { amp: 0.1, lambda: 2, delta: 90 },
    build(p) {
      const extra = (p.delta * Math.PI) / 180;
      return {
        curves: [
          curve("main", "প্রথম তরঙ্গ", copper, samples(0, windowM, (x) => p.amp * Math.sin((2 * Math.PI * x) / p.lambda))),
          curve("second", "দ্বিতীয় তরঙ্গ", green, samples(0, windowM, (x) => p.amp * Math.sin((2 * Math.PI * x) / p.lambda + extra))),
        ],
        calc: `Δφ = ${bnNum(p.delta, 0)}°। λ = ${bnNum(p.lambda, 1)} m। A = ${bnNum(p.amp, 2)} m।`,
      };
    },
  },
];

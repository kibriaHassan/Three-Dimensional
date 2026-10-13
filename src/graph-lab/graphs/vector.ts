import { bnNum } from "../format";
import { blue, copper, curve, green, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

const deg = Math.PI / 180;

export const vectorGraphs: GraphSpec[] = [
  {
    id: "vector-components",
    chapter: "vector",
    title: "ভেক্টরের উপাংশ ও কোণ",
    source: "book",
    xName: "কোণ",
    yName: "উপাংশ",
    xSymbol: "θ (°)",
    ySymbol: "Aₓ, Aᵧ",
    formula: "Aₓ = A cosθ,   Aᵧ = A sinθ",
    condition: "θ আনুভূমিক অক্ষ থেকে মাপা। উপাংশের একক ভেক্টরের মানের এককেরই সমান।",
    explain: "কোণ বাড়লে সমকোণী উপাংশ সাইনের মতো বদলায়। 0°-এ পুরো মান আনুভূমিকে, 90°-এ খাড়া উপাংশে। দুই উপাংশের বর্গের যোগ সবসময় A²।",
    meaning: "একই ভেক্টরকে দুই অক্ষে ভাঙলে রাশি যোগ করা যায়। কাজ, বল ও সরণের হিসাব এই ভাঙনের ওপর দাঁড়ায়।",
    slope: "Aₓ-এর ঢাল −A sinθ (কোণ রেডিয়ানে)। ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "y",
    knobs: [knob("magnitude", "মান A", 1, 10, 0.5, "")],
    base: { magnitude: 5 },
    build(p) {
      const magnitude = p.magnitude;
      return {
        curves: [
          curve("main", "Aₓ = A cosθ", copper, samples(0, 360, (angle) => magnitude * Math.cos(angle * deg))),
          curve("ay", "Aᵧ = A sinθ", blue, samples(0, 360, (angle) => magnitude * Math.sin(angle * deg))),
        ],
        calc: `A = ${bnNum(magnitude, 1)}। 0°-এ Aₓ = ${bnNum(magnitude, 1)}, Aᵧ = 0। 90°-এ Aₓ = 0, Aᵧ = ${bnNum(magnitude, 1)}।`,
      };
    },
  },
  {
    id: "vector-magnitude",
    chapter: "vector",
    title: "ভেক্টরের মান ও কোণ",
    source: "extra",
    xName: "কোণ",
    yName: "মান",
    xSymbol: "θ (°)",
    ySymbol: "|A|, |Aₓ|",
    formula: "|A| = ধ্রুব,   |Aₓ| = |A cosθ|",
    condition: "একই ভেক্টর ঘোরানো হচ্ছে। মান অক্ষের ওপর নির্ভর করে না। এটি সূত্রভিত্তিক অতিরিক্ত লেখ।",
    explain: "ঘোরালে ভেক্টরের মান বদলায় না, তাই |A| অনুভূমিক সরলরেখা। আনুভূমিক উপাংশের পরম মান কোণের সঙ্গে ওঠানামা করে এবং কখনো A-এর বেশি হয় না।",
    meaning: "দিক বদলানো আর মান বদলানো আলাদা ঘটনা। উপাংশ কমলে বাকি অংশ অন্য অক্ষে থাকে।",
    slope: "|A|-এর ঢাল শূন্য। |Aₓ|-এর ঢাল ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [knob("magnitude", "মান A", 1, 10, 0.5, "")],
    base: { magnitude: 5 },
    build(p) {
      const magnitude = p.magnitude;
      return {
        curves: [
          curve("main", "|A|", copper, samples(0, 360, () => magnitude, 40)),
          curve("ax", "|Aₓ|", green, samples(0, 360, (angle) => Math.abs(magnitude * Math.cos(angle * deg)))),
        ],
        calc: `|A| = ${bnNum(magnitude, 1)} সব কোণে। |Aₓ| সর্বোচ্চ ${bnNum(magnitude, 1)} এবং 90° ও 270°-এ শূন্য।`,
      };
    },
  },
  {
    id: "vector-resultant",
    chapter: "vector",
    title: "দুটি ভেক্টরের লব্ধি ও মধ্যবর্তী কোণ",
    source: "book",
    xName: "মধ্যবর্তী কোণ",
    yName: "লব্ধির মান",
    xSymbol: "θ (°)",
    ySymbol: "R",
    formula: "R = √(A² + B² + 2AB cosθ)",
    condition: "A ও B একই সমতলে। θ তাদের মধ্যবর্তী কোণ, 0° থেকে 180°।",
    explain: "কোণ শূন্য হলে দুই ভেক্টর এক দিকে, লব্ধি A + B। 180°-এ বিপরীত দিকে, লব্ধি |A − B|। 90°-এ ক্রস পদ শূন্য, R = √(A² + B²)।",
    meaning: "সামান্তরিক সূত্রের মান-অংশ এই লেখ। কোণ বাড়লে লব্ধি কমে, কারণ cosθ কমে।",
    slope: "dR/dθ ধ্রুব নয়। cosθ কমলে R কমে।",
    area: noArea,
    origin: "y",
    knobs: [knob("a", "প্রথম ভেক্টর A", 1, 10, 0.5, ""), knob("b", "দ্বিতীয় ভেক্টর B", 1, 10, 0.5, "")],
    base: { a: 5, b: 3 },
    build(p) {
      const a = p.a;
      const b = p.b;
      const resultant = (angle: number) => Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(angle * deg));
      return {
        curves: [curve("main", "লব্ধি R", copper, samples(0, 180, resultant))],
        calc: `0°-এ R = ${bnNum(a + b, 1)}। 90°-এ R = ${bnNum(Math.sqrt(a * a + b * b))}। 180°-এ R = ${bnNum(Math.abs(a - b), 1)}।`,
      };
    },
  },
];

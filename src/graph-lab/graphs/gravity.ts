import { bnNum } from "../format";
import { G_ACC, R_EARTH, blue, copper, curve, gAt, green, knob, noArea, orbitalSpeed, periodHours, piecewise, potentialMJ, samples } from "../curves";
import type { GraphSpec } from "../types";

const earth = "পৃথিবীকে R = 6371 km ব্যাসার্ধের সমঘনত্বের গোলক ধরা হয়েছে। g₀ = 9.8 m/s²। অনুভূমিক অক্ষ r/R।";

export const gravityGraphs: GraphSpec[] = [
  {
    id: "gravity-force",
    chapter: "gravity",
    title: "মহাকর্ষ বল–দূরত্ব",
    source: "book",
    xName: "কেন্দ্র থেকে দূরত্ব",
    yName: "বল",
    xSymbol: "r/R",
    ySymbol: "F (N)",
    formula: "r ≤ R: F = mg₀ r/R,    r ≥ R: F = mg₀ R²/r²",
    condition: `${earth} ছোট ভর m-এর ওপর গোলকের টান। বাইরে এটি বিন্দু-ভরের সূত্রের মতো; ভেতরে বল দূরত্বের সমানুপাতিক।`,
    explain: "কেন্দ্রে বল শূন্য। ভেতরে সরলরেখায় বাড়ে, ভূপৃষ্ঠে সবচেয়ে বড়, বাইরে 1/r²-এর মতো কমে। ভূপৃষ্ঠে রেখার কোণ বদলায়।",
    meaning: "দূরত্ব বাড়লে বল সব সময় কমে না। ভূপৃষ্ঠের ভেতরে কেন্দ্রের দিকে গেলে বল কমে।",
    slope: "ভেতরে, r/R অক্ষে ঢাল = mg₀। বাইরে ঢাল ধ্রুব নয় এবং ঋণাত্মক।",
    area: noArea,
    origin: "both",
    knobs: [knob("mass", "ছোট ভর m", 0.5, 10, 0.5, "kg")],
    base: { mass: 1 },
    build(p) {
      const surface = p.mass * G_ACC;
      return {
        curves: [curve("main", "F–r", copper, piecewise(0, 1, 4, (ratio) => p.mass * gAt(ratio)))],
        guides: [{ x: 1, label: "ভূপৃষ্ঠ" }],
        calc: `ভূপৃষ্ঠে F = mg₀ = ${bnNum(surface, 1)} N। r = 2R-এ F = ${bnNum(surface / 4, 2)} N। কেন্দ্রে F = 0।`,
      };
    },
  },
  {
    id: "gravity-g",
    chapter: "gravity",
    title: "অভিকর্ষজ ত্বরণ–কেন্দ্র থেকে দূরত্ব",
    source: "book",
    xName: "কেন্দ্র থেকে দূরত্ব",
    yName: "অভিকর্ষজ ত্বরণ",
    xSymbol: "r/R",
    ySymbol: "g (m/s²)",
    formula: "r ≤ R: g = g₀ r/R,    r ≥ R: g = g₀ R²/r²",
    condition: earth,
    explain: "g-এর লেখ বলের লেখেরই আকার, কারণ F = mg(r)। ভূপৃষ্ঠে চূড়া g₀। ভেতরে মূলবিন্দু দিয়ে সরলরেখা, বাইরে ব্যাস্তবর্গ।",
    meaning: "খনি বা উঁচু পাহাড় দুই জায়গাতেই g ভূপৃষ্ঠের চেয়ে কম, কিন্তু সূত্র আলাদা।",
    slope: "ভেতরে r/R অক্ষে ঢাল = g₀। বাইরে ঢাল ঋণাত্মক ও ধ্রুব নয়।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    build() {
      return {
        curves: [curve("main", "g–r", copper, piecewise(0, 1, 4, gAt))],
        guides: [{ x: 1, label: "ভূপৃষ্ঠ" }],
        calc: `g₀ = ${bnNum(G_ACC, 1)} m/s²। r = R/2-এ g = ${bnNum(G_ACC / 2, 1)} m/s²। r = 2R-এ g = ${bnNum(G_ACC / 4, 2)} m/s²।`,
      };
    },
  },
  {
    id: "gravity-potential",
    chapter: "gravity",
    title: "মহাকর্ষীয় বিভব–দূরত্ব",
    source: "book",
    xName: "কেন্দ্র থেকে দূরত্ব",
    yName: "বিভব",
    xSymbol: "r/R",
    ySymbol: "V (MJ/kg)",
    formula: "r ≥ R: V = −GM/r,    r ≤ R: V = −(GM/2R)(3 − r²/R²)",
    condition: `${earth} অসীমে বিভব শূন্য। বিভব স্কেলার এবং ঋণাত্মক।`,
    explain: "কেন্দ্রে বিভব সবচেয়ে ঋণাত্মক। ভূপৃষ্ঠ পর্যন্ত পরাবৃত্তের মতো ওঠে, বাইরে −1/r-এর মতো শূন্যের দিকে যায়। ভূপৃষ্ঠে মান ও ঢাল দুই সূত্রেই মিলে যায়।",
    meaning: "একক ভরকে অসীম থেকে ওই বিন্দুতে আনতে আকর্ষণ যে কাজ করে, তার ঋণাত্মক চিহ্নই বিভব। বাইরে গেলে বিভব বাড়ে।",
    slope: "ক্ষেত্রের মান g = |dV/dr|। অক্ষ r/R হওয়ায় চোখে দেখা ঢালের মান Rg। ভূপৃষ্ঠে সেই মান g₀R।",
    area: noArea,
    origin: "y",
    knobs: [],
    base: {},
    build() {
      const surface = (G_ACC * R_EARTH) / 1e6;
      return {
        curves: [curve("main", "V–r", blue, piecewise(0, 1, 4, potentialMJ))],
        guides: [{ x: 1, label: "ভূপৃষ্ঠ" }],
        calc: `কেন্দ্রে V = ${bnNum(-1.5 * surface, 1)} MJ/kg। ভূপৃষ্ঠে V = ${bnNum(-surface, 1)} MJ/kg। ভূপৃষ্ঠে দৃশ্য ঢালের মান g₀R = ${bnNum(surface, 1)} MJ/kg।`,
      };
    },
  },
  {
    id: "gravity-orbit-v",
    chapter: "gravity",
    title: "কক্ষীয় বেগ–কক্ষপথের ব্যাসার্ধ",
    source: "book",
    xName: "কক্ষপথের ব্যাসার্ধ",
    yName: "কক্ষীয় বেগ",
    xSymbol: "r/R",
    ySymbol: "v (km/s)",
    formula: "v = √(GM/r)",
    condition: "বৃত্তাকার কক্ষপথ, r ≥ R। বায়ুর বাধা উপেক্ষা। কেন্দ্রে পৃথিবীর ভর। ভেতরের সূত্র এখানে খাটে না।",
    explain: "ব্যাসার্ধ বাড়লে কক্ষীয় বেগ কমে, 1/√r-এর মতো। ভূপৃষ্ঠ ঘেঁষে আদর্শ কক্ষে বেগ প্রায় 7.9 km/s।",
    meaning: "কাছের কক্ষে উপগ্রহকে দ্রুত ঘুরতে হয়। দূরে গেলে কম বেগেও বৃত্তপথ হয়।",
    slope: "ঢাল ঋণাত্মক এবং ধ্রুব নয়। v ∝ 1/√r।",
    area: noArea,
    origin: "y",
    knobs: [],
    base: {},
    build() {
      return {
        curves: [curve("main", "v–r", copper, samples(1, 8, orbitalSpeed))],
        guides: [{ x: 1, label: "ভূপৃষ্ঠ" }],
        calc: `r = R-এ v = ${bnNum(orbitalSpeed(1))} km/s। r = 4R-এ v = ${bnNum(orbitalSpeed(4))} km/s, অর্থাৎ অর্ধেক।`,
      };
    },
  },
  {
    id: "gravity-period",
    chapter: "gravity",
    title: "উপগ্রহের পর্যায়কাল–কক্ষপথের ব্যাসার্ধ",
    source: "book",
    xName: "কক্ষপথের ব্যাসার্ধ",
    yName: "পর্যায়কাল",
    xSymbol: "r/R",
    ySymbol: "T (h)",
    formula: "T = 2π √(r³/GM)",
    condition: "বৃত্তাকার কক্ষপথ, r ≥ R। বায়ু উপেক্ষা। T ঘণ্টায়।",
    explain: "পর্যায়কাল ব্যাসার্ধের ঘাত 3/2-এর সঙ্গে বাড়ে। কাছের কক্ষের ঘুর্ণন দ্রুত, দূরের কক্ষে এক পাক নিতে বেশি সময় লাগে।",
    meaning: "ভূপৃষ্ঠ ঘেঁষে আদর্শ কক্ষের পর্যায়কাল প্রায় 84 মিনিট। উঁচু কক্ষে সময় আরও বেশি।",
    slope: "ঢাল ধনাত্মক এবং ধ্রুব নয়। T ∝ r^(3/2)।",
    area: noArea,
    origin: "y",
    knobs: [],
    base: {},
    build() {
      const minutes = periodHours(1) * 60;
      return {
        curves: [curve("main", "T–r", green, samples(1, 8, periodHours))],
        guides: [{ x: 1, label: "ভূপৃষ্ঠ" }],
        calc: `r = R-এ T = ${bnNum(minutes, 1)} min। r = 2R-এ T = ${bnNum(periodHours(2))} h।`,
      };
    },
  },
  {
    id: "gravity-kepler",
    chapter: "gravity",
    title: "পর্যায়কালের বর্গ–ব্যাসার্ধের ঘন",
    source: "book",
    xName: "ব্যাসার্ধের ঘন",
    yName: "পর্যায়কালের বর্গ",
    xSymbol: "(r/R)³",
    ySymbol: "T² (h²)",
    formula: "T² = (4π²/GM) r³",
    condition: "বৃত্তাকার কক্ষপথ। কেপলারের তৃতীয় সূত্র। ভৌত কক্ষের জন্য r ≥ R; মূলবিন্দু পর্যন্ত ড্যাশ অংশ একই সূত্রের বর্ধিতাংশ।",
    explain: "T² বনাম r³ সরলরেখা এবং মূলবিন্দু দিয়ে যায়। ঢাল 4π²/GM। এই অক্ষে ঢালের একক ঘণ্টা², কারণ r-কে R দিয়ে ভাগ করা।",
    meaning: "সূর্যের গ্রহ বা পৃথিবীর উপগ্রহ—একই কেন্দ্রীয় ভরের সব বৃত্তাকার কক্ষ একই সরলরেখায় পড়ে।",
    slope: "ঢাল ধ্রুব। এই অক্ষে ঢাল = 4π² R³ / GM, ঘণ্টা² এককে।",
    area: noArea,
    origin: "both",
    knobs: [],
    base: {},
    build() {
      const solid = samples(1, 6, (ratio) => periodHours(ratio) ** 2, 40).map((point, index) => {
        const ratio = 1 + (5 * index) / 39;
        return { x: ratio ** 3, y: point.y };
      });
      const slope = solid[0] ? solid[0].y / solid[0].x : 0;
      const atTwo = periodHours(2) ** 2;
      return {
        curves: [
          curve("extend", "সূত্রের বর্ধিতাংশ", copper, [{ x: 0, y: 0 }, solid[0] ?? { x: 1, y: slope }], { dashed: true }),
          curve("main", "কক্ষপথ r ≥ R", copper, solid),
        ],
        guides: [{ x: 1, label: "r = R" }],
        calc: `ঢাল = ${bnNum(slope)} h²। r = 2R হলে (r/R)³ = 8 এবং T² = ${bnNum(atTwo)} h², যা r = R-এর ${bnNum(atTwo / slope, 2)} গুণ।`,
      };
    },
  },
];

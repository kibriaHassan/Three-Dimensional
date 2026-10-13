import { bnNum } from "../format";
import { ELECTRON, MU0, blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const wire = "দীর্ঘ সোজা তার। মাঝের জায়গায় B = μ₀ I / (2πr)। μ₀/2π = 2×10⁻⁷।";

export const magnetGraphs: GraphSpec[] = [
  {
    id: "mg-bi",
    chapter: "magnetism",
    title: "চৌম্বক ক্ষেত্র–তড়িৎ প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "চৌম্বক ক্ষেত্র",
    xSymbol: "I (A)",
    ySymbol: "B (μT)",
    formula: "B = μ₀ I / (2πr)",
    condition: wire,
    explain: "দূরত্ব স্থির থাকলে ক্ষেত্র প্রবাহের সমানুপাতিক। রেখা মূলবিন্দুগামী।",
    meaning: "প্রবাহ শূন্য হলে এই তারের ক্ষেত্র শূন্য। দিক ডানহাতের নিয়মে।",
    slope: "ঢাল = μ₀/(2πr)।",
    area: noArea,
    origin: "both",
    knobs: [knob("distance", "লম্ব দূরত্ব r", 0.02, 0.2, 0.01, "m")],
    base: { distance: 0.05 },
    steps: [
      { eq: "B = μ₀ I / (2πr)", why: "দীর্ঘ সোজা তারের ক্ষেত্র।" },
      { eq: "r স্থির  →  B ∝ I", why: "ক্ষেত্র প্রবাহের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = μ₀/(2πr)", why: "কাছে গেলে একই প্রবাহে ক্ষেত্র বেশি, রেখা খাড়া।" },
    ],
    build(p) {
      const slope = ((MU0 / (2 * Math.PI * p.distance)) * 1e6);
      return {
        curves: [curve("main", "B–I", copper, samples(0, 8, (current) => slope * current, 16))],
        calc: `r = ${bnNum(p.distance, 2)} m। 5 A-এ B = ${bnNum(slope * 5, 2)} μT।`,
      };
    },
  },
  {
    id: "mg-br",
    chapter: "magnetism",
    title: "সোজা তারের চৌম্বক ক্ষেত্র–দূরত্ব",
    source: "book",
    xName: "দূরত্ব",
    yName: "চৌম্বক ক্ষেত্র",
    xSymbol: "r (m)",
    ySymbol: "B (μT)",
    formula: "B = μ₀ I / (2πr)",
    condition: wire + " তারের গায়ের ভেতরের ক্ষেত্র এই সূত্র নয়।",
    explain: "ক্ষেত্র দূরত্বের ব্যাস্তানুপাতিক। দ্বিগুণ দূরে ক্ষেত্র অর্ধেক। বর্গের ব্যাস্তানুপাত নয়।",
    meaning: "বিন্দু আধানের তড়িৎ ক্ষেত্র 1/r², এই চৌম্বক ক্ষেত্র 1/r।",
    slope: "ঢাল = −μ₀ I/(2π r²)।",
    area: noArea,
    knobs: [knob("current", "প্রবাহ I", 1, 15, 0.5, "A")],
    base: { current: 5 },
    steps: [
      { eq: "B = μ₀ I / (2πr)", why: "সোজা তার।" },
      { eq: "I স্থির  →  B ∝ 1/r", why: "দূরত্বের ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "লেখ অধিবৃত্ত", why: "B বনাম r সোজা নয়। B বনাম 1/r হলে সোজা।" },
    ],
    build(p) {
      const scale = ((MU0 * p.current) / (2 * Math.PI)) * 1e6;
      return {
        curves: [curve("main", "B–r", copper, samples(0.02, 0.25, (distance) => scale / distance))],
        calc: `r = 0.05 m-এ B = ${bnNum(scale / 0.05, 2)} μT। r = 0.10 m-এ B = ${bnNum(scale / 0.1, 2)} μT।`,
      };
    },
  },
  {
    id: "mg-coil",
    chapter: "magnetism",
    title: "কুণ্ডলীর কেন্দ্রে ক্ষেত্র–প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "কেন্দ্রের চৌম্বক ক্ষেত্র",
    xSymbol: "I (A)",
    ySymbol: "B (mT)",
    formula: "B = μ₀ N I / (2R)",
    condition: "বৃত্তাকার কুণ্ডলী, পরিমাপ কেন্দ্রে। N পাক, ব্যাসার্ধ R।",
    explain: "কেন্দ্রের ক্ষেত্র প্রবাহ ও পাকসংখ্যার সমানুপাতিক, ব্যাসার্ধের ব্যাস্তানুপাতিক।",
    meaning: "গ্যালভানোমিটারের কুণ্ডলীতে এই ক্ষেত্র কাঁটার ঘূর্ণন ঘটায়।",
    slope: "ঢাল = μ₀ N / (2R)।",
    area: noArea,
    origin: "both",
    knobs: [knob("turns", "পাক সংখ্যা N", 20, 300, 10, ""), knob("radius", "ব্যাসার্ধ R", 0.02, 0.15, 0.01, "m")],
    base: { turns: 100, radius: 0.05 },
    steps: [
      { eq: "B = μ₀ N I / (2R)", why: "বৃত্তাকার কুণ্ডলীর কেন্দ্র।" },
      { eq: "N ও R স্থির  →  B ∝ I", why: "ক্ষেত্র প্রবাহের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ঢাল = μ₀ N/(2R)", why: "পাক বাড়লে বা ব্যাসার্ধ কমলে রেখা খাড়া।" },
    ],
    build(p) {
      const slope = (MU0 * p.turns) / (2 * p.radius) * 1000;
      return {
        curves: [curve("main", "কুণ্ডলী", copper, samples(0, 3, (current) => slope * current, 16))],
        calc: `1 A-এ B = ${bnNum(slope, 3)} mT।`,
      };
    },
  },
  {
    id: "mg-fi",
    chapter: "magnetism",
    title: "চৌম্বক বল–তড়িৎ প্রবাহ",
    source: "book",
    xName: "তড়িৎ প্রবাহ",
    yName: "বল",
    xSymbol: "I (A)",
    ySymbol: "F (N)",
    formula: "F = B I L sinθ",
    condition: "সমক্ষেত্র। তারের দৈর্ঘ্য L ক্ষেত্রের ওপর লম্ব অংশ। θ প্রাবল্য ও প্রবাহের মধ্যবর্তী কোণ।",
    explain: "B, L, θ স্থির থাকলে বল প্রবাহের সমানুপাতিক। θ = 0° হলে বল শূন্য।",
    meaning: "মোটরের তার এই বলে ঘোরে।",
    slope: "ঢাল = B L sinθ।",
    area: noArea,
    origin: "both",
    knobs: [knob("field", "ক্ষেত্র B", 0.05, 0.6, 0.05, "T"), knob("length", "দৈর্ঘ্য L", 0.05, 0.4, 0.05, "m"), knob("angle", "কোণ θ", 0, 90, 5, "°")],
    base: { field: 0.2, length: 0.15, angle: 90 },
    steps: [
      { eq: "F = B I L sinθ", why: "চৌম্বক ক্ষেত্রে তড়িৎবাহী তারের বল।" },
      { eq: "B, L, θ স্থির  →  F ∝ I", why: "বল প্রবাহের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "sinθ = 0 হলে F = 0", why: "প্রবাহ ক্ষেত্রের সমান্তরাল হলে এই বল থাকে না।" },
    ],
    build(p) {
      const slope = p.field * p.length * Math.sin((p.angle * Math.PI) / 180);
      return {
        curves: [curve("main", "F–I", copper, samples(0, 6, (current) => slope * current, 16))],
        calc: `ঢাল = ${bnNum(slope, 3)} N/A। 3 A-এ F = ${bnNum(slope * 3, 3)} N।`,
      };
    },
  },
  {
    id: "mg-fl",
    chapter: "magnetism",
    title: "চৌম্বক বল–দৈর্ঘ্য",
    source: "book",
    xName: "তারের দৈর্ঘ্য",
    yName: "বল",
    xSymbol: "L (m)",
    ySymbol: "F (N)",
    formula: "F = B I L sinθ",
    condition: "B, I ও θ স্থির। দৈর্ঘ্য ক্ষেত্রের ভেতরের অংশ।",
    explain: "লম্বা তার বেশি বল পায়। বল দৈর্ঘ্যের সমানুপাতিক।",
    meaning: "ক্ষেত্রের বাইরের অংশে এই সূত্রের L গোনা হয় না।",
    slope: "ঢাল = B I sinθ।",
    area: noArea,
    origin: "both",
    knobs: [knob("field", "ক্ষেত্র B", 0.05, 0.6, 0.05, "T"), knob("current", "প্রবাহ I", 0.5, 8, 0.5, "A")],
    base: { field: 0.2, current: 3 },
    steps: [
      { eq: "F = B I L sinθ", why: "একই সূত্র, এবার L বদলায়।" },
      { eq: "F ∝ L", why: "B, I, θ স্থির। দৈর্ঘ্যের সমানুপাত।", tag: "সমানুপাত" },
      { eq: "মূলবিন্দুগামী সরলরেখা", why: "দৈর্ঘ্য শূন্য হলে বল শূন্য।" },
    ],
    build(p) {
      const slope = p.field * p.current;
      return {
        curves: [curve("main", "F–L", copper, samples(0, 0.5, (length) => slope * length, 16))],
        calc: `θ = 90°। 0.2 m-এ F = ${bnNum(slope * 0.2, 3)} N।`,
      };
    },
  },
  {
    id: "mg-fv",
    chapter: "magnetism",
    title: "চৌম্বক বল–বেগ",
    source: "book",
    xName: "বেগ",
    yName: "বল",
    xSymbol: "v (m/s)",
    ySymbol: "F (10⁻¹⁴ N)",
    formula: "F = q v B sinθ",
    condition: "একটি ইলেকট্রন। θ বেগ ও ক্ষেত্রের মধ্যবর্তী কোণ, স্থির। অক্ষে বলকে 10⁻¹⁴ দিয়ে ভাগ।",
    explain: "নির্দিষ্ট কোণে বল বেগের সমানুপাতিক। θ = 90° হলে বল সবচেয়ে বড়। θ = 0° হলে শূন্য।",
    meaning: "লরেন্জ বলের চৌম্বক অংশ। বেগ ক্ষেত্রের সমান্তরাল হলে এই বল থাকে না।",
    slope: "ঢাল = q B sinθ।",
    area: noArea,
    origin: "both",
    knobs: [knob("field", "ক্ষেত্র B", 0.02, 0.4, 0.02, "T"), knob("angle", "কোণ θ", 0, 90, 5, "°")],
    base: { field: 0.1, angle: 90 },
    steps: [
      { eq: "F = q v B sinθ", why: "চৌম্বক ক্ষেত্রে গতিশীল আধানের বল।" },
      { eq: "q, B, θ স্থির  →  F ∝ v", why: "বল বেগের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "ইলেকট্রনের বল খুব ছোট", why: "q = 1.6×10⁻¹⁹ C। তাই অক্ষ 10⁻¹⁴ N।" },
    ],
    build(p) {
      const slope = (ELECTRON * p.field * Math.sin((p.angle * Math.PI) / 180)) / 1e-14;
      return {
        curves: [curve("main", "ইলেকট্রন", copper, samples(0, 2e6, (speed) => slope * speed, 20))],
        calc: `10⁶ m/s-এ F = ${bnNum(slope * 1e6, 2)} × 10⁻¹⁴ N।`,
      };
    },
  },
  {
    id: "mg-flux",
    chapter: "magnetism",
    title: "চৌম্বক ফ্লাক্স–কোণ",
    source: "book",
    xName: "অভিলম্বের সাথে ক্ষেত্রের কোণ",
    yName: "ফ্লাক্স",
    xSymbol: "θ (°)",
    ySymbol: "Φ (mWb)",
    formula: "Φ = B A cosθ",
    condition: "সমক্ষেত্র, সমতল ক্ষেত্রফল A। θ ক্ষেত্র ও ক্ষেত্রফলের অভিলম্বের কোণ।",
    explain: "θ = 0° হলে ফ্লাক্স সর্বোচ্চ, θ = 90° হলে শূন্য। কোসাইনের লেখ, সরল সমানুপাত নয়।",
    meaning: "আবেশে ফ্লাক্সের পরিবর্তন দরকার। 90°-এ ফ্লাক্স শূন্য মানে রেখা তল ঘেঁষে যায়।",
    slope: "ঢাল = −BA sinθ। 0° ও 180°-এ ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("field", "ক্ষেত্র B", 0.05, 0.6, 0.05, "T"), knob("area", "ক্ষেত্রফল A", 10, 80, 5, "cm²")],
    base: { field: 0.3, area: 40 },
    steps: [
      { eq: "Φ = B⃗ · A⃗", why: "ফ্লাক্স ক্ষেত্র ও ক্ষেত্রফল ভেক্টরের স্কেলার গুণ।" },
      { eq: "Φ = BA cosθ", why: "B ও A স্থির। কোণের কোসাইন।" },
      { eq: "θ = 0° → Φ = BA", why: "θ = 90°-এ cosθ = 0, ফ্লাক্স শূন্য। θ-এর সাথে সরল সমানুপাত নয়।" },
    ],
    build(p) {
      const max = p.field * p.area * 1e-4 * 1000;
      return {
        curves: [curve("main", "Φ–θ", copper, samples(0, 180, (angle) => max * Math.cos((angle * Math.PI) / 180), 90))],
        calc: `Φₛ = BA = ${bnNum(max, 2)} mWb। 60°-এ Φ = ${bnNum(max * 0.5, 2)} mWb।`,
      };
    },
  },
  {
    id: "mg-bh",
    chapter: "magnetism",
    title: "চৌম্বক ক্ষেত্র–চৌম্বক তীব্রতা",
    source: "book",
    xName: "চৌম্বক তীব্রতা",
    yName: "চৌম্বক ক্ষেত্র",
    xSymbol: "H (A/m)",
    ySymbol: "B (mT)",
    formula: "B = μ₀ μᵣ H",
    condition: "রৈখিক মাধ্যম: অনুচুম্বক, প্রতিচুম্বক, বা ফেরোচৌম্বকের ছোট রৈখিক অংশ। হিস্টেরেসিস এই রেখা নয়।",
    explain: "μᵣ ধ্রুব থাকলে B, H-এর সমানুপাতিক। শূন্যস্থানে μᵣ = 1, রেখা প্রায় শূন্য অক্ষে বসে — স্লাইডারে μᵣ বাড়ালে দেখা যায়।",
    meaning: "ফেরোচৌম্বকে μᵣ বড় ও ধ্রুব নয়। পরের লেখ সেই লুপ।",
    slope: "ঢাল = μ₀ μᵣ।",
    area: noArea,
    origin: "both",
    knobs: [knob("mur", "আপেক্ষিক ভেদ্যতা μᵣ", 1, 2000, 10, "")],
    base: { mur: 200 },
    steps: [
      { eq: "B = μ₀ (H + M)", why: "পদার্থের ভেতরে ক্ষেত্র।" },
      { eq: "M = χ H,   μᵣ = 1 + χ", why: "রৈখিক মাধ্যমে চুম্বকায়ন তীব্রতার সমানুপাতিক।" },
      { eq: "B = μ₀ μᵣ H", why: "μᵣ স্থির। B, H-এর সমানুপাতিক।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = MU0 * p.mur * 1000;
      return {
        curves: [curve("main", "রৈখিক মাধ্যম", copper, samples(0, 400, (field) => slope * field, 16))],
        calc: `H = 100 A/m-এ B = ${bnNum(slope * 100, 2)} mT।`,
      };
    },
  },
  {
    id: "mg-hysteresis",
    chapter: "magnetism",
    title: "ফেরোচৌম্বকের হিস্টেরেসিস",
    source: "schematic",
    xName: "চৌম্বক তীব্রতা",
    yName: "চৌম্বক ক্ষেত্র",
    xSymbol: "H",
    ySymbol: "B",
    formula: "B, H-এর একক ফাংশন নয়",
    condition: "পাঠ্যবইয়ের নকশা। সংখ্যা কোনো নামকরা ইস্পাতের মাপা মান নয়। লুপের আকৃতি দেখানোর জন্য।",
    explain: "H বাড়লে ও কমলে B এক পথ ফেরে না। H = 0-তে যে B থাকে সেটা অবশিষ্ট চুম্বকত্ব। B = 0 করতে উল্টো H লাগে, সেটা নিবারক তীব্রতা।",
    meaning: "লুপের ক্ষেত্রফল এক চক্রে প্রতি একক আয়তনে হারানো শক্তির সমানুপাতিক।",
    slope: "একটি H-এ দুই ঢাল। একক ঢাল নেই।",
    area: "লুপের ক্ষেত্রফল শক্তি-ঘনত্বের নকশা। মাপা জুল নয়।",
    knobs: [],
    base: {},
    steps: [
      { eq: "রৈখিক মাধ্যমে B = μ H", why: "সেখানে এক পথ। ফেরোচৌম্বকে ডোমেন আটকে থাকে।" },
      { eq: "H কমা–বাড়ায় আলাদা বক্ররেখা", why: "B শুধু H-এর বর্তমান মানে বাঁধা নয়।" },
      { eq: "অবশিষ্ট B ও নিবারক H", why: "অক্ষ দুটি কাটার বিন্দু। এই ছবি নকশা।", tag: "নকশা" },
    ],
    build() {
      const bs = 1.2;
      const hc = 45;
      const scale = 28;
      const branch = (sign: number): Point[] => samples(-140, 140, (field) => bs * Math.tanh((field + sign * hc) / scale), 120);
      return {
        curves: [
          curve("main", "H বাড়ছে", copper, branch(1)),
          curve("back", "H কমছে", blue, branch(-1)),
        ],
        guides: [
          { x: 0, label: "H = 0" },
        ],
        calc: "H = 0-এ দুই মান অবশিষ্ট চুম্বকত্বের নকশা। যে H-এ B = 0, সেটা নিবারক তীব্রতার নকশা।",
      };
    },
  },
  {
    id: "mg-torque",
    chapter: "magnetism",
    title: "চৌম্বক দ্বিমেরুর টর্ক–কোণ",
    source: "book",
    xName: "ক্ষেত্রের সাথে দ্বিমেরুর কোণ",
    yName: "টর্ক",
    xSymbol: "θ (°)",
    ySymbol: "τ (N·m)",
    formula: "τ = m B sinθ",
    condition: "সমক্ষেত্র। θ দ্বিমেরু ভ্রামক ও ক্ষেত্রের মধ্যবর্তী কোণ।",
    explain: "θ = 0° হলে টর্ক শূন্য, দ্বিমেরু ক্ষেত্র বরাবর স্থির। θ = 90° হলে টর্ক সর্বোচ্চ। সাইনের লেখ।",
    meaning: "কম্পাস কাঁটা এই টর্কে ক্ষেত্র বরাবর আসে।",
    slope: "ঢাল = m B cosθ। 90°-এ ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("moment", "দ্বিমেরু ভ্রামক m", 0.05, 0.5, 0.05, "A·m²"), knob("field", "ক্ষেত্র B", 0.05, 0.6, 0.05, "T")],
    base: { moment: 0.2, field: 0.4 },
    steps: [
      { eq: "τ⃗ = m⃗ × B⃗", why: "দ্বিমেরুর টর্ক।" },
      { eq: "τ = m B sinθ", why: "মান। m ও B স্থির।" },
      { eq: "θ = 90°-এ সর্বোচ্চ", why: "sinθ সর্বোচ্চ 1। θ-এর সাথে সরল সমানুপাত নয়।" },
    ],
    build(p) {
      const max = p.moment * p.field;
      return {
        curves: [curve("main", "τ–θ", copper, samples(0, 180, (angle) => max * Math.sin((angle * Math.PI) / 180), 90))],
        calc: `τₛ = mB = ${bnNum(max, 3)} N·m। 30°-এ τ = ${bnNum(max * 0.5, 3)} N·m।`,
      };
    },
  },
];

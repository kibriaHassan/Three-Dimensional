import { bnNum } from "../format";
import { blue, copper, curve, knob, noArea, samples } from "../curves";
import type { GraphSpec } from "../types";

export const inductionGraphs: GraphSpec[] = [
  {
    id: "in-flux",
    chapter: "induction",
    title: "চৌম্বক ফ্লাক্স–সময়",
    source: "book",
    xName: "সময়",
    yName: "ফ্লাক্স",
    xSymbol: "t (ms)",
    ySymbol: "Φ (mWb)",
    formula: "Φ = Φₘ cos(2π f t)",
    condition: "একটি কুণ্ডলী সমক্ষেত্রে সমদ্রুতিতে ঘুরছে। এক পাকের Φₘ = NBA।",
    explain: "ফ্লাক্স সময়ের কোসাইন। শূন্য থেকে শুরু নয়: t = 0-তে ফ্লাক্স সর্বোচ্চ, যদি অভিলম্ব ক্ষেত্র বরাবর থাকে।",
    meaning: "ফ্লাক্স বদলালে তবেই আবিষ্ট তড়িচ্চালক বল হয়। চূড়ায় তাৎক্ষণিক পরিবর্তন শূন্য।",
    slope: "dΦ/dt = −Φₘ ω sin(ωt)। চূড়ায় ঢাল শূন্য।",
    area: noArea,
    origin: "both",
    knobs: [knob("peak", "শীর্ষ ফ্লাক্স Φₘ", 5, 40, 1, "mWb"), knob("freq", "ঘূর্ণন কম্পাঙ্ক f", 20, 80, 5, "Hz")],
    base: { peak: 20, freq: 50 },
    steps: [
      { eq: "Φ = NBA cosθ", why: "সমক্ষেত্রে একটি পাক।" },
      { eq: "θ = ωt = 2π f t", why: "সমদ্রুতিতে কোণ সময়ের সমানুপাতিক।", tag: "সমানুপাত" },
      { eq: "Φ = Φₘ cos(2π f t)", why: "তাই ফ্লাক্স সময়ের কোসাইন। সময়ের সাথে সরল সমানুপাত নয়।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "Φ–t", copper, samples(0, 40, (time) => p.peak * Math.cos(2 * Math.PI * p.freq * time * 1e-3), 180))],
        calc: `ω = ${bnNum(2 * Math.PI * p.freq, 0)} rad/s। শীর্ষ ঢালের হার Φₘω = ${bnNum((p.peak * 1e-3 * 2 * Math.PI * p.freq), 2)} Wb/s।`,
      };
    },
  },
  {
    id: "in-emf",
    chapter: "induction",
    title: "আবিষ্ট তড়িচ্চালক বল–সময়",
    source: "book",
    xName: "সময়",
    yName: "আবিষ্ট তড়িচ্চালক বল",
    xSymbol: "t (ms)",
    ySymbol: "ε (V)",
    formula: "ε = Φₘ ω sin(2π f t)",
    condition: "আগের ফ্লাক্স Φ = Φₘ cos(ωt)। এক পাক। লেঞ্জের ঋণ চিহ্ন সাইনের দিকে মেশানো।",
    explain: "তড়িচ্চালক বল ফ্লাক্সের চেয়ে এক চতুর্থাংশ চক্র এগিয়ে বা পিছিয়ে। ফ্লাক্স সর্বোচ্চ হলে ε শূন্য।",
    meaning: "ফ্যারাডে: ε = −dΦ/dt। সাইনের বিস্তার Φₘ ω।",
    slope: "ε নিজেই একটি ঢালের মান। এই লেখের ঢাল dε/dt।",
    area: noArea,
    origin: "both",
    knobs: [knob("peak", "শীর্ষ ফ্লাক্স Φₘ", 5, 40, 1, "mWb"), knob("freq", "কম্পাঙ্ক f", 20, 80, 5, "Hz")],
    base: { peak: 20, freq: 50 },
    steps: [
      { eq: "ε = −dΦ/dt", why: "ফ্যারাডের সূত্র, এক পাক।" },
      { eq: "Φ = Φₘ cos(ωt)", why: "অন্তরকলনে −sin আসে, সামনে ω।" },
      { eq: "ε = Φₘ ω sin(ωt)", why: "বিস্তার ফ্লাক্সের শীর্ষ গুণ কম্পাঙ্ক। f বাড়লে ε বাড়ে।" },
    ],
    build(p) {
      const omega = 2 * Math.PI * p.freq;
      const amplitude = p.peak * 1e-3 * omega;
      return {
        curves: [curve("main", "ε–t", copper, samples(0, 40, (time) => amplitude * Math.sin(omega * time * 1e-3), 180))],
        calc: `εₛ = Φₘω = ${bnNum(amplitude, 2)} V।`,
      };
    },
  },
  {
    id: "in-link",
    chapter: "induction",
    title: "ফ্লাক্সের হার ও আবিষ্ট তড়িচ্চালক বল",
    source: "book",
    xName: "ফ্লাক্সের পরিবর্তনের হার",
    yName: "আবিষ্ট তড়িচ্চালক বল",
    xSymbol: "dΦ/dt (V)",
    ySymbol: "ε (V)",
    formula: "ε = − dΦ/dt",
    condition: "এক পাক। N পাক হলে ε = −N dΦ/dt। অক্ষে হারের একক ভোল্ট, কারণ Wb/s = V।",
    explain: "সূত্রটি সরলরেখা, ঢাল −1। ধনাত্মক হারে তড়িচ্চালক বল ঋণাত্মক — লেঞ্জ।",
    meaning: "যেকোনো সময়ের সাইন-কোসাইন এই রেখার ওপরই পড়ে। রেখা সময়ের আকৃতি নয়, সূত্রের সম্পর্ক।",
    slope: "ঢাল = −1।",
    area: noArea,
    origin: "both",
    knobs: [knob("turns", "পাক সংখ্যা N", 1, 20, 1, "")],
    base: { turns: 1 },
    steps: [
      { eq: "ε = −N dΦ/dt", why: "ফ্যারাডে ও লেঞ্জ।" },
      { eq: "N স্থির  →  ε ∝ −dΦ/dt", why: "ঋণ চিহ্নসহ সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = −N", why: "এক পাকে ঢাল −1। পাক বাড়লে রেখা খাড়া, উল্টো দিকে।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "ε বনাম dΦ/dt", copper, samples(-8, 8, (rate) => -p.turns * rate, 20))],
        calc: `N = ${bnNum(p.turns, 0)}। dΦ/dt = 2 V হলে ε = ${bnNum(-p.turns * 2, 0)} V।`,
      };
    },
  },
  {
    id: "in-vt",
    chapter: "induction",
    title: "পরিবর্তী বিভব–সময়",
    source: "book",
    xName: "সময়",
    yName: "বিভব",
    xSymbol: "t (ms)",
    ySymbol: "V (V)",
    formula: "V = V₀ sin(2π f t)",
    condition: "বিশুদ্ধ সাইন। f = 50 Hz শুরু। V₀ শীর্ষ, rms = V₀/√2।",
    explain: "বিভব সময়ের সাইন। এক চক্রে একবার ধনাত্মক চূড়া, একবার ঋণাত্মক।",
    meaning: "বাড়ির এসি এই আকৃতির। 220 V বলতে rms, শীর্ষ 220√2 ≈ 311 V।",
    slope: "তাৎক্ষণিক ঢাল = V₀ ω cos(ωt)।",
    area: noArea,
    origin: "both",
    knobs: [knob("peak", "শীর্ষ বিভব V₀", 20, 340, 10, "V"), knob("freq", "কম্পাঙ্ক f", 20, 80, 5, "Hz")],
    base: { peak: 311, freq: 50 },
    steps: [
      { eq: "V = V₀ sin(ωt)", why: "জেনারেটরের সাইন বিভব। ω = 2πf।" },
      { eq: "Vᵣₘₛ = V₀ / √2", why: "ক্ষমতার হিসাবে গড় বর্গমূল।" },
      { eq: "সময়ের সাইন", why: "V সময়ের সমানুপাতিক নয়। চক্র T = 1/f।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "V–t", copper, samples(0, 40, (time) => p.peak * Math.sin(2 * Math.PI * p.freq * time * 1e-3), 180))],
        calc: `Vᵣₘₛ = ${bnNum(p.peak / Math.SQRT2, 1)} V। চক্র T = ${bnNum(1000 / p.freq, 1)} ms।`,
      };
    },
  },
  {
    id: "in-it",
    chapter: "induction",
    title: "পরিবর্তী প্রবাহ–সময়",
    source: "book",
    xName: "সময়",
    yName: "প্রবাহ",
    xSymbol: "t (ms)",
    ySymbol: "I (A)",
    formula: "I = I₀ sin(2π f t)",
    condition: "বিশুদ্ধ রোধ। প্রবাহ বিভবের সাথে এক দশায়। I₀ = V₀/R।",
    explain: "রোধে প্রবাহও সাইন, বিভবের সাথে শূন্য ও চূড়া একসময়ে।",
    meaning: "Iᵣₘₛ = I₀/√2। গড় ক্ষমতা Vᵣₘₛ Iᵣₘₛ।",
    slope: "ঢাল সময়ের সাথে বদলায়।",
    area: noArea,
    origin: "both",
    knobs: [knob("peak", "শীর্ষ প্রবাহ I₀", 0.2, 4, 0.1, "A"), knob("freq", "কম্পাঙ্ক f", 20, 80, 5, "Hz")],
    base: { peak: 1.5, freq: 50 },
    steps: [
      { eq: "V = V₀ sin(ωt)", why: "উৎসের বিভব।" },
      { eq: "I = V / R", why: "বিশুদ্ধ রোধে দশা বদলায় না।" },
      { eq: "I = I₀ sin(ωt)", why: "I₀ = V₀/R। প্রবাহও একই সাইন।", tag: "সমানুপাত" },
    ],
    build(p) {
      return {
        curves: [curve("main", "I–t", copper, samples(0, 40, (time) => p.peak * Math.sin(2 * Math.PI * p.freq * time * 1e-3), 180))],
        calc: `Iᵣₘₛ = ${bnNum(p.peak / Math.SQRT2, 2)} A।`,
      };
    },
  },
  {
    id: "in-phase",
    chapter: "induction",
    title: "বিভব ও প্রবাহের দশা পার্থক্য",
    source: "book",
    xName: "সময়",
    yName: "আপেক্ষিক মান",
    xSymbol: "t (ms)",
    ySymbol: "V/V₀ , I/I₀",
    formula: "I = I₀ sin(ωt − φ)",
    condition: "দুই লেখকে শীর্ষ দিয়ে ভাগ করা, যাতে আকৃতি মিলে দেখা যায়। φ ধনাত্মক হলে প্রবাহ বিভবের পিছে।",
    explain: "রোধে φ = 0। আবেকশে প্রবাহ পিছিয়ে φ = +90° পর্যন্ত। ধারকে প্রবাহ এগিয়ে, φ ঋণাত্মক।",
    meaning: "দশা পার্থক্যই বলে বর্তনীতে রোধ, আবেকশ না ধারকত্ব বড়।",
    slope: "দুই লেখের শূন্য পার হওয়ার সময়ের ফারাক φ/ω।",
    area: noArea,
    origin: "both",
    knobs: [knob("phase", "দশা φ", -90, 90, 5, "°"), knob("freq", "কম্পাঙ্ক f", 20, 80, 5, "Hz")],
    base: { phase: 45, freq: 50 },
    steps: [
      { eq: "V = V₀ sin(ωt)", why: "উৎসকে দশার শূন্য ধরা।" },
      { eq: "I = I₀ sin(ωt − φ)", why: "φ প্রবাহের পিছনোর কোণ।" },
      { eq: "φ = 0 → একসাথে", why: "φ = 90° হলে একটির চূড়ায় অন্যটি শূন্য। সময় অক্ষে সরল সমানুপাত নয়।" },
    ],
    build(p) {
      const omega = 2 * Math.PI * p.freq;
      const shift = (p.phase * Math.PI) / 180;
      return {
        curves: [
          curve("main", "V/V₀", copper, samples(0, 40, (time) => Math.sin(omega * time * 1e-3), 180)),
          curve("current", "I/I₀", blue, samples(0, 40, (time) => Math.sin(omega * time * 1e-3 - shift), 180)),
        ],
        calc: `φ = ${bnNum(p.phase, 0)}°। সময়ের ফারাক ${bnNum((p.phase / 360) * (1000 / p.freq), 2)} ms।`,
      };
    },
  },
  {
    id: "in-xl",
    chapter: "induction",
    title: "আবেশীয় রিঅ্যাকট্যান্স–কম্পাঙ্ক",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "আবেশীয় রিঅ্যাকট্যান্স",
    xSymbol: "f (Hz)",
    ySymbol: "Xₗ (Ω)",
    formula: "Xₗ = 2π f L",
    condition: "বিশুদ্ধ আবেকশ। রোধ ও ধারকত্ব নেই।",
    explain: "কম্পাঙ্ক বাড়লে আবেকশ প্রবাহকে বেশি বাধা দেয়। Xₗ কম্পাঙ্কের সমানুপাতিক।",
    meaning: "ডিসিতে f = 0, তাই আদর্শ আবেকশের রিঅ্যাকট্যান্স শূন্য।",
    slope: "ঢাল = 2πL।",
    area: noArea,
    origin: "both",
    knobs: [knob("inductance", "আবেকশ L", 0.02, 0.4, 0.02, "H")],
    base: { inductance: 0.1 },
    steps: [
      { eq: "ε = −L dI/dt", why: "আবেকশে বিভব প্রবাহের পরিবর্তনের হারের সমানুপাতিক।" },
      { eq: "I = I₀ sin(ωt)", why: "সাইন প্রবাহে বিভবের বিস্তার I₀ ω L।" },
      { eq: "Xₗ = ω L = 2π f L", why: "L স্থির। কম্পাঙ্কের সমানুপাতিক।", tag: "সমানুপাত" },
    ],
    build(p) {
      const slope = 2 * Math.PI * p.inductance;
      return {
        curves: [curve("main", "Xₗ", copper, samples(0, 120, (frequency) => slope * frequency, 24))],
        calc: `50 Hz-এ Xₗ = ${bnNum(slope * 50, 1)} Ω।`,
      };
    },
  },
  {
    id: "in-xc",
    chapter: "induction",
    title: "ধারকীয় রিঅ্যাকট্যান্স–কম্পাঙ্ক",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "ধারকীয় রিঅ্যাকট্যান্স",
    xSymbol: "f (Hz)",
    ySymbol: "X꜀ (Ω)",
    formula: "X꜀ = 1 / (2π f C)",
    condition: "বিশুদ্ধ ধারক। f = 0 এই লেখে নেই, কারণ ডিসিতে আদর্শ ধারক খোলা বর্তনী।",
    explain: "কম্পাঙ্ক বাড়লে ধারক সহজে প্রবাহ নিতে দেয়, রিঅ্যাকট্যান্স কমে। ব্যাস্তানুপাত।",
    meaning: "উচ্চ কম্পাঙ্কে ধারক প্রায় শর্ট, নিম্ন কম্পাঙ্কে প্রায় খোলা।",
    slope: "ঢাল = −1/(2π C f²)।",
    area: noArea,
    knobs: [knob("cap", "ধারকত্ব C", 20, 200, 10, "μF")],
    base: { cap: 100 },
    steps: [
      { eq: "I = C dV/dt", why: "ধারকের প্রবাহ বিভবের পরিবর্তনের হারের সমানুপাতিক।" },
      { eq: "X꜀ = 1 / (ω C)", why: "সাইন বিভবে বাধার ভূমিকা 1/(ωC)।" },
      { eq: "X꜀ ∝ 1/f", why: "C স্থির। কম্পাঙ্কের ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
    ],
    build(p) {
      const capacitance = p.cap * 1e-6;
      const reactance = (frequency: number) => 1 / (2 * Math.PI * frequency * capacitance);
      return {
        curves: [curve("main", "X꜀", copper, samples(10, 150, reactance))],
        calc: `50 Hz-এ X꜀ = ${bnNum(reactance(50), 1)} Ω। 100 Hz-এ ${bnNum(reactance(100), 1)} Ω।`,
      };
    },
  },
  {
    id: "in-z",
    chapter: "induction",
    title: "ইম্পিড্যান্স–কম্পাঙ্ক",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "ইম্পিড্যান্স",
    xSymbol: "f (Hz)",
    ySymbol: "Z (Ω)",
    formula: "Z = √[R² + (Xₗ − X꜀)²]",
    condition: "শ্রেণি RLC। Xₗ = 2πfL, X꜀ = 1/(2πfC)।",
    explain: "যে কম্পাঙ্কে Xₗ = X꜀, সেখানে Z সবচেয়ে ছোট এবং Z = R। সেটাই অনুরণন।",
    meaning: "অনুরণনের নিচে ধারকত্ব জেতে, ওপরে আবেকশ জেতে।",
    slope: "অনুরণনে ঢাল শূন্য। দুই পাশে উল্টো।",
    area: noArea,
    knobs: [knob("resistance", "রোধ R", 5, 40, 1, "Ω"), knob("inductance", "L", 0.05, 0.3, 0.01, "H"), knob("cap", "C", 40, 200, 10, "μF")],
    base: { resistance: 20, inductance: 0.1, cap: 100 },
    steps: [
      { eq: "X = Xₗ − X꜀", why: "আবেকশ ও ধারক উল্টো দশায়, বিয়োগ হয়।" },
      { eq: "Z = √(R² + X²)", why: "প্রতিবন্ধ ও বিক্রিয়া সমকোণী যোগ।" },
      { eq: "Xₗ = X꜀ হলে Z = R", why: "অনুরণন। Z-এর সর্বনিম্ন R, কম্পাঙ্কের সরল সমানুপাত নয়।", tag: "ধ্রুব" },
    ],
    build(p) {
      const capacitance = p.cap * 1e-6;
      const impedance = (frequency: number) => {
        const xl = 2 * Math.PI * frequency * p.inductance;
        const xc = 1 / (2 * Math.PI * frequency * capacitance);
        return Math.hypot(p.resistance, xl - xc);
      };
      const resonance = 1 / (2 * Math.PI * Math.sqrt(p.inductance * capacitance));
      return {
        curves: [curve("main", "Z–f", copper, samples(10, 160, impedance, 160))],
        guides: [{ x: resonance, label: "অনুরণন" }],
        calc: `f₀ = ${bnNum(resonance, 1)} Hz। সেখানে Z = R = ${bnNum(p.resistance, 0)} Ω।`,
      };
    },
  },
  {
    id: "in-resonance",
    chapter: "induction",
    title: "অনুরণনে প্রবাহ–কম্পাঙ্ক",
    source: "book",
    xName: "কম্পাঙ্ক",
    yName: "প্রবাহের শীর্ষ",
    xSymbol: "f (Hz)",
    ySymbol: "I₀ (A)",
    formula: "I₀ = V₀ / Z,   f₀ = 1/(2π√(LC))",
    condition: "শ্রেণি RLC, উৎসের শীর্ষ বিভব স্থির।",
    explain: "অনুরণনে Z সবচেয়ে ছোট, তাই প্রবাহ সবচেয়ে বড়। R কমলে চূড়া তীক্ষ্ণ।",
    meaning: "রেডিও টিউনিং এই চূড়া দিয়ে একটি কম্পাঙ্ক বাছে।",
    slope: "চূড়ায় ঢাল শূন্য।",
    area: noArea,
    knobs: [knob("voltage", "শীর্ষ বিভব V₀", 5, 24, 1, "V"), knob("resistance", "রোধ R", 5, 40, 1, "Ω")],
    base: { voltage: 10, resistance: 15 },
    steps: [
      { eq: "I₀ = V₀ / Z", why: "শীর্ষ প্রবাহ শীর্ষ বিভব ভাগ ইম্পিড্যান্স।" },
      { eq: "Z সর্বনিম্ন = R", why: "Xₗ = X꜀ হলে। f₀ = 1/(2π√LC)।" },
      { eq: "I₀ সর্বোচ্চ = V₀ / R", why: "প্রবাহ কম্পাঙ্কের সরল সমানুপাত নয়। একটি চূড়া।", tag: "ধ্রুব" },
    ],
    build(p) {
      const inductance = 0.1;
      const capacitance = 100e-6;
      const resonance = 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance));
      const current = (frequency: number) => {
        const xl = 2 * Math.PI * frequency * inductance;
        const xc = 1 / (2 * Math.PI * frequency * capacitance);
        return p.voltage / Math.hypot(p.resistance, xl - xc);
      };
      return {
        curves: [curve("main", "I₀–f", copper, samples(15, 140, current, 180))],
        guides: [{ x: resonance, label: "f₀" }],
        calc: `f₀ = ${bnNum(resonance, 1)} Hz। চূড়ার প্রবাহ ${bnNum(p.voltage / p.resistance, 2)} A। L = 0.1 H, C = 100 μF স্থির।`,
      };
    },
  },
  {
    id: "in-transformer",
    chapter: "induction",
    title: "ট্রান্সফরমারের বিভব",
    source: "book",
    xName: "প্রাথমিক বিভব",
    yName: "গৌণ বিভব",
    xSymbol: "Vₚ (V)",
    ySymbol: "Vₛ (V)",
    formula: "Vₛ / Vₚ = Nₛ / Nₚ",
    condition: "আদর্শ ট্রান্সফরমার: ফ্লাক্স লিক নেই, কুণ্ডলীর রোধ শূন্য, মজ্জা অসীম ভেদ্যতা। বাস্তবে অল্প ক্ষতি থাকে।",
    explain: "পাকের অনুপাত স্থির থাকলে গৌণ বিভব প্রাথমিক বিভবের সমানুপাতিক। ঢাল Nₛ/Nₚ।",
    meaning: "অনুপাত 1-এর বেশি হলে স্টেপ-আপ, কম হলে স্টেপ-ডাউন। আদর্শ ক্ষেত্রে ক্ষমতা একই, প্রবাহ উল্টো অনুপাতে।",
    slope: "ঢাল = Nₛ/Nₚ।",
    area: noArea,
    origin: "both",
    knobs: [knob("primary", "প্রাথমিক পাক Nₚ", 50, 400, 10, ""), knob("secondary", "গৌণ পাক Nₛ", 20, 400, 10, "")],
    base: { primary: 200, secondary: 100 },
    steps: [
      { eq: "ε = −N dΦ/dt", why: "একই ফ্লাক্স দুই কুণ্ডলীতে।" },
      { eq: "Vₛ/Vₚ = Nₛ/Nₚ", why: "dΦ/dt কাটা যায়। আদর্শ ক্ষেত্রে বিভব ≈ তড়িচ্চালক বল।" },
      { eq: "Vₛ ∝ Vₚ", why: "পাক স্থির। ঢাল পাকের অনুপাত।", tag: "সমানুপাত" },
    ],
    build(p) {
      const ratio = p.secondary / p.primary;
      return {
        curves: [curve("main", "আদর্শ", copper, samples(0, 240, (voltage) => ratio * voltage, 16))],
        calc: `Nₛ/Nₚ = ${bnNum(ratio, 2)}। 220 V প্রাথমিকে গৌণ ${bnNum(ratio * 220, 1)} V।`,
      };
    },
  },
];

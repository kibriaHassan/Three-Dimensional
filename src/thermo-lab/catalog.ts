import { baseParams, type Params } from "./physics";

export type Family = "box" | "rod" | "piston" | "compare" | "engine" | "graph" | "flow" | "bars";
export type Section = "basics" | "process" | "law" | "engine" | "chart";
export type Knob = "temp" | "hot" | "cold" | "volume" | "ratio" | "moles";

export type ThermoModel = {
  no: number;
  slug: string;
  family: Family;
  section: Section;
  focus: string;
  title: string;
  titleEn: string;
  blurb: string;
  blurbEn: string;
  explain: string;
  explainEn: string;
  formula: string;
  symbols: string;
  knobs: Knob[];
  preset: Partial<Params>;
};

const sections = {
  basics: ["মৌলিক", "Basics"],
  process: ["প্রক্রিয়া", "Processes"],
  law: ["সূত্র", "Laws"],
  engine: ["ইঞ্জিন", "Engines"],
  chart: ["লেখ ও চক্র", "Charts"],
} as const;

export function thermoSection(section: Section, lang: "bn" | "en") {
  const pair = sections[section];
  return lang === "en" ? pair[1] : pair[0];
}

const S = "n মোল, R গ্যাস ধ্রুবক, T কেলভিন, V আয়তন, P চাপ, γ = 1.40";

const rows: Omit<ThermoModel, "no">[] = [
  {
    slug: "heat-temp",
    family: "box",
    section: "basics",
    focus: "motion",
    title: "তাপ, তাপমাত্রা ও অণুর গতি",
    titleEn: "Heat, temperature and molecular motion",
    blurb: "তাপমাত্রা বাড়লে অণু দ্রুত চলে।",
    blurbEn: "Molecules move faster when the temperature rises.",
    formula: "T ∝ গড় আণবিক গতিশক্তি",
    symbols: "T কেলভিন। তাপ শক্তি, তাপমাত্রা শক্তির মাত্রা নয়।",
    explain:
      "তাপ এক বস্তু থেকে অন্য বস্তুতে যাওয়া শক্তি। তাপমাত্রা বলে অণুগুলো গড়ে কত জোরে কাঁপছে। বাক্সের রং ও অণুর বেগ স্লাইডারের কেলভিন মান অনুসরণ করে। ঠান্ডা গ্যাস নীল ও ধীর, গরম গ্যাস লাল ও দ্রুত।",
    explainEn:
      "Heat is energy moving from one body to another. Temperature says how fast the molecules are moving on average. The colour and the speed follow the kelvin slider: cold gas is blue and slow, hot gas is red and fast.",
    knobs: ["temp", "volume", "moles"],
    preset: {},
  },
  {
    slug: "expansion",
    family: "rod",
    section: "basics",
    focus: "rod",
    title: "তাপের প্রসারণ ও সংকোচন",
    titleEn: "Thermal expansion and contraction",
    blurb: "গরম হলে দণ্ড লম্বা হয়, ঠান্ডায় কমে।",
    blurbEn: "A rod grows when heated and shrinks when cooled.",
    formula: "ΔL = α L₀ ΔT",
    symbols: "ইস্পাতের α ≈ 1.2×10⁻⁵ /K, L₀ = 1 m, ΔT = T − 300 K",
    explain:
      "দৈর্ঘ্য প্রসারণ ΔL = αL₀ΔT। পাশের সংখ্যা আসল মিলিমিটার। দণ্ডের ছবি বড় করে দেখানো, নইলে এক মিটার দণ্ডে কয়েক মিলিমিটার চোখে পড়ে না। ৩০০ K-এর নিচে নামলে দণ্ড সংকুচিত হয়।",
    explainEn:
      "Linear expansion is ΔL = αL₀ΔT. The number beside the rod is the real millimetre change. The picture is magnified, because a few millimetres on a one-metre rod would be invisible. Below 300 K the rod contracts.",
    knobs: ["temp"],
    preset: { temp: 500 },
  },
  {
    slug: "kinetic",
    family: "box",
    section: "basics",
    focus: "kinetic",
    title: "গ্যাসের অণুর গতিতত্ত্ব",
    titleEn: "Kinetic theory of gases",
    blurb: "চাপ দেয়ালে অণুর ধাক্কা।",
    blurbEn: "Pressure is the molecules striking the walls.",
    formula: "P = ⅓ ρ c²",
    symbols: "c = √(3RT/M), বায়ুর M = 0.029 kg/mol",
    explain:
      "আদর্শ গ্যাসের অণুর নিজস্ব আয়তন ও আকর্ষণ ধরা হয় না। দেয়ালে ধাক্কার হার ও জোর থেকে চাপ আসে, P = ⅓ρc²। একই অবস্থায় এটি PV = nRT-এর চাপের সমান। cᵣₘₛ = √(3RT/M)। তাপমাত্রা বাড়ালে ধাক্কা জোরালো হয়।",
    explainEn:
      "An ideal gas has no molecular volume and no attraction. Pressure comes from how often and how hard molecules hit the wall, P = ⅓ρc². At the same state this matches PV = nRT. cᵣₘₛ = √(3RT/M). A higher temperature means harder hits.",
    knobs: ["temp", "volume", "moles"],
    preset: {},
  },
  {
    slug: "piston-move",
    family: "piston",
    section: "basics",
    focus: "move",
    title: "পিস্টনে গ্যাসের প্রসারণ ও সংকোচন",
    titleEn: "Expansion and compression in a piston",
    blurb: "চাপ স্থির থাকলে গরমে পিস্টন ওঠে।",
    blurbEn: "At constant pressure the piston rises as the gas is heated.",
    formula: "V/T = ধ্রুবক",
    symbols: S,
    explain:
      "সিলিন্ডারের মুখে চলমান পিস্টন। সমচাপে তাপ দিলে আয়তন তাপমাত্রার সঙ্গে বাড়ে, পিস্টন উপরে ওঠে। ঠান্ডা করলে নামে। অণু সব সময় তখনকার আয়তনের ভিতরেই থাকে।",
    explainEn:
      "A movable piston closes the cylinder. Heated at constant pressure, the volume rises with temperature and the piston climbs. Cooling brings it down. The molecules stay inside the volume of that moment.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "isothermal",
    family: "piston",
    section: "process",
    focus: "isothermal",
    title: "সমতাপ প্রক্রিয়া",
    titleEn: "Isothermal process",
    blurb: "তাপমাত্রা স্থির, PV ধ্রুব।",
    blurbEn: "Temperature stays fixed, so PV is constant.",
    formula: "PV = ধ্রুবক",
    symbols: "ΔU = 0, ΔQ = ΔW = nRT ln(V₂/V₁)",
    explain:
      "ধীরে প্রসারণে তাপ স্নানের সঙ্গে বিনিময় হয়, তাই T বদলায় না। আদর্শ গ্যাসে অভ্যন্তরীণ শক্তি শুধু T-এর ওপর, ফলে ΔU = 0। প্রথম সূত্রে দেওয়া তাপ পুরোটাই গ্যাসের করা কাজে যায়।",
    explainEn:
      "A slow expansion exchanges heat with a bath, so T does not change. For an ideal gas the internal energy depends only on T, so ΔU = 0. By the first law the heat supplied all becomes work done by the gas.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "adiabatic",
    family: "piston",
    section: "process",
    focus: "adiabatic",
    title: "রুদ্ধতাপীয় প্রক্রিয়া",
    titleEn: "Adiabatic process",
    blurb: "তাপ ঢোকে না, বেরোয় না।",
    blurbEn: "No heat enters or leaves.",
    formula: "PVᵞ = ধ্রুবক",
    symbols: "ΔQ = 0, ΔW = −ΔU, বায়ুর γ = 1.40",
    explain:
      "দেয়াল তাপরোধী, তাই ΔQ = 0। প্রসারণে গ্যাস নিজের অভ্যন্তরীণ শক্তি খরচ করে কাজ করে, তাপমাত্রা কমে। সংকোচনে তাপমাত্রা বাড়ে। TVᵞ⁻¹ও ধ্রুব।",
    explainEn:
      "The walls let no heat through, so ΔQ = 0. In an expansion the gas spends its own internal energy on work and the temperature falls. In a compression the temperature rises. TVᵞ⁻¹ is constant too.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "isobaric",
    family: "piston",
    section: "process",
    focus: "isobaric",
    title: "সমচাপ প্রক্রিয়া",
    titleEn: "Isobaric process",
    blurb: "চাপ স্থির, আয়তন তাপমাত্রার সঙ্গে।",
    blurbEn: "Pressure stays fixed and volume follows temperature.",
    formula: "ΔW = PΔV = nRΔT",
    symbols: "ΔU = nCᵥΔT, ΔQ = nCₚΔT, Cₚ = γCᵥ",
    explain:
      "পিস্টনের ওপর বাইরের চাপ স্থির। তাপ দিলে আয়তন বাড়ে, T₂/T₁ = V₂/V₁। কাজ PΔV। দেওয়া তাপের এক অংশ অভ্যন্তরীণ শক্তি বাড়ায়, বাকিটা কাজ।",
    explainEn:
      "The outside pressure on the piston stays fixed. Heating increases the volume, with T₂/T₁ = V₂/V₁. The work is PΔV. Part of the heat raises the internal energy and the rest leaves as work.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "isochoric",
    family: "piston",
    section: "process",
    focus: "isochoric",
    title: "সমআয়তন প্রক্রিয়া",
    titleEn: "Isochoric process",
    blurb: "আয়তন আটকানো, চাপ বাড়ে।",
    blurbEn: "The volume is locked and the pressure rises.",
    formula: "ΔW = 0",
    symbols: "ΔQ = ΔU = nCᵥΔT, P/T = ধ্রুবক",
    explain:
      "পিস্টন আটকানো, তাই ΔV = 0 এবং কাজ শূন্য। দেওয়া তাপ পুরোটা অভ্যন্তরীণ শক্তি। চাপ তাপমাত্রার সঙ্গে বাড়ে। অনুপাতের স্লাইডার এখানে T₂/T₁।",
    explainEn:
      "The piston is locked, so ΔV = 0 and the work is zero. All the heat becomes internal energy. Pressure rises with temperature. The ratio slider here is T₂/T₁.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "iso-compare",
    family: "compare",
    section: "process",
    focus: "compare",
    title: "সমোষ্ণ ও রুদ্ধতাপীয় তুলনা",
    titleEn: "Isothermal beside adiabatic",
    blurb: "একই প্রসারণে রুদ্ধতাপীয় গ্যাস ঠান্ডা হয়।",
    blurbEn: "For the same expansion the adiabatic gas cools.",
    formula: "γ > 1",
    symbols: "সমতাপে T স্থির। রুদ্ধতাপে T₂ = T₁ (V₁/V₂)ᵞ⁻¹",
    explain:
      "দুটি সিলিন্ডার একই V₁ থেকে একই V₂-তে যায়। বাঁয়ে তাপমাত্রা স্থির। ডানে তাপ ঢোকে না, তাই অণু ধীর ও নীল হয়ে যায় এবং চাপ বেশি কমে।",
    explainEn:
      "Both cylinders go from the same V₁ to the same V₂. On the left the temperature stays fixed. On the right no heat enters, so the molecules slow down, turn blue, and the pressure falls further.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "first-law",
    family: "piston",
    section: "law",
    focus: "first",
    title: "তাপগতিবিদ্যার প্রথম সূত্র",
    titleEn: "First law of thermodynamics",
    blurb: "তাপ = অভ্যন্তরীণ শক্তি + কাজ।",
    blurbEn: "Heat equals the gain in internal energy plus the work.",
    formula: "ΔQ = ΔU + ΔW",
    symbols: "ΔW গ্যাসের করা কাজ। সমচাপের উদাহরণে তিনটি রাশিই অশূন্য।",
    explain:
      "শক্তি সৃষ্টি বা বিনাশ হয় না। গ্যাসকে দেওয়া তাপ দুই কাজে ভাগ হয়: ভিতরের শক্তি বাড়ে, আর গ্যাস বাইরে কাজ করে। সমচাপ প্রসারণে তিনটি দণ্ড পাশাপাশি দেখা যায় এবং ΔQ = ΔU + ΔW মিলে যায়।",
    explainEn:
      "Energy is not created or destroyed. Heat given to the gas splits in two: the internal energy rises, and the gas does work outside. In an isobaric expansion the three bars sit side by side and ΔQ = ΔU + ΔW closes.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "internal",
    family: "piston",
    section: "law",
    focus: "internal",
    title: "অভ্যন্তরীণ শক্তির পরিবর্তন",
    titleEn: "Change in internal energy",
    blurb: "আদর্শ গ্যাসে ΔU শুধু তাপমাত্রায়।",
    blurbEn: "For an ideal gas ΔU depends only on temperature.",
    formula: "ΔU = n Cᵥ ΔT",
    symbols: "Cᵥ = R/(γ−1) = 2.5 R, দ্বিপরমাণুক বায়ু",
    explain:
      "আদর্শ গ্যাসের অভ্যন্তরীণ শক্তি আয়তনের ওপর নয়, শুধু তাপমাত্রার ওপর। রুদ্ধতাপীয় প্রসারণে তাপ শূন্য, তাই তাপমাত্রা কমার সঙ্গে ΔU ঋণাত্মক এবং সেই শক্তিই কাজ হয়ে বেরোয়।",
    explainEn:
      "The internal energy of an ideal gas does not depend on volume, only on temperature. In an adiabatic expansion the heat is zero, so ΔU is negative as the temperature falls and that energy leaves as work.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "work",
    family: "piston",
    section: "law",
    focus: "work",
    title: "গ্যাসের করা কাজ",
    titleEn: "Work done by the gas",
    blurb: "প্রসারণে কাজ ধনাত্মক।",
    blurbEn: "Expansion does positive work.",
    formula: "ΔW = ∫ P dV",
    symbols: "সমতাপে ΔW = nRT ln(V₂/V₁)",
    explain:
      "পিস্টন সরলে গ্যাস কাজ করে। সমতাপ প্রসারণে ΔW = nRT ln(V₂/V₁)। আয়তন কমলে কাজ ঋণাত্মক — বাইরে থেকে গ্যাসের ওপর কাজ হয়। P–V লেখের নিচের ক্ষেত্রফল এই কাজ।",
    explainEn:
      "When the piston moves, the gas does work. For an isothermal expansion ΔW = nRT ln(V₂/V₁). If the volume falls the work is negative: the outside does work on the gas. That work is the area under the P–V curve.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "heat-engine",
    family: "engine",
    section: "engine",
    focus: "engine",
    title: "তাপ ইঞ্জিন",
    titleEn: "Heat engine",
    blurb: "গরম উৎস থেকে তাপ নিয়ে কাজ।",
    blurbEn: "Work from heat taken out of a hot source.",
    formula: "ΔW = Qₕ − Q꜀",
    symbols: "Qₕ গৃহীত তাপ, Q꜀ বর্জিত তাপ",
    explain:
      "ইঞ্জিন উচ্চ তাপমাত্রার উৎস থেকে Qₕ নেয়, তার কিছু অংশ কাজে লাগায়, বাকি Q꜀ নিম্ন তাপমাত্রার গ্রাহকে ফেলে। চাকা ঘোরে যতক্ষণ নিট কাজ ধনাত্মক। পুরো তাপকে কাজে লাগানো যায় না।",
    explainEn:
      "An engine takes Qₕ from a hot source, turns part of it into work, and rejects the rest Q꜀ to a cold sink. The wheel turns while the net work is positive. Not all of the heat can become work.",
    knobs: ["hot", "cold", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "carnot",
    family: "engine",
    section: "engine",
    focus: "carnot",
    title: "কার্নো ইঞ্জিন",
    titleEn: "Carnot engine",
    blurb: "দুই তাপমাত্রার মধ্যে আদর্শ ইঞ্জিন।",
    blurbEn: "The ideal engine between two temperatures.",
    formula: "η = 1 − T꜀/Tₕ",
    symbols: "T কেলভিন। Tₕ > T꜀",
    explain:
      "কার্নো ইঞ্জিন উভমুখী। দুটি সমতাপ ও দুটি রুদ্ধতাপীয় ধাপ। দক্ষতা শুধু দুই তাপমাত্রার ওপর, η = 1 − T꜀/Tₕ। একই উৎস ও গ্রাহকের মধ্যে এর বেশি দক্ষতা সম্ভব নয়।",
    explainEn:
      "A Carnot engine is reversible: two isothermal steps and two adiabatic steps. Its efficiency depends only on the two temperatures, η = 1 − T꜀/Tₕ. No engine between the same source and sink can do better.",
    knobs: ["hot", "cold", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "carnot-steps",
    family: "engine",
    section: "engine",
    focus: "steps",
    title: "কার্নো চক্রের চার ধাপ",
    titleEn: "Four steps of the Carnot cycle",
    blurb: "প্রসারণ, প্রসারণ, সংকোচন, সংকোচন।",
    blurbEn: "Expansion, expansion, compression, compression.",
    formula: "Qₕ/Tₕ = Q꜀/T꜀",
    symbols: "V₂/V₁ = V₃/V₄, V₃/V₂ = (Tₕ/T꜀)^(1/(γ−1))",
    explain:
      "১) Tₕ-এ সমতাপ প্রসারণ, তাপ গ্রহণ। ২) রুদ্ধতাপীয় প্রসারণ, Tₕ থেকে T꜀। ৩) T꜀-এ সমতাপ সংকোচন, তাপ বর্জন। ৪) রুদ্ধতাপীয় সংকোচন, আবার Tₕ। চার ধাপ শেষে গ্যাস আগের অবস্থায় ফেরে।",
    explainEn:
      "1) Isothermal expansion at Tₕ, absorbing heat. 2) Adiabatic expansion from Tₕ to T꜀. 3) Isothermal compression at T꜀, rejecting heat. 4) Adiabatic compression back to Tₕ. After four steps the gas is back where it started.",
    knobs: ["hot", "cold", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "efficiency",
    family: "engine",
    section: "engine",
    focus: "efficiency",
    title: "তাপ ইঞ্জিনের দক্ষতা",
    titleEn: "Efficiency of a heat engine",
    blurb: "কাজ ভাগ গৃহীত তাপ।",
    blurbEn: "Work divided by the heat absorbed.",
    formula: "η = ΔW / Qₕ = 1 − Q꜀/Qₕ",
    symbols: "কার্নো ইঞ্জিনে η = 1 − T꜀/Tₕ",
    explain:
      "দক্ষতা ইঞ্জিন যত তাপ নিয়েছে তার কত অংশ কাজে দিয়েছে। Tₕ বাড়লে বা T꜀ কমলে কার্নো দক্ষতা বাড়ে। T꜀ শূন্য নয় বলে দক্ষতা ১ হয় না।",
    explainEn:
      "Efficiency is the share of the absorbed heat that becomes work. Carnot efficiency rises if Tₕ rises or T꜀ falls. It never reaches 1, because T꜀ is not zero.",
    knobs: ["hot", "cold", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "fridge",
    family: "engine",
    section: "engine",
    focus: "fridge",
    title: "রেফ্রিজারেটর ও হিমায়ক",
    titleEn: "Refrigerator",
    blurb: "কাজ দিয়ে ঠান্ডা থেকে তাপ তোলা।",
    blurbEn: "Work lifts heat out of the cold body.",
    formula: "COP = Q꜀ / ΔW",
    symbols: "কার্নো হিমায়কে COP = T꜀ / (Tₕ − T꜀)",
    explain:
      "হিমায়ক উল্টো ইঞ্জিন। কাজ খরচ করে ঠান্ডা প্রকোষ্ঠ থেকে Q꜀ তোলে এবং গরম বাইরে Qₕ ফেলে। নিজে থেকে তাপ ঠান্ডা থেকে গরমে যায় না, তাই কম্প্রেসর লাগে।",
    explainEn:
      "A refrigerator is an engine run backwards. It spends work to lift Q꜀ from the cold chamber and dump Qₕ outside. Heat does not flow from cold to hot on its own, so a compressor is needed.",
    knobs: ["hot", "cold", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "heat-pump",
    family: "engine",
    section: "engine",
    focus: "pump",
    title: "হিট পাম্প",
    titleEn: "Heat pump",
    blurb: "বাইরে থেকে তাপ এনে ঘর গরম।",
    blurbEn: "Heat taken from outside warms the room.",
    formula: "COP = Qₕ / ΔW",
    symbols: "কার্নো পাম্পে COP = Tₕ / (Tₕ − T꜀)",
    explain:
      "হিট পাম্পও উল্টো চক্র, কিন্তু উদ্দেশ্য গরম দিকের পাওয়া তাপ। ঘরে পৌঁছায় Qₕ = Q꜀ + ΔW, তাই দেওয়া কাজের চেয়ে বেশি তাপ পাওয়া যায়। কার্নো পাম্পের COP = Tₕ/(Tₕ−T꜀)।",
    explainEn:
      "A heat pump is the reversed cycle too, but the useful quantity is the heat delivered to the hot side. The room receives Qₕ = Q꜀ + ΔW, so the heat exceeds the work spent. For a Carnot pump, COP = Tₕ/(Tₕ−T꜀).",
    knobs: ["hot", "cold", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "heat-flow",
    family: "flow",
    section: "engine",
    focus: "flow",
    title: "তাপ উৎস ও তাপ গ্রাহক",
    titleEn: "Heat source and heat sink",
    blurb: "তাপ নিজে থেকে গরম থেকে ঠান্ডায়।",
    blurbEn: "Heat flows by itself from hot to cold.",
    formula: "Qₕ → ইঞ্জিন → Q꜀",
    symbols: "Tₕ উৎস, T꜀ গ্রাহক",
    explain:
      "তাপ উৎস উচ্চ তাপমাত্রায় তাপ দেয়। তাপ গ্রাহক নিম্ন তাপমাত্রায় তাপ নেয়। পার্থক্য বড় হলে প্রবাহের তীর মোটা। উৎস না থাকলে ইঞ্জিন চলে না, গ্রাহক না থাকলে বর্জিত তাপ রাখার জায়গা থাকে না।",
    explainEn:
      "The source supplies heat at the high temperature. The sink receives heat at the low temperature. A larger gap draws a thicker arrow. Without a source the engine has nothing to take, and without a sink the rejected heat has nowhere to go.",
    knobs: ["hot", "cold"],
    preset: {},
  },
  {
    slug: "pv-diagram",
    family: "graph",
    section: "chart",
    focus: "pv",
    title: "চাপ–আয়তন লেখচিত্র",
    titleEn: "Pressure–volume diagram",
    blurb: "নিচের ক্ষেত্রফল গ্যাসের কাজ।",
    blurbEn: "The area under the curve is the work.",
    formula: "ΔW = ∫ P dV",
    symbols: "অনুভূমিক অক্ষ V, উল্লম্ব অক্ষ P",
    explain:
      "অনুভূমিক অক্ষ আয়তন, উল্লম্ব অক্ষ চাপ। বিন্দু গ্যাসের বর্তমান অবস্থা। সমতাপ বক্ররেখা বরাবর বিন্দু চলে। রেখার নিচের ক্ষেত্রফল প্রসারণে গ্যাসের করা কাজ।",
    explainEn:
      "Volume is horizontal and pressure is vertical. The dot is the current state of the gas. It travels along an isotherm. The area under the curve is the work done by the gas during expansion.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "curve-compare",
    family: "graph",
    section: "chart",
    focus: "curves",
    title: "সমতাপ ও রুদ্ধতাপীয় রেখা",
    titleEn: "Isothermal and adiabatic curves",
    blurb: "রুদ্ধতাপীয় রেখা বেশি খাড়া।",
    blurbEn: "The adiabatic curve is steeper.",
    formula: "|dP/dV|ᵃᵈⁱ = γ |dP/dV|ⁱˢᵒ",
    symbols: "একই বিন্দু থেকে প্রসারণ, γ = 1.40",
    explain:
      "একই শুরুর অবস্থা থেকে দুটি রেখা। সোনালি সমতাপ, নীল রুদ্ধতাপীয়। γ > 1 বলে রুদ্ধতাপীয় রেখা দ্রুত নেমে যায় — একই আয়তনে তার চাপ কম।",
    explainEn:
      "Both curves leave the same starting state. Gold is the isotherm and blue is the adiabat. Because γ > 1 the adiabat falls faster, so at the same volume its pressure is lower.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "cycle-state",
    family: "graph",
    section: "chart",
    focus: "cycle",
    title: "চক্রে চাপ, আয়তন ও তাপমাত্রা",
    titleEn: "Pressure, volume and temperature around a cycle",
    blurb: "চার ধাপে P, V, T বদলায়, শেষে ফেরে।",
    blurbEn: "P, V and T change through four steps, then return.",
    formula: "∮ dU = 0",
    symbols: "এক চক্রে ΔU = 0, নিট কাজ = ঘেরা ক্ষেত্রফল",
    explain:
      "কার্নো লুপে বিন্দু ঘোরে। সমতাপ ধাপে T স্থির, P ও V উল্টো। রুদ্ধতাপীয় ধাপে তিনটিই বদলায়। চক্র শেষে অভ্যন্তরীণ শক্তি আগের মানে ফেরে, নিট কাজ লুপের ক্ষেত্রফল।",
    explainEn:
      "The dot travels the Carnot loop. On an isotherm T is fixed while P and V move in opposite directions. On an adiabat all three change. At the end of the cycle the internal energy is back, and the net work is the enclosed area.",
    knobs: ["hot", "cold", "volume", "ratio", "moles"],
    preset: {},
  },
  {
    slug: "reversible",
    family: "flow",
    section: "chart",
    focus: "reversible",
    title: "প্রত্যাবর্তী ও অপ্রত্যাবর্তী প্রক্রিয়া",
    titleEn: "Reversible and irreversible processes",
    blurb: "ধীরে উভমুখী, হঠাৎ একমুখী।",
    blurbEn: "Slow steps can reverse. A sudden change cannot.",
    formula: "মুক্ত প্রসারণে ΔW = 0",
    symbols: "আদর্শ গ্যাসের মুক্ত প্রসারণে ΔQ = 0, ΔU = 0",
    explain:
      "বাঁয়ে পিস্টন ধীরে সরে, প্রতি মুহূর্তে চাপ সাম্যাবস্থার কাছে — প্রত্যাবর্তী। ডানে দেয়াল সরে গেলে গ্যাস শূন্যে ছড়িয়ে পড়ে। বাইরে কাজ হয় না, তাপ ঢোকে না, তাপমাত্রা একই থাকে, কিন্তু প্রক্রিয়া নিজে থেকে উল্টোয় না।",
    explainEn:
      "On the left the piston moves slowly, with the pressure always near equilibrium: reversible. On the right the partition vanishes and the gas spreads into a vacuum. No outside work, no heat, the temperature stays the same, and the process does not reverse itself.",
    knobs: ["temp", "volume", "moles"],
    preset: {},
  },
  {
    slug: "second-law",
    family: "flow",
    section: "law",
    focus: "second",
    title: "তাপগতিবিদ্যার দ্বিতীয় সূত্র",
    titleEn: "Second law of thermodynamics",
    blurb: "তাপ নিজে ঠান্ডা থেকে গরমে যায় না।",
    blurbEn: "Heat does not flow by itself from cold to hot.",
    formula: "η < 1",
    symbols: "ক্লসিয়াস ও কেলভিনের বিবৃতি",
    explain:
      "ক্লসিয়াস: বাইরের সাহায্য ছাড়া তাপ ঠান্ডা বস্তু থেকে গরম বস্তুতে যায় না। কেলভিন: এমন ইঞ্জিন নেই যে একটি মাত্র উৎস থেকে তাপ নিয়ে পুরোটা কাজে বদলে, আর কিছু বদলায় না। উল্টো তীরটি অসম্ভব।",
    explainEn:
      "Clausius: without outside help, heat does not flow from a colder body to a hotter one. Kelvin: no engine can turn heat from a single source entirely into work and change nothing else. The reverse arrow is impossible.",
    knobs: ["hot", "cold"],
    preset: {},
  },
  {
    slug: "energy-convert",
    family: "bars",
    section: "law",
    focus: "convert",
    title: "প্রক্রিয়ায় শক্তির রূপান্তর",
    titleEn: "Energy conversion in each process",
    blurb: "কোথায় তাপ, কোথায় কাজ, কোথায় ΔU।",
    blurbEn: "Where the heat, the work and ΔU go.",
    formula: "ΔQ = ΔU + ΔW",
    symbols: "চার প্রক্রিয়া একই n, T₁ ও অনুপাত",
    explain:
      "একই শুরুর অবস্থা থেকে চার প্রক্রিয়া। সমতাপে ΔU শূন্য, তাপ আর কাজ সমান। রুদ্ধতাপে তাপ শূন্য, ΔU = −ΔW। সমচাপে তিনটিই আছে। সমআয়তনে কাজ শূন্য, তাপ আর ΔU সমান।",
    explainEn:
      "Four processes start from the same state. On an isotherm ΔU is zero and heat equals work. On an adiabat the heat is zero and ΔU = −ΔW. An isobar uses all three. An isochore does no work, so heat equals ΔU.",
    knobs: ["temp", "volume", "ratio", "moles"],
    preset: {},
  },
];

export const thermoModels: ThermoModel[] = rows.map((row, index) => ({ ...row, no: index + 1 }));

export function modelBySlug(slug: string) {
  return thermoModels.find((model) => model.slug === slug) ?? null;
}

export function paramsOf(model: ThermoModel) {
  return { ...baseParams, ...model.preset };
}

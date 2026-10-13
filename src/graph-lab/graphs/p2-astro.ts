import { bnNum } from "../format";
import { blue, copper, curve, gold, green, knob, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

const classes = [
  { name: "O", temperature: 40000 },
  { name: "B", temperature: 20000 },
  { name: "A", temperature: 10000 },
  { name: "F", temperature: 7500 },
  { name: "G", temperature: 5800 },
  { name: "K", temperature: 4000 },
  { name: "M", temperature: 3000 },
];

export const astroGraphs: GraphSpec[] = [
  {
    id: "as-hr",
    chapter: "astro",
    title: "H–R চিত্রের প্রধান ধারা",
    source: "schematic",
    xName: "পৃষ্ঠের তাপমাত্রা",
    yName: "আলোকদীপ্তি",
    xSymbol: "T (K)",
    ySymbol: "log₁₀(L/L☉)",
    formula: "log₁₀(L/L☉) ≈ 5.5 log₁₀(T / 5800)",
    condition: "পাঠ্যবইয়ের নকশা। শুধু প্রধান ধারার একটি মসৃণ রেখা। গরম নক্ষত্র বাঁয়ে। সূর্য বিন্দুতে, প্রায় 5800 K ও L☉। দানব বা শ্বেত বামন এই রেখায় নেই।",
    explain: "বাঁয়ের গরম নক্ষত্র অনেক উজ্জ্বল, ডানের ঠান্ডা নক্ষত্র অনুজ্জ্বল। প্রধান ধারা উপরের বাঁ থেকে নিচের ডানে নামে।",
    meaning: "হার্টজস্প্রুং–রাসেল চিত্র। বেশিরভাগ নক্ষত্র এই ধারায় থাকে।",
    slope: "তাপমাত্রা বাঁ দিকে বাড়ে। আলোকদীপ্তি ওপরে বাড়ে।",
    area: noArea,
    flipX: true,
    knobs: [],
    base: {},
    steps: [
      { eq: "প্রধান ধারা T ও L জোড়ে", why: "গরম নক্ষত্র বড় ও উজ্জ্বল হয় এই ধারায়।" },
      { eq: "log L ≈ 5.5 log(T/T☉)", why: "নকশার ঢাল। মাপা তালিকা নয়।" },
      { eq: "অক্ষ উল্টো", why: "গরম বাঁয়ে, যেমন H–R চিত্রে।", tag: "ধ্রুব" },
    ],
    build() {
      const luminosity = (temperature: number) => 5.5 * Math.log10(temperature / 5800);
      return {
        curves: [
          curve("main", "প্রধান ধারা", copper, samples(3200, 25000, luminosity, 80)),
          curve("sun", "সূর্য", gold, [{ x: 5800, y: 0 }], { dots: true }),
        ],
        calc: "সূর্য প্রায় 5800 K, log L = 0। 20000 K-এ নকশার log L ≈ 2.9, মানে কয়েক শত সূর্য।",
      };
    },
  },
  {
    id: "as-spectral",
    chapter: "astro",
    title: "বর্ণালী শ্রেণি ও পৃষ্ঠের তাপমাত্রা",
    source: "schematic",
    xName: "বর্ণালী শ্রেণি",
    yName: "প্রতিনিধি তাপমাত্রা",
    xSymbol: "O B A F G K M",
    ySymbol: "T (K)",
    formula: "O গরম, M ঠান্ডা",
    condition: "পাঠ্যবইয়ের নকশা। শ্রেণির সীমানা ধারালো নয়। বিন্দুগুলো প্রতিনিধি তাপমাত্রা: O 40000, B 20000, A 10000, F 7500, G 5800, K 4000, M 3000 কেলভিন।",
    explain: "O থেকে M-এ তাপমাত্রা কমে। সূর্য G। রং নীলচে থেকে লালের দিকে যায়।",
    meaning: "শ্রেণি মূলত পৃষ্ঠের তাপমাত্রার ক্রম। উজ্জ্বলতা আলাদা অক্ষ।",
    slope: "ক্রমে তাপমাত্রা কমে। সমান ধাপ নয়।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "O B A F G K M", why: "তাপমাত্রার কমতির ক্রম।" },
      { eq: "প্রতি শ্রেণির একটি প্রতিনিধি T", why: "সীমানা আসলে ঝাপসা।" },
      { eq: "G ≈ 5800 K", why: "সূর্য এই শ্রেণির কাছে।", tag: "ধ্রুব" },
    ],
    build() {
      const points = classes.map((item, index) => ({ x: index, y: item.temperature }));
      return {
        curves: [
          curve("line", "ক্রম", blue, points, { dashed: true }),
          curve("main", "শ্রেণি", copper, points, { dots: true }),
        ],
        calc: classes.map((item) => `${item.name} ${bnNum(item.temperature, 0)}`).join(", ") + " K।",
      };
    },
  },
  {
    id: "as-mass",
    chapter: "astro",
    title: "ভর–আলোকদীপ্তি",
    source: "extra",
    xName: "ভর",
    yName: "আলোকদীপ্তি",
    xSymbol: "log₁₀(M/M☉)",
    ySymbol: "log₁₀(L/L☉)",
    formula: "L ∝ M^3.5",
    condition: "সূত্রভিত্তিক অতিরিক্ত গ্রাফ। শুধু প্রধান ধারা। সূচক মোটামুটি 3 থেকে 4; এখানে 3.5। দানব বা শ্বেত বামনে এই ঢাল খাটে না।",
    explain: "লগ–লগ লেখে সরলরেখা, ঢাল 3.5। ভর দ্বিগুণ হলে আলোকদীপ্তি প্রায় 11 গুণ।",
    meaning: "ভারী প্রধান ধারার নক্ষত্র অনেক বেশি জ্বলে এবং কম বাঁচে।",
    slope: "ঢাল = 3.5।",
    area: noArea,
    origin: "both",
    knobs: [knob("index", "সূচক", 3, 4, 0.1, "")],
    base: { index: 3.5 },
    steps: [
      { eq: "L / L☉ = (M / M☉)^n", why: "প্রধান ধারার আনুমানিক সূত্র। n ≈ 3.5।" },
      { eq: "log L = n log M", why: "দুদিকে লগ নিলে সরলরেখা।" },
      { eq: "ঢাল = n", why: "মূলবিন্দুগামী। সূর্যে দুই লগই শূন্য।", tag: "সমানুপাত" },
    ],
    build(p) {
      return {
        curves: [curve("main", "প্রধান ধারা", copper, samples(-0.6, 1.2, (mass) => p.index * mass, 20))],
        calc: `ভর দ্বিগুণ, log M = 0.30। log L = ${bnNum(p.index * Math.log10(2), 2)}, তাই L প্রায় ${bnNum(2 ** p.index, 1)} গুণ।`,
      };
    },
  },
  {
    id: "as-distance",
    chapter: "astro",
    title: "দূরত্ব–উজ্জ্বলতা",
    source: "book",
    xName: "দূরত্ব",
    yName: "আপেক্ষিক উজ্জ্বলতা",
    xSymbol: "d (pc)",
    ySymbol: "b / b₁₀",
    formula: "b = L / (4π d²)",
    condition: "একই নক্ষত্র, L স্থির। 10 পারসেকে উজ্জ্বলতাকে 1 ধরা। মাধ্যমে শোষণ নেই।",
    explain: "উজ্জ্বলতা দূরত্বের বর্গের ব্যাস্তানুপাতিক। দূরত্ব দ্বিগুণ হলে উজ্জ্বলতা এক-চতুর্থাংশ।",
    meaning: "দূরের নক্ষত্র অনুজ্জ্বল দেখায়, সে নিজে কম জ্বলছে বলে নয়।",
    slope: "ঢাল = −2 L/(4π d³)। ঋণাত্মক ও বদলায়।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "b = L / (4π d²)", why: "গোলকীয় তরঙ্গমুখে শক্তি ছড়ায়।" },
      { eq: "L স্থির  →  b ∝ 1/d²", why: "বর্গের ব্যাস্তানুপাত।", tag: "ব্যাস্তানুপাত" },
      { eq: "10 pc-এ b/b₁₀ = 1", why: "তুলনার দূরত্ব।" },
    ],
    build() {
      const brightness = (distance: number) => (10 / distance) ** 2;
      return {
        curves: [curve("main", "b–d", copper, samples(2, 40, brightness, 80))],
        guides: [{ x: 10, label: "10 pc" }],
        calc: `20 pc-এ উজ্জ্বলতা ${bnNum(brightness(20), 2)} গুণ। 5 pc-এ ${bnNum(brightness(5), 2)} গুণ।`,
      };
    },
  },
  {
    id: "as-hubble",
    chapter: "astro",
    title: "দূরত্ব–অপসারণ বেগ",
    source: "book",
    xName: "দূরত্ব",
    yName: "অপসারণ বেগ",
    xSymbol: "d (Mpc)",
    ySymbol: "v (km/s)",
    formula: "v = H₀ d",
    condition: "H₀ আনুমানিক মাপা মান, প্রায় 70 km/s/Mpc। নব দিয়ে বদলানো যায়। স্থানীয় গতি এই সরলরেখায় নেই।",
    explain: "দূরের গ্যালাক্সি দ্রুত সরে যায়। রেখা মূলবিন্দুগামী, ঢাল হাবল ধ্রুবক।",
    meaning: "মহাবিশ্ব প্রসারিত হচ্ছে। বেগ দূরত্বের সমানুপাতিক।",
    slope: "ঢাল = H₀, একক km/s প্রতি Mpc।",
    area: noArea,
    origin: "both",
    knobs: [knob("hubble", "H₀", 60, 80, 1, "km/s/Mpc")],
    base: { hubble: 70 },
    steps: [
      { eq: "v = H₀ d", why: "হাবল–লেমেত্রর সম্পর্ক।" },
      { eq: "v ∝ d", why: "H₀ এই লেখে ধ্রুব। সমানুপাত।", tag: "সমানুপাত" },
      { eq: "ঢাল = H₀", why: "প্রায় 70 km/s/Mpc। ঠিক একটি পূর্ণসংখ্যা নয়।" },
    ],
    build(p) {
      return {
        curves: [curve("main", "v–d", copper, samples(0, 100, (distance) => p.hubble * distance, 16))],
        calc: `100 Mpc-এ v ≈ ${bnNum(p.hubble * 100, 0)} km/s। H₀ = ${bnNum(p.hubble, 0)}।`,
      };
    },
  },
  {
    id: "as-life",
    chapter: "astro",
    title: "নক্ষত্রের বিবর্তনের ধাপ",
    source: "schematic",
    xName: "পৃষ্ঠের তাপমাত্রা",
    yName: "আলোকদীপ্তি",
    xSymbol: "T (K)",
    ySymbol: "log₁₀(L/L☉)",
    formula: "প্রোটোস্টার → প্রধান ধারা → দানব → শ্বেত বামন",
    condition: "পাঠ্যবইয়ের নকশা, সূর্যের ভরের কাছাকাছি একটি পথ। বিন্দুর স্থান আনুমানিক। গরম বাঁয়ে। ভারী নক্ষত্রের পথ আলাদা, সুপারনোভা এই লেখে নেই।",
    explain: "মেঘ থেকে প্রোটোস্টার প্রধান ধারায় বসে। জ্বালানি ফুরিয়ে দানব হয়, তারপর কেন্দ্র শ্বেত বামন হিসেবে থাকে — গরম কিন্তু অনুজ্জ্বল।",
    meaning: "H–R চিত্রে জীবনপথ। সূর্য এখন প্রধান ধারায়।",
    slope: "পথের প্রতিটি বাঁক আলাদা দশা। একটি সরল ঢাল নয়।",
    area: noArea,
    flipX: true,
    knobs: [],
    base: {},
    steps: [
      { eq: "প্রোটোস্টার সংকুচিত হয়", why: "তাপমাত্রা বাড়ে, প্রধান ধারায় পৌঁছায়।" },
      { eq: "প্রধান ধারায় H → He", why: "দীর্ঘ স্থির দশা। সূর্য এখানে।" },
      { eq: "দানব, তারপর শ্বেত বামন", why: "খোলস উজ্জ্বল ও ঠান্ডা, কেন্দ্র গরম ও অনুজ্জ্বল।", tag: "ধ্রুব" },
    ],
    build() {
      const track: Point[] = [
        { x: 3800, y: 1.3 },
        { x: 5800, y: 0 },
        { x: 3600, y: 2.6 },
        { x: 14000, y: -2 },
      ];
      const names = ["প্রোটোস্টার", "প্রধান ধারা", "দানব", "শ্বেত বামন"];
      const colors = [blue, copper, gold, green];
      return {
        curves: [
          curve("path", "পথ", blue, track, { dashed: true }),
          ...track.map((point, index) => curve(["a", "main", "c", "d"][index], names[index], colors[index], [point], { dots: true })),
        ],
        calc: "ক্রম: প্রোটোস্টার, প্রধান ধারা (সূর্য), লোহিত দানব, শ্বেত বামন। স্থান নকশা।",
      };
    },
  },
  {
    id: "as-scale",
    chapter: "astro",
    title: "মহাজাগতিক দূরত্বের তুলনা",
    source: "book",
    xName: "একক",
    yName: "দূরত্বের লগ",
    xSymbol: "AU, ly, pc, kpc, Mpc",
    ySymbol: "log₁₀(কিলোমিটার)",
    formula: "1 ly = 9.46×10¹² km,   1 pc = 3.26 ly",
    condition: "পাঁচটি দূরত্ব এককের কিলোমিটার মানের লগ। রৈখিক অক্ষে এরা এক লেখে ধরে না, তাই লগ।",
    explain: "জ্যোতির্বিদ্যা একক থেকে মেগাপারসেক পর্যন্ত প্রতি ধাপে দূরত্ব বহুগুণ। লগ সমান ফাঁকে মানে গুণিতক সমান।",
    meaning: "1 pc ≈ 3.26 আলোকবর্ষ ≈ 2.06×10⁵ AU। 1 Mpc = 10⁶ pc।",
    slope: "pc থেকে kpc ও kpc থেকে Mpc প্রতি ধাপে লগ 3 বাড়ে, মানে 1000 গুণ।",
    area: noArea,
    knobs: [],
    base: {},
    steps: [
      { eq: "1 AU ≈ 1.50×10⁸ km", why: "পৃথিবী–সূর্য।" },
      { eq: "1 ly ≈ 9.46×10¹² km", why: "আলো এক বছরে যতদূর যায়।" },
      { eq: "1 pc ≈ 3.09×10¹³ km", why: "প্রায় 3.26 আলোকবর্ষ। kpc ও Mpc তার হাজার ও দশ লাখ গুণ।", tag: "ধ্রুব" },
    ],
    build() {
      const marks = [
        { name: "AU", y: Math.log10(1.495978707e8) },
        { name: "ly", y: Math.log10(9.46073e12) },
        { name: "pc", y: Math.log10(3.085677581e13) },
        { name: "kpc", y: Math.log10(3.085677581e16) },
        { name: "Mpc", y: Math.log10(3.085677581e19) },
      ];
      return {
        curves: [
          curve("line", "ক্রম", blue, marks.map((item, index) => ({ x: index, y: item.y })), { dashed: true }),
          curve("main", "একক", copper, marks.map((item, index) => ({ x: index, y: item.y })), { dots: true }),
        ],
        calc: marks.map((item) => `${item.name} ${bnNum(item.y, 2)}`).join(" · "),
      };
    },
  },
];

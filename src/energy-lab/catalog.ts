import { baseParams, type Params } from "./physics";

export type Section = "work" | "energy" | "power";
export type Family = "slide" | "signs" | "lift" | "race" | "spring" | "trade" | "swing" | "track" | "bars" | "graph" | "power" | "machine" | "crash" | "orbit";
export type Knob = "force" | "mass" | "angle" | "height" | "speed" | "span" | "spring" | "time" | "friction";

export type EnergyModel = {
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
  work: ["কাজ", "Work"],
  energy: ["শক্তি", "Energy"],
  power: ["ক্ষমতা", "Power"],
} as const;

export function energySection(section: Section, lang: "bn" | "en") {
  const pair = sections[section];
  return lang === "en" ? pair[1] : pair[0];
}

const S = "F বল, s সরণ, θ বল ও সরণের কোণ, m ভর, v বেগ, h উচ্চতা, g = 9.8 m/s²";
const PENDULUM = "1.2";
const TRACK = "1.5";

const rows: Omit<EnergyModel, "no">[] = [
  {
    slug: "work-push",
    family: "slide",
    section: "work",
    focus: "push",
    title: "বল প্রয়োগে বস্তুর সরণ ও কাজ",
    titleEn: "Work done by a force",
    blurb: "বল সরণের দিকে থাকলে বস্তু এগোয় এবং কাজ হয়।",
    blurbEn: "A force along the displacement moves the body and does work.",
    formula: "W = Fs cosθ",
    symbols: S,
    explain:
      "কাজ বল ও সরণের স্কেলার গুণন। বল সরণের দিকে থাকলে θ = ০°, cosθ = ১, তাই W = Fs। বাক্স যতদূর এগোয়, কৃতকাজ তত বাড়ে। স্লাইডারের F ও s পুরো পথের কাজ দেয়, দৃশ্যে কাজ পথের সাথে বাড়ে।",
    explainEn:
      "Work is the scalar product of force and displacement. Along the same line θ = 0°, so W = Fs. The sliders give the work for the whole push. The scene adds the work as the box moves.",
    knobs: ["force", "span"],
    preset: { angle: 0 },
  },
  {
    slug: "work-angle",
    family: "slide",
    section: "work",
    focus: "angle",
    title: "বল ও সরণের মধ্যবর্তী কোণ এবং কৃতকাজ",
    titleEn: "Work and the angle between force and displacement",
    blurb: "শুধু সরণের দিকের উপাংশই কাজ করে।",
    blurbEn: "Only the component along the displacement does work.",
    formula: "W = Fs cosθ",
    symbols: "θ = ০° হলে সর্বোচ্চ, ৯০° হলে শূন্য, ১৮০° হলে ঋণাত্মক",
    explain:
      "বলকে সরণের দিকে ভাঙলে উপাংশ F cosθ। কোণ বাড়লে এই উপাংশ কমে, কাজ কমে। ৯০°-এ বল সরণের ওপর লম্ব, কাজ শূন্য। ৯০°-এর বেশি হলে বল সরণের উল্টো দিকে টানে, কাজ ঋণাত্মক।",
    explainEn:
      "The component along the displacement is F cosθ. A wider angle does less work. At 90° the force is perpendicular and the work is zero. Past 90° the force opposes the motion and the work is negative.",
    knobs: ["force", "span", "angle"],
    preset: { angle: 60 },
  },
  {
    slug: "work-sign",
    family: "signs",
    section: "work",
    focus: "sign",
    title: "ধনাত্মক, ঋণাত্মক ও শূন্য কাজ",
    titleEn: "Positive, negative and zero work",
    blurb: "একই F ও s, তিন রকম কোণ, তিন রকম কাজ।",
    blurbEn: "The same F and s, three angles, three kinds of work.",
    formula: "W > 0 , W = 0 , W < 0",
    symbols: "θ = ০° ধনাত্মক, θ = ৯০° শূন্য, θ = ১৮০° ঋণাত্মক",
    explain:
      "বল সরণের দিকে সাহায্য করলে কাজ ধনাত্মক, বস্তুর শক্তি বাড়ে। বল সরণের উল্টো দিকে বাধা দিলে কাজ ঋণাত্মক, শক্তি কমে। বল সরণের সাথে লম্ব হলে বস্তুকে সরিয়েও সেই বল কাজ করে না।",
    explainEn:
      "A force that helps the displacement does positive work and adds energy. A force that opposes the displacement does negative work and removes energy. A perpendicular force moves with the body and still does no work.",
    knobs: ["force", "span"],
    preset: {},
  },
  {
    slug: "gravity-lift",
    family: "lift",
    section: "work",
    focus: "gravity",
    title: "মহাকর্ষ বলের বিরুদ্ধে ভার তোলা",
    titleEn: "Lifting a body against gravity",
    blurb: "ধীরে তুললে প্রয়োগকৃত বল ওজনের সমান।",
    blurbEn: "A slow lift needs a force equal to the weight.",
    formula: "W = mgh",
    symbols: "মহাকর্ষের কাজ = −mgh, প্রয়োগকৃত বলের কাজ = +mgh",
    explain:
      "সমবেগে উপরে তুলতে হলে উপরের দিকে বল mg। সরণ h উপরে, তাই করা কাজ mgh। মহাকর্ষ নিচের দিকে, সরণের উল্টো, তাই মহাকর্ষের কাজ −mgh। দুই কাজ মিললে বিভবশক্তি বাড়ে mgh।",
    explainEn:
      "A steady lift needs an upward force mg. Over a height h the applied work is mgh. Gravity points opposite the displacement, so its work is −mgh. The pair raises the potential energy by mgh.",
    knobs: ["mass", "height"],
    preset: {},
  },
  {
    slug: "kinetic",
    family: "race",
    section: "energy",
    focus: "kinetic",
    title: "গতিশক্তি ও বস্তুর গতির পরিবর্তন",
    titleEn: "Kinetic energy and a change of motion",
    blurb: "বেগ বাড়লে গতিশক্তি বেগের বর্গে বাড়ে।",
    blurbEn: "Kinetic energy grows with the square of the speed.",
    formula: "K = ½ mv²",
    symbols: "m কিলোগ্রাম, v মিটার/সেকেন্ড, K জুল",
    explain:
      "গতিশক্তি বস্তুর গতির জন্য। বেগ দ্বিগুণ হলে গতিশক্তি চার গুণ, কারণ v²। ভর বাড়লেও গতিশক্তি বাড়ে, কিন্তু বেগের মতো বর্গে নয়। দৃশ্যে বল বস্তুকে থেমে থেকে বেগে আনে, গতিশক্তি সাথে সাথে বাড়ে।",
    explainEn:
      "Kinetic energy belongs to the motion. Doubling the speed multiplies the energy by four, because of v². Mass raises it only in proportion. The scene speeds the body up from rest and the energy rises with it.",
    knobs: ["mass", "speed"],
    preset: {},
  },
  {
    slug: "speed-compare",
    family: "race",
    section: "energy",
    focus: "speeds",
    title: "বিভিন্ন বেগে চলমান বস্তুর গতিশক্তির তুলনা",
    titleEn: "Kinetic energy at different speeds",
    blurb: "একই ভর, বেগের অনুপাত ১ : ২ : ৩।",
    blurbEn: "Same mass. Speeds in the ratio 1 : 2 : 3.",
    formula: "K ∝ v²",
    symbols: "তিন বেগ v, ২v ও ৩v। গতিশক্তির অনুপাত ১ : ৪ : ৯।",
    explain:
      "তিন বস্তুর ভর সমান। বেগ v, ২v ও ৩v হলে গতিশক্তির অনুপাত ১ : ৪ : ৯। দৃশ্যে স্লাইডারের বেগকে v ধরে তিনটি বস্তু v, ২v ও ৩v-এ চলে। স্তম্ভগুলো সেই বর্গের অনুপাত দেখায়।",
    explainEn:
      "The three bodies have the same mass. Speeds v, 2v and 3v give kinetic energies in the ratio 1 : 4 : 9. The slider speed is v. The bars keep that square ratio.",
    knobs: ["mass", "speed"],
    preset: { speed: 3 },
  },
  {
    slug: "potential",
    family: "lift",
    section: "energy",
    focus: "potential",
    title: "বিভবশক্তি ও উচ্চতার পরিবর্তন",
    titleEn: "Potential energy and a change of height",
    blurb: "উঁচুতে তুললে বিভব বাড়ে, ভর ও g স্থির।",
    blurbEn: "A greater height stores more potential energy.",
    formula: "U = mgh",
    symbols: "h ভূমি থেকে উচ্চতা। ভূমিতে U = ০ ধরা।",
    explain:
      "মহাকর্ষীয় বিভবশক্তি উচ্চতার সমানুপাতী। একই ভর দ্বিগুণ উচ্চতায় তুললে বিভব দ্বিগুণ। ভূমিকে শূন্য ধরা হয়েছে, তাই h বাড়লেই U বাড়ে। দৃশ্যের উচ্চতা স্লাইডারের মিটার।",
    explainEn:
      "Gravitational potential energy is proportional to height. Twice the height stores twice the energy for the same mass. The ground is the zero, so raising h raises U. The picture uses the slider’s metres.",
    knobs: ["mass", "height"],
    preset: {},
  },
  {
    slug: "elastic",
    family: "spring",
    section: "energy",
    focus: "elastic",
    title: "স্থিতিস্থাপক বিভবশক্তি",
    titleEn: "Elastic potential energy",
    blurb: "স্প্রিং টানলে বা সংকুচিত হলে শক্তি জমা হয়।",
    blurbEn: "A stretched or compressed spring stores energy.",
    formula: "U = ½ kx²",
    symbols: "k নিউটন/মিটার, x সাম্যাবস্থা থেকে সরণ",
    explain:
      "হুকের সীমার মধ্যে প্রত্যয়নী বল F = −kx। জমা শক্তি ½kx², তাই সরণ দ্বিগুণ হলে শক্তি চার গুণ। টানা ও সংকোচন দুদিকেই x² একই, শক্তি ধনাত্মক। দোলনের মাঝে এই শক্তি গতিশক্তিতে যায়, প্রান্তে আবার স্প্রিংয়ে ফেরে।",
    explainEn:
      "Inside Hooke’s law the restoring force is F = −kx and the stored energy is ½kx². Doubling the displacement quadruples the energy. Stretch and compression store the same amount. At the centre that energy is kinetic. At the ends it is back in the spring.",
    knobs: ["spring", "span"],
    preset: { span: 0.25, mass: 1 },
  },
  {
    slug: "exchange",
    family: "trade",
    section: "energy",
    focus: "exchange",
    title: "গতিশক্তি ও বিভবশক্তির পারস্পরিক রূপান্তর",
    titleEn: "Kinetic and potential energy exchange",
    blurb: "একটি কমে, অন্যটি বাড়ে। যোগফল থাকে।",
    blurbEn: "One falls while the other rises. The sum stays.",
    formula: "K + U = ধ্রুবক",
    symbols: "ঘর্ষণহীন ঢাল। U = mgh, K = ½mv²",
    explain:
      "ঢালের ওপরে বেগ কম, বিভব বেশি। নামতে নামতে বিভব গতিশক্তিতে যায়। নিচে বিভব শূন্য, গতিশক্তি সর্বোচ্চ। ঘর্ষণ না থাকলে যোগফল শুরুর শক্তির সমান থাকে। আবার উঠলে উল্টো রূপান্তর হয়।",
    explainEn:
      "At the top the speed is low and the potential energy is high. On the way down potential energy becomes kinetic. At the bottom the potential energy is zero and the kinetic energy is greatest. Without friction the sum stays equal to the energy at the start.",
    knobs: ["mass", "height"],
    preset: { height: 3 },
  },
  {
    slug: "freefall",
    family: "trade",
    section: "energy",
    focus: "fall",
    title: "মুক্তভাবে পতনশীল বস্তুর শক্তির পরিবর্তন",
    titleEn: "Energy of a freely falling body",
    blurb: "পড়তে পড়তে বিভব কমে, বেগ বাড়ে।",
    blurbEn: "As it falls, potential energy drops and the speed rises.",
    formula: "v = √(2gh) , ½mv² = mgh",
    symbols: "বায়ুর বাধা ধরা হয়নি। শুরুতে বেগ শূন্য।",
    explain:
      "হাত থেকে ছাড়লে শুরুতে শুধু বিভবশক্তি mgh। h মিটার পড়লে হারানো বিভব ½mv² হয়, তাই v = √(2gh)। মাটিতে বিভব শূন্য, গতিশক্তি পুরো mgh। পথে যেকোনো উচ্চতায় দুইয়ের যোগফল একই।",
    explainEn:
      "A body released from rest has only potential energy mgh. After falling through h the lost potential energy is ½mv², so v = √(2gh). At the ground the potential energy is zero and the kinetic energy is the whole mgh.",
    knobs: ["mass", "height"],
    preset: { height: 4 },
  },
  {
    slug: "throw-up",
    family: "trade",
    section: "energy",
    focus: "throw",
    title: "উর্ধ্বে নিক্ষিপ্ত বস্তুর গতিশক্তি ও বিভবশক্তি",
    titleEn: "A body thrown straight up",
    blurb: "ওপরে গতি কমে, বিভব বাড়ে। চূড়ায় বেগ শূন্য।",
    blurbEn: "On the way up the speed falls and the potential energy rises.",
    formula: "h = v²/(2g)",
    symbols: "উপরের দিকে নিক্ষেপ। চূড়ায় K = ০, U = ½mv²",
    explain:
      "উপরে ছুড়লে শুরুতে শুধু গতিশক্তি। উঠতে উঠতে গতিশক্তি বিভবে যায়। চূড়ায় বেগ শূন্য, উচ্চতা v²/(2g), বিভব শুরুর গতিশক্তির সমান। নামতে নামতে বিভব আবার গতিশক্তি হয়।",
    explainEn:
      "A body thrown upward starts with only kinetic energy. On the way up that energy becomes potential. At the top the speed is zero, the height is v²/(2g) and the potential energy equals the kinetic energy at the throw. Coming down reverses the exchange.",
    knobs: ["mass", "speed"],
    preset: { speed: 8 },
  },
  {
    slug: "pendulum",
    family: "swing",
    section: "energy",
    focus: "pendulum",
    title: "দোলকের গতিশক্তি ও বিভবশক্তির রূপান্তর",
    titleEn: "Energy of a pendulum",
    blurb: "প্রান্তে বিভব, মাঝখানে গতিশক্তি।",
    blurbEn: "Potential energy at the ends, kinetic energy at the bottom.",
    formula: "U = mgL(1 − cosθ)",
    symbols: `L = ${PENDULUM} m। টান সরণের লম্ব, তাই টানের কাজ শূন্য।`,
    explain:
      "দড়ির টান সব সময় বৃত্তের লম্ব বরাবর, সরণ স্পর্শক বরাবর, তাই টান কাজ করে না। শুধু মহাকর্ষ শক্তি বদলায়। প্রান্তে বেগ শূন্য, উচ্চতা L(1−cosθ)। নিচের বিন্দুতে বিভব শূন্য, সেই শক্তি পুরো গতিশক্তি।",
    explainEn:
      "The string’s tension is perpendicular to the path, so it does no work. Only gravity changes the energy. At an end the speed is zero and the height is L(1−cosθ). At the bottom that energy is entirely kinetic.",
    knobs: ["mass", "angle"],
    preset: { angle: 40 },
  },
  {
    slug: "coaster",
    family: "track",
    section: "energy",
    focus: "coaster",
    title: "রোলার কোস্টারে শক্তির রূপান্তর",
    titleEn: "Energy on a roller coaster",
    blurb: "উঁচুতে ধীর, নিচে দ্রুত। মোট যান্ত্রিক শক্তি এক।",
    blurbEn: "Slow on the hill, fast in the dip. Mechanical energy stays one sum.",
    formula: "½mv² + mgh = ধ্রুবক",
    symbols: "ঘর্ষণহীন ট্র্যাক। স্লাইডারের বেগ চূড়ায় অতিরিক্ত বেগ।",
    explain:
      "গাড়ি চূড়ায় উচ্চতা h ও বেগ v নিয়ে নামে। নিচে নামলে হারানো বিভব গতিশক্তি বাড়ায়। পরের টিলা আগের চেয়ে নিচু, তাই চূড়ার শক্তি দিয়েই পার হয়। ঘর্ষণ না থাকলে যেকোনো জায়গায় ½mv² + mgh একই থাকে।",
    explainEn:
      "The car leaves the top with height h and speed v. Lost potential energy becomes kinetic energy in the dip. The next hill is lower, so the energy at the first top is enough to cross it. Without friction ½mv² + mgh is the same everywhere.",
    knobs: ["mass", "height", "speed"],
    preset: { height: 5, speed: 2 },
  },
  {
    slug: "spring-block",
    family: "spring",
    section: "energy",
    focus: "hit",
    title: "স্প্রিং ও ব্লকের সংঘর্ষ এবং শক্তির রূপান্তর",
    titleEn: "A block hits a spring",
    blurb: "ধাক্কায় গতিশক্তি স্প্রিংয়ে জমা হয়, তারপর ফেরে।",
    blurbEn: "The collision stores the kinetic energy in the spring, then gives it back.",
    formula: "½ mv² = ½ kA²",
    symbols: "প্রাচীর স্থির। ঘর্ষণ নেই। A সর্বোচ্চ সংকোচন।",
    explain:
      "ব্লক স্প্রিংয়ে লাগার আগে শুধু গতিশক্তি। সংকুচিত হতে হতে গতিশক্তি স্থিতিস্থাপক শক্তিতে যায়। থেমে যাওয়ার মুহূর্তে সংকোচন A = v√(m/k), গতিশক্তি শূন্য। স্প্রিং ফেরত দিলে ব্লক উল্টো দিকে একই দ্রুতিতে বের হয়।",
    explainEn:
      "Before contact the block has only kinetic energy. As the spring compresses, that energy moves into the spring. At the stop the compression is A = v√(m/k) and the kinetic energy is zero. The spring then sends the block back at the same speed.",
    knobs: ["mass", "speed", "spring"],
    preset: { speed: 3, spring: 40, mass: 2 },
  },
  {
    slug: "conserve",
    family: "bars",
    section: "energy",
    focus: "conserve",
    title: "যান্ত্রিক শক্তির সংরক্ষণ সূত্র",
    titleEn: "Conservation of mechanical energy",
    blurb: "অসংরক্ষণশীল বল কাজ না করলে যোগফল স্থির।",
    blurbEn: "If no non-conservative force does work, the sum stays fixed.",
    formula: "K₁ + U₁ = K₂ + U₂",
    symbols: "মহাকর্ষ ও স্প্রিং সংরক্ষণশীল। ঘর্ষণ নয়।",
    explain:
      "সংরক্ষণশীল বলের কাজ পথের ওপর নয়, শুরু ও শেষের ওপর। তাই গতিশক্তি ও বিভবশক্তির যোগফল দুই বিন্দুতে সমান। দৃশ্যে বস্তু ওঠানামা করে, সবুজ ও নীল স্তম্ভ বদলায়, সোনালি মোট স্তম্ভ স্থির থাকে।",
    explainEn:
      "The work of a conservative force depends only on the ends of the path. Kinetic plus potential energy is therefore the same at two points. The body rises and falls, the green and blue bars trade, and the gold total stays put.",
    knobs: ["mass", "height"],
    preset: { height: 3 },
  },
  {
    slug: "friction",
    family: "slide",
    section: "energy",
    focus: "friction",
    title: "ঘর্ষণে যান্ত্রিক শক্তি তাপশক্তিতে রূপান্তর",
    titleEn: "Friction turns mechanical energy into heat",
    blurb: "ঘর্ষণ ঋণাত্মক কাজ করে। হারানো শক্তি তাপ হয়।",
    blurbEn: "Friction does negative work. The lost energy leaves as heat.",
    formula: "W_f = −μmg s",
    symbols: "তাপ = μmg s। যান্ত্রিক শক্তি কমে।",
    explain:
      "ঘর্ষণ সরণের উল্টো দিকে, তাই কাজ ঋণাত্মক। বস্তু থামতে থামতে গতিশক্তি কমে। এই হারানো শক্তি পথ ও বস্তুকে গরম করে, আর যান্ত্রিক শক্তি হিসেবে ফেরে না। থামার দূরত্ব v²/(2μg)। μ শূন্য হলে বস্তু থামে না।",
    explainEn:
      "Friction opposes the displacement, so its work is negative. The kinetic energy falls as the body slows. That lost energy warms the path and the body and does not return as mechanical energy. The stopping distance is v²/(2μg). At μ = 0 the body does not stop.",
    knobs: ["mass", "speed", "friction"],
    preset: { speed: 6, friction: 0.25 },
  },
  {
    slug: "variable",
    family: "spring",
    section: "work",
    focus: "variable",
    title: "পরিবর্তনশীল বলের দ্বারা সম্পাদিত কাজ",
    titleEn: "Work done by a variable force",
    blurb: "স্প্রিংয়ে বল সরণের সাথে বাড়ে। কাজ লেখের ক্ষেত্রফল।",
    blurbEn: "On a spring the force grows with the stretch. Work is the area.",
    formula: "W = ∫ F dx = ½ kx²",
    symbols: "F = kx। শূন্য থেকে x পর্যন্ত লেখ একটি ত্রিভুজ।",
    explain:
      "স্থির বলে W = Fs। বল বদলালে ছোট ছোট অংশের Fs যোগ করতে হয়, সেটাই সমাকলন। স্প্রিংয়ে F শূন্য থেকে kx পর্যন্ত বাড়ে। বল–সরণ লেখের নিচের ত্রিভুজের ক্ষেত্রফল ½kx²। এই কাজই স্প্রিংয়ে জমা শক্তি।",
    explainEn:
      "For a constant force W = Fs. When the force changes, the small pieces add up as an integral. On a spring F grows from zero to kx. The triangle under the force–displacement graph has area ½kx², and that work is the energy stored in the spring.",
    knobs: ["spring", "span"],
    preset: { span: 0.3, spring: 60 },
  },
  {
    slug: "force-graph",
    family: "graph",
    section: "work",
    focus: "area",
    title: "বল–সরণ লেখের ক্ষেত্রফল থেকে কাজ",
    titleEn: "Work from the area of a force–displacement graph",
    blurb: "স্থির বলের লেখ আয়তক্ষেত্র। ক্ষেত্রফলই কাজ।",
    blurbEn: "A constant force draws a rectangle. Its area is the work.",
    formula: "W = ক্ষেত্রফল = Fs cosθ",
    symbols: "খাড়া অক্ষ F cosθ, আড়াআড়ি অক্ষ s",
    explain:
      "লেখের নিচের ক্ষেত্রফল কাজের সমান, বল স্থির হোক বা না হোক। স্থির উপাংশে লেখ আয়তক্ষেত্র, উচ্চতা F cosθ, প্রস্থ s, ক্ষেত্রফল Fs cosθ। কোণ ৯০° হলে উচ্চতা শূন্য, ক্ষেত্রফল শূন্য। কোণ স্থূল হলে উপাংশ ঋণাত্মক, কাজ ঋণাত্মক।",
    explainEn:
      "The area under the graph is the work, whether or not the force is constant. A constant component draws a rectangle of height F cosθ and width s, so the area is Fs cosθ. At 90° the height is zero. Past 90° the component is negative and so is the work.",
    knobs: ["force", "span", "angle"],
    preset: { force: 10, span: 4, angle: 0 },
  },
  {
    slug: "power",
    family: "power",
    section: "power",
    focus: "rate",
    title: "ক্ষমতা — কাজ করার হার",
    titleEn: "Power, the rate of doing work",
    blurb: "একই কাজ কম সময়ে করলে ক্ষমতা বেশি।",
    blurbEn: "The same work in less time means more power.",
    formula: "P = W/t = Fv",
    symbols: "P ওয়াট। ১ W = ১ J/s",
    explain:
      "ক্ষমতা প্রতি সেকেন্ডে কত কাজ হয়। W জুল কাজ t সেকেন্ডে হলে গড় ক্ষমতা W/t। সমবেগে চললে তাৎক্ষণিক ক্ষমতা Fv। সমবেগে F ও v স্থির থাকলে দুই রূপ মিলে যায়, কারণ s = vt হলে W/t = Fs/t = Fv।",
    explainEn:
      "Power is the work done each second. W joules in t seconds is an average power W/t. At steady speed the instantaneous power is Fv. They agree when the speed is steady, because s = vt turns W/t into Fv.",
    knobs: ["force", "span", "time"],
    preset: { angle: 0 },
  },
  {
    slug: "power-compare",
    family: "power",
    section: "power",
    focus: "times",
    title: "একই কাজে বিভিন্ন সময়ে ক্ষমতার তুলনা",
    titleEn: "Same work, different times",
    blurb: "কাজ সমান। সময় দ্বিগুণ হলে ক্ষমতা অর্ধেক।",
    blurbEn: "The work is the same. Twice the time means half the power.",
    formula: "P ∝ 1/t",
    symbols: "তিন সময় t, ২t, ৩t। কাজ একটি।",
    explain:
      "তিনজন একই বাক্স একই দূরত্বে ঠেলে, তাই কাজ এক। সময় t, ২t ও ৩t। ক্ষমতার অনুপাত উল্টো: ১ : ১/২ : ১/৩। দ্রুত শেষ করা মানে বেশি ক্ষমতা, বেশি কাজ নয়।",
    explainEn:
      "Three pushes move the same box over the same distance, so the work is one value. The times are t, 2t and 3t. The powers are in the inverse ratio 1 : 1/2 : 1/3. Finishing sooner means more power, not more work.",
    knobs: ["force", "span", "time"],
    preset: { time: 3 },
  },
  {
    slug: "lifters",
    family: "machine",
    section: "power",
    focus: "lifters",
    title: "মানুষ, মোটর ও ক্রেনের ক্ষমতার তুলনা",
    titleEn: "A person, a motor and a crane",
    blurb: "একই ভার, একই উচ্চতা। সময় আলাদা, ক্ষমতা আলাদা।",
    blurbEn: "Same load, same height. Different times, different powers.",
    formula: "P = mgh / t",
    symbols: "মানুষ t, মোটর t/২, ক্রেন t/৪ সেকেন্ড নেয়।",
    explain:
      "তিনজন একই ভর একই উচ্চতায় তোলে, তাই কাজ একই mgh। মানুষ সময় নেয় t, মোটর অর্ধেক, ক্রেন চার ভাগের এক ভাগ। ক্ষমতা তাই ১ : ২ : ৪। ক্রেন বেশি শক্তিশালী নয় এই হিসাবে — সে একই কাজ দ্রুত করে।",
    explainEn:
      "All three lift the same mass through the same height, so the work is the same mgh. The person takes time t, the motor half of that, the crane a quarter. The powers are in the ratio 1 : 2 : 4. The crane does the same work sooner.",
    knobs: ["mass", "height", "time"],
    preset: { mass: 20, height: 2, time: 8 },
  },
  {
    slug: "power-instant",
    family: "power",
    section: "power",
    focus: "instant",
    title: "গড় ক্ষমতা ও তাৎক্ষণিক ক্ষমতা",
    titleEn: "Average and instantaneous power",
    blurb: "সমত্বরণে তাৎক্ষণিক ক্ষমতা গড়ের দ্বিগুণ হয়ে ওঠে।",
    blurbEn: "Under steady acceleration the instantaneous power ends at twice the average.",
    formula: "P_avg = W/t , P = Fv",
    symbols: "থেকে সমত্বরণে v বাড়ে। F স্থির।",
    explain:
      "গড় ক্ষমতা পুরো সময়ে মোট কাজ ভাগ সময়। তাৎক্ষণিক ক্ষমতা সেই মুহূর্তের Fv। স্থির বল থেমে থেকে বেগ বাড়ালে বেগ সময়ের সাথে বাড়ে, গড় বেগ শেষ বেগের অর্ধেক। তাই শেষ মুহূর্তের তাৎক্ষণিক ক্ষমতা গড় ক্ষমতার দ্বিগুণ।",
    explainEn:
      "Average power divides the whole work by the whole time. Instantaneous power is Fv at that moment. A constant force speeding the body from rest makes the average speed half the final speed, so the final instantaneous power is twice the average.",
    knobs: ["force", "speed", "time"],
    preset: { force: 8, speed: 6, time: 4 },
  },
  {
    slug: "efficiency",
    family: "machine",
    section: "power",
    focus: "efficiency",
    title: "দক্ষতা ও শক্তির অপচয়",
    titleEn: "Efficiency and wasted energy",
    blurb: "দেওয়া শক্তির একাংশই কাজে লাগে। বাকিটা তাপ।",
    blurbEn: "Only part of the input energy does useful work. The rest is heat.",
    formula: "η = W_useful / W_input",
    symbols: "অপচয়ের ভাগ স্লাইডারে। η = ১ − অপচয়।",
    explain:
      "যন্ত্রে দেওয়া পুরো শক্তি দরকারি কাজে যায় না। ঘর্ষণ ও তাপ নিয়ে নেয়। দক্ষতা দরকারি কাজ ভাগ মোট দেওয়া কাজ। দক্ষতা ১ মানে অপচয় নেই। দৃশ্যে অপচয়ের ভাগ বাড়ালে তাপের স্তম্ভ বাড়ে, দরকারি কাজ কমে।",
    explainEn:
      "A machine does not turn all of its input into useful work. Friction and heat take a share. Efficiency is useful work divided by input work. An efficiency of 1 means nothing is wasted. Raising the wasted fraction grows the heat bar and shrinks the useful work.",
    knobs: ["force", "span", "friction"],
    preset: { friction: 0.35, force: 20, span: 2 },
  },
  {
    slug: "collision",
    family: "crash",
    section: "energy",
    focus: "collision",
    title: "স্থিতিস্থাপক ও অস্থিতিস্থাপক সংঘর্ষে শক্তি",
    titleEn: "Energy in elastic and inelastic collisions",
    blurb: "ভরবেগ দুই ক্ষেত্রেই বাঁচে। গতিশক্তি শুধু স্থিতিস্থাপকে।",
    blurbEn: "Momentum is kept in both. Kinetic energy is kept only in the elastic case.",
    formula: "K' = ½ K  (অস্থিতিস্থাপক, সমান ভর)",
    symbols: "লক্ষ্য স্থির। দুই ভর সমান।",
    explain:
      "সমান ভরের স্থিতিস্থাপক ধাক্কায় বেগ বদল হয়: আসা বস্তু থামে, স্থির বস্তু সেই বেগ পায়। গতিশক্তি পুরো থাকে। অস্থিতিস্থাপকে দুজন আটকে v/২ বেগে যায়। গতিশক্তি অর্ধেক থাকে, বাকিটা তাপ ও বিকৃতিতে যায়। ভরবেগ দুই ক্ষেত্রেই mv।",
    explainEn:
      "In a head-on elastic collision of equal masses the velocities swap: the incoming body stops and the target leaves with that speed. The kinetic energy is unchanged. In a perfectly inelastic collision they stick and move at v/2. Half the kinetic energy remains. The rest becomes heat and deformation. Momentum mv is kept in both.",
    knobs: ["mass", "speed"],
    preset: { mass: 1, speed: 4 },
  },
  {
    slug: "circular",
    family: "orbit",
    section: "energy",
    focus: "circle",
    title: "বৃত্তাকার পথে গতিশক্তি ও কাজ",
    titleEn: "Kinetic energy and work on a circular path",
    blurb: "কেন্দ্রমুখী বল সরণের লম্ব। কাজ শূন্য, বেগের মান স্থির।",
    blurbEn: "The centripetal force is perpendicular to the motion. Work is zero and the speed stays constant.",
    formula: "W = 0 , K = ½ mv²",
    symbols: `বৃত্তের ব্যাসার্ধ ${TRACK} m। F = mv²/r কেন্দ্রের দিকে।`,
    explain:
      "সমবেগে বৃত্তপথে বেগের দিক বদলায়, মান বদলায় না। কেন্দ্রমুখী বল সব সময় ব্যাসার্ধ বরাবর, সরণ স্পর্শক বরাবর, মাঝের কোণ ৯০°। তাই এক পাকেও এই বলের কাজ শূন্য। গতিশক্তি ½mv² স্থির থাকে। বেগের মান বদলাতে হলে স্পর্শক বরাবর আরেকটি বল লাগে।",
    explainEn:
      "At constant speed on a circle the direction of the velocity changes and the size does not. The centripetal force stays along the radius while the displacement stays along the tangent, so the angle is 90°. The work of that force is zero even over a full turn, and the kinetic energy ½mv² stays constant. Changing the speed needs a second force along the tangent.",
    knobs: ["mass", "speed"],
    preset: { mass: 1, speed: 3 },
  },
];

export const energyModels: EnergyModel[] = rows.map((row, index) => ({ ...row, no: index + 1 }));

export function modelBySlug(slug: string) {
  return energyModels.find((model) => model.slug === slug) ?? null;
}

export function paramsOf(model: EnergyModel) {
  return { ...baseParams, ...model.preset };
}

import { baseParams, type Params } from "./physics";

export type Section = "laws" | "friction" | "crash" | "circle" | "shot" | "link";
export type Family = Section;
export type Knob =
  | "mass"
  | "mass1"
  | "mass2"
  | "force"
  | "speed"
  | "speed2"
  | "incline"
  | "shot"
  | "muS"
  | "muK"
  | "restitution"
  | "duration"
  | "radius"
  | "span"
  | "time"
  | "drag"
  | "spring"
  | "launch";

export type NewtonModel = {
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
  laws: ["গতিসূত্র", "Laws of motion"],
  friction: ["ঘর্ষণ ও মুক্তবস্তু", "Friction and the free body"],
  crash: ["ভরবেগ ও সংঘর্ষ", "Momentum and collision"],
  circle: ["বৃত্তাকার গতি", "Circular motion"],
  shot: ["প্রক্ষেপণ", "Projectile"],
  link: ["বল, কাজ ও শক্তি", "Force, work and energy"],
} as const;

export function newtonSection(section: Section, lang: "bn" | "en") {
  const pair = sections[section];
  return lang === "en" ? pair[1] : pair[0];
}

const rows: Omit<NewtonModel, "no">[] = [
  {
    slug: "laws",
    family: "laws",
    section: "laws",
    focus: "laws",
    title: "নিউটনের তিন সূত্র ও F = ma",
    titleEn: "Newton's three laws and F = ma",
    blurb: "বল শূন্য হলে বেগ থাকে। বল দিলে ত্বরণ। মাঝের ধাক্কা দুদিকে সমান।",
    blurbEn: "No force, the speed stays. A force accelerates. The push between the carts matches both ways.",
    formula: "F = (m₁+m₂)a",
    symbols: "স্পর্শ বল = m₂a। প্রথম গাড়ির নিট বল = F − স্পর্শ বল। ১ সেকেন্ড পরের বেগ = u + a।",
    explain:
      "একই দৃশ্যে তিন সূত্র। বল শূন্য আর আদি বেগ শূন্য হলে দুই গাড়ি স্থির — জড়তা। বল শূন্য কিন্তু বেগ থাকলে সমবেগে যায়, ফাঁক সমান থাকে। বল দিলে a = F/(m₁+m₂), ভর বদলালে ত্বরণ বদলায়। দুই গাড়ির মাঝের বল সমান ও উল্টো: এটাই ক্রিয়া-প্রতিক্রিয়া, দুটি আলাদা বস্তুতে।",
    explainEn:
      "One scene holds all three laws. Zero force and zero speed, the carts stay put. Zero force with some speed, they coast and the gaps stay equal. A force gives a = F/(m₁+m₂). The push between the carts is equal and opposite, on two different bodies.",
    knobs: ["mass1", "mass2", "force", "speed"],
    preset: { mass1: 2, mass2: 3, force: 10, speed: 0 },
  },
  {
    slug: "friction",
    family: "friction",
    section: "friction",
    focus: "friction",
    title: "ঘর্ষণ, অভিলম্ব বল ও আনত তল",
    titleEn: "Friction, the normal force and an incline",
    blurb: "স্থিতি ঘর্ষণ আঁটে। ছাড়ালে গতীয় ঘর্ষণ। তল কাত করলে উপাংশ ভাগে।",
    blurbEn: "Static friction matches the pull. Past the limit, kinetic friction. Tilt the plane and the weight splits.",
    formula: "fₛ ≤ μₛN , fₖ = μₖN",
    symbols: "N = mg cosθ। তল বরাবর mg sinθ। ধাক্কা তল বেয়ে উপরে। হিসাবে μₖ ≤ μₛ। ত্বরণ নিচের দিকে ধনাত্মক নয় — মান।",
    explain:
      "মুক্তবস্তুর তীর এই ব্লকেই: ওজন সোজা নিচে, অভিলম্ব তলের লম্বে, ঘর্ষণ তল বরাবর, আর প্রয়োগকৃত বল তল বেয়ে উপরে। θ = ০ হলে তল অনুভূমিক, N = mg। নিট টান μₛN-এর মধ্যে থাকলে ব্লক স্থির, ঘর্ষণ সেই টানের সমান। বেশি হলে গতীয় ঘর্ষণ μₖN, ব্লক চলে। কোণ বাড়ালে ওজনের তল-বরাবর উপাংশ বাড়ে।",
    explainEn:
      "The free-body arrows sit on this block: weight straight down, normal perpendicular to the plane, friction along the plane, and the applied force up the plane. At θ = 0 the plane is flat and N = mg. Inside μₛN the block stays and friction matches the pull. Beyond that, kinetic friction is μₖN and the block moves.",
    knobs: ["mass", "force", "incline", "muS", "muK"],
    preset: { mass: 2, force: 0, incline: 30, muS: 0.4, muK: 0.2 },
  },
  {
    slug: "collision",
    family: "crash",
    section: "crash",
    focus: "crash",
    title: "ভরবেগ, ঘাত ও সংঘর্ষ",
    titleEn: "Momentum, impulse and collision",
    blurb: "ধাক্কার আগে ও পরে ভরবেগ মিলে। e = ১ স্থিতিস্থাপক, e = ০ একসাথে আটকে।",
    blurbEn: "Momentum matches before and after. e = 1 is elastic. e = 0 sticks.",
    formula: "J = Δp = FΔt",
    symbols: "e প্রত্যাগতি সহগ। ঘাত প্রথম বস্তুর ভরবেগ বদল। গড় বল = ঘাত / স্পর্শকাল। শক্তিক্ষয় স্থিতিস্থাপক হলে শূন্য।",
    explain:
      "ভরবেগ m v। ধাক্কায় বাইরের বল না থাকলে মোট ভরবেগ আগের মতো থাকে, e যাই হোক। e = ১ হলে গতিশক্তিও থাকে, সমান ভরে বেগ বদল হয়ে যায়। e = ০ হলে দুটো এক বেগে আটকে যায়, গতিশক্তি কমে। একই ভরবেগ বদল অল্প সময়ে হলে গড় বল বড় — ঘাত সমান, বল নয়।",
    explainEn:
      "Momentum is mv. With no outside force the total stays the same for any e. At e = 1 the kinetic energy stays too, and equal masses exchange their speeds. At e = 0 they stick and move as one, and kinetic energy drops. The same change of momentum in a shorter time means a larger average force.",
    knobs: ["mass1", "mass2", "speed", "speed2", "restitution", "duration"],
    preset: { mass1: 2, mass2: 2, speed: 4, speed2: 0, restitution: 1, duration: 0.1 },
  },
  {
    slug: "whirl",
    family: "circle",
    section: "circle",
    focus: "circle",
    title: "সুতার বৃত্ত ও কেন্দ্রাভিমুখী বল",
    titleEn: "A mass on a string and the centripetal force",
    blurb: "বেগ স্পর্শক বরাবর। সুতা কেন্দ্রের দিকে টানে।",
    blurbEn: "The velocity is tangent. The string pulls toward the centre.",
    formula: "F = mv²/r = mω²r",
    symbols: "ω = v/r। আবর্তনকাল ২πr/v। বাতাস ধরা হয়নি। বৃত্ত অনুভূমিক।",
    explain:
      "বৃত্তে চলতে হলে কেন্দ্রের দিকে ত্বরণ v²/r লাগে। এখানে সেই বল সুতার টান। বেগ বাড়লে টান বেগের বর্গ অনুসারে বাড়ে। ব্যাসার্ধ বাড়লে, বেগ না বদলালে, টান কমে। কৌণিক বেগ ω = v/r, তাই একই ω-তে ব্যাসার্ধ বাড়লে টান বাড়ে — স্লাইডারে বেগ স্থির রাখলে প্রথম কথাটা দেখা যায়।",
    explainEn:
      "A circle needs an inward acceleration v²/r. Here that force is the string. A higher speed raises the pull with the square of the speed. A larger radius, at the same speed, lowers the pull. Angular speed is v/r.",
    knobs: ["mass", "speed", "radius"],
    preset: { mass: 0.5, speed: 3, radius: 1 },
  },
  {
    slug: "projectile",
    family: "shot",
    section: "shot",
    focus: "shot",
    title: "প্রক্ষেপণ: কোণ, উচ্চতা ও পাল্লা",
    titleEn: "A projectile: angle, height and range",
    blurb: "অনুভূমিক বেগ থাকে। উল্লম্ব বেগ g-তে কমে। ৪৫°-এ পাল্লা সবচেয়ে বড়।",
    blurbEn: "The horizontal speed stays. The vertical speed falls with g. The range is largest at 45°.",
    formula: "R = v² sin2θ / g",
    symbols: "H = (v sinθ)² / (2g)। উড়ানের কাল 2v sinθ / g। g = 9.8। বাতাস নেই।",
    explain:
      "নিক্ষেপের বেগ দুই উপাংশে ভাগে। vx = v cosθ পুরো পথে একই, কারণ সেদিকে বল নেই। vy = v sinθ থেকে প্রতি সেকেন্ডে ৯.৮ কমে, উপরে গিয়ে শূন্য, তারপর নিচে। সর্বোচ্চ উচ্চতা vy শূন্য হওয়া পর্যন্ত। পাল্লা মাটিতে ফেরার অনুভূমিক দূরত্ব। θ আর v বদলালে পথ, উচ্চতা ও পাল্লা সাথে সাথে বদলায়।",
    explainEn:
      "The launch speed splits in two. vx = v cosθ never changes, because no force acts that way. vy = v sinθ drops by 9.8 each second, passes through zero at the top, then points down. The range is the horizontal distance back to the ground. Change θ or v and the path, the height and the range follow.",
    knobs: ["launch", "shot"],
    preset: { launch: 20, shot: 45 },
  },
  {
    slug: "work-link",
    family: "link",
    section: "link",
    focus: "link",
    title: "বলের কাজ, শক্তি ও ক্ষমতা",
    titleEn: "Work, energy and power from a force",
    blurb: "নিট কাজ গতিশক্তি বাড়ায়। সেই শক্তি উঁচুতে বিভব হয়। স্প্রিংয়ের বল পথে বদলায়।",
    blurbEn: "Net work becomes kinetic energy. That energy becomes potential on the rise. A spring's force changes along the path.",
    formula: "W_net = ΔK , P = W/t",
    symbols: "ধ্রুব বলের কাজ Fs। ঘর্ষণ উল্টো। উচ্চতা K/mg। স্প্রিংয়ের কাজ ½ks², বল kx পথে বাড়ে। বল ঘর্ষণের চেয়ে বড় না হলে সরণ শূন্য।",
    explain:
      "কাজ-শক্তি উপপাদ্য: নিট কাজ গতিশক্তির সমান, স্থির থেকে শুরু হলে K = (F−f)s। এই K দিয়ে বস্তু h = K/mg উচ্চতায় ওঠে, গতিশক্তি বিভব শক্তিতে বদলায়। গড় ক্ষমতা কৃতকাজ ভাগ সময়। পাশের স্প্রিং একই দূরত্বে টানা, কিন্তু বল শুরুতে শূন্য, শেষে ks। তার কাজ ½ks², ধ্রুব বলের Fs-এর সমান নয়।",
    explainEn:
      "The work-energy theorem: from rest, K = (F−f)s. That kinetic energy lifts the body to h = K/mg, so kinetic energy becomes potential. Average power is the work divided by the time. The spring is stretched over the same distance, but its force grows from zero to ks, so its work is ½ks², not Fs.",
    knobs: ["mass", "force", "drag", "span", "time", "spring"],
    preset: { mass: 2, force: 10, drag: 4, span: 2, time: 2, spring: 20 },
  },
];

export const newtonModels: NewtonModel[] = rows.map((row, index) => ({ ...row, no: index + 1 }));

export function modelBySlug(slug: string) {
  return newtonModels.find((model) => model.slug === slug) ?? null;
}

export function paramsOf(model: NewtonModel) {
  return { ...baseParams, ...model.preset };
}

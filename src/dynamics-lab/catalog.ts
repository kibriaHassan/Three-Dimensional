import { baseParams, type Params } from "./physics";

export type Section = "path" | "equations" | "graphs" | "vertical" | "shot";
export type Family = Section;
export type Knob = "east" | "north" | "pace" | "u" | "accel" | "time" | "jerk" | "height" | "launch" | "shot";

export type DynamicsModel = {
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
  path: ["দূরত্ব ও বেগ", "Distance and velocity"],
  equations: ["সমত্বরণ", "Uniform acceleration"],
  graphs: ["গতির লেখ", "Motion graphs"],
  vertical: ["উল্লম্ব গতি", "Vertical motion"],
  shot: ["প্রক্ষেপণ", "Projectile"],
} as const;

export function dynamicsSection(section: Section, lang: "bn" | "en") {
  const pair = sections[section];
  return lang === "en" ? pair[1] : pair[0];
}

const rows: Omit<DynamicsModel, "no">[] = [
  {
    slug: "path",
    family: "path",
    section: "path",
    focus: "path",
    title: "দূরত্ব, সরণ, দ্রুতি ও বেগ",
    titleEn: "Distance, displacement, speed and velocity",
    blurb: "গাড়ি আগে পূর্বে, তারপর উত্তরে। পথ দীর্ঘ, সরণ খাটো।",
    blurbEn: "The car goes east, then north. The path is longer than the displacement.",
    formula: "গড় দ্রুতি = দূরত্ব/t , গড় বেগ = সরণ/t",
    symbols: "তাৎক্ষণিক দ্রুতি পথের বেগের মান। তাৎক্ষণিক বেগের দিক পথের স্পর্শক। সরণের দিক শুরু থেকে শেষ।",
    explain:
      "দূরত্ব মোট পথ, দিক নেই। সরণ শুরু থেকে এখনকার জায়গা, সরলরেখায়, দিকসহ। কোনা ঘুরলে দূরত্ব সরণের চেয়ে বড়। গড় দ্রুতি দূরত্ব ভাগ সময়, গড় বেগ সরণ ভাগ সময়। গাড়ির গায়ের তীর তাৎক্ষণিক বেগ — পূর্বের রাস্তায় পূর্বমুখী, উত্তরের রাস্তায় উত্তরমুখী। দ্রুতি তার মান। সোজা পথে, উত্তরের স্লাইডার শূন্য হলে, দূরত্ব আর সরণ মিলে যায়।",
    explainEn:
      "Distance is the length of the path and has no direction. Displacement is the straight line from the start to here, with a direction. Around a corner, distance is longer. Average speed is distance over time. Average velocity is displacement over time. The arrow on the car is the instantaneous velocity, along the road it is on. Set the northward leg to zero and distance equals displacement.",
    knobs: ["east", "north", "pace"],
    preset: { east: 30, north: 40, pace: 5 },
  },
  {
    slug: "equations",
    family: "equations",
    section: "equations",
    focus: "equations",
    title: "সমত্বরণ, মন্দন ও গতির সমীকরণ",
    titleEn: "Uniform acceleration, retardation and the equations",
    blurb: "ত্বরণ স্থির থাকলে তিন সমীকরণ মিলে। ত্বরণ বদলালে ফাঁক দেখা যায়।",
    blurbEn: "While acceleration is constant the three equations agree. When it changes, a gap opens.",
    formula: "v = u+at , s = ut+½at² , v² = u²+2as",
    symbols: "জার্ক শূন্য মানে সুষম ত্বরণ। ঋণাত্মক ত্বরণ মন্দন। জার্ক থাকলে ত্বরণ সময়ে বদলায়, তাই একক a দিয়ে সমীকরণ আর খাটে না।",
    explain:
      "স্থির থেকে চালু হলে u = ০। ত্বরণ ধনাত্মক হলে বেগ বাড়ে, ঋণাত্মক হলে কমে — মন্দন। জার্ক শূন্য থাকলে ত্বরণ সুষম, তিন সমীকরণ একই সরণ ও বেগ দেয়, আর v² − u² − 2as শূন্য। জার্ক দিলে ত্বরণ সময়ের সাথে বদলায়, অসমত্বরণ। তখন ut+½at² আসল সরণের চেয়ে আলাদা। সেই ফাঁকই পাশের সংখ্যা।",
    explainEn:
      "From rest, set u to 0. Positive acceleration speeds the car up. Negative acceleration slows it. With jerk at zero the acceleration is uniform, the three equations agree, and v² − u² − 2as is zero. A jerk means the acceleration changes with time. Then ut+½at² no longer matches the real distance. That gap is the number beside the scene.",
    knobs: ["u", "accel", "time", "jerk"],
    preset: { u: 5, accel: 2, time: 4, jerk: 0 },
  },
  {
    slug: "graphs",
    family: "graphs",
    section: "graphs",
    focus: "graphs",
    title: "s–t, v–t ও a–t লেখ",
    titleEn: "The s–t, v–t and a–t graphs",
    blurb: "s–t-এর ঢাল বেগ। v–t-এর ক্ষেত্র সরণ। a–t-এর ক্ষেত্র বেগের বদল।",
    blurbEn: "The slope of s–t is velocity. The area of v–t is displacement. The area of a–t is the change in velocity.",
    formula: "ঢাল = dy/dx , ক্ষেত্র = ∫ y dx",
    symbols: "কার্সার চলন্ত মুহূর্ত। সংখ্যাগুলো স্লাইডারের পুরো সময়ের। জার্ক শূন্য হলে a–t আনুভূমিক, ত্বরণ সুষম।",
    explain:
      "একই গতি তিন লেখে। s–t বাঁকা হলে বেগ বদলাচ্ছে, তার ঢাল সেই মুহূর্তের বেগ। v–t সরলরেখা হলে ত্বরণ সুষম, রেখার ঢাল ত্বরণ, আর রেখার নিচের ক্ষেত্র সরণ। a–t আনুভূমিক হলে ত্বরণ স্থির। তার নিচের ক্ষেত্র বেগের পরিবর্তন, v−u। গাড়ি এগোলে কার্সার তিন লেখেই সরে। জার্ক দিলে a–t কাত হয় — ত্বরণ আর স্থির নয়।",
    explainEn:
      "The same motion, three graphs. A curving s–t means the velocity is changing, and its slope is the velocity at that moment. A straight v–t means uniform acceleration: the slope is the acceleration and the area under it is the displacement. A level a–t means constant acceleration, and its area is v−u. The cursor moves with the car. A jerk tilts a–t.",
    knobs: ["u", "accel", "time", "jerk"],
    preset: { u: 4, accel: 2, time: 4, jerk: 0 },
  },
  {
    slug: "vertical",
    family: "vertical",
    section: "vertical",
    focus: "vertical",
    title: "মুক্তপতন ও ওপরের দিকে নিক্ষেপ",
    titleEn: "Free fall and a throw straight up",
    blurb: "শীর্ষে বেগ শূন্য। ত্বরণ তখনও g, নিচের দিকে।",
    blurbEn: "At the top the speed is zero. The acceleration is still g, downward.",
    formula: "v = u − gt , H = u²/2g",
    symbols: "উপরে ধনাত্মক। g = 9.8 m/s²। মাটি y = ০। ছেড়ে দেওয়ার উচ্চতা h। বাতাস নেই। শীর্ষে বেগ ০, ত্বরণ −g।",
    explain:
      "u = ০ আর h > ০ হলে বস্তুকে ছেড়ে দেওয়া, মুক্তপতন। বেগ নিচের দিকে বাড়ে, ত্বরণ সব সময় g। u > ০ হলে ওপরের দিকে নিক্ষেপ। উঠতে উঠতে বেগ কমে, শীর্ষে বেগ শূন্য, কিন্তু ত্বরণ শূন্য নয় — g নিচের দিকেই থাকে। তাই পরমুহূর্তে বেগ নিচমুখী হয়। মাটিতে ফেরার দ্রুতি √(u²+2gh)।",
    explainEn:
      "u = 0 and h > 0 is a drop, free fall. The speed grows downward and the acceleration is g the whole way. u > 0 is a throw straight up. The speed falls, and at the top it is zero, but the acceleration is not: g still points down, so the next moment the velocity points down. The speed at the ground is √(u²+2gh).",
    knobs: ["u", "height"],
    preset: { u: 15, height: 0 },
  },
  {
    slug: "projectile",
    family: "shot",
    section: "shot",
    focus: "shot",
    title: "প্রক্ষেপণ ও দ্বিমাত্রিক গতি",
    titleEn: "A projectile and motion in two dimensions",
    blurb: "পথ পরাবৃত্ত। ৪৫°-এ এই বেগের পাল্লা সবচেয়ে বড়।",
    blurbEn: "The path is a parabola. At this speed the range is largest at 45°.",
    formula: "R = v² sin2θ / g",
    symbols: "vx = v cosθ স্থির। vy = v sinθ − gt। H = (v sinθ)²/(2g)। কাল 2v sinθ/g। ফিকে পথটি একই বেগে ৪৫°। বাতাস নেই।",
    explain:
      "নিক্ষেপের বেগ দুই উপাংশ। অনুভূমিক উপাংশে বল নেই, তাই vx পুরো পথে এক। উল্লম্ব উপাংশ g-তে কমে, শীর্ষে শূন্য, তারপর নিচে। পথ পরাবৃত্ত। উচ্চতা, উড়ানের কাল ও পাল্লা v ও θ বদলালে সাথে সাথে বদলায়। একই বেগে ৪৫° ছাড়া অন্য কোণে পাল্লা ছোট। ফিকে রেখাটি সেই ৪৫° পথ, তুলনার জন্য।",
    explainEn:
      "The launch speed has two components. Nothing pushes horizontally, so vx stays constant. The vertical component falls with g, is zero at the top, then points down. The path is a parabola. Height, flight time and range follow v and θ. At the same speed any angle other than 45° has a shorter range. The faint curve is that 45° path, for comparison.",
    knobs: ["launch", "shot"],
    preset: { launch: 20, shot: 30 },
  },
];

export const dynamicsModels: DynamicsModel[] = rows.map((row, index) => ({ ...row, no: index + 1 }));

export function modelBySlug(slug: string) {
  return dynamicsModels.find((model) => model.slug === slug) ?? null;
}

export function paramsOf(model: DynamicsModel) {
  return { ...baseParams, ...model.preset };
}

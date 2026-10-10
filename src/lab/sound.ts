const STORAGE_KEY = "trimatra-voice";

type Line = { t: number; text: string };

const scripts: Record<string, Line[]> = {
  path: [
    { t: 0, text: "দেখো, বলটা বাঁকা পথে যাচ্ছে। পথের এই পুরো দাগটাই দূরত্ব।" },
    { t: 4.6, text: "এবার শুরু থেকে শেষ পর্যন্ত সোজা তীরটা সরণ। পথ ঘুরলেও সরণ খাটো থাকে।" },
  ],
  freefall: [
    { t: 0, text: "ভারী আর হালকা বল একসাথে ছাড়া হলো। বাতাসের বাধা নেই, তাই দুটোই একইভাবে পড়ে।" },
    { t: 1.5, text: "নিচের দাগগুলো ক্রমশ দূরে দূরে। সময় বাড়লে পথ সময়ের বর্গের মতো বাড়ে।" },
    { t: 3.3, text: "ভর আলাদা, তবু মাটিতে লাগল একসাথে। মুক্তপতনে ত্বরণ ভরের ওপর নির্ভর করে না।" },
  ],
  projectile: [
    { t: 0, text: "বলটা ছুড়ে দেওয়া হলো। সামনের বেগ আর ওপরের বেগ, দুটো আলাদা।" },
    { t: 1.6, text: "সামনের বেগ প্রায় একই থাকে। ওপরের বেগ কমে, তারপর উল্টে বল নামতে থাকে।" },
    { t: 3.4, text: "দুই বেগ মিলে পথটা বাঁকা। এটাই প্রক্ষেপ্য গতি।" },
  ],
  vector: [
    { t: 0, text: "একটা বল ডান দিকে টানছে। তীরের লম্বা মানে বলের মান, ফলা মানে দিক।" },
    { t: 2.3, text: "একই জায়গায় আরেকটা বল তির্যকভাবে। দুটো বলকে দুই তীরে দেখা যাচ্ছে।" },
    { t: 4.6, text: "তীর দুটোকে বাহু ধরে সামান্তরিক আঁকা হলো।" },
    { t: 6.4, text: "মাঝের কর্ণটাই লব্ধি। এই একটি বল আগের দুই বলের কাজ করে।" },
  ],
  newton2: [
    { t: 0, text: "দুই গাড়িতে বল সমান। নিচের গাড়ির ভর তিনগুণ।" },
    { t: 1.2, text: "হালকা গাড়ি দ্রুত এগোয়, ভারী গাড়ি পিছিয়ে পড়ে। বল সমান হলে ভর বেশি মানে ত্বরণ কম।" },
    { t: 4.2, text: "মনে রাখো, বল সমান ভর গুণ ত্বরণ।" },
  ],
  torque: [
    { t: 0, text: "একই বল কব্জার কাছে ঠেলছে। দূরত্ব ছোট, তাই টর্ক ছোট। দরজা প্রায় নড়ে না।" },
    { t: 4.8, text: "এবার বল হাতলে। বল আগের মতোই, কিন্তু দূরত্ব বড়। টর্ক বেড়ে দরজা খুলে যায়।" },
  ],
  tension: [
    { t: 0, text: "টেবিলের বস্তুকে দড়ি ডান দিকে টানছে। ওজন আর অভিলম্ব বল সমান, তাই সে ওপরে ওঠে না।" },
    { t: 1.4, text: "ঝুলন্ত বস্তুর ওজন টানের চেয়ে বেশি। তাই সে নিচে নামে, আর গতি বাড়তে থাকে।" },
    { t: 3.6, text: "হালকা দড়িতে দুপাশের টান সমান। দুই বস্তু এক সুতোয় বাঁধা।" },
  ],
  "pulley-fixed": [
    { t: 0, text: "স্থির কপিকল বলের দিক বদলায়। নিচের দিকে টানলে ভার ওপরে ওঠে।" },
    { t: 2.2, text: "দড়ি যতটুকু নামে, ভার ঠিক ততটুকু ওঠে।" },
    { t: 4.4, text: "দুপাশের ভার সমান। এই কপিকল বল কমায় না, শুধু দিক বদলায়।" },
  ],
  "pulley-move": [
    { t: 0, text: "এটা চল কপিকল। ভার নিচের কপিকলের সাথে বাঁধা, আর কপিকলটা নিজেও উঠতে পারে।" },
    { t: 2, text: "ছোট বস্তুটি ভারের অর্ধেক। এই অল্প বল দিয়েই ভার ওঠে।" },
    { t: 4.2, text: "ভার এক হাত উঠলে দড়ি দুই হাত নামে। তাই যান্ত্রিক সুবিধা দুই।" },
  ],
  friction: [
    { t: 0, text: "ঠেলা এখনো ছোট। ঘর্ষণ ঠিক উল্টো দিকে সমান বল দিয়ে বাক্সকে আটকে রাখে।" },
    { t: 3.8, text: "ঠেলা সীমা ছাড়াল। ঘর্ষণ আর সামলাতে পারছে না, বাক্স চলতে শুরু করল।" },
    { t: 6.5, text: "ঠেলা সরিয়ে নিলে গতি ঘর্ষণ বাক্সকে থামিয়ে দেয়।" },
  ],
  inertia: [
    { t: 0, text: "গ্লাসের মুখে কার্ড, তার ওপর মুদ্রা। সব স্থির আছে।" },
    { t: 1.5, text: "কার্ড সরে গেল। মুদ্রা কার্ডের সাথে যায় না, কারণ তাকে সরাবার মতো বল নেই।" },
    { t: 2.6, text: "মুদ্রা সোজা নিচে গ্লাসে পড়ল। এটাই জড়তা।" },
  ],
  reaction: [
    { t: 0, text: "দুই গাড়ির মাঝে স্প্রিং চাপা। ছোট গাড়ির ভর কম, বড়টার ভর দ্বিগুণ।" },
    { t: 1.4, text: "ছেড়ে দিলে দুজনে সমান বল পায়, দিক উল্টো। একেই বলে ক্রিয়া আর প্রতিক্রিয়া।" },
    { t: 3.2, text: "বল সমান, তাই হালকা গাড়ি দ্বিগুণ বেগে সরে যায়।" },
  ],
  collision: [
    { t: 0, text: "বাঁয়ের বল এগিয়ে আসছে। ডানদিকের বল স্থির। ভর দুটোর সমান।" },
    { t: 1.7, text: "ধাক্কার সময় ভেতরের বল সমান আর উল্টো। বাইরে থেকে কেউ ধাক্কা দেয়নি।" },
    { t: 2.4, text: "বাঁয়ের বল থামল, ডানদিকের বল সেই বেগ নিয়ে চলল। মোট ভরবেগ আগের সমান।" },
  ],
  work: [
    { t: 0, text: "বাক্স ডান দিকে যাচ্ছে, বলও ডান দিকে। বল আর সরণ এক দিকে, তাই কাজ হচ্ছে।" },
    { t: 4.1, text: "এবার বল ওপরের দিকে, সরণ ডান দিকে। কোণ নব্বই ডিগ্রি, তাই কাজ শূন্য।" },
  ],
  energy: [
    { t: 0, text: "গাড়ি ওপরে প্রায় থেমে আছে। নীল স্তম্ভ বিভব শক্তি, সবুজ স্তম্ভ গতিশক্তি।" },
    { t: 1.6, text: "নামতে নামতে উচ্চতা কমছে, বেগ বাড়ছে। বিভব কমছে, গতিশক্তি বাড়ছে।" },
    { t: 4.8, text: "সোনালি স্তম্ভ মোট শক্তি। সেটা একই আছে। শক্তি হারায়নি, শুধু রূপ বদলেছে।" },
  ],
  pressure: [
    { t: 0, text: "এক পাত্রে তিনটি ছিদ্র, তিন গভীরতায়। ওপরের ছিদ্রে পানির স্তম্ভ খাটো।" },
    { t: 1.2, text: "নিচের ছিদ্র থেকে পানি সবচেয়ে জোরে বেরোয়। গভীরে চাপ বেশি।" },
    { t: 3.5, text: "বেরোনোর পর অভিকর্ষ ধারাকে নিচে নামায়, তাই পথ বাঁকে।" },
  ],
  buoyancy: [
    { t: 0, text: "ব্লক এখনো পানিতে ঢোকেনি। শুধু ওজন নিচের দিকে টানছে।" },
    { t: 2, text: "যত ডোবে, তত পানি সরে। সোনালি তীর প্লবতা, সেটা ওপরের দিকে বাড়ছে।" },
    { t: 5, text: "প্লবতা ওজনের সমান হলে নাম থেমে যায়। ব্লক আংশিক ডুবে ভাসে।" },
  ],
  expansion: [
    { t: 0, text: "পিতলের দণ্ড ঠান্ডা। ডান দিকের খুঁটির সাথে ফাঁক দেখা যাচ্ছে।" },
    { t: 1.4, text: "নিচে তাপ দেওয়া হচ্ছে। দণ্ড গরম হয়ে রং বদলাচ্ছে।" },
    { t: 4, text: "গরম দণ্ড লম্বা হয়ে ফাঁক বন্ধ করে দিল। এটাই দৈর্ঘ্য প্রসারণ।" },
  ],
  pendulum: [
    { t: 0, text: "তিনটি দোলক। বাঁয়ের দুটির দৈর্ঘ্য সমান, বব আলাদা। ডানদিকের দোলক খাটো।" },
    { t: 2.2, text: "সমান দৈর্ঘ্যের দুটি এখনও একসাথে দুলছে। ভর বদলালে দোলনকাল বদলায় না।" },
    { t: 4.2, text: "খাটো দোলক এগিয়ে গেছে। দোলনকাল দৈর্ঘ্যের ওপর নির্ভর করে, ভরের ওপর নয়।" },
  ],
  wave: [
    { t: 0, text: "মাঝের লাল কণাটা দেখো। সে ডানে সরে না, নিজের জায়গায় ওঠানামা করে।" },
    { t: 1.5, text: "শিখর ডান দিকে এগোচ্ছে। কণা স্থানেই দোলে, তরঙ্গের আকৃতি এগোয়।" },
    { t: 3.5, text: "পরপর দুই শিখরের ফাঁকই তরঙ্গদৈর্ঘ্য। কণার দোলন তরঙ্গের দিকের সাথে লম্ব।" },
  ],
  sound: [
    { t: 0, text: "এবার কণাগুলো ডানে-বাঁয়ে দুলছে, ওপরে নয়। শব্দ এভাবেই চলে।" },
    { t: 1.6, text: "যেখানে কণা ঘন, সেখানে সংকোচন। এই ঘন জায়গা ডান দিকে এগোয়।" },
    { t: 4, text: "ঘন জায়গার পাশে ফাঁকা অংশ প্রসারণ। সংকোচন আর প্রসারণ মিলে শব্দ এগোয়।" },
  ],
  reflection: [
    { t: 0, text: "আলো দর্পণের দিকে যাচ্ছে। সাদা ড্যাশ রেখাটা অভিলম্ব।" },
    { t: 2.4, text: "দর্পণে লেগে আলো ফিরে এল। যে কোণে পড়েছে, সেই কোণেই ফিরেছে।" },
    { t: 4.5, text: "ঘুরিয়ে দেখো। আপতিত রশ্মি, প্রতিফলিত রশ্মি আর অভিলম্ব একই তলে।" },
  ],
  refraction: [
    { t: 0, text: "আলো বায়ু থেকে কাচের দিকে আসছে। অভিলম্বের সাথে কোণ পঁয়ত্রিশ ডিগ্রি।" },
    { t: 2.2, text: "কাচে ঢুকে কোণ কমে বাইশ ডিগ্রি হলো। আলো অভিলম্বের দিকে বাঁকল।" },
    { t: 4.4, text: "বেরিয়ে আবার বায়ুতে এল। বেরোনো রশ্মি আগের রশ্মির সমান্তরাল।" },
  ],
  lens: [
    { t: 0, text: "তিনটি আলো প্রধান অক্ষের সমান্তরালে উত্তল লেন্সের দিকে আসছে।" },
    { t: 2.2, text: "লেন্স ওপর-নিচের আলোকে অক্ষের দিকে বাঁকাল। মাঝের আলো সোজা গেল।" },
    { t: 4.2, text: "তিনটি আলো এক বিন্দুতে মিলল। ওই বিন্দুই ফোকাস।" },
  ],
  charge: [
    { t: 0, text: "লাল ধনাত্মক, নীল ঋণাত্মক। বিপরীত আধান একে অপরকে টানছে।" },
    { t: 4.1, text: "এবার দুটোই ধনাত্মক। সমজাতীয় আধান ঠেলে দূরে সরে যায়।" },
  ],
  circuit: [
    { t: 0, text: "সুইচ খোলা। পথে ফাঁক আছে, তাই বাল্ব নিভে আছে।" },
    { t: 2.2, text: "সুইচ বন্ধ হলো। পথ জুড়ে গেল, বর্তনী এখন বদ্ধ।" },
    { t: 3.2, text: "বিদ্যুৎ ঘুরছে, বাল্ব জ্বলল। পথ খুললেই আবার নিভে যাবে।" },
  ],
  magnet: [
    { t: 0, text: "লাল উত্তর মেরু, নীল দক্ষিণ মেরু। বলরেখা উত্তর থেকে বেরিয়ে দক্ষিণে ঢোকে।" },
    { t: 1.2, text: "ছোট কণাগুলো রেখা ধরে উত্তর মেরু থেকে দক্ষিণ মেরুতে যাচ্ছে।" },
    { t: 4, text: "মেরুর কাছে রেখা ঘন, ক্ষেত্র জোরালো। দূরে ফাঁকা, ক্ষেত্র দুর্বল।" },
  ],
  halflife: [
    { t: 0, text: "বত্রিশটি সক্রিয় নিউক্লিয়াস। এখনো কোনো ক্ষয় হয়নি।" },
    { t: 2.2, text: "এক অর্ধায়ু পেরোল। অর্ধেক নিভে গেছে, বাকি আছে ষোলটি।" },
    { t: 4.4, text: "পরের অর্ধায়ুতে আবার অর্ধেক। ষোল থেকে আট, তারপর চার। প্রতি ধাপে অর্ধেক থাকে।" },
  ],
};

let enabled = true;
let loaded = false;
let voiceId = "";
let lastTime = -1;
const listeners = new Set<() => void>();

function loadPreference() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "0") enabled = false;
  } catch {
    enabled = true;
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

export function voiceEnabled() {
  loadPreference();
  return enabled;
}

export function subscribeVoice(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

let clip: HTMLAudioElement | null = null;
let spokenIndex = -1;
let starting = false;
let hold = false;
let lastSync: { id: string; time: number; playing: boolean } | null = null;

function dueIndex(id: string, time: number) {
  const lines = scripts[id];
  if (!lines) return -1;
  let index = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].t <= time + 0.05) index = i;
  }
  return index;
}

function playLine(id: string, index: number) {
  const lines = scripts[id];
  if (!lines || index < 0 || index >= lines.length) return;
  clip?.pause();
  const next = new Audio(`/voice/${id}-${index}.mp3`);
  next.preload = "auto";
  clip = next;
  voiceId = id;
  spokenIndex = index;
  starting = true;
  hold = false;
  void next.play().then(
    () => {
      starting = false;
    },
    () => {
      starting = false;
      hold = true;
    },
  );
}

export function cueVoice(id: string, time: number) {
  if (typeof window === "undefined" || !voiceEnabled()) return;
  lastSync = { id, time, playing: true };
  voiceId = id;
  lastTime = time;
  const index = Math.max(0, dueIndex(id, time));
  playLine(id, index);
}

export function unlockVoice() {
  if (!voiceEnabled() || !clip || !clip.paused || clip.ended) return;
  hold = false;
  void clip.play().catch(() => {
    hold = true;
  });
}

export function stopVoice() {
  clip?.pause();
  clip = null;
  voiceId = "";
  spokenIndex = -1;
  starting = false;
  hold = false;
  lastTime = -1;
  lastSync = null;
}

export function setVoiceEnabled(on: boolean) {
  loadPreference();
  enabled = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* private mode */
  }
  if (!on) clip?.pause();
  else if (clip && !clip.ended && lastSync && voiceId === lastSync.id) {
    hold = false;
    void clip.play().catch(() => {
      hold = true;
    });
  } else if (lastSync) {
    voiceId = lastSync.id;
    spokenIndex = dueIndex(lastSync.id, lastSync.time) - 1;
    clip = null;
    syncVoice(lastSync.id, lastSync.time, lastSync.playing);
  }
  emit();
}

export function syncVoice(id: string, time: number, playing: boolean) {
  if (typeof window === "undefined") return;
  lastSync = { id, time, playing };
  if (!voiceEnabled()) {
    clip?.pause();
    return;
  }
  if (voiceId !== id) {
    clip?.pause();
    clip = null;
    voiceId = id;
    spokenIndex = -1;
    starting = false;
    lastTime = -1;
  }
  if (!playing) {
    if (clip && !clip.paused && !clip.ended) clip.pause();
    lastTime = time;
    return;
  }
  if (clip?.paused && !clip.ended && spokenIndex >= 0 && !hold) void clip.play().catch(() => undefined);

  const lines = scripts[id];
  if (!lines) return;
  const jumped = lastTime >= 0 && (time < lastTime - 0.08 || time - lastTime > 0.45);
  lastTime = time;
  const talking = starting || Boolean(clip && !clip.paused && !clip.ended);
  if (talking && !jumped) return;

  const next = jumped ? dueIndex(id, time) : spokenIndex + 1;
  if (next < 0 || next >= lines.length || lines[next].t > time + 0.05) return;
  playLine(id, next);
}

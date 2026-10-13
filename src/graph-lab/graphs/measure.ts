import { bnNum } from "../format";
import { blue, copper, curve, green, knob, leastSquares, mulberry32, noArea, samples } from "../curves";
import type { GraphSpec, Point } from "../types";

export const measureGraphs: GraphSpec[] = [
  {
    id: "measure-fit",
    chapter: "measure",
    title: "পরীক্ষামূলক উপাত্ত ও উপযুক্ত রেখা",
    source: "book",
    xName: "সময়",
    yName: "সরণ",
    xSymbol: "t (s)",
    ySymbol: "s (m)",
    formula: "s = vt",
    condition: "নমুনা উপাত্ত সমবেগের সূত্র s = vt থেকে তৈরি। প্রতিটি পাঠে এলোমেলো পরিমাপ ত্রুটি যোগ করা হয়েছে। প্রকৃত গতি একমাত্রিক ও ধ্রুব বেগের।",
    explain: "বিন্দুগুলো পরীক্ষার পাঠ। সবুজ রেখা সেই বিন্দুর ওপর ন্যূনতম বর্গের উপযুক্ত রেখা, s = mt + c। নীল রেখা যে সূত্র থেকে উপাত্ত তৈরি, s = vt। ত্রুটি শূন্য করলে দুই রেখা মিলে যায়।",
    meaning: "উপযুক্ত রেখার ঢাল থেকে বেগ পাওয়া যায়। ছোট অন্তঃখণ্ড পরিমাপের ছড়াছড়ি দেখায়; ভৌত সূত্র বলছে রেখা মূলবিন্দু দিয়ে যাবে।",
    slope: "উপযুক্ত রেখার ঢাল m বেগের পরিমাপ, একক m/s। নীল রেখার ঢাল প্রকৃত বেগ v।",
    area: noArea,
    origin: "both",
    knobs: [knob("speed", "প্রকৃত বেগ v", 0.5, 4, 0.1, "m/s"), knob("noise", "ত্রুটির বিস্তার", 0, 1.5, 0.1, "m")],
    base: { speed: 2, noise: 0.6 },
    build(p) {
      const speed = p.speed;
      const noise = p.noise;
      const rand = mulberry32(2400 + Math.round(noise * 100));
      const measured: Point[] = [];
      for (let i = 1; i <= 8; i++) {
        const t = i * 0.5;
        measured.push({ x: t, y: speed * t + (rand() - 0.5) * 2 * noise });
      }
      const fit = leastSquares(measured);
      return {
        curves: [
          curve("dots", "পরিমাপ", copper, measured, { dots: true }),
          curve("main", "উপযুক্ত রেখা", green, samples(0.5, 4, (t) => fit.m * t + fit.c, 40)),
          curve("law", "সূত্র s = vt", blue, samples(0, 4, (t) => speed * t, 40)),
        ],
        calc: `প্রকৃত বেগ ${bnNum(speed, 1)} m/s। উপযুক্ত রেখার ঢাল ${bnNum(fit.m)} m/s, অন্তঃখণ্ড ${bnNum(fit.c)} m।`,
      };
    },
  },
];

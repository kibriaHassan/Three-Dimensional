import { motionScenes } from "./motion.js";
import { motionLabScenes } from "./motion-lab.js";
import { newtonScenes } from "./newton.js";
import { forceScenes } from "./force.js";
import { matterScenes } from "./matter.js";
import { waveScenes } from "./waves.js";
import { lightScenes } from "./light.js";
import { opticsScenes } from "./optics.js";

export const chapters = [
  { id: "all", name: "সব" },
  { id: "motion", name: "গতি" },
  { id: "force", name: "বল" },
  { id: "energy", name: "শক্তি" },
  { id: "matter", name: "চাপ" },
  { id: "heat", name: "তাপ" },
  { id: "wave", name: "তরঙ্গ" },
  { id: "light", name: "আলো" },
  { id: "electro", name: "বিদ্যুৎ" },
  { id: "modern", name: "তেজস্ক্রিয়তা" },
];

export const demos = [
  ...motionScenes,
  ...motionLabScenes,
  ...newtonScenes,
  ...forceScenes,
  ...matterScenes,
  ...waveScenes,
  ...lightScenes.filter((demo) => demo.chapter === "light"),
  ...opticsScenes,
  ...lightScenes.filter((demo) => demo.chapter !== "light"),
];

export function demoById(id) {
  return demos.find((demo) => demo.id === id) || null;
}

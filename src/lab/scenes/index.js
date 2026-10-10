import { motionScenes } from "./motion.js";
import { forceScenes } from "./force.js";
import { matterScenes } from "./matter.js";
import { waveScenes } from "./waves.js";
import { lightScenes } from "./light.js";

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
  ...forceScenes,
  ...matterScenes,
  ...waveScenes,
  ...lightScenes,
];

export function demoById(id) {
  return demos.find((demo) => demo.id === id) || null;
}

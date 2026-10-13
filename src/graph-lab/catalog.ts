import { energyGraphs } from "./graphs/energy";
import { dynamicsGraphs } from "./graphs/dynamics";
import { gasGraphs } from "./graphs/gas";
import { gravityGraphs } from "./graphs/gravity";
import { matterGraphs } from "./graphs/matter";
import { measureGraphs } from "./graphs/measure";
import { newtonGraphs } from "./graphs/newton";
import { shmGraphs } from "./graphs/shm";
import { vectorGraphs } from "./graphs/vector";
import { waveGraphs } from "./graphs/wave";
import type { GraphSpec } from "./types";

export const graphs: GraphSpec[] = [
  ...measureGraphs,
  ...vectorGraphs,
  ...dynamicsGraphs,
  ...newtonGraphs,
  ...energyGraphs,
  ...gravityGraphs,
  ...matterGraphs,
  ...shmGraphs,
  ...waveGraphs,
  ...gasGraphs,
];

export function graphsFor(chapter: string) {
  return graphs.filter((graph) => graph.chapter === chapter);
}

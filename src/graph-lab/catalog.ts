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
import { thermoGraphs } from "./graphs/p2-thermo";
import { electroGraphs } from "./graphs/p2-electro";
import { currentGraphs } from "./graphs/p2-current";
import { magnetGraphs } from "./graphs/p2-magnet";
import { inductionGraphs } from "./graphs/p2-induction";
import { geoGraphs } from "./graphs/p2-geo";
import { physOpticGraphs } from "./graphs/p2-phys";
import { modernGraphs } from "./graphs/p2-modern";
import { nucleusGraphs } from "./graphs/p2-nucleus";
import { electronicsGraphs } from "./graphs/p2-electronics";
import { astroGraphs } from "./graphs/p2-astro";
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
  ...thermoGraphs,
  ...electroGraphs,
  ...currentGraphs,
  ...magnetGraphs,
  ...inductionGraphs,
  ...geoGraphs,
  ...physOpticGraphs,
  ...modernGraphs,
  ...nucleusGraphs,
  ...electronicsGraphs,
  ...astroGraphs,
];

export function graphsFor(chapter: string) {
  return graphs.filter((graph) => graph.chapter === chapter);
}

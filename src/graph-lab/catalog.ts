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
import { sscMotionGraphs } from "./graphs/ssc-motion";
import { sscForceGraphs } from "./graphs/ssc-force";
import { sscEnergyGraphs } from "./graphs/ssc-energy";
import { sscPressureGraphs } from "./graphs/ssc-pressure";
import { sscHeatGraphs } from "./graphs/ssc-heat";
import { sscWaveGraphs } from "./graphs/ssc-wave";
import { sscReflectGraphs } from "./graphs/ssc-reflect";
import { sscRefractGraphs } from "./graphs/ssc-refract";
import { sscStaticGraphs } from "./graphs/ssc-static";
import { sscCurrentGraphs } from "./graphs/ssc-current";
import { sscMagnetGraphs } from "./graphs/ssc-magnet";
import { sscModernGraphs } from "./graphs/ssc-modern";
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
  ...sscMotionGraphs,
  ...sscForceGraphs,
  ...sscEnergyGraphs,
  ...sscPressureGraphs,
  ...sscHeatGraphs,
  ...sscWaveGraphs,
  ...sscReflectGraphs,
  ...sscRefractGraphs,
  ...sscStaticGraphs,
  ...sscCurrentGraphs,
  ...sscMagnetGraphs,
  ...sscModernGraphs,
];

export function graphsFor(chapter: string) {
  return graphs.filter((graph) => graph.chapter === chapter);
}

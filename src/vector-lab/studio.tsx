"use client";

import { AngleModel } from "./models/angle";
import { CoordinateModel } from "./models/coordinate";
import { CrossModel } from "./models/cross";
import { DirectionModel } from "./models/direction";
import { DotModel } from "./models/dot";
import { ParallelogramModel } from "./models/parallelogram";
import { ResolutionModel } from "./models/resolution";
import { SumModel } from "./models/sum";
import { TriangleModel } from "./models/triangle";
import { UnitModel } from "./models/unit";

const views = {
  coordinate: CoordinateModel,
  parallelogram: ParallelogramModel,
  triangle: TriangleModel,
  resolution: ResolutionModel,
  sum: SumModel,
  angle: AngleModel,
  dot: DotModel,
  cross: CrossModel,
  unit: UnitModel,
  direction: DirectionModel,
};

export function VectorStudio({ slug }: { slug: string }) {
  const View = views[slug as keyof typeof views];
  if (!View) return null;
  return <View />;
}

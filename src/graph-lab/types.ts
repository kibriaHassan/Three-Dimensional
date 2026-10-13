export type Point = { x: number; y: number };

export type Curve = {
  id: string;
  name: string;
  color: string;
  points: Point[];
  dashed?: boolean;
  dots?: boolean;
};

export type Guide = { x: number; label: string };

export type Knob = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

export type GraphSource = "book" | "extra" | "schematic";

export type GraphView = {
  curves: Curve[];
  guides?: Guide[];
  calc: string;
};

export type Probe = {
  x: number;
  y: number;
  name: string;
  slope: number | null;
};

export type GraphSpec = {
  id: string;
  chapter: string;
  title: string;
  source: GraphSource;
  xName: string;
  yName: string;
  xSymbol: string;
  ySymbol: string;
  formula: string;
  condition: string;
  explain: string;
  meaning: string;
  slope: string;
  area: string;
  fillArea?: boolean;
  origin?: "x" | "y" | "both";
  flipX?: boolean;
  animate?: boolean;
  steps?: { eq: string; why: string; tag?: string }[];
  knobs: Knob[];
  base: Record<string, number>;
  build: (p: Record<string, number>, time: number) => GraphView;
};

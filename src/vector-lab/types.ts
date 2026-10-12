export type Vec3 = { x: number; y: number; z: number };

export type ArrowSpec = {
  id: string;
  from: Vec3;
  to: Vec3;
  color: string;
  label?: string;
};

export type LineSpec = {
  id: string;
  points: Vec3[];
  color: string;
  dashed?: boolean;
  radius?: number;
};

export type FaceSpec = {
  id: string;
  corners: Vec3[];
  color: string;
};

export type MarkerSpec = {
  id: string;
  at: Vec3;
  color: string;
  label?: string;
  radius?: number;
};

export type SceneContent = {
  arrows: ArrowSpec[];
  lines: LineSpec[];
  faces: FaceSpec[];
  markers: MarkerSpec[];
};

export const PAL = {
  x: "#e25b45",
  y: "#2f9e6b",
  z: "#3c6fd8",
  a: "#e2a63b",
  b: "#7d8cf0",
  r: "#1aa58a",
  sub: "#e25b45",
  neg: "#d4783c",
  unit: "#f4efe4",
  guide: "#d5dfd6",
  arc: "#f6f1e6",
};

export const O: Vec3 = { x: 0, y: 0, z: 0 };

export function arrow(id: string, from: Vec3, to: Vec3, color: string, label?: string): ArrowSpec {
  return { id, from, to, color, label };
}

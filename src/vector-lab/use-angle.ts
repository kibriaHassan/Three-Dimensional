"use client";

import { useState } from "react";
import { fromAngle } from "./math";
import type { Vec3 } from "./types";

export type AnglePair = { magA: number; magB: number; theta: number; phi: number };

export function useAnglePair(initial: AnglePair) {
  const [pair, setPair] = useState(initial);
  const A: Vec3 = { x: pair.magA, y: 0, z: 0 };
  const B = fromAngle(pair.magB, pair.theta, pair.phi);
  return {
    pair,
    A,
    B,
    patch: (next: Partial<AnglePair>) => setPair((prev) => ({ ...prev, ...next })),
    reset: () => setPair(initial),
  };
}

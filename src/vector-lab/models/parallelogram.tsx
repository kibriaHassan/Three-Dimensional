"use client";

import { useState } from "react";
import { ModelShell, Stats, VecEditor } from "../controls";
import { add, angleDeg, mag, show, vecText } from "../math";
import { O, PAL, arrow, type Vec3 } from "../types";

const START_A: Vec3 = { x: 2.2, y: 0.4, z: 0.7 };
const START_B: Vec3 = { x: 0.5, y: 1.8, z: 0.8 };

export function ParallelogramModel() {
  const [a, setA] = useState(START_A);
  const [b, setB] = useState(START_B);
  const r = add(a, b);
  const theta = angleDeg(a, b);

  return (
    <ModelShell
      slug="parallelogram"
      legend={[
        { name: "A", color: PAL.a },
        { name: "B", color: PAL.b },
        { name: "R = A + B", color: PAL.r },
      ]}
      content={{
        arrows: [arrow("A", O, a, PAL.a, "A"), arrow("B", O, b, PAL.b, "B"), arrow("R", O, r, PAL.r, "R")],
        lines: [
          { id: "parallel-b", points: [a, r], color: PAL.b, dashed: true },
          { id: "parallel-a", points: [b, r], color: PAL.a, dashed: true },
        ],
        faces: [{ id: "law", corners: [O, a, r, b], color: PAL.r }],
        markers: [],
      }}
      onResetValues={() => {
        setA(START_A);
        setB(START_B);
      }}
      example={`A = ${vecText(a)}\nB = ${vecText(b)}\nR = A + B = ${vecText(r)}\n|A| = ${show(mag(a))}, |B| = ${show(mag(b))}, |R| = ${show(mag(r))}\nমাঝের কোণ θ = ${theta == null ? "—" : `${show(theta, 1)}°`}`}
    >
      <Stats
        rows={[
          { label: "R = A + B", value: vecText(r), wide: true },
          { label: "|R|", value: show(mag(r)) },
          { label: "θ", value: theta == null ? "—" : `${show(theta, 1)}°` },
        ]}
      />
      <VecEditor title="ভেক্টর A" color={PAL.a} value={a} onChange={setA} />
      <VecEditor title="ভেক্টর B" color={PAL.b} value={b} onChange={setB} />
    </ModelShell>
  );
}

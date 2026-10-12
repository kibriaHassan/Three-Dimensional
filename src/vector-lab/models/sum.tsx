"use client";

import { useState } from "react";
import { ModelShell, Stats, VecEditor } from "../controls";
import { add, mag, neg, show, sub, vecText } from "../math";
import { O, PAL, arrow, type Vec3 } from "../types";

const START_A: Vec3 = { x: 2, y: 0.6, z: 0.4 };
const START_B: Vec3 = { x: 0.4, y: 1.6, z: 1 };

export function SumModel() {
  const [a, setA] = useState(START_A);
  const [b, setB] = useState(START_B);
  const plus = add(a, b);
  const minus = sub(a, b);
  const opposite = neg(b);

  return (
    <ModelShell
      slug="sum"
      legend={[
        { name: "A", color: PAL.a },
        { name: "B", color: PAL.b },
        { name: "−B", color: PAL.neg },
        { name: "A + B", color: PAL.r },
        { name: "A − B", color: PAL.sub },
      ]}
      content={{
        arrows: [
          arrow("A", O, a, PAL.a, "A"),
          arrow("B", O, b, PAL.b, "B"),
          arrow("neg", O, opposite, PAL.neg, "−B"),
          arrow("plus", O, plus, PAL.r, "A+B"),
          arrow("minus", O, minus, PAL.sub, "A−B"),
        ],
        lines: [],
        faces: [],
        markers: [],
      }}
      onResetValues={() => {
        setA(START_A);
        setB(START_B);
      }}
      example={`A = ${vecText(a)}\nB = ${vecText(b)}\nA + B = ${vecText(plus)}, মান ${show(mag(plus))}\n−B = ${vecText(opposite)}\nA − B = A + (−B) = ${vecText(minus)}, মান ${show(mag(minus))}`}
    >
      <Stats
        rows={[
          { label: "A + B", value: vecText(plus), wide: true },
          { label: "A − B", value: vecText(minus), wide: true },
          { label: "|A + B|", value: show(mag(plus)) },
          { label: "|A − B|", value: show(mag(minus)) },
        ]}
      />
      <VecEditor title="ভেক্টর A" color={PAL.a} value={a} onChange={setA} />
      <VecEditor title="ভেক্টর B" color={PAL.b} value={b} onChange={setB} />
    </ModelShell>
  );
}

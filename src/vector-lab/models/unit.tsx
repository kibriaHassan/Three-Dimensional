"use client";

import { useState } from "react";
import { Callout, ModelShell, VecEditor } from "../controls";
import { add, cross, mag, scale, show, unit, vecText } from "../math";
import { O, PAL, arrow, type Vec3 } from "../types";

const START: Vec3 = { x: 1.6, y: 0.9, z: 1.2 };

function side(v: Vec3) {
  const u = unit(v) ?? { x: 1, y: 0, z: 0 };
  const helper = Math.abs(u.y) > 0.85 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  const p = unit(cross(u, helper)) ?? { x: 0, y: 0, z: 1 };
  return scale(p, 0.35);
}

export function UnitModel() {
  const [a, setA] = useState(START);
  const u = unit(a);
  const shift = side(a);

  return (
    <ModelShell
      slug="unit"
      legend={[
        { name: "î", color: PAL.x },
        { name: "ĵ", color: PAL.y },
        { name: "k̂", color: PAL.z },
        { name: "A", color: PAL.a },
        { name: "â", color: PAL.unit },
      ]}
      content={{
        arrows: [
          arrow("i", O, { x: 1, y: 0, z: 0 }, PAL.x, "î"),
          arrow("j", O, { x: 0, y: 1, z: 0 }, PAL.y, "ĵ"),
          arrow("k", O, { x: 0, y: 0, z: 1 }, PAL.z, "k̂"),
          arrow("A", O, a, PAL.a, "A"),
          ...(u ? [arrow("unit", shift, add(shift, u), PAL.unit, "â")] : []),
        ],
        lines: u ? [{ id: "tie", points: [u, add(shift, u)], color: PAL.guide, dashed: true }] : [],
        faces: [],
        markers: u ? [{ id: "one", at: u, color: PAL.unit, label: "১", radius: 0.08 }] : [],
      }}
      onResetValues={() => setA(START)}
      example={
        u
          ? `A = ${vecText(a)}\n|A| = ${show(mag(a))}\nâ = A / |A| = ${vecText(u)}\n|â| = ${show(mag(u))}\nî, ĵ, k̂-এর মান প্রতিটি ১। সাদা তীর একই দিক, দৈর্ঘ্য ১। A-এর গায়ে সাদা বিন্দুও দৈর্ঘ্য ১।`
          : "A-এর মান শূন্য। দিক বোঝা যায় না, তাই একক ভেক্টর নেই। মান একটু বাড়াও।"
      }
    >
      {!u ? <Callout>মান শূন্য। একক ভেক্টর অনির্দিষ্ট।</Callout> : null}
      <VecEditor title="ভেক্টর A" color={PAL.a} value={a} onChange={setA} />
    </ModelShell>
  );
}

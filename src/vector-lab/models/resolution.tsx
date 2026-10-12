"use client";

import { useState } from "react";
import { ModelShell, Slider, Stats } from "../controls";
import { mag, show, vecText } from "../math";
import { O, PAL, arrow, type Vec3 } from "../types";

const START: Vec3 = { x: 1.8, y: 1.3, z: 1.1 };

export function ResolutionModel() {
  const [a, setA] = useState(START);
  const ax = { x: a.x, y: 0, z: 0 };
  const ay = { x: 0, y: a.y, z: 0 };
  const az = { x: 0, y: 0, z: a.z };
  const xy = { x: a.x, y: a.y, z: 0 };

  return (
    <ModelShell
      slug="resolution"
      legend={[
        { name: "A", color: PAL.a },
        { name: "Ax", color: PAL.x },
        { name: "Ay", color: PAL.y },
        { name: "Az", color: PAL.z },
      ]}
      content={{
        arrows: [
          arrow("A", O, a, PAL.a, "A"),
          arrow("Ax", O, ax, PAL.x, "Ax"),
          arrow("Ay", O, ay, PAL.y, "Ay"),
          arrow("Az", O, az, PAL.z, "Az"),
        ],
        lines: [
          { id: "stair-y", points: [ax, xy], color: PAL.y, radius: 0.028 },
          { id: "stair-z", points: [xy, a], color: PAL.z, radius: 0.028 },
        ],
        faces: [],
        markers: [{ id: "back", at: a, color: PAL.unit, label: "ফিরে এল", radius: 0.07 }],
      }}
      onResetValues={() => setA(START)}
      example={`A = ${vecText(a)}\nAx = ${show(a.x)}, Ay = ${show(a.y)}, Az = ${show(a.z)}\nAx î + Ay ĵ + Az k̂ = ${vecText(a)}\nজোড়া লাগানোর পর মাথা আবার A-এর মাথায়। |A| = ${show(mag(a))}`}
    >
      <Stats
        rows={[
          { label: "Ax", value: show(a.x) },
          { label: "Ay", value: show(a.y) },
          { label: "Az", value: show(a.z) },
          { label: "|A|", value: show(mag(a)) },
        ]}
      />
      <Slider label="Ax" value={a.x} min={-3} max={3} onChange={(x) => setA({ ...a, x })} />
      <Slider label="Ay" value={a.y} min={-3} max={3} onChange={(y) => setA({ ...a, y })} />
      <Slider label="Az" value={a.z} min={-3} max={3} onChange={(z) => setA({ ...a, z })} />
    </ModelShell>
  );
}

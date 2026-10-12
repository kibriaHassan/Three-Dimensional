"use client";

import { useState } from "react";
import { ModelShell, Slider, Stats } from "../controls";
import { mag, show, vecText } from "../math";
import { O, PAL, arrow, type LineSpec, type Vec3 } from "../types";

const START = { x: 1.6, y: 1.2, z: 1.4 };

function box(p: Vec3): LineSpec[] {
  const x = { x: p.x, y: 0, z: 0 };
  const y = { x: 0, y: p.y, z: 0 };
  const z = { x: 0, y: 0, z: p.z };
  const xy = { x: p.x, y: p.y, z: 0 };
  const xz = { x: p.x, y: 0, z: p.z };
  const yz = { x: 0, y: p.y, z: p.z };
  return [
    { id: "path-x", points: [O, x, xy, p], color: PAL.guide, dashed: true },
    { id: "path-y", points: [O, y, yz, p], color: PAL.guide, dashed: true },
    { id: "path-z", points: [O, z, xz, p], color: PAL.guide, dashed: true },
  ];
}

export function CoordinateModel() {
  const [p, setP] = useState<Vec3>(START);

  return (
    <ModelShell
      slug="coordinate"
      legend={[
        { name: "+অক্ষের মাথা", color: PAL.x },
        { name: "অবস্থান r", color: PAL.a },
        { name: "বিন্দু P", color: PAL.unit },
      ]}
      content={{
        arrows: [arrow("r", O, p, PAL.a, "r")],
        lines: box(p),
        faces: [],
        markers: [{ id: "p", at: p, color: PAL.unit, label: "P", radius: 0.09 }],
      }}
      onResetValues={() => setP(START)}
      example={`ধরো P${vecText(p)}।\nতাহলে r = ${term(p.x, "î", true)} ${term(p.y, "ĵ")} ${term(p.z, "k̂")}\n|r| = ${show(mag(p))}\nঋণাত্মক উপাংশ মানে বিন্দু সেই অক্ষের উল্টো দিকে।`}
    >
      <Stats
        rows={[
          { label: "P", value: vecText(p), wide: true },
          { label: "|r|", value: show(mag(p)) },
          { label: "অষ্টক", value: octant(p) },
        ]}
      />
      <Slider label="x" value={p.x} min={-3} max={3} onChange={(x) => setP({ ...p, x })} />
      <Slider label="y" value={p.y} min={-3} max={3} onChange={(y) => setP({ ...p, y })} />
      <Slider label="z" value={p.z} min={-3} max={3} onChange={(z) => setP({ ...p, z })} />
    </ModelShell>
  );
}

function term(n: number, unit: string, first = false) {
  const body = `${show(Math.abs(n))} ${unit}`;
  if (n < 0) return `− ${body}`;
  return first ? body : `+ ${body}`;
}

function octant(p: Vec3) {
  if (p.x === 0 || p.y === 0 || p.z === 0) return "অক্ষতলে";
  const x = p.x > 0 ? "+" : "−";
  const y = p.y > 0 ? "+" : "−";
  const z = p.z > 0 ? "+" : "−";
  return `${x}x ${y}y ${z}z`;
}

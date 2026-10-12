"use client";

import { useState } from "react";
import { ModelShell, Slider, Stats, VecEditor } from "../controls";
import { directionOf, fromDirection, mag, show, vecText } from "../math";
import { O, PAL, arrow, type Vec3 } from "../types";

const START: Vec3 = { x: 1.8, y: 1.1, z: 0.9 };
const START_DIR = directionOf(START) ?? { magnitude: 1, azimuth: 30, elevation: 20 };

export function DirectionModel() {
  const [a, setA] = useState(START);
  const [angles, setAngles] = useState({ azimuth: START_DIR.azimuth, elevation: START_DIR.elevation });
  const length = mag(a);

  function fromComponents(next: Vec3) {
    setA(next);
    const live = directionOf(next);
    if (live) setAngles({ azimuth: live.azimuth, elevation: live.elevation });
  }

  function setMagnitude(magnitude: number) {
    setA(fromDirection(magnitude, angles.azimuth, angles.elevation));
  }

  function setAzimuth(azimuth: number) {
    setAngles((prev) => ({ ...prev, azimuth }));
    setA(fromDirection(length, azimuth, angles.elevation));
  }

  function setElevation(elevation: number) {
    setAngles((prev) => ({ ...prev, elevation }));
    setA(fromDirection(length, angles.azimuth, elevation));
  }

  const rebuilt = fromDirection(length, angles.azimuth, angles.elevation);

  return (
    <ModelShell
      slug="direction"
      legend={[
        { name: "A", color: PAL.a },
        { name: "অক্ষ", color: PAL.z },
      ]}
      content={{
        arrows: [arrow("A", O, a, PAL.a, "A")],
        lines: [
          {
            id: "drop",
            points: [O, { x: a.x, y: a.y, z: 0 }, a],
            color: PAL.guide,
            dashed: true,
          },
        ],
        faces: [],
        markers: [],
      }}
      onResetValues={() => {
        setA(START);
        setAngles({ azimuth: START_DIR.azimuth, elevation: START_DIR.elevation });
      }}
      example={`উপাংশে A = ${vecText(a)}\n|A| = ${show(length)}\nα = ${show(angles.azimuth)}°, β = ${show(angles.elevation)}°\nসূত্র থেকে পাওয়া যায় ${vecText(rebuilt)}\nদুই রূপ একই ভেক্টর।`}
    >
      <Stats
        rows={[
          { label: "A", value: vecText(a), wide: true },
          { label: "|A|", value: show(length) },
          { label: "α", value: `${show(angles.azimuth)}°` },
          { label: "β", value: `${show(angles.elevation)}°` },
        ]}
      />
      <div className="grid gap-3 rounded-2xl border border-line bg-paper/70 p-3">
        <p className="text-sm font-bold text-copper-deep">মান ও দিক</p>
        <Slider label="|A|" value={length} min={0} max={Math.max(3, length)} onChange={setMagnitude} />
        <Slider label="দিগন্ত কোণ α" value={angles.azimuth} min={0} max={360} step={0.1} suffix="°" onChange={setAzimuth} />
        <Slider label="উন্নতি কোণ β" value={angles.elevation} min={-90} max={90} step={0.1} suffix="°" onChange={setElevation} />
      </div>
      <VecEditor title="উপাংশ" color={PAL.a} value={a} onChange={fromComponents} showLength={false} />
    </ModelShell>
  );
}

"use client";

import { Callout, ModelShell, PlaneControls, Stats } from "../controls";
import { dot, mag, planeArc, scale, show, unit, vecText } from "../math";
import { useAnglePair } from "../use-angle";
import { O, PAL, arrow } from "../types";

const START = { magA: 2.4, magB: 2, theta: 55, phi: 28 };

export function AngleModel() {
  const { pair, A, B, patch, reset } = useAnglePair(START);
  const product = dot(A, B);
  const formula = mag(A) * mag(B) * Math.cos((pair.theta * Math.PI) / 180);
  const radius = Math.min(0.9, Math.max(0.45, Math.min(mag(A), mag(B)) * 0.4));
  const arc = planeArc(A, B, radius, 1);
  const mid = arc[Math.floor(arc.length / 2)];
  const thetaAt = mid && unit(mid) ? scale(unit(mid)!, mag(mid) + 0.22) : null;

  return (
    <ModelShell
      slug="angle"
      legend={[
        { name: "A", color: PAL.a },
        { name: "B", color: PAL.b },
        { name: "θ", color: PAL.arc },
      ]}
      content={{
        arrows: [arrow("A", O, A, PAL.a, "A"), arrow("B", O, B, PAL.b, "B")],
        lines: arc.length > 1 ? [{ id: "theta", points: arc, color: PAL.arc, radius: 0.03 }] : [],
        faces: [],
        markers: thetaAt ? [{ id: "theta", at: thetaAt, color: PAL.arc, label: "θ", radius: 0.02 }] : [],
      }}
      onResetValues={reset}
      example={`|A| = ${show(pair.magA)}, |B| = ${show(pair.magB)}, θ = ${show(pair.theta, 0)}°\nA = ${vecText(A)}\nB = ${vecText(B)}\n|A||B| cosθ = ${show(pair.magA)} × ${show(pair.magB)} × cos${show(pair.theta, 0)}° = ${show(formula)}\nA · B = ${show(product)}`}
    >
      {pair.theta === 90 ? <Callout>θ = ৯০°, তাই cosθ = ০ এবং A · B = ০</Callout> : null}
      <Stats
        rows={[
          { label: "θ", value: `${show(pair.theta, 0)}°` },
          { label: "A · B", value: show(product) },
          { label: "|A||B| cosθ", value: show(formula), wide: true },
        ]}
      />
      <PlaneControls magA={pair.magA} magB={pair.magB} theta={pair.theta} phi={pair.phi} onChange={patch} />
    </ModelShell>
  );
}

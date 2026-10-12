"use client";

import { useState } from "react";
import { useLang } from "@/components/locale";
import { Callout, ModelShell, PlaneControls, Stats } from "../controls";
import { add, arcEnd, cross, dot, mag, planeArc, scale, show, unit, vecText } from "../math";
import { useAnglePair } from "../use-angle";
import { useGrow } from "../use-grow";
import { O, PAL, arrow } from "../types";

const START = { magA: 2.3, magB: 2, theta: 60, phi: 32 };

export function CrossModel() {
  const { t } = useLang();
  const { pair, A, B, patch, reset } = useAnglePair(START);
  const [play, setPlay] = useState(0);
  const grow = useGrow(play, 1900);
  const c = cross(A, B);
  const shown = scale(c, grow);
  const formula = mag(A) * mag(B) * Math.sin((pair.theta * Math.PI) / 180);
  const radius = Math.min(0.95, Math.max(0.5, Math.min(mag(A), mag(B)) * 0.42));
  const arc = planeArc(A, B, radius, Math.max(grow, 0.02));
  const end = arcEnd(A, B, radius, grow);
  const finger = end && unit(end.tangent) ? add(end.at, scale(unit(end.tangent)!, 0.42)) : null;
  const parallel = mag(c) < 1e-3;

  return (
    <ModelShell
      slug="cross"
      legend={[
        { name: "A", color: PAL.a },
        { name: "B", color: PAL.b },
        { name: "A × B", color: PAL.r },
        { name: "আঙুলের বাঁক", color: PAL.arc },
      ]}
      content={{
        arrows: [
          arrow("A", O, A, PAL.a, "A"),
          arrow("B", O, B, PAL.b, "B"),
          arrow("C", O, shown, PAL.r, "A×B"),
          ...(end && finger && !parallel ? [arrow("hand", end.at, finger, PAL.arc, grow > 0.2 ? "আঙুল" : undefined)] : []),
        ],
        lines: arc.length > 1 ? [{ id: "sweep", points: arc, color: PAL.arc, radius: 0.032 }] : [],
        faces: [],
        markers: [],
      }}
      onResetValues={() => {
        reset();
        setPlay(0);
      }}
      example={`A = ${vecText(A)}\nB = ${vecText(B)}\nθ = ${show(pair.theta, 0)}°\n|A × B| = |A||B| sinθ = ${show(pair.magA)} × ${show(pair.magB)} × sin${show(pair.theta, 0)}° = ${show(formula)}\nA × B = ${vecText(c)}\nA · (A × B) = ${show(dot(A, c))}\nB · (A × B) = ${show(dot(B, c))}\nদুই গুণফলই শূন্য, তাই ফল A ও B-এর লম্ব।`}
    >
      {parallel ? <Callout>sinθ = ০, তাই A × B শূন্য ভেক্টর।</Callout> : null}
      <button type="button" onClick={() => setPlay((value) => value + 1)} className="rounded-full bg-copper px-4 py-2 text-sm font-bold text-white">
        {t("rightHand")}
      </button>
      <Stats
        rows={[
          { label: "A × B", value: vecText(c), wide: true },
          { label: "|A × B|", value: show(mag(c)) },
          { label: "|A||B| sinθ", value: show(formula) },
          { label: "A · (A×B)", value: show(dot(A, c)) },
          { label: "B · (A×B)", value: show(dot(B, c)) },
        ]}
      />
      <PlaneControls magA={pair.magA} magB={pair.magB} theta={pair.theta} phi={pair.phi} onChange={patch} />
    </ModelShell>
  );
}

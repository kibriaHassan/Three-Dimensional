"use client";

import { useLang } from "@/components/locale";
import { Callout, ModelShell, PlaneControls, Stats } from "../controls";
import { dot, mag, planeArc, scale, show, sub, unit, vecText } from "../math";
import { useAnglePair } from "../use-angle";
import { O, PAL, arrow } from "../types";

const START = { magA: 2.4, magB: 2.1, theta: 55, phi: 24 };

export function DotModel() {
  const { t } = useLang();
  const { pair, A, B, patch, reset } = useAnglePair(START);
  const product = dot(A, B);
  const formula = mag(A) * mag(B) * Math.cos((pair.theta * Math.PI) / 180);
  const along = unit(A);
  const proj = along ? scale(along, product / mag(A)) : null;
  const radius = Math.min(0.9, Math.max(0.45, Math.min(mag(A), mag(B)) * 0.4));
  const arc = planeArc(A, B, radius, 1);
  const perpendicular = Math.abs(product) < 5e-4;

  return (
    <ModelShell
      slug="dot"
      legend={[
        { name: "A", color: PAL.a },
        { name: "B", color: PAL.b },
        { name: "A-এর ওপর ছায়া", color: PAL.unit },
      ]}
      content={{
        arrows: [
          arrow("A", O, A, PAL.a, "A"),
          arrow("B", O, B, PAL.b, "B"),
          ...(proj ? [arrow("proj", O, proj, PAL.unit, "ছায়া")] : []),
        ],
        lines: [
          ...(arc.length > 1 ? [{ id: "theta", points: arc, color: PAL.arc, radius: 0.028 }] : []),
          ...(proj && mag(sub(B, proj)) > 0.08 && mag(proj) > 0.08
            ? [{ id: "drop", points: [B, proj], color: PAL.guide, dashed: true }]
            : []),
        ],
        faces: [],
        markers: [],
      }}
      onResetValues={reset}
      example={`A = ${vecText(A)}\nB = ${vecText(B)}\nθ = ${show(pair.theta, 0)}°\nA · B = |A||B| cosθ = ${show(pair.magA)} × ${show(pair.magB)} × ${show(Math.cos((pair.theta * Math.PI) / 180))} = ${show(formula)}\nউপাংশ দিয়েও A · B = ${show(product)}`}
    >
      {perpendicular ? <Callout>দুই ভেক্টর লম্ব। ডট গুণন শূন্য।</Callout> : null}
      <button type="button" onClick={() => patch({ theta: 90 })} className="rounded-full bg-copper px-4 py-2 text-sm font-bold text-white">
        {t("makeRight")}
      </button>
      <Stats
        rows={[
          { label: "A · B", value: show(product) },
          { label: "সূত্রের ফল", value: show(formula) },
          { label: "θ", value: `${show(pair.theta, 0)}°` },
          { label: "cosθ", value: show(Math.cos((pair.theta * Math.PI) / 180)) },
        ]}
      />
      <PlaneControls magA={pair.magA} magB={pair.magB} theta={pair.theta} phi={pair.phi} onChange={patch} />
    </ModelShell>
  );
}

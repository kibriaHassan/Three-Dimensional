"use client";

import { useState } from "react";
import { useLang } from "@/components/locale";
import { ModelShell, Stats, VecEditor } from "../controls";
import { add, mag, scale, show, vecText } from "../math";
import { useGrow } from "../use-grow";
import { O, PAL, arrow, type Vec3 } from "../types";

const START_A: Vec3 = { x: 2.1, y: 0.35, z: 0.45 };
const START_B: Vec3 = { x: 0.45, y: 1.7, z: 0.85 };

export function TriangleModel() {
  const [a, setA] = useState(START_A);
  const [b, setB] = useState(START_B);
  const [play, setPlay] = useState(0);
  const { t } = useLang();
  const grow = useGrow(play, 1600);
  const sum = add(a, b);
  const bTip = add(a, b);
  const rTip = scale(sum, grow);

  return (
    <ModelShell
      slug="triangle"
      legend={[
        { name: "A", color: PAL.a },
        { name: "B, A-এর মাথায়", color: PAL.b },
        { name: "লব্ধি R", color: PAL.r },
      ]}
      content={{
        arrows: [arrow("A", O, a, PAL.a, "A"), arrow("B", a, bTip, PAL.b, "B"), arrow("R", O, rTip, PAL.r, "R")],
        lines: [],
        faces: grow > 0.98 ? [{ id: "tri", corners: [O, a, bTip], color: PAL.r }] : [],
        markers: [],
      }}
      onResetValues={() => {
        setA(START_A);
        setB(START_B);
        setPlay(0);
      }}
      example={`A আগে আঁকা, তারপর B।\nA = ${vecText(a)}\nB = ${vecText(b)}\nR = A + B = ${vecText(sum)}\n|R| = ${show(mag(sum))}\nলব্ধি শুরু থেকে B-এর মাথা পর্যন্ত।`}
    >
      <button type="button" onClick={() => setPlay((value) => value + 1)} className="rounded-full bg-copper px-4 py-2 text-sm font-bold text-white">
        {t("playResult")}
      </button>
      <Stats
        rows={[
          { label: "R = A + B", value: vecText(sum), wide: true },
          { label: "|R|", value: show(mag(sum)) },
          { label: "আঁকার অগ্রগতি", value: `${show(grow * 100, 0)}%` },
        ]}
      />
      <VecEditor title="ভেক্টর A" color={PAL.a} value={a} onChange={setA} />
      <VecEditor title="ভেক্টর B" color={PAL.b} value={b} onChange={setB} />
    </ModelShell>
  );
}

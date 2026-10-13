"use client";

import { useEffect, useState } from "react";
import { toBn } from "@/vector-lab/math";
import { bnNum } from "./format";
import { GraphPlot } from "./plot";
import type { Curve, GraphSpec, Probe } from "./types";

const sourceLabel = {
  book: "পাঠ্যবইয়ের গ্রাফ",
  extra: "সূত্রভিত্তিক অতিরিক্ত গ্রাফ",
  schematic: "পাঠ্যবইয়ের নকশা",
} as const;

function digitsOf(step: number) {
  if (step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return 3;
}

export function GraphCard({ spec, index }: { spec: GraphSpec; index: number }) {
  const [params, setParams] = useState(spec.base);
  const [compare, setCompare] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [pick, setPick] = useState<Probe | null>(null);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setTime((value) => value + dt);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const live = spec.build(params, time);
  const curves: Curve[] = [];
  if (compare) {
    const baseView = spec.build(spec.base, 0);
    for (const item of baseView.curves) {
      if (item.dots) continue;
      curves.push({
        ...item,
        id: `${item.id}-compare`,
        name: `${item.name} (তুলনা)`,
        dashed: true,
        color: "#7d8a84",
      });
    }
  }
  curves.push(...live.curves);

  function reset() {
    setParams(spec.base);
    setTime(0);
    setPlaying(false);
    setCompare(false);
    setPick(null);
  }

  return (
    <section id={`graph-${spec.id}`} className="scroll-mt-24 overflow-hidden rounded-[28px] border border-[#1c2a24] bg-white shadow-[7px_7px_0_#c4623a]">
      <header className="flex flex-wrap items-start justify-between gap-3 bg-[#10161d] px-4 py-3 text-[#f6f1e6]">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#f0d48a]">{sourceLabel[spec.source]}</p>
          <h2 className="mt-1 font-serif text-xl leading-tight sm:text-2xl">
            <span className="text-copper">{toBn(index)}.</span> {spec.title}
          </h2>
        </div>
        <p className="max-w-xs font-serif text-sm leading-snug text-[#f0d48a] sm:text-base">{spec.formula}</p>
      </header>
      <div className="grid gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0">
          <p className="mb-1 text-center text-xs font-bold">
            {spec.yName} <span className="font-semibold text-muted">({spec.ySymbol})</span>
          </p>
          {curves.some((item) => item.name) ? (
            <ul className="mb-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] font-bold text-muted">
              {curves.map((item) => (
                <li key={item.id} className="flex items-center gap-1.5">
                  <span className="inline-block w-4 border-t-2" style={{ borderColor: item.color, borderStyle: item.dashed ? "dashed" : "solid" }} />
                  {item.name}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="rounded-[20px] border-2 border-[#10161d] bg-[#fbfaf6]">
            <GraphPlot
              curves={curves}
              guides={live.guides}
              xSymbol={spec.xSymbol}
              ySymbol={spec.ySymbol}
              fillArea={spec.fillArea}
              origin={spec.origin}
              label={`${spec.yName} বনাম ${spec.xName}. ${spec.formula}`}
              marker={pick}
              onPick={setPick}
            />
          </div>
          <p className="mt-1 text-center text-xs font-bold">
            {spec.xName} <span className="font-semibold text-muted">({spec.xSymbol})</span>
          </p>
          {spec.knobs.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {spec.knobs.map((item) => {
                const digits = digitsOf(item.step);
                return (
                  <label key={item.key} className="grid gap-1 text-sm">
                    <span className="flex items-center justify-between gap-3 font-semibold">
                      <span>{item.label}</span>
                      <span className="font-serif text-copper-deep">
                        {bnNum(params[item.key] ?? item.min, digits)} {item.unit}
                      </span>
                    </span>
                    <input
                      className="vec-range"
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={params[item.key] ?? item.min}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setParams((current) => ({ ...current, [item.key]: value }));
                        setPick(null);
                      }}
                    />
                  </label>
                );
              })}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={reset} className="rounded-full border border-ink bg-white px-3 py-1.5 text-sm font-bold">
              রিসেট
            </button>
            {spec.knobs.length > 0 ? (
              <button
                type="button"
                aria-pressed={compare}
                onClick={() => setCompare((value) => !value)}
                className={`rounded-full px-3 py-1.5 text-sm font-bold ${compare ? "bg-ink text-paper-2" : "border border-line bg-white"}`}
              >
                তুলনা
              </button>
            ) : null}
            {spec.animate ? (
              <button type="button" aria-pressed={playing} onClick={() => setPlaying((value) => !value)} className="rounded-full bg-ink px-3 py-1.5 text-sm font-bold text-paper-2">
                {playing ? "থামো" : "চালাও"}
              </button>
            ) : null}
          </div>
        </div>
        <dl className="grid content-start gap-2 text-sm leading-relaxed">
          <div className="rounded-2xl bg-[#10161d] px-3 py-2 text-[#f6f1e6]">
            <dt className="text-[11px] font-bold tracking-wide text-[#f0d48a]">হিসাব</dt>
            <dd className="mt-0.5">{live.calc}</dd>
          </div>
          <div className="rounded-2xl bg-paper px-3 py-2">
            <dt className="text-[11px] font-bold tracking-wide text-copper-deep">শর্ত</dt>
            <dd>{spec.condition}</dd>
          </div>
          <div className="rounded-2xl border border-line px-3 py-2">
            <dt className="text-[11px] font-bold tracking-wide text-muted">ব্যাখ্যা</dt>
            <dd>{spec.explain}</dd>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-line px-3 py-2">
              <dt className="text-[11px] font-bold tracking-wide text-muted">ঢাল</dt>
              <dd>{spec.slope}</dd>
            </div>
            <div className="rounded-2xl border border-line px-3 py-2">
              <dt className="text-[11px] font-bold tracking-wide text-muted">ক্ষেত্রফল</dt>
              <dd>{spec.area}</dd>
            </div>
          </div>
          <div className="rounded-2xl border border-line px-3 py-2">
            <dt className="text-[11px] font-bold tracking-wide text-muted">বৈজ্ঞানিক তাৎপর্য</dt>
            <dd>{spec.meaning}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

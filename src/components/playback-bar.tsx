"use client";

import { useEffect, useState, type RefObject } from "react";
import { formatClock, toBn } from "@/lab/kit";
import type { Demo } from "@/lib/types";
import type { LabViewer } from "./lab-stage";

type Props = {
  demo: Demo;
  viewerRef: RefObject<LabViewer | null>;
  playing: boolean;
  onPlaying: (playing: boolean) => void;
  clockRef: RefObject<HTMLSpanElement | null>;
  rangeRef: RefObject<HTMLInputElement | null>;
  scrubbing: RefObject<boolean>;
  resumeAfterScrub: RefObject<boolean>;
  onStep: (dir: number) => void;
};

export function PlaybackBar({
  demo,
  viewerRef,
  playing,
  onPlaying,
  clockRef,
  rangeRef,
  scrubbing,
  resumeAfterScrub,
  onStep,
}: Props) {
  const [speed, setSpeed] = useState(1);
  const [spinSpeed, setSpinSpeed] = useState(0.7);

  useEffect(() => {
    const initialSpin = demo.spin === false ? 0 : 0.7;
    setSpeed(1);
    setSpinSpeed(initialSpin);
    viewerRef.current?.setSpeed(1);
    viewerRef.current?.setSpinSpeed(initialSpin);
  }, [demo.id, viewerRef]);

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-3 py-2.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={playing}
          onClick={() => {
            const next = viewerRef.current?.toggle();
            if (typeof next === "boolean") onPlaying(next);
          }}
          className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-ink"
        >
          {playing ? "থামাও" : "চালাও"}
        </button>
        <input
          ref={rangeRef}
          aria-label="সময়রেখা"
          type="range"
          min={0}
          max={1000}
          defaultValue={0}
          onPointerDown={() => {
            scrubbing.current = true;
            resumeAfterScrub.current = viewerRef.current?.playing ?? false;
            viewerRef.current?.pause();
            viewerRef.current?.setScrubbing(true);
          }}
          onInput={(event) => {
            const next = (Number(event.currentTarget.value) / 1000) * demo.duration;
            viewerRef.current?.setTime(next);
            if (clockRef.current) clockRef.current.textContent = `${formatClock(next)} / ${formatClock(demo.duration)}`;
          }}
          onPointerUp={() => {
            scrubbing.current = false;
            viewerRef.current?.setScrubbing(false);
            if (resumeAfterScrub.current) viewerRef.current?.play();
          }}
          className="min-w-0 flex-1 accent-copper"
        />
        <span ref={clockRef} className="w-[7.2rem] shrink-0 text-right text-xs text-white tabular-nums sm:text-sm">
          {formatClock(0)} / {formatClock(demo.duration)}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-xs text-white">
          <span className="w-14 shrink-0 font-bold">গতি {toBn(speed)}×</span>
          <input
            aria-label="অ্যানিমেশনের গতি"
            type="range"
            min={0.4}
            max={2}
            step={0.1}
            value={speed}
            onChange={(event) => {
              const next = Number(event.currentTarget.value);
              setSpeed(next);
              viewerRef.current?.setSpeed(next);
            }}
            className="min-w-0 flex-1 accent-copper"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-white">
          <span className="w-16 shrink-0 font-bold">{spinSpeed < 0.05 ? "ঘূর্ণন বন্ধ" : "ঘূর্ণন"}</span>
          <input
            aria-label="ঘূর্ণনের গতি"
            type="range"
            min={0}
            max={1.6}
            step={0.1}
            value={spinSpeed}
            onChange={(event) => {
              const next = Number(event.currentTarget.value);
              setSpinSpeed(next);
              viewerRef.current?.setSpinSpeed(next);
            }}
            className="min-w-0 flex-1 accent-copper"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            viewerRef.current?.restart();
            viewerRef.current?.play();
            onPlaying(true);
          }}
          className="rounded-full border border-white/20 px-2.5 py-1 text-sm text-white"
        >
          আবার
        </button>
        <button
          type="button"
          onClick={() => viewerRef.current?.resetCamera()}
          className="rounded-full border border-white/20 px-2.5 py-1 text-sm text-white"
        >
          ফ্রেম
        </button>
        <button type="button" onClick={() => onStep(-1)} className="rounded-full border border-white/20 px-2.5 py-1 text-sm text-white">
          আগের
        </button>
        <button type="button" onClick={() => onStep(1)} className="rounded-full border border-white/20 px-2.5 py-1 text-sm text-white">
          পরের
        </button>
      </div>
    </div>
  );
}

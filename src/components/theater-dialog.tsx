"use client";

import { useEffect, useRef, useState } from "react";
import { formatClock } from "@/lab/kit";
import type { Demo } from "@/lib/types";
import { LabStage, type LabViewer } from "./lab-stage";

type Props = {
  demo: Demo;
  onClose: () => void;
  onStep: (dir: number) => void;
};

function activeStep(demo: Demo, time: number) {
  let current = demo.steps[0];
  for (const step of demo.steps) {
    if (time >= step.t) current = step;
  }
  return current;
}

export function TheaterDialog({ demo, onClose, onStep }: Props) {
  const viewerRef = useRef<LabViewer | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [spin, setSpin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrubbing = useRef(false);
  const resumeAfterScrub = useRef(false);
  const onCloseRef = useRef(onClose);
  const onStepRef = useRef(onStep);
  onCloseRef.current = onClose;
  onStepRef.current = onStep;

  useEffect(() => {
    setTime(0);
    setPlaying(true);
    setError(null);
  }, [demo.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
      if (
        event.key === " " &&
        event.target instanceof HTMLElement &&
        event.target.tagName !== "INPUT" &&
        event.target.tagName !== "BUTTON"
      ) {
        event.preventDefault();
        const next = viewerRef.current?.toggle();
        if (typeof next === "boolean") setPlaying(next);
      }
      if (event.key === "ArrowRight") onStepRef.current(1);
      if (event.key === "ArrowLeft") onStepRef.current(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stepNow = activeStep(demo, time);

  return (
    <div className="fixed inset-0 z-40 flex bg-ink/90 p-2 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scene-title"
        className="mx-auto grid h-full min-h-0 w-full max-w-[1200px] overflow-hidden rounded-[28px] bg-paper-2 shadow-2xl lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.78fr)]"
      >
        <div className="flex min-h-[52dvh] flex-col bg-lab lg:min-h-0">
          <div className="relative min-h-0 flex-1">
            <LabStage
              ref={viewerRef}
              demo={demo}
              active
              autoplay
              shadow={2048}
              onTick={(nextTime, _duration, nextPlaying, nextError) => {
                if (!scrubbing.current) setTime(nextTime);
                setPlaying(nextPlaying);
                setError(nextError ? "এই দৃশ্য আঁকতে সমস্যা হয়েছে। অন্য প্রমাণ খুলে দেখো।" : null);
              }}
            />
            <p className="pointer-events-none absolute top-3 left-3 z-10 rounded-full bg-paper-2 px-3 py-1 text-sm font-bold text-ink">
              {stepNow?.title}
            </p>
            <p className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-black/45 px-3 py-1 text-xs text-white">
              টেনে ঘোরাও
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 border-t border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-pressed={playing}
                onClick={() => {
                  const next = viewerRef.current?.toggle();
                  if (typeof next === "boolean") setPlaying(next);
                }}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-ink"
              >
                {playing ? "থামাও" : "চালাও"}
              </button>
              <input
                aria-label="সময়রেখা"
                type="range"
                min={0}
                max={1000}
                value={Math.round((time / demo.duration) * 1000)}
                onPointerDown={() => {
                  scrubbing.current = true;
                  resumeAfterScrub.current = viewerRef.current?.playing ?? false;
                  viewerRef.current?.pause();
                  viewerRef.current?.setScrubbing(true);
                }}
                onInput={(event) => {
                  const next = (Number(event.currentTarget.value) / 1000) * demo.duration;
                  viewerRef.current?.setTime(next);
                  setTime(next);
                }}
                onPointerUp={() => {
                  scrubbing.current = false;
                  viewerRef.current?.setScrubbing(false);
                  if (resumeAfterScrub.current) viewerRef.current?.play();
                }}
                className="min-w-0 flex-1 accent-copper"
              />
              <span className="w-[7.2rem] shrink-0 text-right text-sm text-white tabular-nums">
                {formatClock(time)} / {formatClock(demo.duration)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                [0.5, "০.৫×"],
                [1, "১×"],
                [1.6, "১.৬×"],
              ].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={speed === value}
                  onClick={() => {
                    const next = Number(value);
                    setSpeed(next);
                    viewerRef.current?.setSpeed(next);
                  }}
                  className={`rounded-full border px-2.5 py-1 text-sm ${speed === value ? "border-white bg-white text-ink" : "border-white/20 text-white"}`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const next = !spin;
                  setSpin(next);
                  viewerRef.current?.setSpin(next);
                }}
                className="rounded-full border border-white/20 px-2.5 py-1 text-sm text-white"
              >
                {spin ? "ঘোরা বন্ধ" : "ঘুরিয়ে দেখাও"}
              </button>
              <button
                type="button"
                onClick={() => {
                  viewerRef.current?.restart();
                  viewerRef.current?.play();
                  setPlaying(true);
                }}
                className="rounded-full border border-white/20 px-2.5 py-1 text-sm text-white"
              >
                আবার
              </button>
              <button type="button" onClick={() => viewerRef.current?.resetCamera()} className="rounded-full border border-white/20 px-2.5 py-1 text-sm text-white">
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
        </div>

        <aside className="relative max-h-[48dvh] min-h-0 overflow-y-auto px-5 py-5 sm:px-6 lg:max-h-none">
          <button type="button" onClick={onClose} className="sticky top-0 float-right rounded-full border border-line bg-paper-2 px-3 py-1 text-sm font-bold">
            বন্ধ
          </button>
          <p className="text-sm font-bold text-copper-deep">
            অধ্যায় {demo.chapterNo} · {demo.chapterName}
          </p>
          <h2 id="scene-title" className="clear-both mt-1 font-serif text-4xl">
            {demo.title}
          </h2>
          <p className="mt-3 text-lg leading-relaxed">{demo.proof}</p>
          <p className="mt-4 rounded-2xl border border-line bg-white px-4 py-3 font-serif text-3xl">{demo.formula}</p>
          <p className="mt-2 text-muted">{demo.verbal}</p>
          <ol className="mt-4 grid gap-2">
            {demo.steps.map((stepItem, index) => {
              const on = stepNow === stepItem;
              return (
                <li key={stepItem.title} className={`rounded-2xl border px-3 py-3 ${on ? "border-copper bg-[#fff7f1]" : "border-line bg-white/50"}`}>
                  <strong>
                    {index + 1}. {stepItem.title}
                  </strong>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{stepItem.body}</p>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-paper-2">{demo.note}</p>
          {error ? <p className="mt-3 font-bold text-copper-deep">{error}</p> : null}
        </aside>
      </div>
    </div>
  );
}

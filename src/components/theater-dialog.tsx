"use client";

import { useEffect, useRef, useState } from "react";
import { formatClock } from "@/lab/kit";
import { syncVoice, unlockVoice } from "@/lab/sound";
import type { Demo } from "@/lib/types";
import { LabStage, type LabViewer } from "./lab-stage";
import { LessonPanel, stepIndexAt } from "./lesson-panel";
import { PlaybackBar } from "./playback-bar";
import { SceneMic } from "./scene-mic";

type Props = {
  demo: Demo;
  onClose: () => void;
  onStep: (dir: number) => void;
};

export function TheaterDialog({ demo, onClose, onStep }: Props) {
  const viewerRef = useRef<LabViewer | null>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const scrubbing = useRef(false);
  const resumeAfterScrub = useRef(false);
  const onCloseRef = useRef(onClose);
  const onStepRef = useRef(onStep);
  const [playing, setPlaying] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [handsMode, setHandsMode] = useState(false);
  const [handsHint, setHandsHint] = useState("তীর ধরে টেনে অবস্থান বদলাও");
  onCloseRef.current = onClose;
  onStepRef.current = onStep;

  useEffect(() => {
    setPlaying(true);
    setStepIndex(0);
    setError(null);
    setHandsMode(false);
    viewerRef.current?.setHands(false);
    if (rangeRef.current) rangeRef.current.value = "0";
  }, [demo.id]);

  useEffect(() => {
    if (playing && handsMode) {
      viewerRef.current?.setHands(false);
      setHandsMode(false);
    }
  }, [playing, handsMode]);

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

  return (
    <div className="fixed inset-0 z-40 flex bg-ink/90 p-2 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scene-title"
        className="mx-auto flex h-full min-h-0 w-full max-w-[1200px] flex-col overflow-hidden rounded-[28px] bg-paper-2 shadow-2xl lg:grid lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.78fr)]"
      >
        <div className="flex h-[52dvh] shrink-0 flex-col bg-lab lg:h-auto lg:min-h-0 lg:flex-1">
          <div className="relative min-h-0 flex-1 overflow-hidden" onPointerDown={() => unlockVoice()}>
            <LabStage
              ref={viewerRef}
              demo={demo}
              active
              autoplay
              onTick={(nextTime, duration, nextPlaying, nextError) => {
                if (!scrubbing.current && rangeRef.current) {
                  rangeRef.current.value = String(Math.round((nextTime / duration) * 1000));
                }
                if (clockRef.current) {
                  const shown = String(Math.floor(nextTime));
                  if (clockRef.current.dataset.mark !== shown) {
                    clockRef.current.dataset.mark = shown;
                    clockRef.current.textContent = `${formatClock(nextTime)} / ${formatClock(duration)}`;
                  }
                }
                const index = stepIndexAt(demo, nextTime);
                setStepIndex((prev) => (prev === index ? prev : index));
                setPlaying((prev) => (prev === nextPlaying ? prev : nextPlaying));
                setError(nextError ? "এই দৃশ্য আঁকতে সমস্যা হয়েছে। অন্য প্রমাণ খুলে দেখো।" : null);
                try {
                  syncVoice(demo.id, nextTime, nextPlaying && !scrubbing.current);
                } catch {
                  /* সুর আটকালে ছবি থেমে যাবে না */
                }
              }}
            />
            <SceneMic />
            <div className="absolute top-3 left-3 z-20 flex rounded-full bg-black/55 p-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              <button
                type="button"
                aria-pressed={!handsMode}
                onClick={() => {
                  viewerRef.current?.setHands(false);
                  setHandsMode(false);
                  viewerRef.current?.play();
                  setPlaying(true);
                }}
                className={`rounded-full px-3 py-2 ${handsMode ? "text-white/75" : "bg-paper-2 text-ink"}`}
              >
                চলছে
              </button>
              <button
                type="button"
                aria-pressed={handsMode}
                onClick={() => {
                  viewerRef.current?.pause();
                  setPlaying(false);
                  viewerRef.current?.setHands(true);
                  setHandsHint(viewerRef.current?.getHandsHint() || "তীর ধরে টেনে অবস্থান বদলাও");
                  setHandsMode(true);
                }}
                className={`rounded-full px-3 py-2 ${handsMode ? "bg-copper text-white" : "text-white/75"}`}
              >
                নাড়াও
              </button>
            </div>
            <p className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[78%] rounded-full bg-black/45 px-3 py-1 text-xs text-white">
              {handsMode ? handsHint : "এক আঙুলে ঘোরাও · খালি জায়গায় ঘোরো"}
            </p>
          </div>
          <PlaybackBar
            demo={demo}
            viewerRef={viewerRef}
            playing={playing}
            onPlaying={setPlaying}
            clockRef={clockRef}
            rangeRef={rangeRef}
            scrubbing={scrubbing}
            resumeAfterScrub={resumeAfterScrub}
            onStep={onStep}
          />
        </div>
        <LessonPanel demo={demo} stepIndex={stepIndex} error={error} onClose={onClose} />
      </div>
    </div>
  );
}

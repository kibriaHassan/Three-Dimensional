"use client";

import { useRef } from "react";
import { syncVoice, unlockVoice } from "@/lab/sound";
import type { Demo } from "@/lib/types";
import { LabStage, type LabViewer } from "./lab-stage";
import { SceneMic } from "./scene-mic";

type Props = {
  demo: Demo;
  active: boolean;
  onOpen: () => void;
};

export function HeroStage({ demo, active, onOpen }: Props) {
  const viewerRef = useRef<LabViewer | null>(null);

  return (
    <div>
      <div
        className="relative h-[min(68dvh,500px)] overflow-hidden rounded-[28px] bg-lab shadow-[0_24px_60px_rgba(20,33,28,0.18)]"
        onPointerDown={() => {
          if (active) unlockVoice();
        }}
      >
        <LabStage
          ref={viewerRef}
          demo={demo}
          active={active}
          autoplay
          onTick={(time, _duration, playing) => {
            if (!active) return;
            syncVoice(demo.id, time, playing);
          }}
        />
        <SceneMic />
        <p className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-[70%] rounded-full bg-black/50 px-3 py-1 text-xs text-white">
          এক আঙুলে ঘোরাও · দুই আঙুলে কাছে আনো
        </p>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">এখন চলছে</p>
          <h2 className="font-serif text-2xl">{demo.title}</h2>
          <p className="mt-1 font-serif text-xl text-copper-deep">{demo.formula}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{demo.verbal}</p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper-2 hover:bg-copper-deep"
        >
          পূর্ণ দৃশ্য
        </button>
      </div>
    </div>
  );
}

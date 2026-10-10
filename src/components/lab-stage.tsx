"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createViewer } from "@/lab/kit";
import type { Demo } from "@/lib/types";

export type LabViewer = ReturnType<typeof createViewer>;

type Props = {
  demo: Demo | null;
  active?: boolean;
  autoplay?: boolean;
  shadow?: number;
  onTick?: (time: number, duration: number, playing: boolean, error: unknown) => void;
};

export const LabStage = forwardRef<LabViewer | null, Props>(function LabStage(
  { demo, active = true, autoplay = true, shadow = 1024, onTick },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<LabViewer | null>(null);
  const onTickRef = useRef(onTick);
  const [ready, setReady] = useState(0);
  onTickRef.current = onTick;

  useImperativeHandle(ref, () => viewerRef.current as LabViewer, [ready]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    canvas.className = "block h-full w-full touch-none";
    host.appendChild(canvas);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let viewer;
    try {
      viewer = createViewer(host, {
        autoplay: autoplay && !reduce,
        spin: !reduce,
        shadow,
        pixelRatio: shadow > 1024 ? 1.75 : 1.5,
      });
    } catch (error) {
      host.dataset.labError = error instanceof Error ? error.message : String(error);
      canvas.remove();
      return;
    }
    viewer.onTick = (time: number, duration: number, playing: boolean, error: unknown) => {
      onTickRef.current?.(time, duration, playing, error);
    };
    viewerRef.current = viewer;
    if (active) viewer.start();
    setReady(1);
    return () => {
      viewer.dispose();
      canvas.remove();
      viewerRef.current = null;
    };
    // The WebGL viewer is created once per canvas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !demo) return;
    viewer.load(demo);
    viewer.resize();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (autoplay && !reduce) viewer.play();
    else viewer.pause();
  }, [demo, autoplay]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    if (active) {
      viewer.start();
      requestAnimationFrame(() => viewer.resize());
    } else {
      viewer.stop();
    }
  }, [active, ready]);

  return <div ref={hostRef} className="absolute inset-0" />;
});

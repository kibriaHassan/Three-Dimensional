"use client";

import { useEffect, useRef } from "react";
import { VectorWorld } from "./scene";
import type { SceneContent } from "./types";

export function VectorViewport({ content, resetSignal }: { content: SceneContent; resetSignal: number }) {
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<VectorWorld | null>(null);
  const latest = useRef(content);
  latest.current = content;
  const signature = JSON.stringify(content);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const next = new VectorWorld(node);
    world.current = next;
    next.setContent(latest.current);
    return () => {
      next.dispose();
      world.current = null;
    };
  }, []);

  useEffect(() => {
    world.current?.setContent(latest.current);
  }, [signature]);

  useEffect(() => {
    if (resetSignal > 0) world.current?.resetCamera();
  }, [resetSignal]);

  return <div ref={host} className="absolute inset-0" />;
}

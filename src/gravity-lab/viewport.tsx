"use client";

import { useEffect, useRef } from "react";
import { GravityWorld, type ViewState } from "./scene";

export function GravityViewport({
  state,
  resetClock,
  resetCamera,
}: {
  state: ViewState;
  resetClock: number;
  resetCamera: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<GravityWorld | null>(null);
  const latest = useRef(state);
  latest.current = state;
  const signature = JSON.stringify(state);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const next = new GravityWorld(node);
    world.current = next;
    next.setState(latest.current);
    return () => {
      next.dispose();
      world.current = null;
    };
  }, []);

  useEffect(() => {
    world.current?.setState(latest.current);
  }, [signature]);

  useEffect(() => {
    if (resetClock > 0) world.current?.resetTime();
  }, [resetClock]);

  useEffect(() => {
    if (resetCamera > 0) world.current?.resetCamera();
  }, [resetCamera]);

  return <div ref={host} className="absolute inset-0" />;
}

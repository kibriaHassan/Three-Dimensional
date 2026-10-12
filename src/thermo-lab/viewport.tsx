"use client";

import { useEffect, useRef } from "react";
import { ThermoWorld, type ViewState } from "./scene";

export function ThermoViewport({
  state,
  resetClock,
  resetCamera,
}: {
  state: ViewState;
  resetClock: number;
  resetCamera: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<ThermoWorld | null>(null);
  const latest = useRef(state);
  latest.current = state;
  const signature = JSON.stringify(state);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const next = new ThermoWorld(node);
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

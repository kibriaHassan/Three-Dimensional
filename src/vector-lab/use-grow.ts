"use client";

import { useEffect, useState } from "react";

export function useGrow(token: number, ms = 1700) {
  const [grow, setGrow] = useState(1);

  useEffect(() => {
    if (token === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setGrow(1);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setGrow(1 - (1 - t) ** 3);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    setGrow(0);
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [token, ms]);

  return grow;
}

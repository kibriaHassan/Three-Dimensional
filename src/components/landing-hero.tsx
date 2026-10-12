"use client";

import { useEffect, useRef } from "react";
import { useLang } from "./locale";
import type { Board } from "./site-bar";

const zones: { board: Board; title: "zone1" | "zone2" | "zone3"; text: "zone1Text" | "zone2Text" | "zone3Text" }[] = [
  { board: "paper-1", title: "zone1", text: "zone1Text" },
  { board: "paper-2", title: "zone2", text: "zone2Text" },
  { board: "ssc", title: "zone3", text: "zone3Text" },
];

export function LandingHero({ onEnter }: { onEnter: (board: Board) => void }) {
  const { t } = useLang();

  return (
    <section className="relative isolate mx-auto mt-4 min-h-[min(78dvh,680px)] max-w-6xl overflow-hidden rounded-[32px] bg-lab shadow-[0_24px_60px_rgba(16,22,29,0.18)]">
      <Field />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#10161d]/88 via-[#10161d]/55 to-[#10161d]/20" />
      <div className="relative z-10 flex min-h-[min(78dvh,680px)] flex-col justify-end px-5 py-8 sm:px-8 sm:py-10">
        <p className="text-xs font-bold tracking-[0.16em] text-[#f0d48a]">{t("heroKicker")}</p>
        <h1 className="mt-3 max-w-full font-sans text-4xl font-extrabold leading-none tracking-tight text-[#f6f1e6] sm:text-6xl lg:text-7xl">
          <span className="text-copper">3d</span>sciencezone
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-lg">{t("heroLead")}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {zones.map((zone) => (
            <button
              key={zone.board}
              type="button"
              onClick={() => onEnter(zone.board)}
              className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 text-left text-[#f6f1e6] backdrop-blur-md transition hover:border-white/30 hover:bg-white/16"
            >
              <span className="block font-serif text-2xl leading-tight">{t(zone.title)}</span>
              <span className="mt-1 block text-sm leading-relaxed text-white/75">{t(zone.text)}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx = context;
    const surface = canvas;
    const host = parent;
    let frame = 0;
    let alive = true;
    let queued = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots = Array.from({ length: 36 }, (_, index) => ({
      x: (index * 97) % 1000,
      y: (index * 53) % 700,
      r: 0.8 + (index % 4) * 0.45,
      v: 8 + (index % 5) * 4,
    }));

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      surface.width = Math.floor(width * dpr);
      surface.height = Math.floor(height * dpr);
      surface.style.width = `${width}px`;
      surface.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function paint(now: number) {
      const width = host.clientWidth;
      const height = host.clientHeight;
      const time = reduce ? 1.4 : now / 1000;
      const sky = ctx.createLinearGradient(0, 0, width, height);
      sky.addColorStop(0, "#10161d");
      sky.addColorStop(0.62, "#16262b");
      sky.addColorStop(1, "#1a2420");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const copper = ctx.createRadialGradient(width * 0.82, height * 0.28, 8, width * 0.72, height * 0.34, width * 0.48);
      copper.addColorStop(0, "rgba(196,98,58,0.34)");
      copper.addColorStop(1, "rgba(196,98,58,0)");
      ctx.fillStyle = copper;
      ctx.fillRect(0, 0, width, height);

      const teal = ctx.createRadialGradient(width * 0.12, height * 0.82, 8, width * 0.18, height * 0.72, width * 0.36);
      teal.addColorStop(0, "rgba(26,165,138,0.22)");
      teal.addColorStop(1, "rgba(26,165,138,0)");
      ctx.fillStyle = teal;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(244,239,228,0.09)";
      ctx.lineWidth = 1;
      const horizon = height * 0.62;
      for (let row = 0; row < 12; row += 1) {
        const depth = row / 12;
        const y = horizon + depth ** 1.55 * (height - horizon + 24);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let col = -7; col <= 7; col += 1) {
        ctx.beginPath();
        ctx.moveTo(width * 0.62 + col * 10, horizon - 8);
        ctx.lineTo(width * 0.62 + col * width * 0.11, height + 8);
        ctx.stroke();
      }

      const ribbons = [
        { y: height * 0.34, amp: Math.min(54, height * 0.08), k: 0.0075, speed: 1.15, color: "rgba(240,212,138,0.92)", width: 2.4 },
        { y: height * 0.46, amp: Math.min(40, height * 0.06), k: 0.011, speed: -0.82, color: "rgba(126,182,255,0.8)", width: 1.7 },
        { y: height * 0.57, amp: Math.min(34, height * 0.05), k: 0.006, speed: 0.62, color: "rgba(26,165,138,0.85)", width: 1.8 },
      ];
      for (const ribbon of ribbons) {
        ctx.beginPath();
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = ribbon.width;
        for (let x = 0; x <= width; x += 3) {
          const y = ribbon.y + Math.sin(x * ribbon.k + time * ribbon.speed) * ribbon.amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        for (let index = 0; index < 7; index += 1) {
          const x = (index * (width / 6) + time * ribbon.speed * 36) % width;
          const y = ribbon.y + Math.sin(x * ribbon.k + time * ribbon.speed) * ribbon.amp;
          ctx.beginPath();
          ctx.fillStyle = ribbon.color;
          ctx.arc(x, y, 3.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const originX = width * 0.8;
      const originY = height * 0.3;
      ctx.strokeStyle = "rgba(246,241,230,0.2)";
      for (const radius of [42, 74, 108]) {
        ctx.beginPath();
        ctx.ellipse(originX, originY, radius, radius * 0.4, -0.45, 0, Math.PI * 2);
        ctx.stroke();
      }
      const bodies = [
        { radius: 42, speed: 0.75, color: "#f0d48a" },
        { radius: 74, speed: -0.48, color: "#7eb6ff" },
        { radius: 108, speed: 0.3, color: "#1aa58a" },
      ];
      for (const body of bodies) {
        const angle = time * body.speed;
        ctx.beginPath();
        ctx.fillStyle = body.color;
        ctx.arc(originX + Math.cos(angle) * body.radius, originY + Math.sin(angle) * body.radius * 0.4, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.fillStyle = "#c4623a";
      ctx.arc(originX, originY, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(246,241,230,0.45)";
      for (const dot of dots) {
        const x = (dot.x / 1000) * width + time * dot.v;
        const wrapped = ((x % (width + 30)) + width + 30) % (width + 30) - 15;
        const y = (dot.y / 700) * height + Math.sin(time * 0.4 + dot.x) * 8;
        ctx.beginPath();
        ctx.arc(wrapped, y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now: number) {
      queued = false;
      if (!alive) return;
      paint(now);
      if (!reduce && document.visibilityState !== "hidden") {
        queued = true;
        frame = requestAnimationFrame(loop);
      }
    }

    function onVisible() {
      if (!alive || reduce || queued || document.visibilityState !== "visible") return;
      queued = true;
      frame = requestAnimationFrame(loop);
    }

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduce) paint(0);
    });
    observer.observe(host);
    document.addEventListener("visibilitychange", onVisible);
    queued = true;
    frame = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

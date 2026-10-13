"use client";

import { useEffect, useId, useRef, useState } from "react";
import { bnNum, bnTick } from "./format";
import type { Curve, Guide, Point, Probe } from "./types";

type Props = {
  curves: Curve[];
  guides?: Guide[];
  xSymbol: string;
  ySymbol: string;
  fillArea?: boolean;
  origin?: "x" | "y" | "both";
  flipX?: boolean;
  label: string;
  marker: Probe | null;
  onPick: (probe: Probe) => void;
};

function niceStep(span: number, count: number) {
  const raw = span / Math.max(1, count);
  if (!(raw > 0) || !Number.isFinite(raw)) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const factor = raw / pow;
  const nice = factor <= 1 ? 1 : factor <= 2 ? 2 : factor <= 5 ? 5 : 10;
  return nice * pow;
}

function tickMarks(lo: number, hi: number, count: number) {
  const step = niceStep(hi - lo, count);
  const start = Math.ceil((lo + step * 1e-6) / step) * step;
  const out: number[] = [];
  for (let i = 0; i < 8; i++) {
    const value = start + i * step;
    if (value > hi - step * 1e-4) break;
    out.push(Math.abs(value) < step * 1e-4 ? 0 : value);
  }
  return out;
}

function bounds(values: number[], includeZero: boolean) {
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  if (includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  if (!(hi > lo)) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.08;
  return [lo - pad, hi + pad] as const;
}

function monotonic(points: Point[]) {
  for (let i = 1; i < points.length; i++) {
    if (points[i].x <= points[i - 1].x) return false;
  }
  return points.length > 1;
}

function slopeAt(points: Point[], index: number) {
  if (points.length < 2) return null;
  const i = Math.min(Math.max(index, 1), points.length - 1);
  const dx = points[i].x - points[i - 1].x;
  if (Math.abs(dx) < 1e-9) return null;
  return (points[i].y - points[i - 1].y) / dx;
}

export function GraphPlot({ curves, guides = [], xSymbol, ySymbol, fillArea, origin, flipX, label, marker, onPick }: Props) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<Probe | null>(null);
  const clipId = useId().replace(/:/g, "");

  useEffect(() => () => observer.current?.disconnect(), []);

  function setWrap(node: HTMLDivElement | null) {
    if (wrap.current === node) return;
    observer.current?.disconnect();
    wrap.current = node;
    if (!node) return;
    const measure = () => {
      const next = Math.max(280, Math.round(node.clientWidth));
      setWidth((current) => (current === next ? current : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    observer.current = ro;
  }

  const points = curves.flatMap((item) => item.points);
  if (width === 0) {
    return <div ref={setWrap} className="h-[210px] w-full min-w-0 rounded-2xl bg-[#fbfaf6]" />;
  }
  if (points.length === 0) {
    return <p className="rounded-2xl bg-paper px-4 py-10 text-center text-sm text-muted">এই মানে বাস্তব লেখ নেই।</p>;
  }

  const height = Math.round(Math.max(188, Math.min(228, width * 0.42)));
  const pad = { l: width < 460 ? 64 : 76, r: 14, t: 16, b: 32 };
  const includeX = origin === "x" || origin === "both";
  const includeY = origin === "y" || origin === "both" || Boolean(fillArea);
  const [x0, x1] = bounds(points.map((point) => point.x), includeX);
  const [y0, y1] = bounds(points.map((point) => point.y), includeY);
  const plotW = width - pad.l - pad.r;
  const plotH = height - pad.t - pad.b;
  const X = (x: number) => {
    const t = (x - x0) / (x1 - x0);
    return pad.l + (flipX ? 1 - t : t) * plotW;
  };
  const Y = (y: number) => pad.t + (1 - (y - y0) / (y1 - y0)) * plotH;
  const xTicks = tickMarks(x0, x1, width < 460 ? 4 : 5);
  const yTicks = tickMarks(y0, y1, 4);
  const showX0 = x0 < 0 && x1 > 0;
  const showY0 = y0 < 0 && y1 > 0;

  function probeAt(clientX: number, clientY: number, svg: SVGSVGElement) {
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * width;
    const py = ((clientY - rect.top) / rect.height) * height;
    let best: { score: number; dist: number; curve: Curve; index: number } | null = null;
    for (const item of curves) {
      for (let index = 0; index < item.points.length; index++) {
        const point = item.points[index];
        const dx = X(point.x) - px;
        const dy = Y(point.y) - py;
        const dist = dx * dx + dy * dy;
        const score = dist * (item.dots ? 0.65 : 1);
        if (!best || score < best.score) best = { score, dist, curve: item, index };
      }
    }
    if (!best || best.dist > 46 * 46) return null;
    const point = best.curve.points[best.index];
    return {
      x: point.x,
      y: point.y,
      name: best.curve.name,
      slope: best.curve.dots ? null : slopeAt(best.curve.points, best.index),
    } satisfies Probe;
  }

  const active = hover ?? marker;

  return (
    <div ref={setWrap} className="w-full min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full touch-pan-y font-sans text-ink"
        role="img"
        aria-label={label}
        onPointerMove={(event) => setHover(probeAt(event.clientX, event.clientY, event.currentTarget))}
        onPointerLeave={() => setHover(null)}
        onPointerDown={(event) => {
          const next = probeAt(event.clientX, event.clientY, event.currentTarget);
          if (next) onPick(next);
        }}
      >
        <rect x={pad.l} y={pad.t} width={plotW} height={plotH} fill="#fbfaf6" stroke="#d5dfd6" />
        {xTicks.map((tick) => (
          <g key={`x-${tick}`}>
            <line x1={X(tick)} x2={X(tick)} y1={pad.t} y2={pad.t + plotH} stroke="#e3ebe4" />
            <text x={X(tick)} y={height - 12} textAnchor="middle" fontSize="12" fill="#52625b">
              {bnTick(tick)}
            </text>
          </g>
        ))}
        {yTicks.map((tick) => (
          <g key={`y-${tick}`}>
            <line x1={pad.l} x2={pad.l + plotW} y1={Y(tick)} y2={Y(tick)} stroke="#e3ebe4" />
            <text x={pad.l - 8} y={Y(tick) + 4} textAnchor="end" fontSize="12" fill="#52625b">
              {bnTick(tick)}
            </text>
          </g>
        ))}
        {showX0 ? <line x1={X(0)} x2={X(0)} y1={pad.t} y2={pad.t + plotH} stroke="#14211c" strokeWidth="1.2" /> : null}
        {showY0 ? <line x1={pad.l} x2={pad.l + plotW} y1={Y(0)} y2={Y(0)} stroke="#14211c" strokeWidth="1.2" /> : null}
        <text x={pad.l + plotW} y={height - 14} textAnchor="end" fontSize="12" fill="#14211c" fontWeight="700">
          {xSymbol}
        </text>
        <text x={pad.l + 8} y={pad.t + 16} fontSize="12" fill="#14211c" fontWeight="700">
          {ySymbol}
        </text>
        <defs>
          <clipPath id={clipId}>
            <rect x={pad.l} y={pad.t} width={plotW} height={plotH} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {fillArea && showY0
            ? curves
                .filter((item) => item.id === "main" && !item.dots && monotonic(item.points))
                .map((item) => {
                  const first = item.points[0];
                  const last = item.points[item.points.length - 1];
                  const path = [`M ${X(first.x)} ${Y(0)}`, ...item.points.map((point) => `L ${X(point.x)} ${Y(point.y)}`), `L ${X(last.x)} ${Y(0)} Z`].join(" ");
                  return <path key={`${item.id}-fill`} d={path} fill={item.color} opacity="0.14" />;
                })
            : null}
          {guides.map((guide, index) => (
            <g key={guide.label}>
              <line x1={X(guide.x)} x2={X(guide.x)} y1={pad.t} y2={pad.t + plotH} stroke="#8d3f22" strokeDasharray="4 4" />
              <text
                x={X(guide.x) + 4}
                y={pad.t + 18 + index * 16}
                fontSize="11"
                fill="#8d3f22"
                stroke="#fbfaf6"
                strokeWidth="3"
                paintOrder="stroke"
              >
                {guide.label}
              </text>
            </g>
          ))}
          {curves.map((item) =>
            item.dots ? (
              <g key={item.id}>
                {item.points.map((point) => (
                  <circle key={`${point.x}-${point.y}`} cx={X(point.x)} cy={Y(point.y)} r="4.5" fill={item.color} stroke="#fff" strokeWidth="1.5" />
                ))}
              </g>
            ) : (
              <polyline
                key={item.id}
                points={item.points.map((point) => `${X(point.x)},${Y(point.y)}`).join(" ")}
                fill="none"
                stroke={item.color}
                strokeWidth={item.dashed ? 2 : 3}
                strokeDasharray={item.dashed ? "7 6" : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ),
          )}
        </g>
        {active ? (
          <g>
            <line x1={X(active.x)} x2={X(active.x)} y1={pad.t} y2={pad.t + plotH} stroke="#14211c" strokeDasharray="3 4" opacity="0.45" />
            <circle cx={X(active.x)} cy={Y(active.y)} r="5.5" fill="#fff" stroke="#14211c" strokeWidth="2" />
          </g>
        ) : null}
      </svg>
      {active ? (
        <p className="mt-2 text-sm font-semibold text-ink">
          {active.name}: {xSymbol} = {bnNum(active.x, 3)}, {ySymbol} = {bnNum(active.y, 3)}
          {active.slope === null ? "" : `, ঢাল = ${bnNum(active.slope, 3)}`}
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">লেখের ওপর চাপলে স্থানাঙ্ক ও ঢাল দেখা যাবে।</p>
      )}
    </div>
  );
}

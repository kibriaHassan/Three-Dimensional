import type { ConcavePlace } from "./types";

const AXIS = 158;
const CX = 286;
const R = 168;
const PX = CX + R;
const FX = (CX + PX) / 2;

type Pt = { x: number; y: number };

const copper = "#c4623a";
const green = "#1f6b52";
const blue = "#2f6ea6";
const gold = "#b8862f";

function onMirror(angle: number): Pt {
  return { x: CX + R * Math.cos(angle), y: AXIS + R * Math.sin(angle) };
}

function hitLevel(y: number): Pt {
  const sine = Math.max(-0.9, Math.min(0.9, (y - AXIS) / R));
  return onMirror(Math.asin(sine));
}

function hitRadius(tip: Pt): Pt {
  const dx = tip.x - CX;
  const dy = tip.y - AXIS;
  const len = Math.hypot(dx, dy) || 1;
  const sign = tip.x < CX ? -1 : 1;
  return { x: CX + (sign * dx * R) / len, y: AXIS + (sign * dy * R) / len };
}

function hitThrough(tip: Pt, aim: Pt): Pt {
  const dx = aim.x - tip.x || 0.001;
  const dy = aim.y - tip.y;
  const ox = tip.x - CX;
  const oy = tip.y - AXIS;
  const a = dx * dx + dy * dy;
  const b = 2 * (ox * dx + oy * dy);
  const c = ox * ox + oy * oy - R * R;
  const disc = Math.sqrt(Math.max(0, b * b - 4 * a * c));
  const far = (-b + disc) / (2 * a);
  const near = (-b - disc) / (2 * a);
  const t = far > 1.02 ? far : near;
  return { x: tip.x + t * dx, y: tip.y + t * dy };
}

function cross(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const den = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  if (Math.abs(den) < 1e-3) return null;
  const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / den;
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}

function extend(from: Pt, through: Pt, x: number): Pt {
  const dx = through.x - from.x || 0.001;
  return { x, y: from.y + ((x - from.x) * (through.y - from.y)) / dx };
}

function pathOf(points: Pt[], color: string, dashed = false) {
  const d = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  return <path d={d} fill="none" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "5 4" : undefined} />;
}

function pointer(foot: Pt, head: Pt, color: string, dashed = false) {
  const dx = head.x - foot.x;
  const dy = head.y - foot.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return (
    <g fill={color} stroke={color} strokeWidth="2.4" strokeLinecap="round">
      <line x1={foot.x} y1={foot.y} x2={head.x - ux * 2} y2={head.y - uy * 2} strokeDasharray={dashed ? "4 3" : undefined} />
      <path d={`M${head.x} ${head.y} l${-ux * 10 - uy * 4.2} ${-uy * 10 + ux * 4.2} l${uy * 8.4} ${-ux * 8.4} z`} stroke="none" />
    </g>
  );
}

function label(x: number, y: number, text: string, anchor: "start" | "middle" | "end" = "middle", tone = "#14211c") {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={tone} stroke="#fbfaf6" strokeWidth="4" paintOrder="stroke" fontSize="13" fontWeight="700">
      {text}
    </text>
  );
}

const arc = Array.from({ length: 32 }, (_, index) => onMirror(-1.15 + (2.3 * index) / 31));
const arcD = arc.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");

export function ConcaveRay({ place }: { place: ConcavePlace }) {
  const objectX = place === "beyond" ? 150 : place === "center" ? CX - 18 : place === "between" ? (CX + FX) / 2 + 8 : place === "focus" ? FX : (FX + PX) / 2;
  const objectH = place === "inside" ? 34 : place === "between" ? 40 : place === "center" ? 46 : 62;
  const tip: Pt = { x: objectX, y: AXIS - objectH };
  const focus: Pt = { x: FX, y: AXIS };
  const centre: Pt = { x: CX, y: AXIS };
  const parallelHit = place === "infinity" ? null : hitLevel(tip.y);
  const radialHit = place === "infinity" || place === "focus" || place === "center" || place === "between" ? null : hitRadius(tip);
  const image = parallelHit && radialHit ? cross(parallelHit, focus, radialHit, centre) : null;
  const behind = Boolean(image && image.x > PX + 6);
  const pairTip: Pt | null = place === "center" ? { x: CX, y: AXIS - 40 } : place === "between" ? tip : null;
  const pairParallel = pairTip ? hitLevel(pairTip.y) : null;
  const pairFocusHit = pairTip ? hitThrough(pairTip, focus) : null;
  const pairImage = pairParallel && pairFocusHit ? cross(pairParallel, focus, pairFocusHit, { x: 40, y: pairFocusHit.y }) : null;

  return (
    <svg viewBox="0 0 640 340" className="h-auto w-full" role="img" aria-label="অবতল দর্পণের রশ্মিচিত্র">
      <line x1="24" y1={AXIS} x2="616" y2={AXIS} stroke="#1c2a24" strokeWidth="1.5" />
      {label(36, AXIS - 10, "প্রধান অক্ষ", "start")}
      <path d={arcD} fill="none" stroke="#10161d" strokeWidth="3.2" />
      {arc
        .filter((_, index) => index % 2 === 0)
        .map((point) => {
          const dx = (point.x - CX) / R;
          const dy = (point.y - AXIS) / R;
          return <line key={`${point.y}`} x1={point.x} y1={point.y} x2={point.x + dx * 13} y2={point.y + dy * 13} stroke="#10161d" strokeWidth="1.5" />;
        })}
      {label(568, 286, "দর্পণ")}
      {place === "center" ? (
        <>
          <line x1={CX} y1={AXIS - 8} x2={CX} y2={AXIS + 8} stroke="#10161d" strokeWidth="1.7" />
          {label(CX - 14, AXIS - 22, "C", "end")}
          {label(CX - 14, AXIS - 8, "কেন্দ্র", "end")}
        </>
      ) : null}
      {[
        [CX, "C", "কেন্দ্র"],
        [FX, "F", "ফোকাস"],
        [PX, "P", "মেরু"],
      ].filter(([, mark]) => !(place === "center" && mark === "C")).map(([x, mark, name]) => (
        <g key={String(mark)}>
          <line x1={Number(x)} y1={AXIS - 8} x2={Number(x)} y2={AXIS + 8} stroke="#10161d" strokeWidth="1.7" />
          <text x={Number(x)} y={AXIS + 26} textAnchor="middle" fill="#14211c" fontSize="15" fontWeight="700">
            {mark}
          </text>
          <text x={Number(x)} y={AXIS + 42} textAnchor="middle" fill="#5c6b64" fontSize="11" fontWeight="700">
            {name}
          </text>
        </g>
      ))}

      {place === "infinity"
        ? [46, 24].map((lift) => {
            const hit = hitLevel(AXIS - lift);
            return (
              <g key={lift}>
                {pathOf([{ x: 40, y: AXIS - lift }, hit], copper)}
                {pathOf([hit, focus], blue)}
              </g>
            );
          })
        : null}
      {place === "infinity" ? (
        <>
          <circle cx={FX} cy={AXIS} r="5.5" fill={green} />
          {label(FX, AXIS - 18, "প্রতিবিম্ব")}
          {label(52, 46, "অসীম থেকে", "start")}
        </>
      ) : null}

      {pairTip && pairParallel && pairFocusHit && pairImage ? (
        <>
          {pointer({ x: pairTip.x, y: AXIS }, pairTip, copper)}
          {label(pairTip.x - 14, pairTip.y - 8, "AB", "end")}
          {pathOf([pairTip, pairParallel], copper)}
          {pathOf([pairParallel, pairImage], blue)}
          {pathOf([pairTip, pairFocusHit], copper)}
          {pathOf([pairFocusHit, pairImage], blue)}
          {pointer({ x: pairImage.x, y: AXIS }, pairImage, green)}
          {label(pairImage.x - 12, pairImage.y + 4, "A′B′", "end")}
        </>
      ) : null}

      {place === "focus" && parallelHit ? (
        <>
          {pointer({ x: objectX, y: AXIS }, tip, copper)}
          {label(objectX - 16, tip.y - 6, "AB", "end")}
          {pathOf([tip, parallelHit], copper)}
          {pathOf([parallelHit, extend(parallelHit, focus, 40)], blue)}
          {pathOf([tip, hitLevel(tip.y - 30)], copper)}
          {pathOf([hitLevel(tip.y - 30), { x: 40, y: tip.y - 30 }], blue)}
          {label(52, tip.y - 42, "অসীমে", "start")}
        </>
      ) : null}

      {parallelHit && radialHit && image && place !== "focus" ? (
        <>
          {pointer({ x: objectX, y: AXIS }, tip, copper)}
          {label(objectX, tip.y - 8, "AB")}
          {pathOf([tip, parallelHit], copper)}
          {pathOf([tip, radialHit], copper)}
          {behind ? (
            <>
              {pathOf([parallelHit, extend(parallelHit, focus, 56)], blue)}
              {pathOf([radialHit, extend(radialHit, centre, CX - 30)], blue)}
              {pathOf([parallelHit, image], gold, true)}
              {pathOf([radialHit, image], gold, true)}
              {pointer({ x: image.x, y: AXIS }, image, gold, true)}
              {label(image.x, Math.min(image.y, AXIS) - 12, "A′B′")}
            </>
          ) : (
            <>
              {pathOf([parallelHit, image], blue)}
              {pathOf([radialHit, image], blue)}
                  {pointer({ x: image.x, y: AXIS }, image, green)}
                  {label(image.x - 10, image.y + (image.y > AXIS ? 4 : -8), "A′B′", "end")}
            </>
          )}
        </>
      ) : null}
    </svg>
  );
}

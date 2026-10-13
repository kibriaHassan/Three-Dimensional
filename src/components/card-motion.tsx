"use client";

import { useId, type ReactNode } from "react";

type Kind = "vector" | "wave" | "optics" | "thermo";

const WAVE = "M-80 52 C-60 22 -40 22 -20 52 S20 82 40 52 S80 22 100 52 S140 82 160 52 S200 22 220 52 S260 82 280 52";

function Clip({ id, children }: { id: string; children: ReactNode }) {
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect width="160" height="100" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
}

function Travel({ clip, stroke = "#e7a15a", y = 0 }: { clip: string; stroke?: string; y?: number }) {
  return (
    <Clip id={clip}>
      <g transform={`translate(0 ${y})`}>
        <g className="slide">
          <path d={WAVE} stroke={stroke} />
        </g>
      </g>
    </Clip>
  );
}

function vectorArt(slug: string): ReactNode {
  if (slug === "parallelogram") {
    return (
      <>
        <path d="M28 74 L78 74 L118 30 L68 30 Z" />
        <path className="dash" d="M28 74 L118 30" stroke="#9ddec0" />
        <path d="M28 74 L78 74" stroke="#e07a62" />
        <path d="M28 74 L68 30" stroke="#e7a15a" />
      </>
    );
  }
  if (slug === "triangle") {
    return (
      <>
        <path d="M24 72 L86 72" stroke="#e07a62" />
        <path d="M86 72 L128 28" stroke="#e7a15a" />
        <path className="dash" d="M24 72 L128 28" stroke="#9ddec0" />
      </>
    );
  }
  if (slug === "resolution") {
    return (
      <>
        <path d="M28 76 L112 28" stroke="#e7a15a" />
        <path d="M28 76 H112" stroke="#e07a62" />
        <path d="M112 76 V28" stroke="#8fd0ef" />
        <path d="M28 76 V40" stroke="#9ddec0" />
      </>
    );
  }
  if (slug === "sum") {
    return (
      <>
        <path d="M22 68 L70 68" stroke="#e07a62" />
        <path d="M22 68 L48 34" stroke="#e7a15a" />
        <path d="M22 68 L96 34" stroke="#9ddec0" />
        <path d="M96 68 L132 46" stroke="#8fd0ef" />
      </>
    );
  }
  if (slug === "angle" || slug === "dot") {
    return (
      <>
        <path d="M30 74 H132" stroke="#e07a62" />
        <path d="M30 74 L118 26" stroke="#e7a15a" />
        <path d="M58 74 A28 28 0 0 1 48 50" stroke="#9ddec0" />
        {slug === "dot" ? <path d="M30 74 H92" stroke="#8fd0ef" strokeWidth="5" /> : null}
      </>
    );
  }
  if (slug === "cross") {
    return (
      <>
        <path d="M36 72 L108 72" stroke="#e07a62" />
        <path d="M36 72 L92 34" stroke="#e7a15a" />
        <path className="bob" d="M36 72 V28" stroke="#9ddec0" />
      </>
    );
  }
  if (slug === "unit") {
    return (
      <>
        <path d="M28 78 H128" />
        <path d="M28 78 L28 22" />
        <path d="M28 78 L92 48" />
        <circle cx="68" cy="78" r="4" fill="#e7a15a" stroke="none" />
        <circle cx="28" cy="46" r="4" fill="#e07a62" stroke="none" />
        <circle cx="58" cy="64" r="4" fill="#9ddec0" stroke="none" />
      </>
    );
  }
  if (slug === "direction") {
    return (
      <>
        <path d="M24 74 H140" />
        <path d="M24 74 L120 30" stroke="#e7a15a" />
        <path d="M56 74 A32 32 0 0 1 46 48" stroke="#9ddec0" />
        <path d="M24 74 V28" stroke="#8fd0ef" />
      </>
    );
  }
  return (
    <>
      <path d="M24 78 H136" />
      <path d="M80 78 V18" />
      <path d="M24 78 L132 28" />
      <circle className="dot" cx="96" cy="48" r="5" fill="#e7a15a" stroke="none" />
    </>
  );
}

function waveArt(family: string, clip: string): ReactNode {
  if (family === "spring" || family === "echo") {
    return (
      <>
        <g className="spring">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <circle key={i} cx={28 + i * 18} cy="50" r="7" stroke={i % 2 ? "#e07a62" : "#8fd0ef"} />
          ))}
        </g>
        {family === "echo" ? <path d="M132 18 V82" stroke="#e7a15a" /> : null}
      </>
    );
  }
  if (family === "pair" || family === "super") {
    return (
      <>
        <Travel clip={`${clip}a`} y={-16} />
        <Travel clip={`${clip}b`} stroke="#8fd0ef" y={16} />
      </>
    );
  }
  if (family === "media" || family === "bars") {
    return (
      <>
        <Travel clip={`${clip}a`} y={-26} />
        <Travel clip={`${clip}b`} stroke="#8fd0ef" />
        <Travel clip={`${clip}c`} stroke="#e07a62" y={26} />
      </>
    );
  }
  if (family === "shm") {
    return (
      <>
        <path d="M20 16 H140" />
        <path d="M80 16 V34" />
        <path className="bob" d="M80 34 V62" stroke="#e7a15a" />
        <circle className="bob" cx="80" cy="72" r="10" fill="#e7a15a" stroke="none" />
      </>
    );
  }
  if (family === "standing" || family === "string") {
    return (
      <>
        <path d="M16 78 H144" />
        <g className="swell">
          <path d="M20 50 C40 18 60 18 80 50 S120 82 140 50" stroke="#e7a15a" />
        </g>
        <circle cx="20" cy="50" r="3" fill="#e07a62" stroke="none" />
        <circle cx="140" cy="50" r="3" fill="#e07a62" stroke="none" />
      </>
    );
  }
  if (family === "pipe") {
    return (
      <>
        <path d="M28 28 H132 V72 H28 Z" />
        <g className="swell">
          <path d="M36 50 C56 34 72 34 92 50 S124 66 132 50" stroke="#e7a15a" />
        </g>
      </>
    );
  }
  if (family === "water" || family === "doppler") {
    return (
      <>
        <circle className="ripple" cx="78" cy="50" r="14" stroke="#8fd0ef" />
        <circle className="ripple delay-1" cx="78" cy="50" r="26" stroke="#e7a15a" />
        <circle className="ripple delay-2" cx="78" cy="50" r="38" />
        <circle cx="78" cy="50" r="4" fill="#e7a15a" stroke="none" />
      </>
    );
  }
  if (family === "reflect") {
    return (
      <>
        <path d="M128 16 V84" stroke="#e7a15a" />
        <g className="slide-short">
          <path d="M20 62 C40 62 48 28 68 28" stroke="#8fd0ef" />
        </g>
      </>
    );
  }
  if (family === "graph") {
    return (
      <>
        <path d="M24 18 V82 H146" />
        <Travel clip={clip} />
      </>
    );
  }
  return <Travel clip={clip} />;
}

function opticsArt(family: string, clip: string): ReactNode {
  if (family === "young" || family === "compare") {
    return (
      <>
        <path d="M18 28 V72" />
        <path d="M18 40 H42" stroke="#e7a15a" />
        <path d="M18 60 H42" stroke="#e7a15a" />
        <path d="M78 18 V82" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} className="fade" style={{ animationDelay: `${i * 0.18}s` }} d={`M${92 + i * 8} 24 V76`} stroke={i % 2 ? "#e7a15a" : "currentColor"} strokeWidth={i % 2 ? 3.4 : 1.4} />
        ))}
      </>
    );
  }
  if (family === "slit") {
    return (
      <>
        <path d="M36 16 V38 M36 62 V84" />
        <path d="M18 50 H36" stroke="#e7a15a" />
        <path d="M36 50 C70 50 78 24 120 24" stroke="#8fd0ef" />
        <path d="M36 50 H130" stroke="#e7a15a" />
        <path d="M36 50 C70 50 78 76 120 76" stroke="#8fd0ef" />
      </>
    );
  }
  if (family === "multi") {
    return (
      <>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${28 + i * 10} 22 V78`} />
        ))}
        <path d="M78 18 V82" />
        <Travel clip={clip} />
      </>
    );
  }
  if (family === "polar") {
    return (
      <>
        <path d="M48 22 V78" />
        <path d="M108 22 V78" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${36 + i * 4} ${34 + i * 8} H60`} stroke="#e7a15a" />
        ))}
        <g className="fade">
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${96 + i * 4} ${38 + i * 8} H120`} stroke="#9ddec0" />
          ))}
        </g>
      </>
    );
  }
  if (family === "front") {
    return (
      <>
        <circle className="ripple" cx="36" cy="50" r="16" stroke="#e7a15a" />
        <circle className="ripple delay-1" cx="36" cy="50" r="30" />
        <circle className="ripple delay-2" cx="36" cy="50" r="44" stroke="#8fd0ef" />
        <circle cx="36" cy="50" r="4" fill="#e7a15a" stroke="none" />
      </>
    );
  }
  return (
    <>
      <Travel clip={`${clip}a`} y={-14} />
      <Travel clip={`${clip}b`} stroke="#8fd0ef" y={14} />
    </>
  );
}

function thermoArt(family: string): ReactNode {
  if (family === "rod") {
    return (
      <>
        <path d="M18 34 V66 M142 34 V66" />
        <rect className="grow" x="28" y="44" width="104" height="12" stroke="#e7a15a" />
      </>
    );
  }
  if (family === "piston" || family === "engine") {
    return (
      <>
        <path d="M48 18 V82 H112 V18" />
        <path className="piston" d="M48 36 H112" stroke="#e7a15a" />
        <circle className="dot" cx="70" cy="62" r="4" fill="#e07a62" stroke="none" />
        <circle className="dot delay-1" cx="90" cy="70" r="4" fill="#e7a15a" stroke="none" />
      </>
    );
  }
  if (family === "compare" || family === "graph") {
    return (
      <>
        <path d="M24 16 V84 H146" />
        <path d="M32 70 Q70 68 132 28" stroke="#e7a15a" />
        <path d="M32 74 Q80 40 132 48" stroke="#8fd0ef" />
      </>
    );
  }
  if (family === "flow") {
    return (
      <>
        <rect x="28" y="30" width="36" height="40" stroke="#e07a62" />
        <rect x="96" y="34" width="36" height="32" stroke="#8fd0ef" />
        <path className="dash" d="M68 50 H92" stroke="#e7a15a" />
      </>
    );
  }
  if (family === "bars") {
    return (
      <>
        <path d="M24 82 H140" />
        <rect className="bar" x="36" y="48" width="16" height="34" stroke="#8fd0ef" />
        <rect className="bar delay-1" x="72" y="30" width="16" height="52" stroke="#e7a15a" />
        <rect className="bar delay-2" x="108" y="40" width="16" height="42" stroke="#e07a62" />
      </>
    );
  }
  return (
    <>
      <path d="M36 22 H124 V78 H36 Z" />
      <circle className="dot" cx="58" cy="46" r="4" fill="#e7a15a" stroke="none" />
      <circle className="dot delay-1" cx="86" cy="58" r="4" fill="#e07a62" stroke="none" />
      <circle className="dot delay-2" cx="104" cy="40" r="4" fill="#8fd0ef" stroke="none" />
      <circle className="dot delay-3" cx="70" cy="66" r="4" fill="#9ddec0" stroke="none" />
    </>
  );
}

export function CardMotion({ kind, name }: { kind: Kind; name: string }) {
  const clip = useId().replace(/:/g, "");
  const picture = kind === "vector" ? vectorArt(name) : kind === "wave" ? waveArt(name, clip) : kind === "optics" ? opticsArt(name, clip) : thermoArt(name);

  return (
    <svg viewBox="0 0 160 100" className="card-motion h-24 w-full" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {picture}
    </svg>
  );
}

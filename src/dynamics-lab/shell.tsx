"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { fmt, show } from "@/vector-lab/math";
import { dynamicsModels, dynamicsSection, paramsOf, type DynamicsModel, type Knob } from "./catalog";
import { factsFor, type Params } from "./physics";
import { DynamicsViewport } from "./viewport";

const knobText = {
  bn: {
    east: "পূর্বের পথ",
    north: "উত্তরের পথ",
    pace: "দ্রুতি",
    u: "আদিবেগ u",
    accel: "ত্বরণ a",
    time: "সময় t",
    jerk: "জার্ক",
    height: "ছেড়ে দেওয়ার উচ্চতা h",
    launch: "নিক্ষেপ বেগ v",
    shot: "নিক্ষেপ কোণ θ",
  },
  en: {
    east: "Eastward path",
    north: "Northward path",
    pace: "Speed",
    u: "Initial speed u",
    accel: "Acceleration a",
    time: "Time t",
    jerk: "Jerk",
    height: "Release height h",
    launch: "Launch speed v",
    shot: "Launch angle θ",
  },
} as const;

const factText = {
  bn: {
    distance: "দূরত্ব",
    shift: "সরণ",
    instant: "তাৎক্ষণিক দ্রুতি",
    avg: "গড় বেগের মান",
    heading: "সরণের দিক",
    vel: "বেগ v",
    span: "সরণ s",
    predict: "ut+½at²",
    gap: "আসল ও সমীকরণের ফাঁক",
    square: "v²−u²−2as",
    slopeS: "s–t-এর ঢাল",
    areaV: "v–t-এর ক্ষেত্র",
    slopeV: "v–t-এর ঢাল",
    areaA: "a–t-এর ক্ষেত্র",
    gee: "অভিকর্ষজ ত্বরণ",
    top: "সর্বোচ্চ উচ্চতা",
    hang: "শীর্ষে পৌঁছাতে",
    flight: "মাটিতে ফেরার কাল",
    impact: "মাটিতে দ্রুতি",
    vx: "অনুভূমিক বেগ",
    vy: "উল্লম্ব বেগ",
    height: "সর্বোচ্চ উচ্চতা",
    range: "পাল্লা",
    air: "উড়ানের কাল",
    best: "৪৫°-এ পাল্লা",
  },
  en: {
    distance: "Distance",
    shift: "Displacement",
    instant: "Instantaneous speed",
    avg: "Average velocity",
    heading: "Displacement direction",
    vel: "Velocity v",
    span: "Displacement s",
    predict: "ut+½at²",
    gap: "Gap from the equation",
    square: "v²−u²−2as",
    slopeS: "Slope of s–t",
    areaV: "Area of v–t",
    slopeV: "Slope of v–t",
    areaA: "Area of a–t",
    gee: "Gravitational acceleration",
    top: "Maximum height",
    hang: "Time to the top",
    flight: "Time back to the ground",
    impact: "Speed at the ground",
    vx: "Horizontal speed",
    vy: "Vertical speed",
    height: "Maximum height",
    range: "Range",
    air: "Time of flight",
    best: "Range at 45°",
  },
} as const;

const specs: Record<Knob, { min: number; max: number; step: number; suffix: string }> = {
  east: { min: 0, max: 60, step: 1, suffix: " m" },
  north: { min: 0, max: 60, step: 1, suffix: " m" },
  pace: { min: 1, max: 15, step: 1, suffix: " m/s" },
  u: { min: -10, max: 30, step: 1, suffix: " m/s" },
  accel: { min: -6, max: 8, step: 0.5, suffix: " m/s²" },
  time: { min: 0.5, max: 10, step: 0.1, suffix: " s" },
  jerk: { min: -3, max: 3, step: 0.1, suffix: " m/s³" },
  height: { min: 0, max: 50, step: 1, suffix: " m" },
  launch: { min: 5, max: 40, step: 1, suffix: " m/s" },
  shot: { min: 10, max: 80, step: 1, suffix: "°" },
};

const chapterHref = "/?board=paper-1&chapter=dynamics";

export function DynamicsShell({ model }: { model: DynamicsModel }) {
  const { lang, t } = useLang();
  const [params, setParams] = useState<Params>(() => paramsOf(model));
  const [playing, setPlaying] = useState(true);
  const [slow, setSlow] = useState(false);
  const [resetClock, setResetClock] = useState(0);
  const [resetCamera, setResetCamera] = useState(0);

  useEffect(() => {
    setParams(paramsOf(model));
    setPlaying(true);
    setSlow(false);
    setResetClock((value) => value + 1);
  }, [model.slug]);

  const index = dynamicsModels.findIndex((item) => item.slug === model.slug);
  const prev = index > 0 ? dynamicsModels[index - 1] : null;
  const next = index < dynamicsModels.length - 1 ? dynamicsModels[index + 1] : null;
  const title = lang === "en" ? model.titleEn : model.title;
  const blurb = lang === "en" ? model.blurbEn : model.blurb;
  const explain = lang === "en" ? model.explainEn : model.explain;
  const rows = factsFor(model.focus, params).map((fact) => ({
    id: fact.id,
    label: factText[lang][fact.id as keyof (typeof factText)["bn"]] ?? fact.id,
    value: `${lang === "bn" ? show(fact.value, fact.digits) : fmt(fact.value, fact.digits)}${fact.unit ? ` ${fact.unit}` : ""}`,
  }));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <BrandLockup href={chapterHref} caption={t("dynamicsChapter")} />
          <SiteBar active="paper-1" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("dynamicsChapter")} · {dynamicsSection(model.section, lang)} · {lang === "bn" ? show(model.no, 0) : model.no} /{" "}
              {lang === "bn" ? show(dynamicsModels.length, 0) : dynamicsModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/dynamics/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href={chapterHref} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/dynamics/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <DynamicsViewport
              state={{ family: model.family, focus: model.focus, params, playing, speed: slow ? 0.35 : 1, lang }}
              resetClock={resetClock}
              resetCamera={resetCamera}
            />
            <p className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white/80">{t("orbit")}</p>
          </div>
          <aside className="grid content-start gap-3 lg:max-h-[min(68dvh,560px)] lg:overflow-auto lg:pr-1">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setPlaying((value) => !value)} className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper-2">
                {playing ? t("pause") : t("play")}
              </button>
              <button type="button" onClick={() => setResetClock((value) => value + 1)} className="rounded-full border border-ink bg-white px-4 py-2 text-sm font-bold text-ink">
                {t("replay")}
              </button>
              <button
                type="button"
                aria-pressed={slow}
                onClick={() => setSlow((value) => !value)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${slow ? "bg-copper text-white" : "border border-line bg-white text-ink"}`}
              >
                {t("slow")}
              </button>
              <button type="button" onClick={() => setResetCamera((value) => value + 1)} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-ink">
                {t("resetCamera")}
              </button>
              <button type="button" onClick={() => setParams(paramsOf(model))} className="rounded-full border border-ink bg-white px-4 py-2 text-sm font-bold text-ink">
                {t("resetValues")}
              </button>
            </div>
            {model.knobs.length ? (
              <div className="grid gap-3 rounded-3xl border border-line bg-white/85 p-4">
                {model.knobs.map((knob) => (
                  <Slider
                    key={knob}
                    label={knobText[lang][knob]}
                    spec={specs[knob]}
                    value={params[knob]}
                    lang={lang}
                    onChange={(value) => setParams((current) => ({ ...current, [knob]: value }))}
                  />
                ))}
              </div>
            ) : null}
            <dl className="grid grid-cols-2 gap-2">
              {rows.map((row) => (
                <div key={row.id} className="rounded-2xl bg-paper px-3 py-2">
                  <dt className="text-xs font-bold text-muted">{row.label}</dt>
                  <dd className="font-serif text-xl text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <article className="rounded-3xl border border-line bg-white/85 p-4">
            <h2 className="text-sm font-bold text-copper">{t("explain")}</h2>
            <p className="mt-2 text-sm leading-relaxed">{explain}</p>
          </article>
          <article className="rounded-3xl border border-line bg-white/85 p-4">
            <h2 className="text-sm font-bold text-copper">{t("formula")}</h2>
            <p className="mt-2 font-serif text-2xl leading-snug">{model.formula}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{model.symbols}</p>
          </article>
          <article className="rounded-3xl border border-line bg-white/85 p-4">
            <h2 className="text-sm font-bold text-copper">{t("example")}</h2>
            <p className="mt-2 text-sm leading-relaxed">
              {rows.map((row) => `${row.label} ${row.value}`).join(lang === "bn" ? "। " : ". ")}
              {lang === "bn" ? "।" : "."}
            </p>
          </article>
        </div>
      </main>
    </div>
  );
}

function Slider({
  label,
  value,
  spec,
  lang,
  onChange,
}: {
  label: string;
  value: number;
  spec: { min: number; max: number; step: number; suffix: string };
  lang: "bn" | "en";
  onChange: (value: number) => void;
}) {
  const digits = Number.isInteger(spec.step) ? 0 : spec.step < 0.01 ? 3 : spec.step <= 0.1 ? 2 : 1;
  const shown = lang === "bn" ? show(value, digits) : fmt(value, digits);
  return (
    <label className="grid gap-1 text-sm">
      <span className="flex items-baseline justify-between gap-3 font-bold">
        <span>{label}</span>
        <span className="font-serif text-lg">{`${shown}${spec.suffix}`}</span>
      </span>
      <input type="range" min={spec.min} max={spec.max} step={spec.step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

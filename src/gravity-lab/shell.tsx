"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { fmt, show } from "@/vector-lab/math";
import { gravityModels, gravitySection, paramsOf, type GravityModel, type Knob } from "./catalog";
import { factsFor, type Params } from "./physics";
import { GravityViewport } from "./viewport";

const knobText = {
  bn: {
    mass: "ভর m",
    mass1: "ভর m₁",
    mass2: "ভর m₂",
    gap: "দূরত্ব r",
    height: "উচ্চতা h",
    depth: "গভীরতা d",
    latitude: "অক্ষাংশ λ",
    orbit: "কক্ষের ব্যাসার্ধ",
    speed: "প্রাথমিক বেগ",
    tower: "উচ্চতা",
    gee: "স্থানীয় g",
  },
  en: {
    mass: "Mass m",
    mass1: "Mass m₁",
    mass2: "Mass m₂",
    gap: "Distance r",
    height: "Height h",
    depth: "Depth d",
    latitude: "Latitude λ",
    orbit: "Orbit radius",
    speed: "Initial speed",
    tower: "Height",
    gee: "Local g",
  },
} as const;

const factText = {
  bn: {
    force: "বল F",
    a1: "m₁-এর ত্বরণ",
    a2: "m₂-এর ত্বরণ",
    sunEarth: "সূর্য–পৃথিবী",
    earthMoon: "পৃথিবী–চাঁদ",
    gee: "g",
    time: "পতনের সময়",
    weight: "ওজন",
    vacuum: "শূন্যে সময়",
    equator: "বিষুব",
    mid: "৪৫°",
    pole: "মেরু",
    here: "এই স্থান",
    loss: "ঘূর্ণনে কমতি",
    height: "উচ্চতা",
    depth: "গভীরতা",
    inside: "ভেতরে",
    surface: "পৃষ্ঠ",
    outside: "বাইরে",
    field: "ক্ষেত্রপ্রাবল্য",
    ratio: "দূরত্ব",
    potential: "বিভব V",
    farV: "২R-এ V",
    mgh: "mgh",
    exact: "সঠিক ΔU",
    energy: "বিভব শক্তি",
    speed: "বেগ",
    period: "আবর্তনকাল",
    grav: "মহাকর্ষ বল",
    centri: "mv²/r",
    leo: "নিচু কক্ষ",
    geo: "ভূস্থির",
    double: "দ্বিগুণ ব্যাসার্ধে T",
    escape: "মুক্তিবেগ",
    circular: "বৃত্তীয় বেগ",
    extra: "অতিরিক্ত শক্তি",
    normal: "স্পর্শ বল",
    restN: "স্থির অবস্থায় N",
    fallN: "পতনে N",
    a: "অর্ধ-দীর্ঘ অক্ষ",
    e: "উৎকেন্দ্রতা",
    near: "কাছের কক্ষ",
    outer: "দ্বিগুণ অক্ষ",
    match: "T²/a³ মিল",
    earth: "পৃথিবী",
    moon: "চাঁদ",
    mass: "ভর",
    mars: "মঙ্গল",
    jupiter: "বৃহস্পতি",
  },
  en: {
    force: "Force F",
    a1: "Acceleration of m₁",
    a2: "Acceleration of m₂",
    sunEarth: "Sun–Earth",
    earthMoon: "Earth–Moon",
    gee: "g",
    time: "Time to fall",
    weight: "Weight",
    vacuum: "Time in vacuum",
    equator: "Equator",
    mid: "45°",
    pole: "Pole",
    here: "This place",
    loss: "Lost to spin",
    height: "Height",
    depth: "Depth",
    inside: "Inside",
    surface: "Surface",
    outside: "Outside",
    field: "Field strength",
    ratio: "Distance",
    potential: "Potential V",
    farV: "V at 2R",
    mgh: "mgh",
    exact: "Exact ΔU",
    energy: "Potential energy",
    speed: "Speed",
    period: "Period",
    grav: "Gravity",
    centri: "mv²/r",
    leo: "Low orbit",
    geo: "Geostationary",
    double: "T at twice the radius",
    escape: "Escape speed",
    circular: "Circular speed",
    extra: "Extra energy",
    normal: "Normal force",
    restN: "N at rest",
    fallN: "N in free fall",
    a: "Semi-major axis",
    e: "Eccentricity",
    near: "Inner orbit",
    outer: "Double the axis",
    match: "T²/a³ match",
    earth: "Earth",
    moon: "Moon",
    mass: "Mass",
    mars: "Mars",
    jupiter: "Jupiter",
  },
} as const;

const specs: Record<Knob, { min: number; max: number; step: number; suffix: string }> = {
  mass: { min: 1, max: 2000, step: 1, suffix: " kg" },
  mass1: { min: 0.02, max: 20, step: 0.001, suffix: " ×10²⁴ kg" },
  mass2: { min: 0.02, max: 20, step: 0.001, suffix: " ×10²⁴ kg" },
  gap: { min: 16, max: 500, step: 1, suffix: " ×10⁶ m" },
  height: { min: 0, max: 9000, step: 50, suffix: " km" },
  depth: { min: 0, max: 6370, step: 10, suffix: " km" },
  latitude: { min: 0, max: 90, step: 1, suffix: "°" },
  orbit: { min: 1.05, max: 8, step: 0.05, suffix: " R" },
  speed: { min: 1, max: 16, step: 0.1, suffix: " km/s" },
  tower: { min: 2, max: 50, step: 1, suffix: " m" },
  gee: { min: 1.6, max: 25, step: 0.1, suffix: " m/s²" },
};

const chapterHref = "/?board=paper-1&chapter=gravity";

export function GravityShell({ model }: { model: GravityModel }) {
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

  const index = gravityModels.findIndex((item) => item.slug === model.slug);
  const prev = index > 0 ? gravityModels[index - 1] : null;
  const next = index < gravityModels.length - 1 ? gravityModels[index + 1] : null;
  const title = lang === "en" ? model.titleEn : model.title;
  const blurb = lang === "en" ? model.blurbEn : model.blurb;
  const explain = lang === "en" ? model.explainEn : model.explain;
  const rows = factsFor(model.focus, params).map((fact) => ({
    label: factText[lang][fact.id as keyof (typeof factText)["bn"]] ?? fact.id,
    value: `${lang === "bn" ? show(fact.value, fact.digits) : fmt(fact.value, fact.digits)}${fact.unit ? ` ${fact.unit}` : ""}`,
  }));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <BrandLockup href={chapterHref} caption={t("gravityChapter")} />
          <SiteBar active="paper-1" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("gravityChapter")} · {gravitySection(model.section, lang)} · {lang === "bn" ? show(model.no, 0) : model.no} /{" "}
              {lang === "bn" ? show(gravityModels.length, 0) : gravityModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/gravity/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href={chapterHref} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/gravity/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <GravityViewport
              state={{ family: model.family, focus: model.focus, params, playing, speed: slow ? 0.35 : 1, lang }}
              resetClock={resetClock}
              resetCamera={resetCamera}
            />
            <p className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white/80">{t("orbit")}</p>
          </div>
          <aside className="grid gap-3 lg:max-h-[min(68dvh,560px)] lg:overflow-auto lg:pr-1">
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
                <div key={row.label} className="rounded-2xl bg-paper px-3 py-2">
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
              {rows.length ? (lang === "bn" ? "।" : ".") : lang === "bn" ? "স্লাইডার নেই। দৃশ্য নিজেই তুলনা দেখায়।" : "No sliders. The scene itself makes the comparison."}
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
        <span className="font-serif text-lg">
          {shown}
          {spec.suffix}
        </span>
      </span>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { fmt, show } from "@/vector-lab/math";
import { matterModels, matterSection, paramsOf, type Knob, type MatterModel } from "./catalog";
import { factsFor, type Params } from "./physics";
import { MatterViewport } from "./viewport";

const knobText = {
  bn: {
    force: "বল F",
    area: "ক্ষেত্রফল A",
    length: "দৈর্ঘ্য L",
    young: "ইয়ং গুণাঙ্ক Y",
    poisson: "পয়সন σ",
    bulk: "আয়তন গুণাঙ্ক K",
    shear: "দৃঢ়তা গুণাঙ্ক η",
    pressure: "চাপ ΔP",
    tension: "পৃষ্ঠটান T",
    radius: "ব্যাসার্ধ r",
    density: "তরলের ঘনত্ব",
    viscosity: "সান্দ্রতা η₀",
    speed: "বেগ v",
    temp: "তাপমাত্রা T",
    angle: "সংস্পর্শ কোণ θ",
    count: "ফোঁটার সংখ্যা n",
    spring: "স্প্রিং ধ্রুবক k",
    strain: "বিকৃতি",
  },
  en: {
    force: "Force F",
    area: "Area A",
    length: "Length L",
    young: "Young's modulus Y",
    poisson: "Poisson σ",
    bulk: "Bulk modulus K",
    shear: "Shear modulus η",
    pressure: "Pressure ΔP",
    tension: "Surface tension T",
    radius: "Radius r",
    density: "Liquid density",
    viscosity: "Viscosity η₀",
    speed: "Speed v",
    temp: "Temperature T",
    angle: "Contact angle θ",
    count: "Number of drops n",
    spring: "Spring constant k",
    strain: "Strain",
  },
} as const;

const factText = {
  bn: {
    stress: "পীড়ন",
    strain: "বিকৃতি",
    deltaL: "প্রসারণ ΔL",
    young: "Y",
    extension: "প্রসারণ x",
    stored: "জমা শক্তি",
    energy: "পৃষ্ঠশক্তি",
    volStrain: "আয়তন বিকৃতি",
    bulk: "K",
    shearStrain: "শিয়ার বিকৃতি",
    shear: "η",
    long: "অনুদৈর্ঘ্য বিকৃতি",
    lat: "অনুপ্রস্থ বিকৃতি",
    poisson: "σ",
    force: "প্রয়োজনীয় বল",
    tension: "পৃষ্ঠটান",
    area: "ক্ষেত্রফল",
    height: "কৈশিক উচ্চতা",
    angle: "সংস্পর্শ কোণ",
    waterV: "পানিতে vₜ",
    glyV: "গ্লিসারিনে vₜ",
    eta: "সান্দ্রতা",
    terminal: "প্রান্তিক বেগ",
    re: "রেনল্ডস সংখ্যা",
    drag: "সান্দ্র বল",
    speed: "চওড়া অংশে বেগ",
    narrow: "সরু অংশে বেগ",
    drop: "চাপের পার্থক্য",
    rise: "উচ্চতার পার্থক্য",
    rd: "আপেক্ষিক ঘনত্ব",
    dropE: "ফোঁটার শক্তি",
    bubbleE: "বুদবুদের শক্তি",
  },
  en: {
    stress: "Stress",
    strain: "Strain",
    deltaL: "Extension ΔL",
    young: "Y",
    extension: "Extension x",
    stored: "Stored energy",
    energy: "Surface energy",
    volStrain: "Volume strain",
    bulk: "K",
    shearStrain: "Shear strain",
    shear: "η",
    long: "Longitudinal strain",
    lat: "Lateral strain",
    poisson: "σ",
    force: "Force required",
    tension: "Surface tension",
    area: "Area",
    height: "Capillary height",
    angle: "Contact angle",
    waterV: "Terminal speed in water",
    glyV: "Terminal speed in glycerine",
    eta: "Viscosity",
    terminal: "Terminal speed",
    re: "Reynolds number",
    drag: "Viscous drag",
    speed: "Speed in the wide part",
    narrow: "Speed in the narrow part",
    drop: "Pressure difference",
    rise: "Height difference",
    rd: "Relative density",
    dropE: "Drop energy",
    bubbleE: "Bubble energy",
  },
} as const;

const specs: Record<Knob, { min: number; max: number; step: number; suffix: string }> = {
  force: { min: 2, max: 80, step: 1, suffix: " N" },
  area: { min: 0.2, max: 4, step: 0.1, suffix: " mm²" },
  length: { min: 0.4, max: 2, step: 0.1, suffix: " m" },
  young: { min: 0.01, max: 220, step: 0.01, suffix: " GPa" },
  poisson: { min: 0, max: 0.49, step: 0.01, suffix: "" },
  bulk: { min: 1, max: 200, step: 1, suffix: " GPa" },
  shear: { min: 1, max: 100, step: 1, suffix: " GPa" },
  pressure: { min: 20, max: 400, step: 10, suffix: " kPa" },
  tension: { min: 0.02, max: 0.5, step: 0.005, suffix: " N/m" },
  radius: { min: 0.2, max: 4, step: 0.1, suffix: " mm" },
  density: { min: 0.7, max: 13.6, step: 0.1, suffix: " g/cm³" },
  viscosity: { min: 0.5, max: 2000, step: 0.5, suffix: " mPa·s" },
  speed: { min: 0.2, max: 4, step: 0.1, suffix: " m/s" },
  temp: { min: 0, max: 80, step: 1, suffix: " °C" },
  angle: { min: 0, max: 180, step: 1, suffix: "°" },
  count: { min: 2, max: 27, step: 1, suffix: "" },
  spring: { min: 10, max: 120, step: 1, suffix: " N/m" },
  strain: { min: 1, max: 80, step: 1, suffix: " ×10⁻⁴" },
};

const chapterHref = "/?board=paper-1&chapter=matter";

export function MatterShell({ model }: { model: MatterModel }) {
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

  const index = matterModels.findIndex((item) => item.slug === model.slug);
  const prev = index > 0 ? matterModels[index - 1] : null;
  const next = index < matterModels.length - 1 ? matterModels[index + 1] : null;
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
          <BrandLockup href={chapterHref} caption={t("matterChapter")} />
          <SiteBar active="paper-1" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("matterChapter")} · {matterSection(model.section, lang)} · {lang === "bn" ? show(model.no, 0) : model.no} /{" "}
              {lang === "bn" ? show(matterModels.length, 0) : matterModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/matter/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href={chapterHref} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/matter/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <MatterViewport
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

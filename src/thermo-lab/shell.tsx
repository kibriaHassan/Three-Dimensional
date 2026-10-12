"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { fmt, show } from "@/vector-lab/math";
import { paramsOf, thermoModels, thermoSection, type Knob, type ThermoModel } from "./catalog";
import {
  celsius,
  efficiency,
  expansion,
  pressureOf,
  processState,
  rmsSpeed,
  type Params,
  type Process,
} from "./physics";
import { ThermoViewport } from "./viewport";

const knobText = {
  bn: {
    temp: "তাপমাত্রা T",
    hot: "উৎসের তাপমাত্রা Tₕ",
    cold: "গ্রাহকের তাপমাত্রা T꜀",
    volume: "আয়তন V₁",
    ratio: "আয়তনের অনুপাত V₂/V₁",
    moles: "মোল সংখ্যা n",
  },
  en: {
    temp: "Temperature T",
    hot: "Source temperature Tₕ",
    cold: "Sink temperature T꜀",
    volume: "Volume V₁",
    ratio: "Volume ratio V₂/V₁",
    moles: "Amount n",
  },
} as const;

const chapterHref = "/?board=paper-2&chapter=thermo";

export function ThermoShell({ model }: { model: ThermoModel }) {
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

  const index = thermoModels.findIndex((item) => item.slug === model.slug);
  const prev = index > 0 ? thermoModels[index - 1] : null;
  const next = index < thermoModels.length - 1 ? thermoModels[index + 1] : null;
  const title = lang === "en" ? model.titleEn : model.title;
  const blurb = lang === "en" ? model.blurbEn : model.blurb;
  const explain = lang === "en" ? model.explainEn : model.explain;
  const rows = lesson(model, params, lang);

  function setKnob(key: Knob, value: number) {
    setParams((current) => {
      const nextParams = { ...current, [key]: value };
      if (nextParams.hot < nextParams.cold + 20) {
        if (key === "cold") nextParams.hot = nextParams.cold + 20;
        else nextParams.cold = Math.max(250, nextParams.hot - 20);
      }
      return nextParams;
    });
  }

  const ratioLabel = model.focus === "isochoric"
    ? lang === "bn" ? "তাপমাত্রার অনুপাত T₂/T₁" : "Temperature ratio T₂/T₁"
    : knobText[lang].ratio;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <BrandLockup href={chapterHref} caption={t("thermoChapter")} />
          <SiteBar active="paper-2" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("thermoChapter")} · {thermoSection(model.section, lang)} · {lang === "bn" ? show(model.no, 0) : model.no} /{" "}
              {lang === "bn" ? show(thermoModels.length, 0) : thermoModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/thermo/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href={chapterHref} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/thermo/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <ThermoViewport
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
                    label={knob === "ratio" ? ratioLabel : knobText[lang][knob]}
                    spec={specOf(knob)}
                    value={params[knob]}
                    lang={lang}
                    onChange={(value) => setKnob(knob, value)}
                  />
                ))}
              </div>
            ) : null}
            <dl className="grid grid-cols-2 gap-2">
              {rows.map((row) => (
                <div key={row.label} className={`rounded-2xl bg-paper px-3 py-2 ${row.wide ? "col-span-2" : ""}`}>
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
            <p className="mt-2 text-sm leading-relaxed">{exampleOf(model, params, lang)}</p>
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
  const digits = Number.isInteger(spec.step) ? 0 : spec.step < 0.05 ? 2 : 1;
  const shown = lang === "bn" ? show(value, digits) : fmt(value, digits);
  return (
    <label className="grid gap-1 text-sm">
      <span className="flex items-center justify-between gap-3 font-semibold">
        <span>{label}</span>
        <span className="font-serif text-copper-deep">
          {shown}
          {spec.suffix}
        </span>
      </span>
      <input
        className="vec-range"
        type="range"
        min={spec.min}
        max={spec.max}
        step={Number.isInteger(spec.step) ? spec.step : "any"}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function specOf(knob: Knob) {
  if (knob === "temp") return { min: 250, max: 700, step: 5, suffix: " K" };
  if (knob === "hot") return { min: 400, max: 900, step: 5, suffix: " K" };
  if (knob === "cold") return { min: 250, max: 500, step: 5, suffix: " K" };
  if (knob === "volume") return { min: 6, max: 24, step: 0.5, suffix: " L" };
  if (knob === "ratio") return { min: 1.2, max: 3, step: 0.05, suffix: "" };
  return { min: 0.2, max: 2, step: 0.1, suffix: " mol" };
}

function num(value: number, lang: "bn" | "en", digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return lang === "bn" ? show(value, digits) : fmt(value, digits);
}

function joule(value: number, lang: "bn" | "en") {
  if (!Number.isFinite(value)) return "—";
  const digits = Math.abs(value) >= 100 ? 0 : 1;
  return `${num(value, lang, digits)} J`;
}

function kindOf(focus: string): Process {
  if (focus === "adiabatic" || focus === "internal") return "adiabatic";
  if (focus === "isochoric") return "isochoric";
  if (focus === "isothermal" || focus === "work" || focus === "pv") return "isothermal";
  return "isobaric";
}

function lesson(model: ThermoModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  const rows: { label: string; value: string; wide?: boolean }[] = [];
  const push = (bn: string, labelEn: string, value: string, wide = false) => rows.push({ label: en ? labelEn : bn, value, wide });

  if (model.focus === "rod") {
    const delta = expansion(params.temp) * 1000;
    push("T", "T", `${num(params.temp, lang, 0)} K`);
    push("ΔT", "ΔT", `${num(params.temp - 300, lang, 0)} K`);
    push("ΔL", "ΔL", `${num(delta, lang, 2)} mm`, true);
    push("ছবি", "Picture", en ? "magnified" : "বড় করে দেখানো");
    return rows;
  }

  if (model.focus === "motion" || model.focus === "kinetic") {
    const pressure = pressureOf(params.moles, params.volume, params.temp);
    push("T", "T", `${num(params.temp, lang, 0)} K`);
    push("t", "t", `${num(celsius(params.temp), lang, 0)} °C`);
    push("P", "P", `${num(pressure, lang, 0)} kPa`);
    push("cᵣₘₛ", "cᵣₘₛ", `${num(rmsSpeed(params.temp), lang, 0)} m/s`);
    return rows;
  }

  if (model.focus === "reversible") {
    push("বাঁয়ে", "Left", en ? "slow, reversible" : "ধীর, প্রত্যাবর্তী");
    push("ডানে", "Right", en ? "free expansion" : "মুক্ত প্রসারণ");
    push("W", "W", en ? "0 in free expansion" : "মুক্ত প্রসারণে ০", true);
    push("ΔU", "ΔU", en ? "0, T unchanged" : "০, T অপরিবর্তিত");
    return rows;
  }

  if (model.focus === "curves" || model.focus === "compare") {
    const iso = processState("isothermal", params, 1);
    const adi = processState("adiabatic", params, 1);
    push("T সমতাপ", "Isothermal T", `${num(iso.temp, lang, 0)} K`);
    push("T রুদ্ধতাপ", "Adiabatic T", `${num(adi.temp, lang, 0)} K`);
    push("P সমতাপ", "Isothermal P", `${num(iso.pressure, lang, 0)} kPa`);
    push("P রুদ্ধতাপ", "Adiabatic P", `${num(adi.pressure, lang, 0)} kPa`);
    return rows;
  }

  if (model.focus === "convert") {
    const kinds: Process[] = ["isothermal", "adiabatic", "isobaric", "isochoric"];
    const names = en ? ["Isothermal", "Adiabatic", "Isobaric", "Isochoric"] : ["সমতাপ", "রুদ্ধতাপ", "সমচাপ", "সমআয়তন"];
    kinds.forEach((kind, index) => {
      const end = processState(kind, params, 1);
      push(names[index], names[index], `Q ${joule(end.heat, lang)} · U ${joule(end.energy, lang)} · W ${joule(end.work, lang)}`, true);
    });
    return rows;
  }

  if (model.family === "engine" || model.focus === "flow" || model.focus === "second" || model.focus === "cycle") {
    const score = efficiency(params);
    push("Tₕ", "Tₕ", `${num(score.hot, lang, 0)} K`);
    push("T꜀", "T꜀", `${num(score.cold, lang, 0)} K`);
    if (model.focus === "fridge") {
      push("Q꜀", "Q꜀", joule(score.rejected, lang));
      push("COP", "COP", num(score.fridge, lang));
      return rows;
    }
    if (model.focus === "pump") {
      push("Qₕ", "Qₕ", joule(score.absorbed, lang));
      push("COP", "COP", num(score.pump, lang));
      return rows;
    }
    push("η", "η", `${num(score.engine * 100, lang, 1)}%`);
    push("ΔW", "ΔW", joule(score.work, lang));
    if (model.focus !== "flow" && model.focus !== "second") {
      push("Qₕ", "Qₕ", joule(score.absorbed, lang));
      push("Q꜀", "Q꜀", joule(score.rejected, lang));
    }
    return rows;
  }

  const end = processState(kindOf(model.focus), params, 1);
  push("T₂", "T₂", `${num(end.temp, lang, 0)} K`);
  push("P₂", "P₂", `${num(end.pressure, lang, 0)} kPa`);
  push("ΔQ", "ΔQ", joule(end.heat, lang));
  push("ΔU", "ΔU", joule(end.energy, lang));
  push("ΔW", "ΔW", joule(end.work, lang), true);
  return rows;
}

function exampleOf(model: ThermoModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  if (model.focus === "rod") {
    const delta = expansion(params.temp) * 1000;
    return en
      ? `A 1 m steel rod, warmed from 300 K to ${num(params.temp, lang, 0)} K, changes length by ${num(delta, lang, 2)} mm. The picture stretches that change so it can be seen.`
      : `১ মিটার ইস্পাতের দণ্ড ৩০০ K থেকে ${num(params.temp, lang, 0)} K হলে দৈর্ঘ্য বদলায় ${num(delta, lang, 2)} mm। ছবিতে এই সামান্য বদল বড় করে দেখানো হয়েছে।`;
  }
  if (model.focus === "kinetic" || model.focus === "motion") {
    return en
      ? `At ${num(params.temp, lang, 0)} K the rms speed of air molecules is about ${num(rmsSpeed(params.temp), lang, 0)} m/s. The same state gives P = ${num(pressureOf(params.moles, params.volume, params.temp), lang, 0)} kPa from both PV = nRT and ⅓ρc².`
      : `${num(params.temp, lang, 0)} K-এ বায়ুর অণুর গড় বর্গবেগের বর্গমূল প্রায় ${num(rmsSpeed(params.temp), lang, 0)} m/s। একই অবস্থায় PV = nRT ও ⅓ρc² দুটোই চাপ দেয় ${num(pressureOf(params.moles, params.volume, params.temp), lang, 0)} kPa।`;
  }
  if (model.focus === "reversible") {
    return en
      ? "The left piston moves slowly, so the gas stays near equilibrium and the step can be reversed. On the right the partition opens into a vacuum: Q = 0, W = 0 and, for an ideal gas, ΔU = 0."
      : "বাঁয়ের পিস্টন ধীরে সরে, গ্যাস প্রায় সাম্যাবস্থায় থাকে, তাই ধাপ উল্টোনো যায়। ডানে দেয়াল খুললে গ্যাস শূন্যে ছড়ায়: Q = 0, W = 0, আর আদর্শ গ্যাসে ΔU = 0।";
  }
  if (model.focus === "curves" || model.focus === "compare") {
    const adi = processState("adiabatic", params, 1);
    const iso = processState("isothermal", params, 1);
    return en
      ? `Same expansion to ${num(params.volume * params.ratio, lang, 1)} L. Isothermal pressure stays ${num(iso.pressure, lang, 0)} kPa. Adiabatic pressure falls to ${num(adi.pressure, lang, 0)} kPa and T to ${num(adi.temp, lang, 0)} K.`
      : `একই প্রসারণ ${num(params.volume * params.ratio, lang, 1)} L পর্যন্ত। সমতাপে চাপ থাকে ${num(iso.pressure, lang, 0)} kPa। রুদ্ধতাপে চাপ নামে ${num(adi.pressure, lang, 0)} kPa এবং তাপমাত্রা ${num(adi.temp, lang, 0)} K।`;
  }
  if (model.family === "engine" || model.focus === "cycle" || model.focus === "flow" || model.focus === "second") {
    const score = efficiency(params);
    return en
      ? `Between ${num(score.hot, lang, 0)} K and ${num(score.cold, lang, 0)} K a Carnot engine has efficiency ${num(score.engine * 100, lang, 1)}%. A fridge COP is ${num(score.fridge, lang)} and a heat-pump COP is ${num(score.pump, lang)}.`
      : `${num(score.hot, lang, 0)} K ও ${num(score.cold, lang, 0)} K-এর মধ্যে কার্নো দক্ষতা ${num(score.engine * 100, lang, 1)}%। হিমায়কের COP ${num(score.fridge, lang)}, হিট পাম্পের COP ${num(score.pump, lang)}।`;
  }
  const end = processState(kindOf(model.focus), params, 1);
  return en
    ? `From the slider values the end state is ${num(end.temp, lang, 0)} K and ${num(end.pressure, lang, 0)} kPa. Heat ${joule(end.heat, lang)}, internal energy ${joule(end.energy, lang)}, work by the gas ${joule(end.work, lang)}.`
    : `স্লাইডারের মানে শেষ অবস্থা ${num(end.temp, lang, 0)} K ও ${num(end.pressure, lang, 0)} kPa। তাপ ${joule(end.heat, lang)}, অভ্যন্তরীণ শক্তি ${joule(end.energy, lang)}, গ্যাসের কাজ ${joule(end.work, lang)}।`;
}

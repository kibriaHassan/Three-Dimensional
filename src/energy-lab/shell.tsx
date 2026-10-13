"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { fmt, show } from "@/vector-lab/math";
import { energyModels, energySection, paramsOf, type EnergyModel, type Knob } from "./catalog";
import {
  G,
  PENDULUM_LENGTH,
  TRACK_RADIUS,
  circularForce,
  collisionEnergy,
  efficiencyOf,
  elastic,
  fallSpeed,
  frictionWork,
  instantPower,
  kinetic,
  pendulumAmp,
  pendulumHeight,
  potential,
  powerOf,
  springAmplitude,
  stoppingDistance,
  throwHeight,
  workOf,
  type Params,
} from "./physics";
import { EnergyViewport } from "./viewport";

const knobText = {
  bn: {
    force: "বল F",
    mass: "ভর m",
    angle: "কোণ θ",
    height: "উচ্চতা h",
    speed: "বেগ v",
    span: "সরণ s",
    spring: "স্প্রিং ধ্রুবক k",
    time: "সময় t",
    friction: "ঘর্ষণ গুণাঙ্ক μ",
  },
  en: {
    force: "Force F",
    mass: "Mass m",
    angle: "Angle θ",
    height: "Height h",
    speed: "Speed v",
    span: "Displacement s",
    spring: "Spring constant k",
    time: "Time t",
    friction: "Friction μ",
  },
} as const;

const chapterHref = "/?board=paper-1&chapter=energy";

export function EnergyShell({ model }: { model: EnergyModel }) {
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

  const index = energyModels.findIndex((item) => item.slug === model.slug);
  const prev = index > 0 ? energyModels[index - 1] : null;
  const next = index < energyModels.length - 1 ? energyModels[index + 1] : null;
  const title = lang === "en" ? model.titleEn : model.title;
  const blurb = lang === "en" ? model.blurbEn : model.blurb;
  const explain = lang === "en" ? model.explainEn : model.explain;
  const rows = lesson(model, params, lang);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <BrandLockup href={chapterHref} caption={t("energyChapter")} />
          <SiteBar active="paper-1" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("energyChapter")} · {energySection(model.section, lang)} · {lang === "bn" ? show(model.no, 0) : model.no} /{" "}
              {lang === "bn" ? show(energyModels.length, 0) : energyModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/energy/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href={chapterHref} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/energy/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <EnergyViewport
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
                    label={labelOf(knob, model.focus, lang)}
                    spec={specOf(knob, model.focus)}
                    value={params[knob]}
                    lang={lang}
                    onChange={(value) => setParams((current) => ({ ...current, [knob]: value }))}
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

function labelOf(knob: Knob, focus: string, lang: "bn" | "en") {
  if (knob === "friction" && focus === "efficiency") return lang === "bn" ? "অপচয়ের ভাগ" : "Wasted fraction";
  if (knob === "span" && (focus === "elastic" || focus === "variable")) return lang === "bn" ? "প্রসারণ x" : "Extension x";
  if (knob === "angle" && focus === "pendulum") return lang === "bn" ? "বিস্তার θ" : "Amplitude θ";
  if (knob === "speed" && focus === "coaster") return lang === "bn" ? "চূড়ায় বেগ" : "Speed at the top";
  return knobText[lang][knob];
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

function specOf(knob: Knob, focus: string) {
  if (knob === "force") return { min: 2, max: 40, step: 1, suffix: " N" };
  if (knob === "mass") return { min: focus === "lifters" ? 5 : 0.5, max: focus === "lifters" ? 80 : 8, step: focus === "lifters" ? 1 : 0.1, suffix: " kg" };
  if (knob === "angle") return focus === "pendulum" ? { min: 10, max: 70, step: 1, suffix: "°" } : { min: 0, max: 180, step: 5, suffix: "°" };
  if (knob === "height") return { min: 0.5, max: 8, step: 0.1, suffix: " m" };
  if (knob === "speed") return { min: 0, max: 12, step: 0.1, suffix: " m/s" };
  if (knob === "span") {
    if (focus === "elastic" || focus === "variable") return { min: 0.05, max: 0.6, step: 0.01, suffix: " m" };
    return { min: 0.5, max: 6, step: 0.1, suffix: " m" };
  }
  if (knob === "spring") return { min: 20, max: 200, step: 5, suffix: " N/m" };
  if (knob === "time") return { min: 1, max: 12, step: 0.5, suffix: " s" };
  return { min: 0, max: 0.8, step: 0.05, suffix: focus === "efficiency" ? "" : "" };
}

function num(value: number, lang: "bn" | "en", digits = 1) {
  if (!Number.isFinite(value)) return "—";
  return lang === "bn" ? show(value, digits) : fmt(value, digits);
}

function joule(value: number, lang: "bn" | "en") {
  const digits = Math.abs(value) >= 100 ? 0 : 1;
  return `${num(value, lang, digits)} J`;
}

function watt(value: number, lang: "bn" | "en") {
  return `${num(value, lang, 1)} W`;
}

function lesson(model: EnergyModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  const rows: { label: string; value: string; wide?: boolean }[] = [];
  const push = (bn: string, labelEn: string, value: string, wide = false) => rows.push({ label: en ? labelEn : bn, value, wide });
  const focus = model.focus;

  if (focus === "push" || focus === "angle" || focus === "sign" || focus === "area") {
    const work = workOf(params.force, params.span, focus === "sign" ? 0 : params.angle);
    push("F", "F", `${num(params.force, lang, 0)} N`);
    push("s", "s", `${num(params.span, lang)} m`);
    if (focus !== "push") push("θ", "θ", `${num(focus === "sign" ? 0 : params.angle, lang, 0)}°`);
    if (focus === "sign") {
      push("ধনাত্মক", "Positive", joule(workOf(params.force, params.span, 0), lang));
      push("শূন্য", "Zero", joule(0, lang));
      push("ঋণাত্মক", "Negative", joule(workOf(params.force, params.span, 180), lang), true);
    } else push("W", "W", joule(work, lang), true);
    return rows;
  }

  if (focus === "gravity" || focus === "potential" || focus === "lifters") {
    const energy = potential(params.mass, params.height);
    push("mg", "mg", `${num(params.mass * G, lang)} N`);
    push("h", "h", `${num(params.height, lang)} m`);
    push(focus === "potential" ? "U" : "W", focus === "potential" ? "U" : "W", joule(energy, lang), true);
    if (focus === "lifters") {
      push("মানুষ", "Person", watt(powerOf(energy, params.time), lang));
      push("মোটর", "Motor", watt(powerOf(energy, params.time / 2), lang));
      push("ক্রেন", "Crane", watt(powerOf(energy, params.time / 4), lang), true);
    }
    return rows;
  }

  if (focus === "kinetic" || focus === "speeds") {
    const k = kinetic(params.mass, params.speed);
    push("m", "m", `${num(params.mass, lang)} kg`);
    push("v", "v", `${num(params.speed, lang)} m/s`);
    if (focus === "speeds") {
      push("K", "K", joule(k, lang));
      push("৪K", "4K", joule(4 * k, lang));
      push("৯K", "9K", joule(9 * k, lang), true);
    } else push("K", "K", joule(k, lang), true);
    return rows;
  }

  if (focus === "elastic" || focus === "variable") {
    const stored = elastic(params.spring, params.span);
    push("k", "k", `${num(params.spring, lang, 0)} N/m`);
    push("x", "x", `${num(params.span, lang, 2)} m`);
    push("F = kx", "F = kx", `${num(params.spring * params.span, lang)} N`);
    push(focus === "variable" ? "W" : "U", focus === "variable" ? "W" : "U", joule(stored, lang));
    return rows;
  }

  if (focus === "fall" || focus === "exchange" || focus === "conserve") {
    const energy = potential(params.mass, params.height);
    push("U", "U", joule(energy, lang));
    push("নিচে v", "v at bottom", `${num(fallSpeed(params.height), lang, 2)} m/s`);
    push("K + U", "K + U", joule(energy, lang), true);
    return rows;
  }

  if (focus === "throw") {
    const k = kinetic(params.mass, params.speed);
    push("K", "K", joule(k, lang));
    push("h", "h", `${num(throwHeight(params.speed), lang, 2)} m`);
    push("চূড়ায় U", "U at top", joule(k, lang), true);
    return rows;
  }

  if (focus === "pendulum") {
    const amp = pendulumAmp(params.angle);
    const energy = potential(params.mass, pendulumHeight(amp));
    push("L", "L", `${num(PENDULUM_LENGTH, lang)} m`);
    push("θ", "θ", `${num((amp * 180) / Math.PI, lang, 0)}°`);
    push("U_max", "U_max", joule(energy, lang));
    push("টানের কাজ", "Tension work", joule(0, lang));
    return rows;
  }

  if (focus === "coaster") {
    const total = potential(params.mass, params.height) + kinetic(params.mass, params.speed);
    push("U", "U", joule(potential(params.mass, params.height), lang));
    push("K", "K", joule(kinetic(params.mass, params.speed), lang));
    push("মোট", "Total", joule(total, lang), true);
    return rows;
  }

  if (focus === "hit") {
    const before = kinetic(params.mass, params.speed);
    const amp = springAmplitude(params.mass, params.speed, params.spring);
    push("K", "K", joule(before, lang));
    push("A", "A", `${num(amp, lang, 2)} m`);
    push("U_max", "U_max", joule(elastic(params.spring, amp), lang), true);
    return rows;
  }

  if (focus === "friction") {
    const stop = stoppingDistance(params.speed, params.friction);
    const distance = Number.isFinite(stop) ? stop : 0;
    push("K", "K", joule(kinetic(params.mass, params.speed), lang));
    push("s", "s", Number.isFinite(stop) ? `${num(stop, lang, 2)} m` : "∞");
    push("W_f", "W_f", joule(frictionWork(params.mass, params.friction, distance), lang), true);
    return rows;
  }

  if (focus === "rate" || focus === "times") {
    const work = workOf(params.force, params.span, 0);
    push("W", "W", joule(work, lang));
    push("t", "t", `${num(params.time, lang)} s`);
    if (focus === "times") {
      push("P", "P", watt(powerOf(work, params.time), lang));
      push("P/২", "P/2", watt(powerOf(work, params.time * 2), lang));
      push("P/৩", "P/3", watt(powerOf(work, params.time * 3), lang), true);
    } else push("P", "P", watt(powerOf(work, params.time), lang), true);
    return rows;
  }

  if (focus === "instant") {
    const now = instantPower(params.force, params.speed);
    const distance = 0.5 * params.speed * params.time;
    const avg = powerOf(workOf(params.force, distance, 0), params.time);
    push("Fv", "Fv", watt(now, lang));
    push("W/t", "W/t", watt(avg, lang));
    push("s", "s", `${num(distance, lang, 2)} m`, true);
    return rows;
  }

  if (focus === "efficiency") {
    const input = workOf(params.force, params.span, 0);
    const eta = efficiencyOf(params.friction);
    push("দেওয়া", "Input", joule(input, lang));
    push("η", "η", `${num(eta * 100, lang, 0)}%`);
    push("কাজ", "Useful", joule(input * eta, lang));
    push("তাপ", "Heat", joule(input * (1 - eta), lang));
    return rows;
  }

  if (focus === "collision") {
    const energy = collisionEnergy(params.mass, params.speed);
    push("আগে", "Before", joule(energy.before, lang));
    push("ভরবেগ", "Momentum", `${num(params.mass * params.speed, lang)} kg m/s`);
    push("স্থিতিস্থাপক", "Elastic", joule(energy.elastic, lang));
    push("অস্থিতিস্থাপক", "Inelastic", joule(energy.inelastic, lang));
    return rows;
  }

  const force = circularForce(params.mass, params.speed);
  push("r", "r", `${num(TRACK_RADIUS, lang)} m`);
  push("F", "F", `${num(force, lang)} N`);
  push("K", "K", joule(kinetic(params.mass, params.speed), lang));
  push("W", "W", joule(0, lang));
  return rows;
}

function exampleOf(model: EnergyModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  const work = workOf(params.force, params.span, params.angle);
  if (model.focus === "push" || model.focus === "angle" || model.focus === "area") {
    return en
      ? `A ${num(params.force, lang, 0)} N force through ${num(params.span, lang)} m at ${num(params.angle, lang, 0)}° does ${joule(work, lang)}.`
      : `${num(params.force, lang, 0)} N বল ${num(params.span, lang)} m সরণে ${num(params.angle, lang, 0)}° কোণে ${joule(work, lang)} কাজ করে।`;
  }
  if (model.focus === "sign") {
    return en
      ? `The same push does ${joule(workOf(params.force, params.span, 0), lang)}, 0 J, and ${joule(workOf(params.force, params.span, 180), lang)}.`
      : `একই ধাক্কায় কাজ ${joule(workOf(params.force, params.span, 0), lang)}, 0 J ও ${joule(workOf(params.force, params.span, 180), lang)}।`;
  }
  if (model.focus === "gravity" || model.focus === "potential") {
    return en
      ? `Lifting ${num(params.mass, lang)} kg by ${num(params.height, lang)} m stores ${joule(potential(params.mass, params.height), lang)}.`
      : `${num(params.mass, lang)} kg ভর ${num(params.height, lang)} m তুললে ${joule(potential(params.mass, params.height), lang)} জমা হয়।`;
  }
  if (model.focus === "kinetic" || model.focus === "speeds") {
    return en
      ? `${num(params.mass, lang)} kg at ${num(params.speed, lang)} m/s has ${joule(kinetic(params.mass, params.speed), lang)}.`
      : `${num(params.mass, lang)} kg ভর ${num(params.speed, lang)} m/s বেগে ${joule(kinetic(params.mass, params.speed), lang)} গতিশক্তি রাখে।`;
  }
  if (model.focus === "friction") {
    const stop = stoppingDistance(params.speed, params.friction);
    return en
      ? `It stops in ${Number.isFinite(stop) ? `${num(stop, lang, 2)} m` : "an endless slide"}.`
      : Number.isFinite(stop)
        ? `${num(stop, lang, 2)} m গিয়ে থামে। হারানো শক্তি তাপ।`
        : "μ = ০, তাই ঘর্ষণ থামায় না।";
  }
  if (model.focus === "collision") {
    const energy = collisionEnergy(params.mass, params.speed);
    return en
      ? `Inelastic kinetic energy falls from ${joule(energy.before, lang)} to ${joule(energy.inelastic, lang)}.`
      : `অস্থিতিস্থাপক ধাক্কায় গতিশক্তি ${joule(energy.before, lang)} থেকে ${joule(energy.inelastic, lang)} হয়।`;
  }
  if (model.focus === "efficiency") {
    const eta = efficiencyOf(params.friction);
    return en
      ? `${num(eta * 100, lang, 0)}% of the input does useful work.`
      : `দেওয়া শক্তির ${num(eta * 100, lang, 0)}% কাজে লাগে।`;
  }
  return en ? "Move a slider and the scene and the numbers change together." : "স্লাইডার নাড়লে দৃশ্য ও পাশের সংখ্যা একসাথে বদলায়।";
}

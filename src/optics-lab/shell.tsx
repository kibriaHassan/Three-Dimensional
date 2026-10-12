"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { fmt, show } from "@/vector-lab/math";
import { opticsModels, paramsOf, sectionLabel, type Knob, type OpticsModel } from "./catalog";
import {
  brightY,
  centralWidth,
  darkY,
  frequencyHz,
  fringeBeta,
  malus,
  minimumY,
  onScreen,
  youngAt,
  type Params,
} from "./physics";
import { OpticsViewport } from "./viewport";

const knobText = {
  bn: {
    lambda: "তরঙ্গদৈর্ঘ্য λ",
    d: "দুই চিরের দূরত্ব d",
    D: "পর্দার দূরত্ব D",
    a: "চিরের প্রস্থ a",
    phase: "দশা পার্থক্য φ",
    theta: "অক্ষের কোণ θ",
    tilt: "কম্পন তলের কোণ α",
    amp: "বিস্তার A",
    slits: "চিরের সংখ্যা N",
    order: "ক্রম n",
  },
  en: {
    lambda: "Wavelength λ",
    d: "Slit separation d",
    D: "Screen distance D",
    a: "Slit width a",
    phase: "Phase difference φ",
    theta: "Axis angle θ",
    tilt: "Angle between planes α",
    amp: "Amplitude A",
    slits: "Number of slits N",
    order: "Order n",
  },
} as const;

export function OpticsShell({ model }: { model: OpticsModel }) {
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

  const index = opticsModels.findIndex((item) => item.slug === model.slug);
  const prev = index > 0 ? opticsModels[index - 1] : null;
  const next = index < opticsModels.length - 1 ? opticsModels[index + 1] : null;
  const title = lang === "en" ? model.titleEn : model.title;
  const blurb = lang === "en" ? model.blurbEn : model.blurb;
  const explain = lang === "en" ? model.explainEn : model.explain;
  const rows = lesson(model, params, lang);
  const note = cue(model, params, lang);

  function setKnob(key: Knob, value: number) {
    setParams((current) => ({ ...current, ...patch(key, value) }));
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <BrandLockup href="/?board=paper-2&chapter=phys-optics" caption={t("opticsChapter")} />
          <SiteBar active="paper-2" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("opticsChapter")} · {sectionLabel(model.section, lang)} · {lang === "bn" ? show(model.no, 0) : model.no} /{" "}
              {lang === "bn" ? show(opticsModels.length, 0) : opticsModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/optics/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href="/?board=paper-2&chapter=phys-optics" className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/optics/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <OpticsViewport
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
                    spec={specOf(knob, model)}
                    value={valueOf(knob, params)}
                    lang={lang}
                    onChange={(value) => setKnob(knob, value)}
                  />
                ))}
              </div>
            ) : null}
            {note ? <p className="rounded-2xl bg-copper px-3 py-2 text-sm font-bold leading-relaxed text-white">{note}</p> : null}
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

function specOf(knob: Knob, model: OpticsModel) {
  if (knob === "lambda") return { min: 400, max: 700, step: 5, suffix: " nm" };
  if (knob === "d") return { min: 0.1, max: 0.8, step: 0.01, suffix: " mm" };
  if (knob === "D") return { min: 0.5, max: 2, step: 0.05, suffix: " m" };
  if (knob === "a") return { min: 0.04, max: 0.25, step: 0.01, suffix: " mm" };
  if (knob === "phase") return { min: 0, max: 360, step: 1, suffix: "°" };
  if (knob === "theta") return { min: 0, max: 180, step: 1, suffix: "°" };
  if (knob === "tilt") return { min: 0, max: 90, step: 1, suffix: "°" };
  if (knob === "amp") return { min: 0.4, max: 1.6, step: 0.1, suffix: "" };
  if (knob === "slits") return { min: 2, max: 6, step: 1, suffix: "" };
  return { min: model.focus === "dark" || model.focus === "minima" ? 1 : 0, max: 4, step: 1, suffix: "" };
}

function valueOf(knob: Knob, params: Params) {
  if (knob === "lambda") return params.lambdaNm;
  if (knob === "d") return params.dMm;
  if (knob === "D") return params.screenM;
  if (knob === "a") return params.aMm;
  if (knob === "phase") return params.phaseDeg;
  if (knob === "theta") return params.thetaDeg;
  if (knob === "tilt") return params.tiltDeg;
  if (knob === "amp") return params.amp;
  if (knob === "slits") return params.nSlits;
  return params.order;
}

function patch(knob: Knob, value: number): Partial<Params> {
  if (knob === "lambda") return { lambdaNm: value };
  if (knob === "d") return { dMm: value };
  if (knob === "D") return { screenM: value };
  if (knob === "a") return { aMm: value };
  if (knob === "phase") return { phaseDeg: value };
  if (knob === "theta") return { thetaDeg: value };
  if (knob === "tilt") return { tiltDeg: value };
  if (knob === "amp") return { amp: value };
  if (knob === "slits") return { nSlits: Math.round(value) };
  return { order: Math.round(value) };
}

function num(value: number, lang: "bn" | "en", digits = 2) {
  return lang === "bn" ? show(value, digits) : fmt(value, digits);
}

function lesson(model: OpticsModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  const rows: { label: string; value: string; wide?: boolean }[] = [];
  const push = (bn: string, labelEn: string, value: string, wide = false) => rows.push({ label: en ? labelEn : bn, value, wide });

  if (model.family === "pair") {
    const factor = Math.cos(((params.phaseDeg * Math.PI) / 180) / 2);
    push("দশা φ", "Phase φ", `${num(params.phaseDeg, lang, 0)}°`);
    push("লব্ধি বিস্তার", "Resultant amplitude", num(2 * params.amp * Math.abs(factor), lang));
    push("I / Imax", "I / Imax", num(factor * factor, lang), true);
    return rows;
  }

  if (model.family === "polar") {
    if (!model.knobs.includes("theta")) {
      push("অবস্থা", "State", model.focus === "unpolarized" ? (en ? "Every direction" : "সব দিক") : en ? "One plane" : "এক তল", true);
      if (model.focus === "polarizer") push("তীব্রতা", "Intensity", en ? "I₀ = I/2" : "I₀ = I/২", true);
      return rows;
    }
    const ratio = malus(params.thetaDeg).ratio;
    push("θ", "θ", `${num(params.thetaDeg, lang, 0)}°`);
    push("cos²θ", "cos²θ", num(ratio, lang));
    push("I / I₀", "I / I₀", num(ratio, lang), true);
    return rows;
  }

  if (model.family === "front") {
    const f = frequencyHz(params) / 1e14;
    push("λ", "λ", `${num(params.lambdaNm, lang, 0)} nm`);
    push("f", "f", `${num(f, lang)} × 10¹⁴ Hz`, true);
    push("c = fλ", "c = fλ", en ? "3.00 × 10⁸ m/s" : "৩.০০ × ১০⁸ m/s", true);
    return rows;
  }

  if (model.family === "slit" || model.focus === "compare") {
    const width = centralWidth(params) * 1e3;
    const first = minimumY(1, params) * 1e3;
    push("λ", "λ", `${num(params.lambdaNm, lang, 0)} nm`);
    push("a", "a", `${num(params.aMm, lang)} mm`);
    push("W = 2λD/a", "W = 2λD/a", `${num(width, lang)} mm`, true);
    push("প্রথম অন্ধকার", "First minimum", `${num(first, lang)} mm`, true);
    if (model.family === "compare") {
      push("β = λD/d", "β = λD/d", `${num(fringeBeta(params) * 1e3, lang)} mm`, true);
    }
    return rows;
  }

  if (model.family === "multi") {
    push("N", "N", num(params.nSlits, lang, 0));
    push("d", "d", `${num(params.dMm, lang)} mm`);
    push("a", "a", `${num(params.aMm, lang)} mm`);
    push("কেন্দ্রে I/I₀", "I/I₀ at centre", "1", true);
    return rows;
  }

  const order = model.focus === "dark" ? Math.max(1, params.order) : params.order;
  const y = model.focus === "dark" ? darkY(order, params) : brightY(order, params);
  const at = youngAt(y, params);
  push("β = λD/d", "β = λD/d", `${num(fringeBeta(params) * 1e3, lang)} mm`, true);
  push(model.focus === "dark" ? "অন্ধকার yₙ" : "উজ্জ্বল yₙ", model.focus === "dark" ? "Dark yₙ" : "Bright yₙ", `${num(y * 1e3, lang)} mm`);
  push("δ", "δ", `${num(at.delta * 1e9, lang, 1)} nm`);
  push("φ", "φ", `${num(at.phi / Math.PI, lang)} π`);
  push("I/Imax", "I/Imax", num(at.I, lang));
  if (!onScreen(y)) push("নোট", "Note", en ? "This order is outside the drawn screen." : "এই ক্রম আঁকা পর্দার বাইরে।", true);
  return rows;
}

function cue(model: OpticsModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  if (model.family === "pair") {
    const intensity = Math.cos(((params.phaseDeg * Math.PI) / 180) / 2) ** 2;
    if (intensity > 0.97) return en ? "Constructive. The amplitudes add." : "গঠনমূলক। বিস্তার যোগ হচ্ছে।";
    if (intensity < 0.03) return en ? "Destructive. The waves cancel." : "ধ্বংসাত্মক। তরঙ্গ কাটছে।";
  }
  if (model.family === "polar" && model.knobs.includes("theta")) {
    if (params.thetaDeg > 88 && params.thetaDeg < 92) return en ? "Axes are crossed. Intensity is zero." : "অক্ষ লম্ব। তীব্রতা শূন্য।";
    if (params.thetaDeg < 2 || params.thetaDeg > 178) return en ? "Axes are parallel. Intensity is maximum." : "অক্ষ সমান্তরাল। তীব্রতা সর্বোচ্চ।";
  }
  if (model.focus === "polarized" && params.tiltDeg > 85) return en ? "Vibrations are perpendicular, so the fringes vanish." : "কম্পন লম্ব, তাই ডোরা মিলিয়ে গেছে।";
  return null;
}

function exampleOf(model: OpticsModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  if (model.family === "young" || model.family === "compare") {
    const beta = fringeBeta(params) * 1e3;
    return en
      ? `Take λ = ${fmt(params.lambdaNm, 0)} nm, d = ${fmt(params.dMm)} mm and D = ${fmt(params.screenM)} m. Then β = λD/d = ${fmt(beta)} mm. Sodium yellow light is about 589 nm — set the slider there and read β again.`
      : `ধরো λ = ${show(params.lambdaNm, 0)} nm, d = ${show(params.dMm)} mm, D = ${show(params.screenM)} m। তাহলে β = λD/d = ${show(beta)} mm। সোডিয়ামের হলুদ আলো প্রায় ৫৮৯ nm — স্লাইডারে বসিয়ে β আবার পড়ো।`;
  }
  if (model.family === "slit" || model.family === "multi") {
    const width = centralWidth(params) * 1e3;
    return en
      ? `With λ = ${fmt(params.lambdaNm, 0)} nm, a = ${fmt(params.aMm)} mm and D = ${fmt(params.screenM)} m, the central band is W = 2λD/a = ${fmt(width)} mm wide. The first dark band is at half of that.`
      : `λ = ${show(params.lambdaNm, 0)} nm, a = ${show(params.aMm)} mm, D = ${show(params.screenM)} m হলে কেন্দ্রীয় ডোরার প্রস্থ W = 2λD/a = ${show(width)} mm। প্রথম অন্ধকার এর অর্ধেক দূরে।`;
  }
  if (model.family === "polar") {
    const ratio = malus(params.thetaDeg).ratio;
    return en
      ? `At θ = ${fmt(params.thetaDeg, 0)}°, Malus’s law gives I/I₀ = cos²θ = ${fmt(ratio)}. At 60° the screen keeps one quarter of I₀. At 90° it is dark.`
      : `θ = ${show(params.thetaDeg, 0)}° হলে মালুসের সূত্রে I/I₀ = cos²θ = ${show(ratio)}। ৬০°-এ পর্দায় I₀-এর এক-চতুর্থাংশ থাকে। ৯০°-এ অন্ধকার।`;
  }
  if (model.family === "front") {
    const f = frequencyHz(params) / 1e14;
    return en
      ? `λ = ${fmt(params.lambdaNm, 0)} nm gives f = c/λ = ${fmt(f)} × 10¹⁴ Hz. Green light near 550 nm is about 5.45 × 10¹⁴ Hz.`
      : `λ = ${show(params.lambdaNm, 0)} nm হলে f = c/λ = ${show(f)} × ১০¹⁴ Hz। ৫৫০ nm সবুজ আলো প্রায় ৫.৪৫ × ১০¹⁴ Hz।`;
  }
  const factor = Math.cos(((params.phaseDeg * Math.PI) / 180) / 2);
  return en
    ? `At φ = ${fmt(params.phaseDeg, 0)}° the resultant amplitude is 2A cos(φ/2) = ${fmt(2 * params.amp * Math.abs(factor))} (A = ${fmt(params.amp)}). Intensity is ${fmt(factor * factor)} of the maximum.`
    : `φ = ${show(params.phaseDeg, 0)}° হলে লব্ধি বিস্তার 2A cos(φ/2) = ${show(2 * params.amp * Math.abs(factor))} (A = ${show(params.amp)})। তীব্রতা সর্বোচ্চের ${show(factor * factor)} অংশ।`;
}

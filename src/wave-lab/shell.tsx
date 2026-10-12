"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { fmt, show } from "@/vector-lab/math";
import { paramsOf, sectionLabel, waveModels, type Knob, type WaveModel } from "./catalog";
import {
  SOUND_V,
  closedFreq,
  closedWavelength,
  dopplerFreq,
  echoTime,
  harmonicFreq,
  intensityRatio,
  loudnessFactor,
  nodeAntinodeGap,
  nodeGap,
  periodOf,
  resultantAmp,
  soundWavelength,
  stringWavelength,
  velocity,
  type Params,
} from "./physics";
import { WaveViewport } from "./viewport";

const knobText = {
  bn: {
    amp: "বিস্তার A",
    freq: "কম্পাঙ্ক f",
    lambda: "তরঙ্গদৈর্ঘ্য λ",
    speed: "বেগ v",
    phase: "দশা φ",
    harmonic: "হারমোনিক n",
    vs: "উৎসের বেগ vₛ",
    vo: "পর্যবেক্ষকের বেগ vₒ",
    gap: "ফাঁকের প্রস্থ",
    distance: "দূরত্ব d",
    length: "দৈর্ঘ্য L",
  },
  en: {
    amp: "Amplitude A",
    freq: "Frequency f",
    lambda: "Wavelength λ",
    speed: "Speed v",
    phase: "Phase φ",
    harmonic: "Harmonic n",
    vs: "Source speed vₛ",
    vo: "Observer speed vₒ",
    gap: "Gap width",
    distance: "Distance d",
    length: "Length L",
  },
} as const;

const chapterHref = "/?board=paper-1&chapter=wave";

export function WaveShell({ model }: { model: WaveModel }) {
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

  const index = waveModels.findIndex((item) => item.slug === model.slug);
  const prev = index > 0 ? waveModels[index - 1] : null;
  const next = index < waveModels.length - 1 ? waveModels[index + 1] : null;
  const title = lang === "en" ? model.titleEn : model.title;
  const blurb = lang === "en" ? model.blurbEn : model.blurb;
  const explain = lang === "en" ? model.explainEn : model.explain;
  const rows = lesson(model, params, lang);
  const note = cue(model, params, lang);

  function setKnob(key: Knob, value: number) {
    setParams((current) => {
      const next = { ...current, [key]: key === "harmonic" ? Math.round(value) : value };
      if (model.mode === "string") {
        const n = Math.max(1, next.harmonic);
        next.lambda = (2 * next.length) / n;
        next.freq = (n * next.speed) / (2 * next.length);
        return next;
      }
      if (model.mode === "pipe" && key !== "freq") {
        if (model.focus === "shift" || model.focus === "sound-res") return next;
        const n = Math.max(1, next.harmonic);
        const closed = model.focus === "closed";
        next.freq = closed ? closedFreq(n, next.length) : harmonicFreq(n, SOUND_V, next.length);
        next.lambda = closed ? closedWavelength(n, next.length) : stringWavelength(n, next.length);
        return next;
      }
      if (model.mode === "sound" && key === "freq") {
        next.lambda = soundWavelength(next.freq);
        return next;
      }
      if (model.mode === "doppler" || model.mode === "echo") return next;
      if (key === "speed") next.lambda = next.speed / Math.max(0.05, next.freq);
      if (key === "freq" && (model.focus === "lambda-f" || model.focus === "speed" || model.focus === "speed-change")) {
        next.lambda = next.speed / Math.max(0.05, next.freq);
      } else if (key === "freq" && model.focus === "l-fixed") {
        next.speed = next.freq * next.lambda;
      } else if (key === "freq" && model.knobs.includes("lambda")) {
        next.speed = next.freq * next.lambda;
      }
      if (key === "lambda") next.speed = next.freq * next.lambda;
      return next;
    });
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <Link href={chapterHref} className="flex shrink-0 items-center gap-3 text-ink no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-ink bg-paper-2 shadow-[4px_4px_0_#14211c]">
              <span className="block h-4 w-4 rotate-45 border border-ink bg-gradient-to-br from-transparent from-40% to-copper to-40%" />
            </span>
            <span className="hidden sm:block">
              <strong className="block font-serif text-2xl font-normal leading-none">ত্রিমাত্র</strong>
              <small className="text-xs text-muted">{t("waveChapter")}</small>
            </span>
          </Link>
          <SiteBar active="paper-1" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("waveChapter")} · {sectionLabel(model.section, lang)} · {lang === "bn" ? show(model.no, 0) : model.no} /{" "}
              {lang === "bn" ? show(waveModels.length, 0) : waveModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/wave/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href={chapterHref} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/wave/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <WaveViewport
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
                    value={params[knob]}
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

function specOf(knob: Knob, model: WaveModel) {
  if (knob === "amp") return { min: 1, max: 8, step: 0.1, suffix: " cm" };
  if (knob === "phase") return { min: 0, max: 360, step: 1, suffix: "°" };
  if (knob === "harmonic") return { min: 1, max: 5, step: 1, suffix: "" };
  if (knob === "vs") return { min: -60, max: 80, step: 1, suffix: " m/s" };
  if (knob === "vo") return { min: -40, max: 40, step: 1, suffix: " m/s" };
  if (knob === "gap") return { min: 0.12, max: 1.2, step: 0.01, suffix: " m" };
  if (knob === "distance") return { min: 10, max: 200, step: 1, suffix: " m" };
  if (knob === "length") return { min: model.mode === "pipe" ? 0.25 : 0.4, max: model.mode === "pipe" ? 1.2 : 1.5, step: 0.05, suffix: " m" };
  if (knob === "lambda") return { min: 0.4, max: 2.4, step: 0.05, suffix: " m" };
  if (knob === "speed") return model.mode === "string" ? { min: 50, max: 400, step: 1, suffix: " m/s" } : { min: 0.4, max: 4, step: 0.05, suffix: " m/s" };
  if (model.mode === "sound") return { min: 200, max: 1600, step: 10, suffix: " Hz" };
  if (model.mode === "pipe") return { min: 80, max: 1400, step: 5, suffix: " Hz" };
  if (model.mode === "doppler") return { min: 200, max: 1200, step: 10, suffix: " Hz" };
  return { min: 0.4, max: 2.5, step: 0.05, suffix: " Hz" };
}

function num(value: number, lang: "bn" | "en", digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return lang === "bn" ? show(value, digits) : fmt(value, digits);
}

function lesson(model: WaveModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  const rows: { label: string; value: string; wide?: boolean }[] = [];
  const push = (bn: string, labelEn: string, value: string, wide = false) => rows.push({ label: en ? labelEn : bn, value, wide });
  const n = Math.max(1, Math.round(params.harmonic));

  if (model.mode === "doppler") {
    const heard = dopplerFreq(params.freq, params.vs, params.vo);
    push("f", "f", `${num(params.freq, lang, 0)} Hz`);
    push("f′", "f′", Number.isFinite(heard) ? `${num(heard, lang, 1)} Hz` : "—");
    push("vₛ", "vₛ", `${num(params.vs, lang, 0)} m/s`);
    push("vₒ", "vₒ", `${num(params.vo, lang, 0)} m/s`, true);
    return rows;
  }

  if (model.mode === "echo") {
    const t = echoTime(params.distance);
    push("d", "d", `${num(params.distance, lang, 0)} m`);
    push("t = 2d/v", "t = 2d/v", `${num(t, lang)} s`, true);
    push("v", "v", `${num(SOUND_V, lang, 0)} m/s`);
    push("ন্যূনতম পথ", "Least path", en ? "about 34 m" : "প্রায় ৩৪ m");
    return rows;
  }

  if (model.mode === "string" || (model.mode === "pipe" && model.focus !== "shift" && model.focus !== "sound-res" && model.focus !== "closed")) {
    const freq = harmonicFreq(n, model.mode === "pipe" ? SOUND_V : params.speed, params.length);
    const lam = stringWavelength(n, params.length);
    push("n", "n", num(n, lang, 0));
    push("L", "L", `${num(params.length, lang)} m`);
    push("fₙ", "fₙ", `${num(freq, lang, 1)} Hz`);
    push("λₙ", "λₙ", `${num(lam, lang)} m`, true);
    return rows;
  }

  if (model.focus === "closed") {
    push("n", "n", num(n, lang, 0));
    push("L", "L", `${num(params.length, lang)} m`);
    push("fₙ", "fₙ", `${num(closedFreq(n, params.length), lang, 1)} Hz`);
    push("λ", "λ", `${num(closedWavelength(n, params.length), lang)} m`, true);
    return rows;
  }

  if (model.focus === "shift" || model.focus === "sound-res") {
    const natural = harmonicFreq(n, SOUND_V, params.length);
    push("চালক f", "Driver f", `${num(params.freq, lang, 0)} Hz`);
    push("স্বাভাবিক fₙ", "Natural fₙ", `${num(natural, lang, 1)} Hz`, true);
    push("L", "L", `${num(params.length, lang)} m`);
    push("n", "n", num(n, lang, 0));
    return rows;
  }

  if (model.family === "super") {
    push("φ", "φ", `${num(params.phase, lang, 0)}°`);
    push("A′", "A′", num(resultantAmp(params.amp, params.phase), lang));
    push("I/Imax", "I/Imax", num(intensityRatio(params.phase), lang), true);
    return rows;
  }

  if (model.family === "shm" || model.section === "shm") {
    const omega = Math.PI * 2 * params.freq;
    const meters = params.amp / 100;
    push("A", "A", `${num(params.amp, lang)} cm`);
    push("T", "T", `${num(periodOf(params.freq), lang)} s`);
    push("vₘₐₓ", "vₘₐₓ", `${num(omega * meters, lang)} m/s`);
    push("aₘₐₓ", "aₘₐₓ", `${num(omega * omega * meters, lang)} m/s²`, true);
    return rows;
  }

  if (model.family === "standing" || model.focus === "envelope" || model.focus === "nodes") {
    push("λ", "λ", `${num(params.lambda, lang)} m`);
    push("f", "f", `${num(params.freq, lang)} Hz`);
    push("নিস্পন্দ–নিস্পন্দ", "Node to node", `${num(nodeGap(params.lambda), lang)} m`);
    push("নিস্পন্দ–সুস্পন্দ", "Node to antinode", `${num(nodeAntinodeGap(params.lambda), lang)} m`, true);
    return rows;
  }

  if (model.mode === "sound" || model.family === "bars") {
    const lam = soundWavelength(params.freq);
    push("f", "f", `${num(params.freq, lang, 0)} Hz`);
    push("λ = v/f", "λ = v/f", `${num(lam, lang)} m`, true);
    push("T", "T", `${num(periodOf(params.freq), lang, 4)} s`);
    push("প্রাবল্য ∝ A²", "Loudness ∝ A²", num(loudnessFactor(params.amp), lang));
    return rows;
  }

  const speed = velocity(params.freq, params.lambda);
  push("f", "f", `${num(params.freq, lang)} Hz`);
  push("λ", "λ", `${num(params.lambda, lang)} m`);
  push("v = fλ", "v = fλ", `${num(speed, lang)} m/s`, true);
  push("T = 1/f", "T = 1/f", `${num(periodOf(params.freq), lang)} s`);
  if (model.knobs.includes("phase")) push("φ", "φ", `${num(params.phase, lang, 0)}°`);
  return rows;
}

function cue(model: WaveModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  if (model.family === "super") {
    const intensity = intensityRatio(params.phase);
    if (intensity > 0.97) return en ? "Constructive. The amplitudes add." : "গঠনমূলক। বিস্তার যোগ হচ্ছে।";
    if (intensity < 0.03) return en ? "Destructive. The waves cancel." : "ধ্বংসাত্মক। তরঙ্গ কাটছে।";
  }
  if (model.mode === "doppler") {
    if (params.vs > 8) return en ? "The source is approaching. The pitch rises." : "উৎস কাছে আসছে। সুর চড়ছে।";
    if (params.vs < -8) return en ? "The source is leaving. The pitch falls." : "উৎস সরে যাচ্ছে। সুর নামছে।";
  }
  if (model.mode === "echo" && echoTime(params.distance) < 0.1) {
    return en ? "The delay is under 0.1 s, so the echo is not heard separately." : "সময় ০.১ s-এর কম, তাই প্রতিধ্বনি আলাদা শোনা যায় না।";
  }
  if ((model.focus === "shift" || model.focus === "sound-res") && Math.abs(params.freq - harmonicFreq(params.harmonic, SOUND_V, params.length)) < 25) {
    return en ? "The driver matches the pipe. This is resonance." : "চালক সুর মিলেছে। এটাই অনুরণন।";
  }
  if (model.focus === "closed") return en ? "Only odd harmonics: f, 3f, 5f…" : "শুধু বেজোড় হারমোনিক: f, ৩f, ৫f…";
  return null;
}

function exampleOf(model: WaveModel, params: Params, lang: "bn" | "en") {
  const en = lang === "en";
  const n = Math.max(1, Math.round(params.harmonic));
  if (model.mode === "string") {
    const freq = harmonicFreq(n, params.speed, params.length);
    return en
      ? `A string of length ${fmt(params.length)} m and wave speed ${fmt(params.speed, 0)} m/s has fₙ = n v/(2L) = ${fmt(freq, 1)} Hz for n = ${n}. λₙ = 2L/n = ${fmt(stringWavelength(n, params.length))} m. Pressing the string shortens L and raises the pitch.`
      : `L = ${show(params.length)} m এবং v = ${show(params.speed, 0)} m/s তারের n = ${show(n, 0)} হলে fₙ = nv/(2L) = ${show(freq, 1)} Hz। λₙ = 2L/n = ${show(stringWavelength(n, params.length))} m। তার ছোট ছুঁলে L কমে, সুর চড়ে।`;
  }
  if (model.focus === "closed") {
    const freq = closedFreq(n, params.length);
    return en
      ? `For a closed pipe, L = ${fmt(params.length)} m and v = 340 m/s give fₙ = (2n−1)v/(4L) = ${fmt(freq, 1)} Hz. n = 1 is the fundamental, n = 2 is the third harmonic.`
      : `বন্ধ পাইপে L = ${show(params.length)} m, v = ৩৪০ m/s হলে fₙ = (2n−1)v/(4L) = ${show(freq, 1)} Hz। n = ১ মৌলিক, n = ২ তৃতীয় হারমোনিক।`;
  }
  if (model.mode === "pipe") {
    const natural = harmonicFreq(n, SOUND_V, params.length);
    return en
      ? `An open pipe of length ${fmt(params.length)} m has fₙ = n×340/(2L) = ${fmt(natural, 1)} Hz. The same length closed at one end sounds an octave lower at the fundamental.`
      : `খোলা পাইপের দৈর্ঘ্য ${show(params.length)} m হলে fₙ = n×৩৪০/(2L) = ${show(natural, 1)} Hz। একই দৈর্ঘ্যের বন্ধ পাইপের মৌলিক সুর এর অর্ধেক।`;
  }
  if (model.mode === "doppler") {
    const heard = dopplerFreq(params.freq, params.vs, params.vo);
    return en
      ? `With f = ${fmt(params.freq, 0)} Hz, vₛ = ${fmt(params.vs, 0)} m/s and vₒ = ${fmt(params.vo, 0)} m/s, f′ = f(v+vₒ)/(v−vₛ) = ${Number.isFinite(heard) ? fmt(heard, 1) : "—"} Hz. An approaching siren is the familiar case.`
      : `f = ${show(params.freq, 0)} Hz, vₛ = ${show(params.vs, 0)} m/s, vₒ = ${show(params.vo, 0)} m/s হলে f′ = f(v+vₒ)/(v−vₛ) = ${Number.isFinite(heard) ? show(heard, 1) : "—"} Hz। কাছে আসা সাইরেন এই ঘটনা।`;
  }
  if (model.mode === "echo") {
    const t = echoTime(params.distance);
    return en
      ? `A wall ${fmt(params.distance, 0)} m away returns the sound in t = 2d/v = ${fmt(t)} s. A distinct echo needs about 17 m or more.`
      : `দেয়াল ${show(params.distance, 0)} m দূরে হলে শব্দ ফিরতে t = 2d/v = ${show(t)} s লাগে। আলাদা প্রতিধ্বনির জন্য প্রায় ১৭ m বা তার বেশি দরকার।`;
  }
  if (model.family === "super") {
    const amp = resultantAmp(params.amp, params.phase);
    return en
      ? `At φ = ${fmt(params.phase, 0)}° two equal waves of amplitude ${fmt(params.amp)} cm give A′ = 2A|cos(φ/2)| = ${fmt(amp)} cm. The intensity ratio is ${fmt(intensityRatio(params.phase))}.`
      : `φ = ${show(params.phase, 0)}° এবং A = ${show(params.amp)} cm হলে লব্ধি A′ = 2A|cos(φ/2)| = ${show(amp)} cm। তীব্রতার অনুপাত ${show(intensityRatio(params.phase))}।`;
  }
  if (model.family === "shm") {
    const omega = Math.PI * 2 * params.freq;
    const meters = params.amp / 100;
    return en
      ? `A = ${fmt(params.amp)} cm and f = ${fmt(params.freq)} Hz give ω = ${fmt(omega)} rad/s. Then vₘₐₓ = Aω = ${fmt(omega * meters)} m/s and aₘₐₓ = ω²A = ${fmt(omega * omega * meters)} m/s².`
      : `A = ${show(params.amp)} cm, f = ${show(params.freq)} Hz হলে ω = ${show(omega)} rad/s। vₘₐₓ = Aω = ${show(omega * meters)} m/s এবং aₘₐₓ = ω²A = ${show(omega * omega * meters)} m/s²।`;
  }
  if (model.family === "standing") {
    return en
      ? `λ = ${fmt(params.lambda)} m, so neighbouring nodes are λ/2 = ${fmt(nodeGap(params.lambda))} m apart, and a node is λ/4 = ${fmt(nodeAntinodeGap(params.lambda))} m from the nearest antinode.`
      : `λ = ${show(params.lambda)} m হলে পরপর দুই নিস্পন্দ λ/2 = ${show(nodeGap(params.lambda))} m দূরে, আর নিস্পন্দ থেকে পাশের সুস্পন্দ λ/4 = ${show(nodeAntinodeGap(params.lambda))} m।`;
  }
  if (model.mode === "sound") {
    const lam = soundWavelength(params.freq);
    return en
      ? `In air, v = 340 m/s. A ${fmt(params.freq, 0)} Hz tone has λ = v/f = ${fmt(lam)} m. Doubling the amplitude multiplies the intensity by four, while the pitch stays the same.`
      : `বাতাসে v = ৩৪০ m/s। ${show(params.freq, 0)} Hz সুরের λ = v/f = ${show(lam)} m। বিস্তার দ্বিগুণ হলে তীব্রতা চার গুণ, সুর একই থাকে।`;
  }
  const speed = velocity(params.freq, params.lambda);
  return en
    ? `With f = ${fmt(params.freq)} Hz and λ = ${fmt(params.lambda)} m, the wave speed is v = fλ = ${fmt(speed)} m/s and the period is T = 1/f = ${fmt(periodOf(params.freq))} s. A crest travels one wavelength in one period.`
    : `f = ${show(params.freq)} Hz এবং λ = ${show(params.lambda)} m হলে তরঙ্গবেগ v = fλ = ${show(speed)} m/s, পর্যায়কাল T = 1/f = ${show(periodOf(params.freq))} s। এক পর্যায়কালে শিখর এক তরঙ্গদৈর্ঘ্য এগোয়।`;
}

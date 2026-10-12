"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useLang, vectorEn } from "@/components/locale";
import { modelBySlug, vectorModels } from "./catalog";
import { mag, show, toBn, withLength } from "./math";
import type { SceneContent, Vec3 } from "./types";
import { VectorHeader } from "./header";
import { VectorViewport } from "./viewport";

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  const shown = Number.isInteger(step) ? show(value, 0) : show(value);
  return (
    <label className="grid gap-1 text-sm">
      <span className="flex items-center justify-between gap-3 font-semibold">
        <span>{label}</span>
        <span className="font-serif text-copper-deep">
          {shown}
          {suffix}
        </span>
      </span>
      <input
        className="vec-range"
        type="range"
        min={min}
        max={max}
        step={Number.isInteger(step) ? step : "any"}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

export function VecEditor({
  title,
  color,
  value,
  onChange,
  showLength = true,
}: {
  title: string;
  color: string;
  value: Vec3;
  onChange: (next: Vec3) => void;
  showLength?: boolean;
}) {
  const { t } = useLang();
  const length = mag(value);
  return (
    <div className="grid gap-3 rounded-2xl border border-line bg-paper/70 p-3">
      <p className="text-sm font-bold" style={{ color }}>
        {title}
      </p>
      {showLength ? (
        <Slider label={t("magnitude")} value={length} min={0} max={Math.max(3, length)} step={0.1} onChange={(next) => onChange(withLength(value, next))} />
      ) : null}
      <Slider label="x" value={value.x} min={-3} max={3} step={0.1} onChange={(x) => onChange({ ...value, x })} />
      <Slider label="y" value={value.y} min={-3} max={3} step={0.1} onChange={(y) => onChange({ ...value, y })} />
      <Slider label="z" value={value.z} min={-3} max={3} step={0.1} onChange={(z) => onChange({ ...value, z })} />
    </div>
  );
}

export function PlaneControls({
  magA,
  magB,
  theta,
  phi,
  onChange,
}: {
  magA: number;
  magB: number;
  theta: number;
  phi: number;
  onChange: (patch: Partial<{ magA: number; magB: number; theta: number; phi: number }>) => void;
}) {
  const { t } = useLang();
  return (
    <div className="grid gap-3">
      <Slider label="|A|" value={magA} min={0.2} max={3.5} step={0.1} onChange={(next) => onChange({ magA: next })} />
      <Slider label="|B|" value={magB} min={0.2} max={3.5} step={0.1} onChange={(next) => onChange({ magB: next })} />
      <Slider label={t("angle")} value={theta} min={0} max={180} step={1} suffix="°" onChange={(next) => onChange({ theta: next })} />
      <Slider label={t("tilt")} value={phi} min={-70} max={70} step={1} suffix="°" onChange={(next) => onChange({ phi: next })} />
    </div>
  );
}

export function Stats({ rows }: { rows: { label: string; value: string; wide?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2" aria-live="polite">
      {rows.map((row) => (
        <div key={row.label} className={`rounded-2xl bg-ink px-3 py-2 text-paper-2 ${row.wide ? "col-span-2" : ""}`}>
          <dt className="text-[11px] text-white/60">{row.label}</dt>
          <dd className="font-serif text-base leading-snug">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-copper px-3 py-2 text-sm font-bold leading-relaxed text-white">{children}</p>;
}

export function ModelShell({
  slug,
  legend,
  content,
  example,
  onResetValues,
  children,
}: {
  slug: string;
  legend: { name: string; color: string }[];
  content: SceneContent;
  example: string;
  onResetValues: () => void;
  children: ReactNode;
}) {
  const { lang, t } = useLang();
  const model = modelBySlug(slug);
  const [resetSignal, setResetSignal] = useState(0);
  if (!model) return null;
  const english = vectorEn[model.slug];
  const title = lang === "en" ? english?.title ?? model.title : model.title;
  const blurb = lang === "en" ? english?.blurb ?? model.blurb : model.blurb;
  const explain = lang === "en" ? english?.explain ?? model.explain : model.explain;
  const index = vectorModels.findIndex((item) => item.slug === slug);
  const prev = index > 0 ? vectorModels[index - 1] : null;
  const next = index < vectorModels.length - 1 ? vectorModels[index + 1] : null;

  return (
    <div className="min-h-dvh">
      <VectorHeader />
      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-5 sm:py-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-copper">
              {t("vectorChapter")} · {lang === "bn" ? toBn(model.no) : model.no} / {lang === "bn" ? toBn(vectorModels.length) : vectorModels.length}
            </p>
            <h1 className="font-serif text-3xl leading-tight sm:text-5xl">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            {prev ? (
              <Link href={`/vector/${prev.slug}`} className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
                {t("prev")}
              </Link>
            ) : null}
            <Link href="/?board=paper-1&chapter=vector" className="rounded-full border border-line bg-white px-3 py-2 text-ink no-underline">
              {t("allModels")}
            </Link>
            {next ? (
              <Link href={`/vector/${next.slug}`} className="rounded-full bg-ink px-3 py-2 text-paper-2 no-underline">
                {t("next")}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.72fr)]">
          <div className="relative h-[min(48dvh,420px)] min-h-[260px] overflow-hidden rounded-[28px] bg-lab shadow-[0_20px_50px_rgba(16,22,29,0.18)] sm:h-[min(62dvh,520px)] lg:h-[min(68dvh,560px)]">
            <VectorViewport content={content} resetSignal={resetSignal} />
            <p className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white/80">
              {t("orbit")}
            </p>
            <ul className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
              {legend.map((item) => (
                <li key={item.name} className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2 py-1 text-xs font-semibold text-white">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  {item.name}
                </li>
              ))}
            </ul>
          </div>

          <aside className="grid content-start gap-3 rounded-[28px] border border-line bg-white/85 p-4 lg:max-h-[min(68dvh,560px)] lg:overflow-auto">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                title="Reset Camera"
                onClick={() => setResetSignal((value) => value + 1)}
                className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper-2"
              >
                {t("resetCamera")}
              </button>
              <button
                type="button"
                title="Reset Values"
                onClick={onResetValues}
                className="rounded-full border border-ink bg-white px-4 py-2 text-sm font-bold text-ink"
              >
                {t("resetValues")}
              </button>
            </div>
            {children}
          </aside>
        </div>

        <section className="mt-4 grid gap-3 md:grid-cols-3">
          <article className="rounded-3xl border border-line bg-white/85 p-4">
            <h2 className="text-sm font-bold text-copper">{t("explain")}</h2>
            <p className="mt-2 text-sm leading-relaxed">{explain}</p>
          </article>
          <article className="rounded-3xl border border-line bg-white/85 p-4">
            <h2 className="text-sm font-bold text-copper">{t("formula")}</h2>
            <p className="mt-3 font-serif text-2xl leading-snug">{model.formula}</p>
          </article>
          <article className="rounded-3xl border border-line bg-white/85 p-4">
            <h2 className="text-sm font-bold text-copper">{t("example")}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{example}</p>
          </article>
        </section>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { toBn } from "@/lab/kit";
import { icons } from "@/lab/icons";
import { demoById } from "@/lab/scenes/index";
import { interPapers, type InterChapter } from "@/lib/inter-physics";
import type { Demo } from "@/lib/types";
import { opticsModels, sectionLabel } from "@/optics-lab/catalog";
import { vectorModels } from "@/vector-lab/catalog";
import { thermoModels, thermoSection } from "@/thermo-lab/catalog";
import { sectionLabel as waveSection, waveModels } from "@/wave-lab/catalog";
import { CardMotion } from "./card-motion";
import { chapterEn, demoEn, useLang, vectorEn } from "./locale";
import type { Board } from "./site-bar";

function serialTitle(no: number, title: string, lang: "bn" | "en") {
  const label = lang === "bn" ? toBn(no) : String(no);
  return (
    <span className="flex items-baseline gap-2">
      <span className="shrink-0 font-serif text-xl leading-none text-copper-deep">{label}.</span>
      <span className="font-serif text-2xl leading-tight">{title}</span>
    </span>
  );
}

function chapterLabel(chapters: InterChapter[], sceneId: string, lang: "bn" | "en") {
  const owner = chapters.find((chapter) => scenesOf(chapter).includes(sceneId));
  if (!owner) return "";
  return lang === "en" ? chapterEn[owner.id] ?? owner.title : owner.title;
}

export function scenesOf(chapter: InterChapter) {
  if (chapter.id === "vector") return [];
  if (chapter.sceneIds?.length) return chapter.sceneIds;
  return chapter.sceneId ? [chapter.sceneId] : [];
}

export function interCount(paperId: Board, chapterId: string) {
  const paper = interPapers.find((item) => item.id === paperId);
  if (!paper || paperId === "ssc") return 0;
  const chapters = chapterId === "all" ? paper.chapters : paper.chapters.filter((item) => item.id === chapterId);
  const scenes = chapters.reduce((sum, chapter) => sum + scenesOf(chapter).length, 0);
  const vectors = chapters.some((chapter) => chapter.id === "vector") ? vectorModels.length : 0;
  const optics = chapters.some((chapter) => chapter.id === "phys-optics") ? opticsModels.length : 0;
  const waves = chapters.some((chapter) => chapter.id === "wave") ? waveModels.length : 0;
  const thermo = chapters.some((chapter) => chapter.id === "thermo") ? thermoModels.length : 0;
  return scenes + vectors + optics + waves + thermo;
}

export function ChapterBoard({
  board,
  chapterId,
  query,
  onOpen,
}: {
  board: Exclude<Board, "ssc">;
  chapterId: string;
  query: string;
  onOpen: (id: string) => void;
}) {
  const { lang, t } = useLang();
  const paper = interPapers.find((item) => item.id === board) ?? interPapers[0];
  const selected = chapterId === "all" ? paper.chapters : paper.chapters.filter((item) => item.id === chapterId);
  const q = query.trim().toLowerCase();

  const models = selected.some((chapter) => chapter.id === "vector")
    ? vectorModels.filter((model) => {
        if (!q) return true;
        const extra = vectorEn[model.slug];
        return `${model.title} ${model.blurb} ${extra?.title ?? ""} ${extra?.blurb ?? ""}`.toLowerCase().includes(q);
      })
    : [];

  const optics = selected.some((chapter) => chapter.id === "phys-optics")
    ? opticsModels.filter((model) => {
        if (!q) return true;
        return `${model.title} ${model.blurb} ${model.titleEn} ${model.blurbEn}`.toLowerCase().includes(q);
      })
    : [];

  const waves = selected.some((chapter) => chapter.id === "wave")
    ? waveModels.filter((model) => {
        if (!q) return true;
        return `${model.title} ${model.blurb} ${model.titleEn} ${model.blurbEn}`.toLowerCase().includes(q);
      })
    : [];

  const thermo = selected.some((chapter) => chapter.id === "thermo")
    ? thermoModels.filter((model) => {
        if (!q) return true;
        return `${model.title} ${model.blurb} ${model.titleEn} ${model.blurbEn}`.toLowerCase().includes(q);
      })
    : [];

  const demos = selected.flatMap((chapter) =>
    scenesOf(chapter)
      .map((id) => demoById(id) as Demo | null)
      .filter((demo): demo is Demo => Boolean(demo))
      .filter((demo) => {
        if (!q) return true;
        return `${demo.title} ${demo.blurb} ${demoEn[demo.id] ?? ""}`.toLowerCase().includes(q);
      }),
  );

  const chapter = paper.chapters.find((item) => item.id === chapterId);
  const empty = models.length === 0 && optics.length === 0 && waves.length === 0 && thermo.length === 0 && demos.length === 0;

  return (
    <div>
      {empty ? (
        <article className="rounded-3xl border border-line bg-white/90 p-5">
          <h2 className="font-serif text-3xl">{chapter ? (lang === "en" ? chapterEn[chapter.id] ?? chapter.title : chapter.title) : t("empty")}</h2>
          {chapter && lang === "bn" ? <p className="mt-3 max-w-2xl leading-relaxed text-muted">{chapter.explain}</p> : null}
          {chapter ? (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {chapter.formulas.map((formula) => (
                <li key={formula} className="rounded-2xl bg-paper px-3 py-2 font-serif text-xl">
                  {formula}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-4 text-sm text-muted">{q ? t("emptySearch") : t("empty")}</p>
        </article>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => {
            const extra = vectorEn[model.slug];
            const title = lang === "en" ? extra?.title ?? model.title : model.title;
            const blurb = lang === "en" ? extra?.blurb ?? model.blurb : model.blurb;
            return (
              <Link
                key={model.slug}
                href={`/vector/${model.slug}`}
                className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-ink no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,33,28,0.1)]"
              >
                <span className="grid h-32 place-items-center overflow-hidden bg-[#152028] px-5 text-[#f3eadc] sm:h-36">
                  <CardMotion kind="vector" name={model.slug} />
                </span>
                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-xs font-bold text-copper-deep">{t("vectorChapter")}</span>
                  {serialTitle(model.no, title, lang)}
                  <span className="font-serif text-lg text-copper-deep">{model.formula}</span>
                  <span className="flex-1 text-sm leading-relaxed text-muted">{blurb}</span>
                  <span className="text-sm font-bold">{t("open")} →</span>
                </span>
              </Link>
            );
          })}
          {waves.map((model) => {
            const title = lang === "en" ? model.titleEn : model.title;
            const blurb = lang === "en" ? model.blurbEn : model.blurb;
            return (
              <Link
                key={`wave-${model.slug}`}
                href={`/wave/${model.slug}`}
                className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-ink no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,33,28,0.1)]"
              >
                <span className="grid h-32 place-items-center overflow-hidden bg-[#152028] px-5 text-[#f3eadc] sm:h-36">
                  <CardMotion kind="wave" name={model.family} />
                </span>
                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-xs font-bold text-copper-deep">{waveSection(model.section, lang)}</span>
                  {serialTitle(model.no, title, lang)}
                  <span className="font-serif text-lg text-copper-deep">{model.formula}</span>
                  <span className="flex-1 text-sm leading-relaxed text-muted">{blurb}</span>
                  <span className="text-sm font-bold">{t("open")} →</span>
                </span>
              </Link>
            );
          })}
          {optics.map((model) => {
            const title = lang === "en" ? model.titleEn : model.title;
            const blurb = lang === "en" ? model.blurbEn : model.blurb;
            return (
              <Link
                key={model.slug}
                href={`/optics/${model.slug}`}
                className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-ink no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,33,28,0.1)]"
              >
                <span className="grid h-32 place-items-center overflow-hidden bg-[#152028] px-5 text-[#f3eadc] sm:h-36">
                  <CardMotion kind="optics" name={model.family} />
                </span>
                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-xs font-bold text-copper-deep">{sectionLabel(model.section, lang)}</span>
                  {serialTitle(model.no, title, lang)}
                  <span className="font-serif text-lg text-copper-deep">{model.formula}</span>
                  <span className="flex-1 text-sm leading-relaxed text-muted">{blurb}</span>
                  <span className="text-sm font-bold">{t("open")} →</span>
                </span>
              </Link>
            );
          })}
          {thermo.map((model) => {
            const title = lang === "en" ? model.titleEn : model.title;
            const blurb = lang === "en" ? model.blurbEn : model.blurb;
            return (
              <Link
                key={`thermo-${model.slug}`}
                href={`/thermo/${model.slug}`}
                className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-ink no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,33,28,0.1)]"
              >
                <span className="grid h-32 place-items-center overflow-hidden bg-[#152028] px-5 text-[#f3eadc] sm:h-36">
                  <CardMotion kind="thermo" name={model.family} />
                </span>
                <span className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-xs font-bold text-copper-deep">{thermoSection(model.section, lang)}</span>
                  {serialTitle(model.no, title, lang)}
                  <span className="font-serif text-lg text-copper-deep">{model.formula}</span>
                  <span className="flex-1 text-sm leading-relaxed text-muted">{blurb}</span>
                  <span className="text-sm font-bold">{t("open")} →</span>
                </span>
              </Link>
            );
          })}
          {demos.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => onOpen(demo.id)}
              className="flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,33,28,0.1)]"
            >
              <span
                className="grid h-32 place-items-center bg-[#152028] px-6 text-[#f3eadc] sm:h-36 [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: icons[demo.id as keyof typeof icons] || icons.path }}
              />
              <span className="flex flex-1 flex-col gap-2 p-4">
                <span className="text-xs font-bold text-copper-deep">{chapterLabel(paper.chapters, demo.id, lang)}</span>
                <span className="font-serif text-2xl leading-tight">{lang === "en" ? demoEn[demo.id] ?? demo.title : demo.title}</span>
                <span className="font-serif text-lg text-copper-deep">{demo.formula}</span>
                {lang === "bn" ? <span className="flex-1 text-sm leading-relaxed text-muted">{demo.blurb}</span> : <span className="flex-1" />}
                <span className="text-sm font-bold">{t("open")} →</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

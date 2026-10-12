"use client";

import { useEffect, useMemo, useState } from "react";
import { toBn } from "@/lab/kit";
import { chapters, demoById, demos } from "@/lab/scenes/index";
import { cueVoice } from "@/lab/sound";
import { interPapers } from "@/lib/inter-physics";
import type { Chapter, Demo } from "@/lib/types";
import { BrandLockup } from "./brand-mark";
import { Catalog } from "./catalog";
import { ChapterBoard, interCount } from "./chapter-board";
import { chapterEn, sscChapterEn, useLang } from "./locale";
import { GlobalMute } from "./global-mute";
import { LabBackdrop } from "./lab-backdrop";
import { LandingHero } from "./landing-hero";
import { SiteBar, type Board } from "./site-bar";
import { TheaterDialog } from "./theater-dialog";

const catalog = demos as Demo[];
const featured = demoById("pulley-move") as Demo;

const chapterList = chapters as Chapter[];

function isBoard(value: string | null): value is Board {
  return value === "paper-1" || value === "paper-2" || value === "ssc";
}

export function Studio() {
  const { lang, t } = useLang();
  const [board, setBoard] = useState<Board>("paper-1");
  const [chapter, setChapter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const current = openId ? (demoById(openId) as Demo | null) : null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((demo) => {
      if (chapter !== "all" && demo.chapter !== chapter) return false;
      if (!q) return true;
      return `${demo.title} ${demo.blurb} ${demo.chapterName} ${demo.keywords} ${demo.formula}`
        .toLowerCase()
        .includes(q);
    });
  }, [chapter, query]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextBoard = params.get("board");
    if (isBoard(nextBoard)) setBoard(nextBoard);
    const nextChapter = params.get("chapter");
    if (nextChapter) setChapter(nextChapter);
    const id = decodeURIComponent(window.location.hash.replace("#", ""));
    if (id && demoById(id)) setOpenId(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openId]);

  function remember(nextBoard: Board, nextChapter: string) {
    const url = `/?board=${nextBoard}&chapter=${nextChapter}`;
    window.history.replaceState(null, "", url);
  }

  function selectBoard(next: Board, scroll: "top" | "chapters" = "top") {
    setBoard(next);
    setChapter("all");
    setQuery("");
    remember(next, "all");
    if (scroll === "chapters") {
      window.requestAnimationFrame(() => document.getElementById("chapters")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectChapter(id: string) {
    setChapter(id);
    remember(board, id);
  }

  function openDemo(id: string) {
    cueVoice(id, 0);
    setOpenId(id);
    window.history.replaceState(null, "", `/?board=${board}&chapter=${chapter}#${id}`);
  }

  function closeDemo() {
    setOpenId(null);
    cueVoice(featured.id, 0);
    window.history.replaceState(null, "", `/?board=${board}&chapter=${chapter}`);
  }

  function step(dir: number) {
    if (!current) return;
    const list = visible.length ? visible : catalog;
    const index = list.findIndex((demo) => demo.id === current.id);
    const next = list[(index + dir + list.length) % list.length];
    openDemo(next.id);
  }

  const paper = interPapers.find((item) => item.id === board);
  const chips =
    board === "ssc"
      ? chapterList.map((item) => ({
          id: item.id,
          label: lang === "en" ? sscChapterEn[item.id] ?? item.name : item.name,
          count: item.id === "all" ? catalog.length : catalog.filter((demo) => demo.chapter === item.id).length,
        }))
      : [
          { id: "all", label: t("all"), count: interCount(board, "all") },
          ...(paper?.chapters ?? []).map((item) => ({
            id: item.id,
            label: lang === "en" ? chapterEn[item.id] ?? item.title : item.title,
            count: interCount(board, item.id),
          })),
        ];

  const title = board === "ssc" ? t("sscTitle") : board === "paper-1" ? t("paper1Title") : t("paper2Title");
  const lead = board === "ssc" ? t("sscLead") : board === "paper-1" ? t("paper1Lead") : t("paper2Lead");
  const shown = board === "ssc" ? visible.length : interCount(board, chapter);

  return (
    <>
      <LabBackdrop />
      <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <BrandLockup href="/" caption={t("tagline")} />
          <SiteBar active={board} onSelect={selectBoard} />
        </div>
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 sm:px-5">
          {chips.map((item) => {
            const on = chapter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => selectChapter(item.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${on ? "border-ink bg-ink text-paper-2" : "border-line bg-white/70"}`}
              >
                {item.label} {lang === "bn" ? toBn(item.count) : item.count}
              </button>
            );
          })}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-16 sm:px-5">
        {chapter === "all" ? <LandingHero onEnter={(next) => selectBoard(next, "chapters")} /> : null}
        <div id="chapters" className={`${chapter === "all" ? "mt-8" : ""} mb-4 flex scroll-mt-28 flex-wrap items-end justify-between gap-3`}>
          <div>
            {chapter === "all" ? (
              <h2 className="font-serif text-4xl leading-tight sm:text-5xl">{title}</h2>
            ) : (
              <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>
            )}
            <p className="mt-2 max-w-2xl text-muted">{lead}</p>
          </div>
          <p className="font-bold text-muted">{lang === "bn" ? `${toBn(shown)}টি দৃশ্য` : `${shown} ${t("scenes")}`}</p>
        </div>
        {board === "ssc" ? (
          <Catalog embedded chapter={chapter} query={query} visible={visible} onChapter={selectChapter} onQuery={setQuery} onOpen={openDemo} />
        ) : (
          <>
            <label className="mb-5 block max-w-md">
              <span className="sr-only">{t("search")}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="search"
                placeholder={t("search")}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none"
              />
            </label>
            <ChapterBoard board={board} chapterId={chapter} query={query} onOpen={openDemo} />
          </>
        )}
      </main>

      <GlobalMute />
      {current ? <TheaterDialog demo={current} onClose={closeDemo} onStep={step} /> : null}
    </>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLockup } from "@/components/brand-mark";
import { chapterEn, sscChapterEn, useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";
import { interPapers } from "@/lib/inter-physics";
import { sscGraphChapters } from "./ssc-chapters";
import { toBn } from "@/vector-lab/math";
import { GraphCard } from "./card";
import { graphsFor } from "./catalog";
import type { GraphSource } from "./types";

const filters: { id: "all" | GraphSource; label: string }[] = [
  { id: "all", label: "সব" },
  { id: "book", label: "পাঠ্যবই" },
  { id: "extra", label: "অতিরিক্ত" },
  { id: "schematic", label: "নকশা" },
];

export function GraphStudio({ chapter }: { chapter: string }) {
  const { lang, t } = useLang();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const sscHit = sscGraphChapters.some((item) => item.id === chapter);
  const paper = interPapers.find((item) => item.chapters.some((entry) => entry.id === chapter));
  const boardId = sscHit ? "ssc" : paper?.id ?? "paper-1";
  const chapters = sscHit
    ? sscGraphChapters
    : (paper ?? interPapers[0]).chapters.map((item, index) => ({ id: item.id, no: index + 1, title: item.title, blurb: item.blurb }));
  const paperShort = sscHit ? "SSC" : boardId === "paper-2" ? "HSC ২য়" : "HSC ১ম";
  const paperLong = sscHit ? "SSC" : boardId === "paper-2" ? "HSC ২য় পত্র" : "HSC ১ম পত্র";
  const current = chapters.find((item) => item.id === chapter);
  const labelOf = (id: string, title: string) => (lang === "en" ? chapterEn[id] ?? sscChapterEn[id] ?? title : title);
  const all = graphsFor(chapter);

  const shown = useMemo(() => {
    const text = query.trim().toLowerCase();
    return all.filter((graph) => {
      if (filter !== "all" && graph.source !== filter) return false;
      if (!text) return true;
      return `${graph.title} ${graph.formula} ${graph.explain}`.toLowerCase().includes(text);
    });
  }, [all, filter, query]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/92 shadow-[inset_0_-3px_0_#c4623a] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <BrandLockup href="/" caption={t("graph")} />
          <SiteBar active={boardId} />
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-5 sm:px-5 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-[28px] bg-[#10161d] p-3 text-[#f6f1e6] shadow-[6px_6px_0_#c4623a]">
            <p className="px-2 text-[11px] font-bold tracking-[0.16em] text-[#f0d48a]">{paperShort}</p>
            <h2 className="px-2 font-serif text-2xl">{t("chapters")}</h2>
            <ul className="mt-2 grid gap-1">
              {chapters.map((item, index) => {
                const on = item.id === chapter;
                const label = labelOf(item.id, item.title);
                return (
                  <li key={item.id}>
                    <Link
                      href={`/graph/${item.id}`}
                      aria-current={on ? "page" : undefined}
                      className={`grid grid-cols-[2rem_minmax(0,1fr)] items-center rounded-2xl px-2 py-2 text-sm font-semibold no-underline ${on ? "bg-[#f6f1e6] text-ink" : "text-[#f6f1e6] hover:bg-white/10"}`}
                    >
                      <span className={`font-serif ${on ? "text-copper-deep" : "text-[#f0d48a]"}`}>{toBn(item.no)}</span>
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
        <main className="min-w-0">
          <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {chapters.map((item) => {
              const on = item.id === chapter;
              const label = labelOf(item.id, item.title);
              return (
                <Link
                  key={item.id}
                  href={`/graph/${item.id}`}
                  aria-current={on ? "page" : undefined}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold no-underline ${on ? "bg-ink text-paper-2 shadow-[3px_3px_0_#c4623a]" : "border border-line bg-white text-ink"}`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          {current ? (
            <>
              <p className="text-xs font-bold tracking-[0.14em] text-copper-deep">{paperLong} · {t("graph")}</p>
              <h1 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">{current.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{current.blurb}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="গ্রাফ খোঁজো"
                  className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-copper sm:max-w-xs"
                />
                <div className="flex flex-wrap gap-2">
                  {filters.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={filter === item.id}
                      onClick={() => setFilter(item.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${filter === item.id ? "bg-ink text-paper-2" : "border border-line bg-white"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-muted">{toBn(shown.length)}টি গ্রাফ</p>
              {shown.length === 0 ? (
                <p className="mt-6 rounded-[28px] border border-line bg-white/80 px-4 py-8 text-center text-sm">এই খোঁজে কোনো গ্রাফ নেই।</p>
              ) : (
                <div className="mt-4 grid gap-5">
                  {all.map((graph, index) =>
                    shown.includes(graph) ? <GraphCard key={graph.id} spec={graph} index={index + 1} /> : null,
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="font-serif text-4xl">এই অধ্যায়ের গ্রাফ নেই</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">HSC ও SSC-এর অধ্যায়ের গ্রাফ আছে। তালিকা থেকে একটি অধ্যায় খোলো।</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

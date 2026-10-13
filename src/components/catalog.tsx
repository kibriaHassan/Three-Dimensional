"use client";

import { toBn } from "@/lab/kit";
import { icons } from "@/lab/icons";
import { chapters, demos } from "@/lab/scenes/index";
import type { Chapter, Demo } from "@/lib/types";
import { demoEn, sscChapterEn, useLang } from "./locale";

const catalog = demos as Demo[];
const chapterList = chapters as Chapter[];

type Props = {
  chapter: string;
  query: string;
  visible: Demo[];
  onChapter: (id: string) => void;
  onQuery: (value: string) => void;
  onOpen: (id: string) => void;
  embedded?: boolean;
};

export function Catalog({ chapter, query, visible, onChapter, onQuery, onOpen, embedded = false }: Props) {
  const { lang, t } = useLang();
  const count = lang === "bn" ? `${toBn(visible.length)}টি দৃশ্য` : `${visible.length} ${t("scenes")}`;

  return (
    <section id="catalog" className={embedded ? "" : "mx-auto max-w-6xl px-4 py-8 sm:px-5"}>
      {embedded ? null : (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-copper-deep">নবম–দশম · ত্রিমাত্র দৃশ্য</p>
            <h2 className="font-serif text-4xl">{t("sscTitle")}</h2>
          </div>
          <p className="font-bold text-muted">{count}</p>
        </div>
      )}

      {embedded ? null : <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {chapterList.map((item) => {
          const count = item.id === "all" ? catalog.length : catalog.filter((demo) => demo.chapter === item.id).length;
          const on = chapter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChapter(item.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold ${on ? "border-ink bg-ink text-paper-2" : "border-line bg-white/60"}`}
            >
              {(lang === "en" ? sscChapterEn[item.id] ?? item.name : item.name)} {lang === "bn" ? toBn(count) : count}
            </button>
          );
        })}
      </div>}

      <label className="mt-4 block max-w-md">
        <span className="sr-only">{t("search")}</span>
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          type="search"
          placeholder={t("search")}
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none"
        />
      </label>

      {visible.length === 0 ? (
        <p className="mt-8 text-muted">{t("emptySearch")}</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => onOpen(demo.id)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-left shadow-[5px_5px_0_rgba(196,98,58,0.28)] transition duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_#c4623a]"
            >
              <span
                className="grid h-32 place-items-center bg-[#152028] px-6 text-[#f3eadc] sm:h-36 [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: icons[demo.id as keyof typeof icons] || icons.path }}
              />
              <span className="flex flex-1 flex-col gap-2 p-4">
                <span className="text-xs font-bold text-copper-deep">
                  {lang === "en" ? sscChapterEn[demo.chapter] ?? demo.chapterName : `অধ্যায় ${demo.chapterNo} · ${demo.chapterName}`}
                </span>
                <span className="font-serif text-2xl leading-tight text-ink sm:text-[1.65rem]">{lang === "en" ? demoEn[demo.id] ?? demo.title : demo.title}</span>
                <span className="font-serif text-lg text-copper-deep">{demo.formula}</span>
                {lang === "bn" ? <span className="flex-1 text-sm leading-relaxed text-muted">{demo.blurb}</span> : <span className="flex-1" />}
                <span className="text-sm font-bold">{t("open")} →</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

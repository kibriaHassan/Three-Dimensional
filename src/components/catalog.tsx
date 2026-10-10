"use client";

import { toBn } from "@/lab/kit";
import { icons } from "@/lab/icons";
import { chapters, demos } from "@/lab/scenes/index";
import type { Chapter, Demo } from "@/lib/types";

const catalog = demos as Demo[];
const chapterList = chapters as Chapter[];

type Props = {
  chapter: string;
  query: string;
  visible: Demo[];
  onChapter: (id: string) => void;
  onQuery: (value: string) => void;
  onOpen: (id: string) => void;
};

export function Catalog({ chapter, query, visible, onChapter, onQuery, onOpen }: Props) {

  return (
    <section id="catalog" className="mx-auto max-w-6xl px-4 py-8 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-copper-deep">পাঠ্যবইয়ের ধারা</p>
          <h2 className="font-serif text-4xl">প্রমাণের তালিকা</h2>
        </div>
        <p className="font-bold text-muted">{toBn(visible.length)}টি দৃশ্য</p>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
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
              {item.name} {toBn(count)}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block max-w-md">
        <span className="sr-only">প্রমাণ খোঁজো</span>
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          type="search"
          placeholder="খুঁজো: টর্ক, কপিকল, টান, দোলক, প্রতিসরণ…"
          className="w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none"
        />
      </label>

      {visible.length === 0 ? (
        <p className="mt-8 text-muted">এই নামে কোনো প্রমাণ নেই। টর্ক, কপিকল বা টান লিখে দেখো।</p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((demo) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => onOpen(demo.id)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,33,28,0.1)]"
            >
              <span
                className="grid h-32 place-items-center bg-[#152028] px-6 text-[#f3eadc] sm:h-36 [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: icons[demo.id as keyof typeof icons] || icons.path }}
              />
              <span className="flex flex-1 flex-col gap-2 p-4">
                <span className="text-xs font-bold text-copper-deep">
                  অধ্যায় {demo.chapterNo} · {demo.chapterName}
                </span>
                <span className="font-serif text-2xl leading-tight text-ink sm:text-[1.65rem]">{demo.title}</span>
                <span className="font-serif text-lg text-copper-deep">{demo.formula}</span>
                <span className="flex-1 text-sm leading-relaxed text-muted">{demo.blurb}</span>
                <span className="text-sm font-bold">দৃশ্য চালাও →</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

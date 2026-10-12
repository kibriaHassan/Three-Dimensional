"use client";

import { useState } from "react";
import { toBn } from "@/lab/kit";
import { interPapers, type InterChapter } from "@/lib/inter-physics";

type Props = {
  onOpenScene?: (id: string) => void;
};

export function InterPapers({ onOpenScene }: Props) {
  const [paperId, setPaperId] = useState(interPapers[0].id);
  const [chapterId, setChapterId] = useState(interPapers[0].chapters[0].id);
  const paper = interPapers.find((item) => item.id === paperId) ?? interPapers[0];
  const chapter = paper.chapters.find((item) => item.id === chapterId) ?? paper.chapters[0];

  function choosePaper(nextId: (typeof interPapers)[number]["id"]) {
    const next = interPapers.find((item) => item.id === nextId) ?? interPapers[0];
    setPaperId(next.id);
    setChapterId(next.chapters[0].id);
  }

  return (
    <section id="inter" className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="overflow-hidden rounded-[28px] border border-line bg-white/92 shadow-[0_24px_60px_rgba(20,33,28,0.06)]">
        <div className="grid gap-6 border-b border-line px-5 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-bold text-copper-deep">একাদশ–দ্বাদশ · এনসিটিবি</p>
            <h2 className="mt-1 font-serif text-4xl leading-tight sm:text-5xl">ইন্টার পদার্থবিজ্ঞান</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">{paper.lead}</p>
          </div>
          <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="পত্র">
            {interPapers.map((item) => {
              const on = item.id === paper.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => choosePaper(item.id)}
                  className={`rounded-2xl border px-3 py-3 text-left ${on ? "border-ink bg-ink text-paper-2" : "border-line bg-paper"}`}
                >
                  <span className="block text-xs font-bold opacity-80">{toBn(item.chapters.length)}টি অধ্যায়</span>
                  <span className="mt-1 block font-serif text-2xl leading-none">{item.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="mb-4 text-sm font-bold">{paper.title}</p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 xl:grid-cols-5" role="tablist" aria-label={paper.title}>
              {paper.chapters.map((item, index) => (
                <ChapterCoin
                  key={item.id}
                  chapter={item}
                  index={index}
                  selected={item.id === chapter.id}
                  onSelect={() => setChapterId(item.id)}
                />
              ))}
            </div>
          </div>
          <ChapterNote chapter={chapter} index={paper.chapters.findIndex((item) => item.id === chapter.id)} onOpenScene={onOpenScene} />
        </div>
      </div>
    </section>
  );
}

function ChapterCoin({
  chapter,
  index,
  selected,
  onSelect,
}: {
  chapter: InterChapter;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className="group flex flex-col items-center text-center"
    >
      <span className="coin-stage" data-on={selected ? "1" : "0"}>
        <span className="coin">
          <span className="coin-face">
            <span className="text-[11px] font-bold tracking-wide text-white/75">০{toBn(index + 1)}</span>
            <span className="coin-glyph" dangerouslySetInnerHTML={{ __html: chapter.icon }} />
          </span>
        </span>
      </span>
      <span className={`mt-3 text-sm font-bold leading-snug ${selected ? "text-copper-deep" : "text-ink"}`}>{chapter.title}</span>
      <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{chapter.blurb}</span>
    </button>
  );
}

function ChapterNote({
  chapter,
  index,
  onOpenScene,
}: {
  chapter: InterChapter;
  index: number;
  onOpenScene?: (id: string) => void;
}) {
  return (
    <article className="flex h-full flex-col rounded-3xl bg-ink px-5 py-5 text-paper-2" aria-live="polite">
      <p className="text-xs font-bold text-copper">অধ্যায় {toBn(index + 1)}</p>
      <h3 className="mt-1 font-serif text-3xl leading-tight">{chapter.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/80">{chapter.explain}</p>
      <ul className="mt-4 grid gap-2">
        {chapter.formulas.map((formula) => (
          <li key={formula} className="rounded-2xl bg-white/10 px-3 py-2 font-serif text-lg leading-snug text-white">
            {formula}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-white/70">{chapter.blurb}</p>
      {chapter.sceneId && onOpenScene ? (
        <button
          type="button"
          onClick={() => onOpenScene(chapter.sceneId!)}
          className="mt-5 rounded-full bg-paper-2 px-4 py-2.5 text-sm font-bold text-ink"
        >
          ত্রিমাত্র দৃশ্য খুলো
        </button>
      ) : (
        <p className="mt-5 text-xs leading-relaxed text-white/55">এই অধ্যায়ের মূল ধারণা ও সূত্র। দৃশ্য যেখানে বইয়ের পরীক্ষা আছে, সেখানে বোতাম উঠবে।</p>
      )}
    </article>
  );
}

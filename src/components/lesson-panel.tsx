"use client";

import { useEffect, useRef } from "react";
import type { Demo } from "@/lib/types";

export function stepIndexAt(demo: Demo, time: number) {
  let index = 0;
  for (let i = 0; i < demo.steps.length; i += 1) {
    if (time >= demo.steps[i].t) index = i;
  }
  return index;
}

type Props = {
  demo: Demo;
  stepIndex: number;
  error?: string | null;
  onClose?: () => void;
};

export function LessonPanel({ demo, stepIndex, error, onClose }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const auto = Boolean(demo.autoProof);
  const finished = stepIndex >= demo.steps.length - 1;

  useEffect(() => {
    if (!auto) return;
    listRef.current?.querySelector<HTMLElement>("[data-live='1']")?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [auto, demo.id, stepIndex]);

  return (
    <aside className="relative min-h-0 flex-1 overflow-y-auto bg-paper-2 px-4 py-4 sm:px-6 sm:py-5 lg:flex-none">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 float-right rounded-full border border-line bg-white px-3 py-1.5 text-sm font-bold"
        >
          বন্ধ
        </button>
      ) : null}
      <p className="text-xs font-bold tracking-wide text-copper-deep">
        অধ্যায় {demo.chapterNo} · {demo.chapterName}
      </p>
      <h2 id="scene-title" className="clear-both mt-1 font-serif text-3xl leading-tight sm:text-4xl">
        {demo.title}
      </h2>
      {!auto || finished ? (
        <p className={`mt-3 text-base leading-relaxed text-ink ${auto ? "proof-rise" : ""}`}>{demo.proof}</p>
      ) : null}
      <div className="mt-4 rounded-2xl border border-line bg-white px-4 py-3">
        <p className="text-xs font-bold text-copper-deep">মূল সূত্র</p>
        <p className="mt-1 font-serif text-3xl leading-tight">{demo.formula}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{demo.verbal}</p>
      </div>
      {auto ? <p className="mt-4 text-xs font-bold text-copper-deep">প্রমাণ</p> : null}
      <ol ref={listRef} className="mt-2 grid gap-2">
        {demo.steps.map((stepItem, index) => {
          if (auto && index > stepIndex) return null;
          const on = index === stepIndex;
          return (
            <li
              key={stepItem.title}
              data-live={on ? "1" : "0"}
              className={`rounded-2xl border px-3 py-3 ${on ? "border-copper bg-[#fff7f1]" : "border-line bg-white/70"} ${auto && on ? "proof-rise" : ""}`}
            >
              <strong className="text-sm">
                {index + 1}. {stepItem.title}
              </strong>
              <p className="mt-1 text-sm leading-relaxed text-muted">{stepItem.body}</p>
            </li>
          );
        })}
      </ol>
      {demo.questions?.length && (!auto || finished) ? (
        <div className={`mt-4 grid gap-2 ${auto ? "proof-rise" : ""}`}>
          <p className="text-xs font-bold text-copper-deep">প্রশ্ন ও সমাধান</p>
          {demo.questions.map((item) => (
            <article key={item.q} className="rounded-2xl border border-line bg-white px-3 py-3">
              <p className="text-sm font-semibold leading-relaxed">{item.q}</p>
              <p className="mt-2 font-serif text-2xl leading-tight">{item.formula}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.solve}</p>
            </article>
          ))}
        </div>
      ) : null}
      {!auto || finished ? (
        <p className={`mt-4 rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-paper-2 ${auto ? "proof-rise" : ""}`}>
          {demo.note}
        </p>
      ) : null}
      {error ? <p className="mt-3 font-bold text-copper-deep">{error}</p> : null}
    </aside>
  );
}

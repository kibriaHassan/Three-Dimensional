"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { chapters as sscChapters } from "@/lab/scenes/index";
import { interPapers } from "@/lib/inter-physics";
import type { Chapter } from "@/lib/types";
import { chapterEn, sscChapterEn, useLang } from "./locale";

export type Board = "paper-1" | "paper-2" | "ssc";

const boards: Board[] = ["paper-1", "paper-2", "ssc"];
const sscList = (sscChapters as Chapter[]).filter((item) => item.id !== "all");

export function SiteBar({ active, onSelect }: { active?: Board; onSelect?: (board: Board) => void }) {
  const { lang, t, toggleLang } = useLang();
  const label = { "paper-1": t("inter1"), "paper-2": t("inter2"), ssc: t("ssc") };
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = [
    {
      id: "paper-1",
      title: t("paper1Title"),
      items: interPapers[0].chapters.map((item) => ({
        id: item.id,
        label: lang === "en" ? chapterEn[item.id] ?? item.title : item.title,
      })),
    },
    {
      id: "paper-2",
      title: t("paper2Title"),
      items: interPapers[1].chapters.map((item) => ({
        id: item.id,
        label: lang === "en" ? chapterEn[item.id] ?? item.title : item.title,
      })),
    },
    {
      id: "ssc",
      title: t("sscTitle"),
      items: sscList.map((item) => ({
        id: item.id,
        label: lang === "en" ? sscChapterEn[item.id] ?? item.name : item.name,
      })),
    },
  ];

  const drawer = (
    <div className={open ? "" : "pointer-events-none"}>
      <button
        type="button"
        aria-label={t("close")}
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-40 bg-ink/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        id="graph-drawer"
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label={t("graph")}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%,20.5rem)] flex-col border-r border-line bg-paper-2 shadow-2xl transition-transform duration-300 motion-reduce:transition-none ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
          <h2 className="font-serif text-2xl">{t("chapters")}</h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-bold">
            {t("close")}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <section key={group.id} className="mb-5">
              <h3 className="px-2 text-xs font-bold tracking-wide text-copper-deep">{group.title}</h3>
              <ul className="mt-2 grid gap-1">
                {group.items.map((item) => {
                  const key = `${group.id}:${item.id}`;
                  const on = picked === key;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setPicked(key)}
                        className={`w-full rounded-2xl px-3 py-2.5 text-left text-sm font-semibold ${on ? "bg-ink text-paper-2" : "text-ink hover:bg-white"}`}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );

  return (
    <>
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="graph-drawer"
        onClick={() => setOpen(true)}
        className={`rounded-full px-2.5 py-1.5 text-xs font-bold sm:px-3 sm:text-sm ${open ? "bg-ink text-paper-2" : "border border-line bg-white/80 text-ink"}`}
      >
        {t("graph")}
      </button>
      {boards.map((board) => {
        const on = active === board;
        const className = `rounded-full px-2.5 py-1.5 text-xs font-bold sm:px-3 sm:text-sm ${on ? "bg-ink text-paper-2" : "border border-line bg-white/80 text-ink"}`;
        if (onSelect) {
          return (
            <button key={board} type="button" aria-pressed={on} onClick={() => onSelect(board)} className={className}>
              {label[board]}
            </button>
          );
        }
        return (
          <Link key={board} href={`/?board=${board}&chapter=all`} className={`${className} no-underline`}>
            {label[board]}
          </Link>
        );
      })}
      <button type="button" onClick={toggleLang} className="rounded-full border border-copper bg-white/80 px-2.5 py-1.5 text-xs font-bold text-copper-deep sm:px-3 sm:text-sm">
        {t("lang")}
      </button>
    </div>
    {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}

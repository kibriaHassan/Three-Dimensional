"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { chapters as sscChapters } from "@/lab/scenes/index";
import { interPapers } from "@/lib/inter-physics";
import type { Chapter } from "@/lib/types";
import { toBn } from "@/vector-lab/math";
import { chapterEn, sscChapterEn, useLang } from "./locale";

export type Board = "paper-1" | "paper-2" | "ssc";

const boards: Board[] = ["paper-1", "paper-2", "ssc"];
const sscList = (sscChapters as Chapter[]).filter((item) => item.id !== "all");

export function SiteBar({ active, onSelect }: { active?: Board; onSelect?: (board: Board) => void }) {
  const { lang, t, toggleLang } = useLang();
  const path = usePathname() ?? "";
  const label = { "paper-1": t("inter1"), "paper-2": t("inter2"), ssc: t("ssc") };
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

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
        className={`fixed inset-0 z-40 bg-[#070b0e]/55 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        id="graph-drawer"
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label={t("graph")}
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%,22rem)] flex-col bg-[#10161d] text-[#f6f1e6] shadow-[8px_0_0_#c4623a] transition-transform duration-300 motion-reduce:transition-none ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-[#f0d48a]">{t("graph")}</p>
            <h2 className="font-serif text-2xl leading-none">{t("chapters")}</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/20 px-3 py-1.5 text-sm font-bold text-[#f6f1e6]">
            {t("close")}
          </button>
        </div>
        <div className="drawer-scroll min-h-0 flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <section key={group.id} className="mb-5">
              <h3 className="px-2 text-[11px] font-bold tracking-[0.14em] text-[#f0d48a]">{group.title}</h3>
              <ul className="mt-2 grid gap-1">
                {group.items.map((item, index) => {
                  const key = `${group.id}:${item.id}`;
                  const current = group.id === "paper-1" && path === `/graph/${item.id}`;
                  const on = current || picked === key;
                  const row = `grid w-full grid-cols-[2.2rem_minmax(0,1fr)] items-center gap-1 rounded-2xl px-2 py-2 text-left text-sm font-semibold ${on ? "bg-[#f6f1e6] text-ink" : "text-[#f6f1e6] hover:bg-white/8"}`;
                  const mark = <span className={`font-serif ${on ? "text-copper-deep" : "text-[#f0d48a]"}`}>{toBn(index + 1)}</span>;
                  return (
                    <li key={key}>
                      {group.id === "paper-1" ? (
                        <Link href={`/graph/${item.id}`} aria-current={current ? "page" : undefined} onClick={() => setOpen(false)} className={`${row} no-underline`}>
                          {mark}
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button type="button" aria-pressed={on} onClick={() => setPicked(key)} className={row}>
                          {mark}
                          <span>{item.label}</span>
                        </button>
                      )}
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
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold sm:px-3 sm:text-sm ${mounted && (open || path.startsWith("/graph")) ? "bg-copper text-white shadow-[3px_3px_0_#14211c]" : "border border-copper bg-[#fff7f2] text-copper-deep"}`}
      >
        <svg viewBox="0 0 28 14" className="h-3.5 w-6" aria-hidden="true">
          <path d="M1 11 C 5 11, 6 3, 10 3 S 15 11, 19 7 S 24 2, 27 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
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

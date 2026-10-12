"use client";

import Link from "next/link";
import { useLang } from "./locale";

export type Board = "paper-1" | "paper-2" | "ssc";

const boards: Board[] = ["paper-1", "paper-2", "ssc"];

export function SiteBar({ active, onSelect }: { active?: Board; onSelect?: (board: Board) => void }) {
  const { t, toggleLang } = useLang();
  const label = { "paper-1": t("inter1"), "paper-2": t("inter2"), ssc: t("ssc") };

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
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
  );
}

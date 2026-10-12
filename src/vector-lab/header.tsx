"use client";

import Link from "next/link";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";

export function VectorHeader() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <Link href="/?board=paper-1&chapter=vector" className="flex shrink-0 items-center gap-3 text-ink no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-ink bg-paper-2 shadow-[4px_4px_0_#14211c]">
            <span className="block h-4 w-4 rotate-45 border border-ink bg-gradient-to-br from-transparent from-40% to-copper to-40%" />
          </span>
          <span className="hidden sm:block">
            <strong className="block font-serif text-2xl font-normal leading-none">ত্রিমাত্র</strong>
            <small className="text-xs text-muted">{t("vectorChapter")}</small>
          </span>
        </Link>
        <SiteBar active="paper-1" />
      </div>
    </header>
  );
}

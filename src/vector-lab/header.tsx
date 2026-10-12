"use client";

import { BrandLockup } from "@/components/brand-mark";
import { useLang } from "@/components/locale";
import { SiteBar } from "@/components/site-bar";

export function VectorHeader() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <BrandLockup href="/?board=paper-1&chapter=vector" caption={t("vectorChapter")} />
        <SiteBar active="paper-1" />
      </div>
    </header>
  );
}

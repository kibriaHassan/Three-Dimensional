"use client";

import { useEffect, useMemo, useState } from "react";
import { toBn } from "@/lab/kit";
import { demoById, demos } from "@/lab/scenes/index";
import { cueVoice } from "@/lab/sound";
import type { Demo } from "@/lib/types";
import { Catalog } from "./catalog";
import { GlobalMute } from "./global-mute";
import { HeroStage } from "./hero-stage";
import { TheaterDialog } from "./theater-dialog";

const catalog = demos as Demo[];
const featured = demoById("pulley-move") as Demo;

const book = [
  ["ভৌত রাশি ও পরিমাপ", "দূরত্ব স্কেলার, সরণ ভেক্টর"],
  ["গতি", "মুক্তপতন, প্রক্ষেপ্য"],
  ["বল", "সামান্তরিক, টর্ক, টান, কপিকল, ঘর্ষণ, জড়তা, ভরবেগ"],
  ["কাজ, ক্ষমতা ও শক্তি", "কাজের শর্ত, শক্তির রূপান্তর"],
  ["পদার্থের অবস্থা ও চাপ", "গভীরতার সাথে চাপ, প্লবতা"],
  ["তাপের প্রভাব", "দৈর্ঘ্য প্রসারণ"],
  ["তরঙ্গ ও শব্দ", "সরল দোলক, অনুপ্রস্থ ও অনুদৈর্ঘ্য তরঙ্গ"],
  ["আলোর প্রতিফলন ও প্রতিসরণ", "দর্পণে বিম্ব, লেন্সে বিম্ব, সংকট কোণ"],
  ["স্থির বিদ্যুৎ", "আকর্ষণ ও বিকর্ষণ"],
  ["বিদ্যুতের চৌম্বক ক্রিয়া", "বদ্ধ বর্তনী, চুম্বক বলরেখা"],
  ["তেজস্ক্রিয়তা", "অর্ধায়ু"],
];

export function Studio() {
  const [chapter, setChapter] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const current = openId ? (demoById(openId) as Demo | null) : null;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((demo) => {
      if (chapter !== "all" && demo.chapter !== chapter) return false;
      if (!q) return true;
      return `${demo.title} ${demo.blurb} ${demo.chapterName} ${demo.keywords} ${demo.formula}`
        .toLowerCase()
        .includes(q);
    });
  }, [chapter, query]);

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.replace("#", ""));
    if (id && demoById(id)) setOpenId(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openId]);

  function openDemo(id: string) {
    cueVoice(id, 0);
    setOpenId(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  function closeDemo() {
    setOpenId(null);
    cueVoice(featured.id, 0);
    window.history.replaceState(null, "", window.location.pathname);
  }

  function step(dir: number) {
    if (!current) return;
    const list = visible.length ? visible : catalog;
    const index = list.findIndex((demo) => demo.id === current.id);
    const next = list[(index + dir + list.length) % list.length];
    openDemo(next.id);
  }

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-transparent bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4">
          <a href="#top" className="flex items-center gap-3 text-ink no-underline">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-ink bg-paper-2 shadow-[4px_4px_0_#14211c]">
              <span className="block h-4 w-4 rotate-45 border border-ink bg-gradient-to-br from-transparent from-40% to-copper to-40%" />
            </span>
            <span>
              <strong className="block font-serif text-2xl font-normal leading-none">ত্রিমাত্র</strong>
              <small className="text-xs text-muted">নবম–দশম পদার্থবিজ্ঞান</small>
            </span>
          </a>
          <nav className="hidden gap-5 text-sm font-semibold sm:flex">
            <a href="#catalog" className="text-ink no-underline">প্রমাণ</a>
            <a href="#howto" className="text-ink no-underline">কীভাবে দেখবে</a>
            <a href="#chapters" className="text-ink no-underline">অধ্যায়</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-6 sm:px-5 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div>
            <p className="mb-3 text-sm font-bold text-copper-deep">লগইন নেই · ব্রাউজারেই চলে</p>
            <h1 className="font-serif text-4xl leading-[1.18] text-balance sm:text-6xl">
              বইয়ের প্রমাণ, এখন ত্রিমাত্রে।
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              বল, টর্ক, টান, কপিকল থেকে আলো ও অর্ধায়ু—নবম-দশম শ্রেণির পরিচিত পরীক্ষাগুলো ছোট একটা দৃশ্য। ক্লিক করলে ভিডিওর মতো চলবে, আঙুল দিয়ে ঘোরালে চারদিক থেকে দেখা যাবে।
            </p>
            <ol className="mt-6 grid gap-2 text-sm font-semibold sm:grid-cols-3">
              {["প্রমাণ বেছে ক্লিক করো", "পাশে সূত্র পড়ো", "স্লাইডার দিয়ে গতি বদলাও"].map((item, index) => (
                <li key={item} className="rounded-2xl border border-line bg-white/70 px-3 py-3">
                  <span className="mb-1 block text-xs text-copper">০{toBn(index + 1)}</span>
                  {item}
                </li>
              ))}
            </ol>
            <a href="#catalog" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper-2 no-underline hover:bg-copper-deep">
              সব প্রমাণ দেখো
            </a>
          </div>
          <HeroStage demo={featured} active={!openId} onOpen={() => openDemo(featured.id)} />
        </section>

        <Catalog
          chapter={chapter}
          query={query}
          visible={visible}
          onChapter={setChapter}
          onQuery={setQuery}
          onOpen={openDemo}
        />

        <section id="howto" className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:px-5 md:grid-cols-3">
          {[
            ["তীর মানে বল", "লাল প্রযুক্ত বল, নীল ওজন, সবুজ বেগ, সোনালি টান। তীরের দৈর্ঘ্য মান, ফলা দিক।"],
            ["পাশে সূত্র", "প্রতিটি দৃশ্যের পাশে বাংলা নাম, মূল সূত্র আর ছোট ব্যাখ্যা থাকে।"],
            ["গতি ও ঘূর্ণন", "নিচের স্লাইডার দিয়ে অ্যানিমেশন ধীর-দ্রুত করো, ঘূর্ণন কমাও বা বাড়াও।"],
          ].map(([title, body], index) => (
            <article key={title} className="rounded-3xl border border-line bg-white/75 p-5">
              <p className="text-sm font-bold text-copper">০{toBn(index + 1)}</p>
              <h2 className="mt-1 font-serif text-3xl">{title}</h2>
              <p className="mt-2 text-muted">{body}</p>
            </article>
          ))}
        </section>

        <section id="chapters" className="mx-auto max-w-6xl px-4 pb-24 sm:px-5">
          <div className="rounded-3xl border border-line bg-white/80 p-5 sm:p-8">
            <h2 className="font-serif text-4xl">বইয়ের যে অধ্যায় ধরা আছে</h2>
            <ol className="mt-4 grid gap-3 sm:grid-cols-2">
              {book.map(([title, body], index) => (
                <li key={title} className="rounded-2xl bg-paper px-4 py-3">
                  <span className="text-xs font-bold text-copper-deep">{toBn(index + 1)}</span>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-muted">{body}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
            ত্রিমাত্র একটি পড়ার সহযোগী। সূত্রগুলো এসএসসি পদার্থবিজ্ঞানের পরিচিত রূপ। দৃশ্যের সংখ্যা বোঝার জন্য স্কেল করা — ল্যাবের মাপকাঠি নয়। আদর্শ দড়ি, ভরহীন কপিকল আর ঘর্ষণহীন তল যেখানে বইয়ে ধরা হয়, এখানেও সেভাবে।
          </p>
        </section>
      </main>

      <GlobalMute />
      {current ? <TheaterDialog demo={current} onClose={closeDemo} onStep={step} /> : null}
    </>
  );
}

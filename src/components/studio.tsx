"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toBn } from "@/lab/kit";
import { icons } from "@/lab/icons";
import { chapters, demoById, demos } from "@/lab/scenes/index";
import type { Chapter, Demo } from "@/lib/types";
import { cueVoice, syncVoice, unlockVoice } from "@/lab/sound";
import { LabStage, type LabViewer } from "./lab-stage";
import { SceneMic } from "./scene-mic";
import { TheaterDialog } from "./theater-dialog";

const catalog = demos as Demo[];
const chapterList = chapters as Chapter[];
const featured = demoById("pulley-move") as Demo;

const book = [
  ["ভৌত রাশি ও পরিমাপ", "দূরত্ব স্কেলার, সরণ ভেক্টর"],
  ["গতি", "মুক্তপতন, প্রক্ষেপ্য"],
  ["বল", "সামান্তরিক, টর্ক, টান, কপিকল, ঘর্ষণ, জড়তা, ভরবেগ"],
  ["কাজ, ক্ষমতা ও শক্তি", "কাজের শর্ত, শক্তির রূপান্তর"],
  ["পদার্থের অবস্থা ও চাপ", "গভীরতার সাথে চাপ, প্লবতা"],
  ["তাপের প্রভাব", "দৈর্ঘ্য প্রসারণ"],
  ["তরঙ্গ ও শব্দ", "সরল দোলক, অনুপ্রস্থ ও অনুদৈর্ঘ্য তরঙ্গ"],
  ["আলোর প্রতিফলন ও প্রতিসরণ", "i = r, স্নেল, উত্তল লেন্স"],
  ["স্থির বিদ্যুৎ", "আকর্ষণ ও বিকর্ষণ"],
  ["বিদ্যুতের চৌম্বক ক্রিয়া", "বদ্ধ বর্তনী, চুম্বক বলরেখা"],
  ["তেজস্ক্রিয়তা", "অর্ধায়ু"],
];

export function Studio() {
  const heroRef = useRef<LabViewer | null>(null);
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
    heroRef.current?.stop();
    window.history.replaceState(null, "", `#${id}`);
  }

  function closeDemo() {
    setOpenId(null);
    heroRef.current?.start();
    cueVoice(featured.id, heroRef.current?.time ?? 0);
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
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
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <div>
            <p className="mb-3 text-sm font-bold text-copper-deep">লগইন নেই · ব্রাউজারেই চলে</p>
            <h1 className="font-serif text-5xl leading-[1.18] text-balance sm:text-6xl">
              বইয়ের প্রমাণ, এখন ত্রিমাত্রে।
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              বল, টর্ক, টান, কপিকল থেকে আলো ও অর্ধায়ু—নবম-দশম শ্রেণির পরিচিত পরীক্ষাগুলো ছোট একটা দৃশ্য। ক্লিক করলে ভিডিওর মতো চলবে, টেনে ঘোরালে চারদিক থেকে দেখা যাবে।
            </p>
            <ol className="mt-6 grid gap-2 text-sm font-semibold sm:grid-cols-3">
              {["প্রমাণ বেছে ক্লিক করো", "দৃশ্যটা নিজে থেকে চলবে", "টেনে ঘুরিয়ে ত্রিমাত্র দেখো"].map((item, index) => (
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

          <div>
            <div
              className="relative h-[420px] overflow-hidden rounded-[28px] bg-lab shadow-[0_24px_60px_rgba(20,33,28,0.18)] sm:h-[500px]"
              onPointerDown={() => {
                if (!openId) unlockVoice();
              }}
            >
              <LabStage
                ref={heroRef}
                demo={featured}
                active={!openId}
                autoplay
                shadow={1024}
                onTick={(time, _duration, playing) => {
                  if (openId) return;
                  syncVoice(featured.id, time, playing);
                }}
              />
              <SceneMic />
              <p className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                টেনে ঘোরাও · স্ক্রল করে কাছে আনো
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted">এখন চলছে</p>
                <h2 className="font-serif text-2xl">{featured.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => openDemo(featured.id)}
                className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper-2 hover:bg-copper-deep"
              >
                পূর্ণ দৃশ্য
              </button>
            </div>
          </div>
        </section>

        <section id="catalog" className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-copper-deep">পাঠ্যবইয়ের ধারা</p>
              <h2 className="font-serif text-4xl">প্রমাণের তালিকা</h2>
            </div>
            <p className="font-bold text-muted">{toBn(visible.length)}টি দৃশ্য</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {chapterList.map((item) => {
              const count = item.id === "all" ? catalog.length : catalog.filter((demo) => demo.chapter === item.id).length;
              const on = chapter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setChapter(item.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${on ? "border-ink bg-ink text-paper-2" : "border-line bg-white/60"}`}
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
              onChange={(event) => setQuery(event.target.value)}
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
                  onClick={() => openDemo(demo.id)}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,33,28,0.1)]"
                >
                  <span
                    className="grid h-36 place-items-center bg-[#152028] px-6 text-[#f3eadc] [&_svg]:h-full [&_svg]:w-full"
                    dangerouslySetInnerHTML={{ __html: icons[demo.id as keyof typeof icons] || icons.path }}
                  />
                  <span className="flex flex-1 flex-col gap-2 p-4">
                    <span className="text-xs font-bold text-copper-deep">অধ্যায় {demo.chapterNo} · {demo.chapterName}</span>
                    <span className="font-serif text-[1.65rem] leading-tight text-ink">{demo.title}</span>
                    <span className="flex-1 text-sm leading-relaxed text-muted">{demo.blurb}</span>
                    <span className="text-sm font-bold">দৃশ্য চালাও →</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section id="howto" className="mx-auto grid max-w-6xl gap-4 px-5 py-8 md:grid-cols-3">
          {[
            ["তীর মানে বল", "লাল প্রযুক্ত বল, নীল ওজন, সবুজ বেগ, সোনালি টান। তীরের দৈর্ঘ্য মান, ফলা দিক।"],
            ["পাশে সূত্র", "দৃশ্য চলার সাথে ধাপ বদলায়। সূত্র, কথায় অর্থ, আর মনে রাখার লাইন একসাথে থাকে।"],
            ["সময়রেখা", "থামাও, পেছাও, আবার চালাও। ধীর গতিতে টর্ক বা কপিকলের সরণ মিলিয়ে দেখো।"],
          ].map(([title, body], index) => (
            <article key={title} className="rounded-3xl border border-line bg-white/75 p-5">
              <p className="text-sm font-bold text-copper">০{toBn(index + 1)}</p>
              <h2 className="mt-1 font-serif text-3xl">{title}</h2>
              <p className="mt-2 text-muted">{body}</p>
            </article>
          ))}
        </section>

        <section id="chapters" className="mx-auto max-w-6xl px-5 pb-16">
          <div className="rounded-3xl border border-line bg-white/80 p-6 sm:p-8">
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

      {current ? <TheaterDialog demo={current} onClose={closeDemo} onStep={step} /> : null}
    </>
  );
}

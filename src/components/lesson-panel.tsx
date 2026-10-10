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
      <p className="mt-3 text-base leading-relaxed text-ink">{demo.proof}</p>
      <div className="mt-4 rounded-2xl border border-line bg-white px-4 py-3">
        <p className="text-xs font-bold text-copper-deep">মূল সূত্র</p>
        <p className="mt-1 font-serif text-3xl leading-tight">{demo.formula}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{demo.verbal}</p>
      </div>
      <ol className="mt-4 grid gap-2">
        {demo.steps.map((stepItem, index) => {
          const on = index === stepIndex;
          return (
            <li
              key={stepItem.title}
              className={`rounded-2xl border px-3 py-3 ${on ? "border-copper bg-[#fff7f1]" : "border-line bg-white/70"}`}
            >
              <strong className="text-sm">
                {index + 1}. {stepItem.title}
              </strong>
              <p className="mt-1 text-sm leading-relaxed text-muted">{stepItem.body}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 rounded-2xl bg-ink px-4 py-3 text-sm leading-relaxed text-paper-2">{demo.note}</p>
      {error ? <p className="mt-3 font-bold text-copper-deep">{error}</p> : null}
    </aside>
  );
}

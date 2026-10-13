import type { Metadata } from "next";
import { LabBackdrop } from "@/components/lab-backdrop";
import { GraphStudio } from "@/graph-lab/studio";
import { interPapers } from "@/lib/inter-physics";
import { sscGraphChapters } from "@/graph-lab/ssc-chapters";

export function generateStaticParams() {
  return [
    ...interPapers.flatMap((paper) => paper.chapters.map((chapter) => ({ chapter: chapter.id }))),
    ...sscGraphChapters.map((chapter) => ({ chapter: chapter.id })),
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  const ssc = sscGraphChapters.find((item) => item.id === chapter);
  if (ssc) {
    return {
      title: `${ssc.title} — গ্রাফ`,
      description: `SSC পদার্থবিজ্ঞানের ${ssc.title} অধ্যায়ের গ্রাফ।`,
    };
  }
  const paper = interPapers.find((item) => item.chapters.some((entry) => entry.id === chapter));
  const found = paper?.chapters.find((item) => item.id === chapter);
  const which = paper?.id === "paper-2" ? "HSC ২য় পত্রের" : "HSC ১ম পত্রের";
  return {
    title: found ? `${found.title} — গ্রাফ` : "গ্রাফ",
    description: found ? `${which} ${found.title} অধ্যায়ের গ্রাফ।` : "পদার্থবিজ্ঞানের গ্রাফ।",
  };
}

export default async function GraphChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter } = await params;
  return (
    <>
      <LabBackdrop />
      <GraphStudio chapter={chapter} />
    </>
  );
}

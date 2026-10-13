import type { Metadata } from "next";
import { LabBackdrop } from "@/components/lab-backdrop";
import { GraphStudio } from "@/graph-lab/studio";
import { interPapers } from "@/lib/inter-physics";

export function generateStaticParams() {
  return interPapers.flatMap((paper) => paper.chapters.map((chapter) => ({ chapter: chapter.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  const paper = interPapers.find((item) => item.chapters.some((entry) => entry.id === chapter));
  const found = paper?.chapters.find((item) => item.id === chapter);
  const which = paper?.id === "paper-2" ? "HSC ২য় পত্রের" : "HSC ১ম পত্রের";
  return {
    title: found ? `${found.title} — গ্রাফ` : "গ্রাফ",
    description: found ? `${which} ${found.title} অধ্যায়ের গ্রাফ।` : "HSC পদার্থবিজ্ঞানের গ্রাফ।",
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

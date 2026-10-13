import type { Metadata } from "next";
import { LabBackdrop } from "@/components/lab-backdrop";
import { GraphStudio } from "@/graph-lab/studio";
import { interPapers } from "@/lib/inter-physics";

export function generateStaticParams() {
  return interPapers[0].chapters.map((chapter) => ({ chapter: chapter.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }): Promise<Metadata> {
  const { chapter } = await params;
  const found = interPapers[0].chapters.find((item) => item.id === chapter);
  return {
    title: found ? `${found.title} — গ্রাফ` : "গ্রাফ",
    description: found ? `HSC ১ম পত্রের ${found.title} অধ্যায়ের গ্রাফ।` : "HSC ১ম পত্রের গ্রাফ।",
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

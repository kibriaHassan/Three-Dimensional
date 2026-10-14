import type { Metadata } from "next";
import Link from "next/link";
import { LabBackdrop } from "@/components/lab-backdrop";
import { dynamicsModels, modelBySlug } from "@/dynamics-lab/catalog";
import { DynamicsStudio } from "@/dynamics-lab/studio";

export function generateStaticParams() {
  return dynamicsModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = modelBySlug(slug);
  return {
    title: model ? `${model.title} — গতিবিদ্যা` : "গতিবিদ্যা",
    description: model?.blurb ?? "HSC ১ম পত্রের গতিবিদ্যা অধ্যায়ের ত্রিমাত্র দৃশ্য",
  };
}

export default async function DynamicsModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = modelBySlug(slug);

  if (!model) {
    return (
      <>
        <LabBackdrop />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-serif text-4xl">এই মডেল নেই</h1>
          <p className="mt-3 text-muted">গতিবিদ্যা অধ্যায়ের তালিকায় ফিরে যাও।</p>
          <Link href="/?board=paper-1&chapter=dynamics" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper-2 no-underline">
            সব মডেল
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <LabBackdrop />
      <DynamicsStudio slug={slug} />
    </>
  );
}

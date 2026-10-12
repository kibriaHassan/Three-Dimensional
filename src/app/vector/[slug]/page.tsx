import type { Metadata } from "next";
import Link from "next/link";
import { LabBackdrop } from "@/components/lab-backdrop";
import { modelBySlug, vectorModels } from "@/vector-lab/catalog";
import { VectorHeader } from "@/vector-lab/header";
import { VectorStudio } from "@/vector-lab/studio";

export function generateStaticParams() {
  return vectorModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = modelBySlug(slug);
  return {
    title: model ? `${model.title} — ভেক্টর অধ্যায়` : "ভেক্টর অধ্যায়",
    description: model?.blurb ?? "ইন্টার ১ম পত্রের ভেক্টর অধ্যায়ের ত্রিমাত্র দৃশ্য",
  };
}

export default async function VectorModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = modelBySlug(slug);

  if (!model) {
    return (
      <>
        <LabBackdrop />
        <VectorHeader />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-serif text-4xl">এই মডেল নেই</h1>
          <p className="mt-3 text-muted">দশটি ভেক্টর মডেলের তালিকায় ফিরে যাও।</p>
          <Link href="/?board=paper-1&chapter=vector" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper-2 no-underline">
            সব মডেল
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <LabBackdrop />
      <VectorStudio slug={slug} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LabBackdrop } from "@/components/lab-backdrop";
import { modelBySlug, opticsModels } from "@/optics-lab/catalog";
import { OpticsStudio } from "@/optics-lab/studio";

export function generateStaticParams() {
  return opticsModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = modelBySlug(slug);
  return {
    title: model ? `${model.title} — ভৌত আলোকবিজ্ঞান` : "ভৌত আলোকবিজ্ঞান",
    description: model?.blurb ?? "ইন্টার ২য় পত্রের ভৌত আলোকবিজ্ঞানের ত্রিমাত্র দৃশ্য",
  };
}

export default async function OpticsModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = modelBySlug(slug);

  if (!model) {
    return (
      <>
        <LabBackdrop />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-serif text-4xl">এই মডেল নেই</h1>
          <p className="mt-3 text-muted">ভৌত আলোকবিজ্ঞানের তালিকায় ফিরে যাও।</p>
          <Link href="/?board=paper-2&chapter=phys-optics" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper-2 no-underline">
            সব মডেল
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <LabBackdrop />
      <OpticsStudio slug={slug} />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { LabBackdrop } from "@/components/lab-backdrop";
import { matterModels, modelBySlug } from "@/matter-lab/catalog";
import { MatterStudio } from "@/matter-lab/studio";

export function generateStaticParams() {
  return matterModels.map((model) => ({ slug: model.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = modelBySlug(slug);
  return {
    title: model ? `${model.title} — পদার্থের গাঠনিক ধর্ম` : "পদার্থের গাঠনিক ধর্ম",
    description: model?.blurb ?? "HSC ১ম পত্রের পদার্থের গাঠনিক ধর্ম অধ্যায়ের ত্রিমাত্র দৃশ্য",
  };
}

export default async function MatterModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = modelBySlug(slug);

  if (!model) {
    return (
      <>
        <LabBackdrop />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="font-serif text-4xl">এই মডেল নেই</h1>
          <p className="mt-3 text-muted">পদার্থের গাঠনিক ধর্ম অধ্যায়ের তালিকায় ফিরে যাও।</p>
          <Link href="/?board=paper-1&chapter=matter" className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper-2 no-underline">
            সব মডেল
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <LabBackdrop />
      <MatterStudio slug={slug} />
    </>
  );
}

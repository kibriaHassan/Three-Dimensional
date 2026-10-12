"use client";

import { modelBySlug } from "./catalog";
import { WaveShell } from "./shell";

export function WaveStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <WaveShell model={model} />;
}

"use client";

import { modelBySlug } from "./catalog";
import { MatterShell } from "./shell";

export function MatterStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <MatterShell model={model} />;
}

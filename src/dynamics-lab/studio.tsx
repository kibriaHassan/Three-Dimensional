"use client";

import { modelBySlug } from "./catalog";
import { DynamicsShell } from "./shell";

export function DynamicsStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <DynamicsShell model={model} />;
}

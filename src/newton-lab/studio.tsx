"use client";

import { modelBySlug } from "./catalog";
import { NewtonShell } from "./shell";

export function NewtonStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <NewtonShell model={model} />;
}

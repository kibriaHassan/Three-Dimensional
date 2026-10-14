"use client";

import { modelBySlug } from "./catalog";
import { GravityShell } from "./shell";

export function GravityStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <GravityShell model={model} />;
}

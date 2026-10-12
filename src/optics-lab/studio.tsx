"use client";

import { modelBySlug } from "./catalog";
import { OpticsShell } from "./shell";

export function OpticsStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <OpticsShell model={model} />;
}

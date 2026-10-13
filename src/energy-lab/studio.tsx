"use client";

import { modelBySlug } from "./catalog";
import { EnergyShell } from "./shell";

export function EnergyStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <EnergyShell model={model} />;
}

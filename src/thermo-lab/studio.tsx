"use client";

import { modelBySlug } from "./catalog";
import { ThermoShell } from "./shell";

export function ThermoStudio({ slug }: { slug: string }) {
  const model = modelBySlug(slug);
  if (!model) return null;
  return <ThermoShell model={model} />;
}

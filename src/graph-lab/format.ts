import { fmt, toBn } from "@/vector-lab/math";

export function bnNum(value: number, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const cleaned = abs < 5e-12 ? 0 : value;
  const magnitude = Math.abs(cleaned);
  const text =
    magnitude !== 0 && (magnitude >= 1e6 || magnitude < 1e-3)
      ? cleaned.toExponential(digits)
      : fmt(cleaned, digits);
  return toBn(text).replace(/-/g, "−");
}

export function bnTick(value: number) {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const cleaned = abs < 5e-12 ? 0 : value;
  const magnitude = Math.abs(cleaned);
  if (magnitude !== 0 && (magnitude >= 1e6 || magnitude < 1e-4)) {
    return toBn(cleaned.toExponential(1)).replace(/-/g, "−");
  }
  const digits = magnitude >= 100 || magnitude === 0 ? 0 : magnitude >= 10 ? 1 : magnitude >= 1 ? 2 : magnitude >= 0.01 ? 3 : 4;
  return toBn(fmt(cleaned, digits)).replace(/-/g, "−");
}

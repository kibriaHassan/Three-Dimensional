import Link from "next/link";

export const BRAND = "3dsciencezone";

export function BrandLockup({ href, caption }: { href: string; caption: string }) {
  return (
    <Link href={href} className="flex min-w-0 shrink items-center gap-2.5 text-ink no-underline">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-[11px] font-extrabold tracking-tight text-paper-2 shadow-[3px_3px_0_#c4623a]">
        3D
      </span>
      <span className="min-w-0">
        <strong className="block truncate font-sans text-[15px] font-extrabold leading-none tracking-tight sm:text-xl">
          <span className="text-copper">3d</span>sciencezone
        </strong>
        <small className="mt-0.5 block truncate text-[11px] text-muted sm:text-xs">{caption}</small>
      </span>
    </Link>
  );
}

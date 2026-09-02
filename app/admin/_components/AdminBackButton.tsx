"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type AdminBackButtonProps = {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function AdminBackButton({ label, href, onClick, className = "" }: AdminBackButtonProps) {
  const baseClassName = `inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border border-sky-300/20 bg-[#081427] px-3 py-2 text-sm font-black text-cyan-100 shadow-sm shadow-black/20 transition hover:border-orange-300/45 hover:bg-[#0d1b31] hover:text-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-[#07111f] ${className}`;
  const content = (
    <>
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 truncate">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={baseClassName} aria-label={label}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClassName} aria-label={label}>
      {content}
    </button>
  );
}

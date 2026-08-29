"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function PartnerAdminEmptyState({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <section className="rounded border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase text-slate-400">Partners</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{detail}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/admin/partner-verification"
          className="inline-flex h-10 items-center justify-center gap-2 rounded bg-slate-950 px-4 text-sm font-medium text-white hover:bg-slate-800"
        >
          Open Partner Verification
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href="/admin"
          className="inline-flex h-10 items-center justify-center rounded border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </div>
    </section>
  );
}

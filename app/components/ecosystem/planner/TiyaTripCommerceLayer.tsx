"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { TiyaCommerceBundle } from "@/app/lib/ecosystem/planner/plannerCommerceEngine";

type TiyaTripCommerceLayerProps = {
  bundles: TiyaCommerceBundle[];
};

export default function TiyaTripCommerceLayer({
  bundles,
}: TiyaTripCommerceLayerProps) {
  const safeBundles = Array.isArray(bundles) ? bundles : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          <ShoppingBag size={15} />
          Dynamic trip commerce layer
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
          {safeBundles.length} bundles
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {safeBundles.map((bundle) => (
          <article
            key={bundle.id}
            className="rounded-3xl border border-white/10 bg-white/10 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                {bundle.source}
              </span>
              <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-[11px] font-black text-orange-100">
                {bundle.relevance}% fit
              </span>
            </div>
            <h3 className="mt-4 text-base font-black text-white">{bundle.title}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              {bundle.detail}
            </p>
            <Link
              href={bundle.href}
              className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
            >
              {bundle.cta}
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

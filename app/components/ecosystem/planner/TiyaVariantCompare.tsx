"use client";

import { GitCompareArrows } from "lucide-react";
import type { TiyaTripVariant } from "@/app/lib/ecosystem/planner/plannerVariantEngine";

type TiyaVariantCompareProps = {
  variants: TiyaTripVariant[];
  selectedVariantId?: string;
};

function MetricBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
        <span>{label}</span>
        <span className="text-white/80">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaVariantCompare({
  variants,
  selectedVariantId,
}: TiyaVariantCompareProps) {
  const safeVariants = Array.isArray(variants) ? variants : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <GitCompareArrows size={15} />
        Variant comparison
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {safeVariants.map((variant) => {
          const selected = selectedVariantId === variant.id;

          return (
            <div
              key={`variant-compare-${variant.id}`}
              className={`rounded-2xl border p-3 transition ${
                selected
                  ? "border-orange-300/50 bg-orange-500/10"
                  : "border-white/10 bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-black text-white">
                    {variant.name}
                  </h4>
                  <p className="mt-1 text-[11px] font-bold text-white/50">
                    {variant.duration} · ₹
                    {variant.estimatedCost.toLocaleString("en-IN")}
                  </p>
                </div>
                {variant.isRecommended ? (
                  <span className="rounded-full bg-cyan-300/15 px-2 py-1 text-[10px] font-black text-cyan-100">
                    AI fit
                  </span>
                ) : null}
              </div>
              <div className="mt-3 grid gap-2">
                <MetricBar label="Intensity" value={variant.activityIntensity} />
                <MetricBar label="Comfort" value={variant.comfortLevel} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

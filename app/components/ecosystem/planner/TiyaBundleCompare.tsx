"use client";

import { BarChart3 } from "lucide-react";
import type { TiyaSmartBundle } from "@/app/lib/ecosystem/planner/plannerBundleEngine";

type TiyaBundleCompareProps = {
  bundles: TiyaSmartBundle[];
  selectedBundle?: TiyaSmartBundle;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-black text-white">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-orange-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaBundleCompare({
  bundles,
  selectedBundle,
}: TiyaBundleCompareProps) {
  const safeBundles = Array.isArray(bundles) ? bundles : [];
  const bundle = selectedBundle ?? safeBundles.find((item) => item.isRecommended) ?? safeBundles[0];

  if (!bundle) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <BarChart3 size={15} />
            Bundle comparison
          </div>
          <h3 className="mt-2 text-lg font-black text-white">{bundle.name}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
            {bundle.bestFor}
          </p>
        </div>
        <span className="w-fit rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black text-emerald-100">
          Save ₹{bundle.estimatedSavings.toLocaleString("en-IN")}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ScoreBar label="Comfort score" value={bundle.comfortScore} />
        <ScoreBar label="Safety score" value={bundle.safetyScore} />
        <ScoreBar label="Value score" value={bundle.valueScore} />
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {safeBundles.map((item) => (
          <div
            key={item.id}
            className={`min-w-[190px] rounded-2xl border p-3 ${
              item.id === bundle.id
                ? "border-orange-300/35 bg-orange-400/15"
                : "border-white/10 bg-white/10"
            }`}
          >
            <p className="text-sm font-black text-white">{item.name}</p>
            <p className="mt-1 text-xs font-semibold text-white/60">
              Value {item.valueScore}% · Safety {item.safetyScore}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

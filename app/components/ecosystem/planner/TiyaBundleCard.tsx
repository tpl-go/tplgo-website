"use client";

import { CheckCircle2, Layers3 } from "lucide-react";
import type { TiyaSmartBundle } from "@/app/lib/ecosystem/planner/plannerBundleEngine";

type TiyaBundleCardProps = {
  bundle: TiyaSmartBundle;
  isSelected: boolean;
  onSelect: (bundleId: TiyaSmartBundle["id"]) => void;
};

export default function TiyaBundleCard({
  bundle,
  isSelected,
  onSelect,
}: TiyaBundleCardProps) {
  const safeItems = Array.isArray(bundle.includedItems)
    ? bundle.includedItems
    : [];

  return (
    <article
      className={`flex min-h-[360px] flex-col rounded-3xl border p-3 transition sm:p-4 ${
        isSelected
          ? "border-orange-300/40 bg-orange-400/15 shadow-[0_0_34px_rgba(249,115,22,0.16)]"
          : "border-white/10 bg-white/[0.08] hover:bg-white/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
          <Layers3 size={19} />
        </div>
        <div className="flex flex-col items-end gap-2">
          {bundle.isRecommended ? (
            <span className="rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black text-white">
              Tiya pick
            </span>
          ) : null}
          <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-black text-emerald-100">
            Save ₹{bundle.estimatedSavings.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      <h3 className="mt-4 text-lg font-black text-white">{bundle.name}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
        {bundle.bestFor}
      </p>

      <div className="mt-4 grid gap-2">
        {safeItems.map((item) => (
          <div key={item} className="flex items-start gap-2 text-xs font-semibold text-white/75">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Comfort", bundle.comfortScore],
          ["Safety", bundle.safetyScore],
          ["Value", bundle.valueScore],
        ].map(([label, score]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/10 p-2"
          >
            <p className="text-sm font-black text-white">{score}%</p>
            <p className="text-[10px] font-black uppercase text-white/45">
              {label}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-xs font-semibold leading-5 text-cyan-50">
        {bundle.upgradeNote}
      </p>

      <div className="mt-auto grid gap-2 pt-4">
        <button
          type="button"
          onClick={() => onSelect(bundle.id)}
          className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-black transition ${
            isSelected
              ? "bg-orange-500 text-white shadow-[0_12px_32px_rgba(249,115,22,0.28)] hover:bg-orange-600"
              : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          Select Bundle
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="min-h-10 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
          >
            Compare
          </button>
          <button
            type="button"
            className="min-h-10 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-white transition hover:bg-white/15"
          >
            Customize
          </button>
        </div>
      </div>
    </article>
  );
}

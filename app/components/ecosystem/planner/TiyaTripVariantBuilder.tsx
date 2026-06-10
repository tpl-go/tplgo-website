"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Layers,
  Route,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  generatePlannerTripVariants,
  type TiyaTripVariant,
  type TiyaTripVariantId,
} from "@/app/lib/ecosystem/planner/plannerVariantEngine";
import type {
  TiyaGeneratedPlan,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaVariantCompare from "./TiyaVariantCompare";

type TiyaTripVariantBuilderProps = {
  intent: TiyaTripIntent;
  plan: TiyaGeneratedPlan;
  selectedVariantId?: TiyaTripVariantId;
  isGenerating?: boolean;
  onVariantSelect?: (variant: TiyaTripVariant) => void;
  onVariantApply?: (variant: TiyaTripVariant) => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
    style: "currency",
    currency: "INR",
  }).format(value);
}

function ScoreChip({
  label,
  score,
}: {
  label: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs font-black text-white">{score}</span>
      </div>
    </div>
  );
}

export default function TiyaTripVariantBuilder({
  intent,
  plan,
  selectedVariantId,
  isGenerating = false,
  onVariantSelect,
  onVariantApply,
}: TiyaTripVariantBuilderProps) {
  const variants = useMemo(
    () => generatePlannerTripVariants(intent, plan),
    [intent, plan]
  );
  const recommendedVariant = variants.find((variant) => variant.isRecommended);
  const [internalSelectedVariantId, setInternalSelectedVariantId] =
    useState<TiyaTripVariantId>(recommendedVariant?.id ?? "premium");
  const [showCompare, setShowCompare] = useState(false);
  const [duplicatedVariantIds, setDuplicatedVariantIds] = useState<
    TiyaTripVariantId[]
  >([]);
  const [savedVariantIds, setSavedVariantIds] = useState<TiyaTripVariantId[]>([]);
  const activeVariantId = selectedVariantId ?? internalSelectedVariantId;

  function selectVariant(variant: TiyaTripVariant) {
    setInternalSelectedVariantId(variant.id);
    onVariantSelect?.(variant);
  }

  function duplicateVariant(variantId: TiyaTripVariantId) {
    setDuplicatedVariantIds((current) =>
      current.includes(variantId) ? current : [...current, variantId]
    );
  }

  function saveVariant(variantId: TiyaTripVariantId) {
    setSavedVariantIds((current) =>
      current.includes(variantId) ? current : [...current, variantId]
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_90%_12%,rgba(249,115,22,0.18),transparent_25%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Layers
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Trip variant builder
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Generate alternate trip versions
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Compare budget, premium, short, long, family, adventure and
              luxury variants from the same live planner intent.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedVariant ? (
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100">
                AI highlights {recommendedVariant.name}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setShowCompare((current) => !current)}
              className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
            >
              Compare variant
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 lg:grid-cols-2">
        {variants.map((variant) => {
          const selected = activeVariantId === variant.id;
          const duplicated = duplicatedVariantIds.includes(variant.id);
          const saved = savedVariantIds.includes(variant.id);

          return (
            <article
              key={variant.id}
              className={`rounded-3xl border p-3 transition-all duration-300 sm:p-4 ${
                selected
                  ? "border-orange-300/50 bg-orange-500/10 shadow-[0_16px_44px_rgba(249,115,22,0.18)]"
                  : "border-white/10 bg-white/[0.08] hover:bg-white/10"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        selected ? "bg-orange-500" : "bg-white/10"
                      }`}
                    >
                      <Wand2 size={19} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-white">
                        {variant.name}
                      </h3>
                      <p className="mt-0.5 text-xs font-bold text-white/60">
                        {variant.duration}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.isRecommended ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-300/15 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                      <Sparkles size={12} />
                      AI note
                    </span>
                  ) : null}
                  {duplicated ? (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75">
                      Duplicate ready
                    </span>
                  ) : null}
                  {saved ? (
                    <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-black text-emerald-100">
                      Saved locally
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Cost
                  </p>
                  <p className="mt-1 text-sm font-black text-white">
                    {formatCurrency(variant.estimatedCost)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Route
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-white">
                    {variant.routeStyle}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Stay
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-white">
                    {variant.stayStyle}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-2.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                    Transport
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-white">
                    {variant.transportStyle}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <ScoreChip label="Activity intensity" score={variant.activityIntensity} />
                <ScoreChip label="Comfort level" score={variant.comfortLevel} />
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-white/50">
                  Best for
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/75">
                  {variant.bestFor}
                </p>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-white/50">
                  What changes
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/75">
                  {variant.changesFromBase}
                </p>
                <p className="mt-3 text-xs font-bold leading-5 text-orange-100/90">
                  {variant.aiNote}
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <button
                  type="button"
                  onClick={() => selectVariant(variant)}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
                    selected
                      ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_12px_28px_rgba(255,123,0,0.28)]"
                      : "border border-white/15 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {selected ? <CheckCircle2 size={15} /> : <Route size={15} />}
                  {selected ? "Selected" : "Select"}
                </button>
                <button
                  type="button"
                  onClick={() => onVariantApply?.(variant)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-500/15"
                >
                  <Wand2 size={15} />
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => duplicateVariant(variant.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
                >
                  <Copy size={15} />
                  Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => saveVariant(variant.id)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black text-white transition hover:bg-white/15"
                >
                  <Save size={15} />
                  Save
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {showCompare ? (
        <div className="border-t border-white/10 p-3 sm:p-5">
          <TiyaVariantCompare
            variants={variants}
            selectedVariantId={activeVariantId}
          />
        </div>
      ) : null}
    </section>
  );
}

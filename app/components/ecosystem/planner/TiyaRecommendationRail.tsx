"use client";

import { ArrowRight, MapPinned } from "lucide-react";
import type { TiyaMemoryRecommendation } from "@/app/lib/ecosystem/planner/plannerRecommendationMemory";

type TiyaRecommendationRailProps = {
  recommendations: TiyaMemoryRecommendation[];
};

export default function TiyaRecommendationRail({
  recommendations,
}: TiyaRecommendationRailProps) {
  const safeRecommendations = Array.isArray(recommendations)
    ? recommendations
    : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          <MapPinned size={15} />
          Smart recommendation layer
        </div>
        <span className="rounded-full border border-orange-300/20 bg-orange-400/10 px-3 py-1 text-xs font-black text-orange-100">
          {safeRecommendations.length} matches
        </span>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {safeRecommendations.map((recommendation) => (
          <article
            key={recommendation.id}
            className="min-w-[250px] rounded-3xl border border-white/10 bg-white/10 p-4 sm:min-w-[300px]"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-cyan-300/10 px-2.5 py-1 text-[11px] font-black text-cyan-100">
                {recommendation.category}
              </span>
              <span className="rounded-full bg-orange-400/15 px-2.5 py-1 text-[11px] font-black text-orange-100">
                {recommendation.fitScore}% fit
              </span>
            </div>
            <h3 className="mt-4 text-base font-black text-white">
              {recommendation.title}
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              {recommendation.detail}
            </p>
            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/15"
            >
              Use as inspiration
              <ArrowRight size={13} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

"use client";

import { BrainCircuit, Sparkles } from "lucide-react";
import type { TiyaTravelPersonality as TiyaTravelPersonalityData } from "@/app/lib/ecosystem/planner/plannerTravelPersonalityEngine";

type TiyaTravelPersonalityProps = {
  personality: TiyaTravelPersonalityData;
};

export default function TiyaTravelPersonality({
  personality,
}: TiyaTravelPersonalityProps) {
  const safeTraits = Array.isArray(personality.traits) ? personality.traits : [];

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <BrainCircuit size={15} />
            Behaviour intelligence
          </div>
          <h3 className="mt-2 text-xl font-black text-white">
            {personality.label}
          </h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
            {personality.note}
          </p>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-orange-300/25 bg-orange-400/10 shadow-[0_0_34px_rgba(249,115,22,0.18)]">
          <span className="text-2xl font-black text-orange-100">
            {personality.score}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {safeTraits.map((trait) => (
          <span
            key={trait}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white"
          >
            <Sparkles size={12} />
            {trait}
          </span>
        ))}
      </div>
    </article>
  );
}

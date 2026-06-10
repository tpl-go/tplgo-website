"use client";

import { LifeBuoy, Sparkles } from "lucide-react";
import type { TiyaRecoverySuggestion } from "@/app/lib/ecosystem/planner/plannerRecoveryEngine";

type TiyaRecoverySuggestionsProps = {
  suggestions: TiyaRecoverySuggestion[];
};

export default function TiyaRecoverySuggestions({
  suggestions,
}: TiyaRecoverySuggestionsProps) {
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <LifeBuoy size={15} />
        AI recovery suggestions
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-2">
        {safeSuggestions.map((suggestion) => (
          <article
            key={suggestion.id}
            className="rounded-2xl border border-white/10 bg-white/[0.06] p-3"
          >
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-100" />
              <div>
                <h4 className="text-sm font-black text-white">
                  {suggestion.title}
                </h4>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/70">
                  {suggestion.detail}
                </p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
                  {suggestion.actionType.replace("-", " ")}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

import { ArrowRight, BrainCircuit, Sparkles } from "lucide-react";
import type { TiyaAIRecommendation } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaAIRecommendationRailProps = {
  recommendations: TiyaAIRecommendation[];
};

export default function TiyaAIRecommendationRail({
  recommendations,
}: TiyaAIRecommendationRailProps) {
  const safeRecommendations = Array.isArray(recommendations)
    ? recommendations
    : [];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <BrainCircuit size={15} />
            AI recommendation rail
          </div>
          <h2 className="mt-2 text-xl font-black text-white">
            Dynamic suggestions
          </h2>
        </div>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
        {safeRecommendations.map((recommendation) => (
          <article
            key={recommendation.id}
            className="min-w-[240px] rounded-3xl border border-white/10 bg-white/10 p-4 sm:min-w-[280px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <Sparkles size={18} />
            </div>
            <h3 className="mt-4 text-base font-black text-white">
              {recommendation.title}
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              {recommendation.detail}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
              {recommendation.impact}
              <ArrowRight size={13} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

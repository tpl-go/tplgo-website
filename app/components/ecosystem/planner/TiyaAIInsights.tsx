import { BrainCircuit } from "lucide-react";
import type { TiyaInsight } from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaAIInsightsProps = {
  insights: TiyaInsight[];
  isGenerating?: boolean;
};

const barStyles: Record<TiyaInsight["tone"], string> = {
  blue: "bg-blue-600",
  orange: "bg-orange-500",
  green: "bg-emerald-500",
  slate: "bg-slate-500",
};

export default function TiyaAIInsights({
  insights,
  isGenerating = false,
}: TiyaAIInsightsProps) {
  const safeInsights = Array.isArray(insights) ? insights : [];

  return (
    <section className="rounded-3xl border border-white/80 bg-[#061839]/95 p-4 text-white shadow-[0_18px_60px_rgba(6,24,57,0.18)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <BrainCircuit size={15} className={isGenerating ? "animate-pulse" : undefined} />
            AI insight panel
          </div>
          <h2 className="mt-2 text-xl font-black text-white">Planning signals</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-cyan-100">
          Frontend mock
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {safeInsights.map((insight) => (
          <div key={insight.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-black text-white/78">{insight.label}</span>
              <span className="font-black text-white">{insight.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barStyles[insight.tone]}`}
                style={{ width: `${insight.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

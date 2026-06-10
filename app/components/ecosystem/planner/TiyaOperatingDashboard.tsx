import type {
  TiyaAIRecommendation,
  TiyaBudgetIntelligence,
  TiyaSmartAlert,
  TiyaTravelStat,
  TiyaTripHealth,
} from "@/app/lib/ecosystem/planner/plannerTypes";
import TiyaAIRecommendationRail from "./TiyaAIRecommendationRail";
import TiyaBudgetIntelligencePanel from "./TiyaBudgetIntelligence";
import TiyaSmartAlerts from "./TiyaSmartAlerts";
import TiyaTravelStats from "./TiyaTravelStats";
import TiyaTripHealthPanel from "./TiyaTripHealth";

type TiyaOperatingDashboardProps = {
  health: TiyaTripHealth;
  budget: TiyaBudgetIntelligence;
  alerts: TiyaSmartAlert[];
  recommendations: TiyaAIRecommendation[];
  stats: TiyaTravelStat[];
  isGenerating?: boolean;
};

export default function TiyaOperatingDashboard({
  health,
  budget,
  alerts,
  recommendations,
  stats,
  isGenerating = false,
}: TiyaOperatingDashboardProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 p-4 sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.2),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.2),transparent_26%)]" />
        <div className="relative">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            AI trip operating dashboard
          </div>
          <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
            Live travel cockpit
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
            Tiya monitors health, booking readiness, budget risk, alerts,
            recommendations and operating stats from the current frontend plan.
          </p>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5">
        <TiyaTripHealthPanel health={health} isGenerating={isGenerating} />
        <div className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
          <TiyaBudgetIntelligencePanel budget={budget} />
          <TiyaSmartAlerts alerts={alerts} />
        </div>
        <TiyaAIRecommendationRail recommendations={recommendations} />
        <TiyaTravelStats stats={stats} />
      </div>
    </section>
  );
}

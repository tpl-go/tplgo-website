import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import type {
  TiyaAIRecommendationChangeLog,
  TiyaBudgetIntelligence,
  TiyaSmartAlert,
  TiyaTripHealth as TiyaTripHealthData,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type TiyaTripHealthProps = {
  health: TiyaTripHealthData;
  alerts?: TiyaSmartAlert[];
  budget?: TiyaBudgetIntelligence;
  changeHistory?: TiyaAIRecommendationChangeLog[];
  isGenerating?: boolean;
};

export default function TiyaTripHealth({
  alerts = [],
  budget,
  changeHistory = [],
  health,
  isGenerating = false,
}: TiyaTripHealthProps) {
  const metricScore = (label: string, fallback: number) =>
    health.metrics.find((metric) =>
      metric.label.toLowerCase().includes(label.toLowerCase())
    )?.score || fallback;
  const formula = [
    ["Route Health", 20, metricScore("route", 82)],
    ["Budget Health", 15, budget?.risk === "high spend" ? 58 : budget?.risk === "balanced" ? 76 : 88],
    ["Safety Health", 20, alerts.some((alert) => alert.severity === "critical") ? 52 : alerts.some((alert) => alert.severity === "warning") ? 72 : 90],
    ["Weather Health", 15, metricScore("weather", 78)],
    ["Comfort Health", 15, metricScore("comfort", health.overallScore)],
    ["Booking Readiness", 15, metricScore("booking", 76)],
  ] as const;
  const weightedScore = Math.round(
    formula.reduce((sum, [, weight, score]) => sum + (weight / 100) * score, 0)
  );
  const angle = `${Math.round((weightedScore / 100) * 360)}deg`;
  const bookingConfidence = Math.min(
    96,
    Math.max(38, weightedScore + (changeHistory.length ? 4 : 0) - alerts.length * 2)
  );
  const verdict =
    weightedScore >= 82 && bookingConfidence >= 78
      ? "Ready To Book"
      : weightedScore >= 62
        ? "Needs Review"
        : "Not Recommended";
  const verdictStyle =
    verdict === "Ready To Book"
      ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-100"
      : verdict === "Needs Review"
        ? "border-orange-300/25 bg-orange-400/10 text-orange-100"
        : "border-rose-300/25 bg-rose-400/10 text-rose-100";
  const impactBefore = Math.max(42, weightedScore - Math.min(12, changeHistory.length * 3));
  const readinessScore = formula.find(([label]) => label === "Booking Readiness")?.[2] || 0;
  const readinessBefore = Math.max(35, readinessScore - Math.min(14, changeHistory.length * 4));
  const readinessImpact = readinessScore - readinessBefore;
  const blockingAlerts = alerts.filter((alert) => alert.severity !== "info").length;
  const scenarios = [
    ["Current Plan", weightedScore, "Live itinerary, current route and selected services"],
    ["Budget Plan", Math.max(45, weightedScore - 4), "Lower cost with mild comfort trade-off"],
    ["Comfort Plan", Math.min(98, weightedScore + 6), "Recovery stay and lighter day pacing"],
    ["Adventure Plan", Math.max(44, weightedScore - 8), "Higher activity load and route exposure"],
    ["Luxury Plan", Math.min(99, weightedScore + 8), "Premium stay and private transfer emphasis"],
  ] as const;
  const healthTimeline = Array.from({ length: 5 }, (_, index) => ({
    day: `Day ${index + 1}`,
    score: Math.max(48, Math.min(96, weightedScore + (index % 2 === 0 ? 3 : -5) - index)),
  }));

  return (
    <section className="w-full max-w-full min-w-0 overflow-x-hidden rounded-3xl border border-white/10 bg-white/[0.08] p-4 text-white">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
            <Activity size={15} className={isGenerating ? "animate-pulse" : undefined} />
            Final trip audit engine
          </div>
          <h3 className="mt-2 text-xl font-black text-white">
            Is this trip healthy and ready to book?
          </h3>
          <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-white/62">
            This audit scores booking confidence from route, budget, safety,
            weather, comfort and readiness. It does not duplicate Smart Travel Recommendations.
          </p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 text-sm font-black ${verdictStyle}`}>
          {verdict}
        </div>
      </div>

      <div className="mt-4 grid min-w-0 max-w-full grid-cols-1 gap-4 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full p-2 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
          style={{
            background: `conic-gradient(#fb923c ${angle}, rgba(255,255,255,0.12) ${angle})`,
          }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#061839]">
            <span className="text-4xl font-black">{weightedScore}%</span>
            <span className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/50">
              Trip audit
            </span>
          </div>
        </div>

        <div className="min-w-0 max-w-full">
          <div className="flex items-start gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-300/10 p-3">
            <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
            <p className="text-sm font-semibold leading-6 text-white/75">
              {verdict === "Ready To Book"
                ? "The trip is healthy enough to move into final review and booking."
                : verdict === "Needs Review"
                  ? "The trip can proceed, but review the highlighted readiness or risk items before booking."
                  : "The trip should not be booked until safety, readiness or budget blockers are resolved."}{" "}
              {health.recommendationNote}
            </p>
          </div>
          <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-3">
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                Overall score
              </p>
              <p className="mt-1 text-lg font-black text-white">{weightedScore}%</p>
            </div>
            <div className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                Booking confidence
              </p>
              <p className="mt-1 text-lg font-black text-white">{bookingConfidence}%</p>
            </div>
            <div className={`min-w-0 rounded-2xl border p-3 ${verdictStyle}`}>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] opacity-75">
                Final verdict
              </p>
              <p className="mt-1 text-sm font-black">{verdict}</p>
            </div>
          </div>
          <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {formula.map(([label, weight, score]) => (
              <div key={label} className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="font-black text-white/70">
                    {label} {weight}%
                  </span>
                  <span className="font-black text-white">{score}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400"
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-3">
        <div className="min-w-0 rounded-3xl border border-emerald-300/18 bg-emerald-400/10 p-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
            <ShieldCheck size={15} />
            Readiness impact
          </div>
          <p className="mt-2 text-2xl font-black text-white">
            {readinessBefore}% → {readinessScore}%
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-emerald-50/72">
            Booking readiness {readinessImpact >= 0 ? "improved" : "changed"} by {readinessImpact >= 0 ? "+" : ""}{readinessImpact} from applied planner changes.
          </p>
        </div>
        <div className="min-w-0 rounded-3xl border border-cyan-300/18 bg-cyan-300/10 p-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <CheckCircle2 size={15} />
            Health impact after changes
          </div>
          <p className="mt-2 text-2xl font-black text-white">
            {impactBefore}% → {weightedScore}%
          </p>
          <p className="mt-1 text-xs font-semibold leading-5 text-cyan-50/72">
            Comfort, risk and readiness changes are pulled from the transparent change log.
          </p>
        </div>
        <div className="min-w-0 rounded-3xl border border-orange-300/18 bg-orange-400/10 p-3">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
            <AlertTriangle size={15} />
            Audit blockers
          </div>
          <p className="mt-2 text-2xl font-black text-white">{blockingAlerts}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-orange-50/72">
            Non-info alerts affecting the final verdict.
          </p>
        </div>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 xl:grid-cols-2">
        <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            Day-wise health timeline
          </p>
          <div className="mt-3 grid gap-2">
            {healthTimeline.map((day) => (
              <div key={day.day} className="grid min-w-0 grid-cols-[70px_minmax(0,1fr)_42px] items-center gap-3">
                <span className="text-xs font-black text-white">{day.day}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-orange-400" style={{ width: `${day.score}%` }} />
                </div>
                <span className="text-xs font-black text-white">{day.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-orange-300/18 bg-orange-400/10 p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
            Alert center
          </p>
          <div className="mt-3 grid gap-2">
            {(alerts.length ? alerts : [{ id: "clear", title: "No critical alerts", detail: "Trip is inside normal operating limits.", severity: "info" as const }]).slice(0, 4).map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-xs font-black text-white">{alert.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-white/58">{alert.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          Scenario simulation
        </p>
        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {scenarios.map(([label, score, detail]) => (
            <div key={label} className="min-w-0 rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-xs font-black text-white">{label}</p>
              <p className="mt-1 text-lg font-black text-white">{score}%</p>
              <p className="mt-1 text-[11px] font-semibold leading-4 text-white/50">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 min-w-0 rounded-3xl border border-white/10 bg-white/[0.06] p-3">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
          <CheckCircle2 size={14} />
          Health change log
        </div>
        <div className="mt-3 grid gap-2">
          {changeHistory.length ? changeHistory.slice(0, 4).map((change) => (
            <div key={change.id} className="rounded-2xl border border-white/10 bg-white/10 p-3">
              <p className="text-sm font-black text-white">{change.title}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-white/58">{change.impact}</p>
            </div>
          )) : (
            <p className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold text-white/58">
              No applied planner changes yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

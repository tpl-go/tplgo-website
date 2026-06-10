import { CloudSun, FileText, Route, ShieldCheck, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { TiyaRouteOption } from "@/app/lib/ecosystem/planner/plannerTypes";
import type { getTravelIntelligenceDashboard } from "../data/routePreviewData";

type TravelIntelligence = ReturnType<typeof getTravelIntelligenceDashboard>;

function IntelligenceScore({
  label,
  score,
  gradient,
}: {
  label: string;
  score: number;
  gradient: string;
}) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const status =
    clampedScore >= 90
      ? "Excellent"
      : clampedScore >= 75
        ? "Good"
        : clampedScore >= 60
          ? "Moderate"
          : "Caution";
  const statusColor =
    status === "Excellent"
      ? "text-emerald-700"
      : status === "Good"
        ? "text-cyan-700"
        : status === "Moderate"
          ? "text-amber-700"
          : "text-rose-700";

  return (
    <div className="rounded-2xl border border-sky-100 bg-white/82 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 p-1.5">
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-[0_12px_28px_rgba(15,23,42,0.14)]`}
          style={{
            opacity: 0.48 + clampedScore / 200,
          }}
        >
          {clampedScore}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] font-black leading-4 text-slate-700">
        {label}
      </p>
      <p className={`mt-1 text-center text-[10px] font-black uppercase tracking-[0.12em] ${statusColor}`}>
        {status}
      </p>
    </div>
  );
}

function IntelligenceCard({
  title,
  badge,
  icon,
  tone = "sky",
  score,
  confidence,
  children,
}: {
  title: string;
  badge?: string;
  icon?: ReactNode;
  tone?: "sky" | "emerald" | "amber" | "violet";
  score?: number;
  confidence?: string;
  children: ReactNode;
}) {
  const tones = {
    sky: "border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50",
    emerald:
      "border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50",
    amber:
      "border-amber-100 bg-gradient-to-br from-amber-50 via-white to-sky-50",
    violet:
      "border-violet-100 bg-gradient-to-br from-violet-50 via-white to-sky-50",
  };

  return (
    <div className={`min-w-0 rounded-[1.15rem] border p-3 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:rounded-[1.35rem] sm:p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-slate-700 shadow-sm">
              {icon}
            </span>
          ) : null}
          <p className="text-sm font-black text-slate-950">{title}</p>
        </div>
        {badge ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
            {badge}
          </span>
        ) : null}
      </div>
      {typeof score === "number" || confidence ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {typeof score === "number" ? (
            <span className="rounded-full border border-white/70 bg-white/78 px-3 py-1 text-[10px] font-black text-slate-700 shadow-sm">
              Score {score}/100
            </span>
          ) : null}
          {confidence ? (
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black text-cyan-700">
              {confidence}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function IntelligenceMetricGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map(([label, value]) => (
        <div
          key={`${label}-${value}`}
          className="rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2"
        >
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  );
}

type TravelIntelligenceSectionProps = {
  routeOption: TiyaRouteOption;
  travelIntelligence: TravelIntelligence;
};

export default function TravelIntelligenceSection({
  routeOption,
  travelIntelligence,
}: TravelIntelligenceSectionProps) {
  return (
<div className="grid min-w-0 gap-3 sm:gap-4">
<div className="rounded-[1.15rem] border border-sky-200 bg-gradient-to-br from-white via-sky-50/80 to-orange-50/50 p-3 shadow-[0_18px_44px_rgba(15,23,42,0.10)] sm:rounded-[1.45rem] sm:p-4">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
        AI travel command center
      </p>
      <h5 className="mt-1 text-xl font-black text-slate-950">
        Route, weather, safety and permit intelligence
      </h5>
    </div>
    <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-[11px] font-black text-cyan-700">
      Live API ready
    </span>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
    {travelIntelligence.scores.map(([label, score, gradient]) => (
      <IntelligenceScore
        key={label}
        label={label}
        score={score}
        gradient={gradient}
      />
    ))}
  </div>
</div>

<div className="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-2">
  <IntelligenceCard
    title="Weather Intelligence"
    badge={travelIntelligence.weather.status}
    icon={<CloudSun size={18} />}
    tone="sky"
    score={travelIntelligence.scores[1][1]}
    confidence="Confidence 86%"
  >
    <IntelligenceMetricGrid
      items={[
        ["Temperature", travelIntelligence.weather.temperatureRange],
        ["Rain Risk", travelIntelligence.weather.rainRisk],
        ["Wind", travelIntelligence.weather.windSpeed],
        ["Visibility", travelIntelligence.weather.visibility],
        ["Best Window", travelIntelligence.weather.bestWindow],
        ["Status", travelIntelligence.weather.status],
      ]}
    />
  </IntelligenceCard>

  <IntelligenceCard
    title="Route Intelligence"
    badge={travelIntelligence.route.roadStatus}
    icon={<Route size={18} />}
    tone="sky"
    score={routeOption.comfortScore}
    confidence="Confidence 82%"
  >
    <IntelligenceMetricGrid
      items={[
        ["Road Status", travelIntelligence.route.roadStatus],
        ["EV / Fuel", travelIntelligence.route.evCharging],
        ["Fuel Availability", travelIntelligence.route.fuelAvailability],
        ["Network", travelIntelligence.route.networkCoverage],
        ["Driving Difficulty", travelIntelligence.route.drivingDifficulty],
      ]}
    />
  </IntelligenceCard>

  <IntelligenceCard
    title="Safety & Health"
    badge={travelIntelligence.safety.safetyStatus}
    icon={<ShieldCheck size={18} />}
    tone="emerald"
    score={travelIntelligence.scores[2][1]}
    confidence="Confidence 88%"
  >
    <IntelligenceMetricGrid
      items={[
        ["Safety Status", travelIntelligence.safety.safetyStatus],
        ["Altitude Risk", travelIntelligence.safety.altitudeRisk],
        ["Medical Readiness", travelIntelligence.safety.medicalReadiness],
        ["Emergency Access", travelIntelligence.safety.emergencyAccess],
      ]}
    />
  </IntelligenceCard>

  <IntelligenceCard
    title="Permit & Regulation"
    badge={travelIntelligence.permit.travelAdvisory}
    icon={<FileText size={18} />}
    tone="amber"
    score={routeOption.riskLevel === "High" ? 62 : 86}
    confidence="Confidence 79%"
  >
    <IntelligenceMetricGrid
      items={[
        ["Permit", travelIntelligence.permit.permitStatus],
        ["Restricted Zones", travelIntelligence.permit.restrictedZones],
        ["Travel Advisory", travelIntelligence.permit.travelAdvisory],
        ["Local Alerts", travelIntelligence.permit.localAlerts],
      ]}
    />
  </IntelligenceCard>
</div>

<div className="rounded-[1.15rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-orange-50 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.08)] sm:rounded-[1.35rem] sm:p-4">
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-violet-200 bg-white/86 text-violet-700 shadow-sm">
        <Sparkles size={18} />
      </span>
      <p className="text-sm font-black text-slate-950">
        AI Recommendations
      </p>
    </div>
    <span className="rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-700">
      Tiya AI
    </span>
  </div>
  <div className="mt-3 grid gap-2 sm:grid-cols-2">
    {travelIntelligence.recommendations.map((recommendation) => (
      <div
        key={recommendation.title}
        className="flex items-start gap-2 rounded-2xl border border-sky-100 bg-sky-50/70 px-3 py-2 text-sm font-bold leading-5 text-slate-700"
      >
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-black text-white">
          ✓
        </span>
        <span className="min-w-0">
          <span className="block font-black text-slate-950">
            {recommendation.title}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-slate-600">
            {recommendation.description}
          </span>
          <span className="mt-2 inline-flex rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-orange-700">
            {recommendation.priorityTag}
          </span>
        </span>
      </div>
    ))}
  </div>
</div>
            </div>
  );
}

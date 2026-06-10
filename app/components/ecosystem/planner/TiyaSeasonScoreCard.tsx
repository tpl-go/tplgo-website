"use client";

import { CalendarDays } from "lucide-react";
import type {
  TiyaBestMonthIntelligence,
  TiyaSeasonReadiness,
} from "@/app/lib/ecosystem/planner/plannerSeasonEngine";

type TiyaSeasonScoreCardProps = {
  readiness: TiyaSeasonReadiness;
  monthIntelligence: TiyaBestMonthIntelligence;
};

const riskStyles = {
  Low: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Medium: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  High: "border-rose-300/20 bg-rose-400/10 text-rose-100",
} as const;

function MonthStrip({
  label,
  months,
}: {
  label: string;
  months: string[];
}) {
  const safeMonths = Array.isArray(months) ? months : [];

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {safeMonths.map((month) => (
          <span
            key={`${label}-${month}`}
            className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/75"
          >
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TiyaSeasonScoreCard({
  readiness,
  monthIntelligence,
}: TiyaSeasonScoreCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <CalendarDays size={15} />
            Seasonal readiness
          </div>
          <p className="mt-2 text-3xl font-black text-white">
            {readiness.seasonScore}%
          </p>
          <p className="mt-1 text-sm font-semibold text-white/70">
            {readiness.selectedMonth} · {readiness.seasonType} ·{" "}
            {readiness.destinationType}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1.5 text-xs font-black ${riskStyles[readiness.riskLabel]}`}
        >
          {readiness.riskLabel} risk
        </span>
      </div>

      <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm font-semibold leading-6 text-white/70">
        {readiness.note}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
            Best window
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {readiness.bestTravelWindow}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
            Avoid
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {readiness.avoidWindow}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
            Ideal duration
          </p>
          <p className="mt-1 text-xs font-black text-white">
            {readiness.idealTripDuration}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <MonthStrip label="Best months" months={monthIntelligence.bestMonths} />
        <MonthStrip label="Okay months" months={monthIntelligence.okayMonths} />
        <MonthStrip label="Avoid months" months={monthIntelligence.avoidMonths} />
      </div>
    </div>
  );
}

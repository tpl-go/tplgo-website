"use client";

import { Activity } from "lucide-react";
import type { TiyaFatigueSummary } from "@/app/lib/ecosystem/planner/plannerFatigueEngine";

type TiyaFatigueInsightsProps = {
  summary: TiyaFatigueSummary;
};

function FatigueMeter({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/50">
          {label}
        </p>
        <span className="text-sm font-black text-white">{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-orange-400 to-rose-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaFatigueInsights({
  summary,
}: TiyaFatigueInsightsProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <Activity size={15} />
        Travel fatigue intelligence
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <FatigueMeter label="Overall" value={summary.overallFatigue} />
        <FatigueMeter label="Long stretch" value={summary.longTravelStretch} />
        <FatigueMeter label="Overnight" value={summary.overnightFatigue} />
        <FatigueMeter label="Altitude" value={summary.altitudeFatigue} />
        <FatigueMeter label="Transfers" value={summary.multiTransferOverload} />
      </div>
    </div>
  );
}

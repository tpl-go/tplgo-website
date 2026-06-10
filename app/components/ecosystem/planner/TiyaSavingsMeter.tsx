"use client";

import { TrendingDown } from "lucide-react";
import type { TiyaSavingsMeterData } from "@/app/lib/ecosystem/planner/plannerSavingsEngine";

type TiyaSavingsMeterProps = {
  savings: TiyaSavingsMeterData;
};

function ImpactMeter({
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
          className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-orange-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaSavingsMeter({ savings }: TiyaSavingsMeterProps) {
  return (
    <div className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-100">
            <TrendingDown size={15} />
            Smart savings meter
          </div>
          <p className="mt-2 text-3xl font-black text-white">
            ₹{savings.estimatedSavings.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs font-semibold text-white/70">
            Estimated optimization headroom · {savings.savingsPercent}% of trip
            cost
          </p>
        </div>
        <span className="w-fit rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1.5 text-xs font-black text-emerald-100">
          Frontend estimate
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <ImpactMeter label="Comfort impact" value={savings.comfortImpact} />
        <ImpactMeter label="Scenic impact" value={savings.scenicImpact} />
        <ImpactMeter
          label="Intensity relief"
          value={savings.travelIntensityImpact}
        />
      </div>
    </div>
  );
}

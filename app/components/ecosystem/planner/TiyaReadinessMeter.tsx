"use client";

import { Gauge, ShieldCheck } from "lucide-react";
import type { TiyaPackingReadiness } from "@/app/lib/ecosystem/planner/plannerReadinessEngine";

type TiyaReadinessMeterProps = {
  readiness: TiyaPackingReadiness;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-black text-white">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-orange-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function TiyaReadinessMeter({
  readiness,
}: TiyaReadinessMeterProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
            <Gauge size={15} />
            Readiness meter
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
            Packing, safety and weather preparation readiness for this trip.
          </p>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-orange-300/25 bg-orange-400/10 shadow-[0_0_34px_rgba(249,115,22,0.18)]">
          <span className="text-2xl font-black text-orange-100">
            {readiness.packingReadiness}%
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <ScoreBar label="Weather readiness" value={readiness.weatherReadiness} />
        <ScoreBar label="Safety readiness" value={readiness.safetyReadiness} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-2">
          <p className="text-lg font-black text-rose-100">
            {readiness.missingEssentials}
          </p>
          <p className="text-[10px] font-black uppercase text-rose-100/70">
            Missing
          </p>
        </div>
        <div className="rounded-2xl border border-orange-300/20 bg-orange-400/10 p-2">
          <p className="text-lg font-black text-orange-100">
            {readiness.criticalItems}
          </p>
          <p className="text-[10px] font-black uppercase text-orange-100/70">
            Critical
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-2">
          <p className="text-lg font-black text-cyan-100">
            {readiness.optionalUpgrades}
          </p>
          <p className="text-[10px] font-black uppercase text-cyan-100/70">
            Upgrades
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-xs font-semibold leading-5 text-emerald-50">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        Critical items are generated from destination, transport, travellers,
        route risk and seasonal simulation.
      </div>
    </div>
  );
}

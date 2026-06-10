"use client";

import { Gauge } from "lucide-react";
import type { TiyaReviewScores } from "@/app/lib/ecosystem/planner/plannerReviewEngine";

type TiyaReviewScoreProps = {
  scores: TiyaReviewScores;
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

export default function TiyaReviewScore({ scores }: TiyaReviewScoreProps) {
  return (
    <div className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
            <Gauge size={15} />
            AI quality score
          </div>
          <h3 className="mt-2 text-xl font-black text-white">
            Final plan quality
          </h3>
        </div>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-orange-300/25 bg-orange-500 text-white shadow-[0_0_34px_rgba(249,115,22,0.22)]">
          <span className="text-2xl font-black">{scores.tripQualityScore}%</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <ScoreBar label="Booking readiness" value={scores.bookingReadinessScore} />
        <ScoreBar label="Safety confidence" value={scores.safetyConfidence} />
        <ScoreBar label="Budget fit" value={scores.budgetFit} />
        <ScoreBar label="Comfort match" value={scores.comfortMatch} />
        <ScoreBar label="Experience match" value={scores.experienceMatch} />
      </div>
    </div>
  );
}

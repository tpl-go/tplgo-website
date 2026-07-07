"use client";

import { ShieldCheck } from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

type ReviewReadinessScoreCardProps = {
  score: number;
  status: "Ready To Book" | "Needs Review" | "Not Ready";
  summary: Array<{ label: string; value: string | number }>;
};

function statusClass(status: ReviewReadinessScoreCardProps["status"]) {
  return getReviewStatusVisual(status === "Ready To Book" ? "Ready" : status).badgeClass;
}

export default function ReviewReadinessScoreCard({
  score,
  status,
  summary,
}: ReviewReadinessScoreCardProps) {
  const statusVisual = getReviewStatusVisual(status === "Ready To Book" ? "Ready" : status);

  return (
    <article className={`rounded-[1.75rem] border border-slate-200 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)] ${statusVisual.cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Overall Readiness Score
          </p>
          <p className="mt-3 text-5xl font-black text-slate-950">{score}%</p>
        </div>
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-current/10 bg-white/70 ${statusVisual.iconClass}`}>
          <ShieldCheck size={22} />
        </span>
      </div>

      <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-black ${statusClass(status)}`}>
        {status}
      </span>

      <div className="mt-5 grid gap-2">
        {summary.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <span className="text-xs font-bold text-slate-500">{row.label}</span>
            <span className="text-sm font-black text-slate-950">{row.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

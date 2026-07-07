"use client";

import { Gauge, ShieldCheck } from "lucide-react";

type ReviewAuditScoreCardProps = {
  critical: number;
  passed: number;
  pending: number;
  score: number;
  status: string;
  warnings: number;
};

export default function ReviewAuditScoreCard({
  critical,
  passed,
  pending,
  score,
  status,
  warnings,
}: ReviewAuditScoreCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Planner Audit Score
          </p>
          <p className="mt-3 text-5xl font-black text-slate-950">{score}%</p>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <Gauge size={22} />
        </span>
      </div>

      <p className="mt-3 inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-black text-[#4f46e5]">
        {status}
      </p>

      <div className="mt-5 grid gap-2">
        {[
          ["Critical", critical],
          ["Warnings", warnings],
          ["Passed", passed],
          ["Pending", pending],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <span className="text-xs font-bold text-slate-500">{label}</span>
            <span className="text-sm font-black text-slate-950">{value}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700">
        <ShieldCheck size={15} />
        Audit data is read from the Smart Planner review payload.
      </p>
    </article>
  );
}

"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

type ReadinessRow = {
  label: string;
  status: "Ready" | "Pending" | "Missing";
};

type ReviewTravellerValidationProps = {
  gaps: string[];
  readiness: ReadinessRow[];
};

function statusClass(status: ReadinessRow["status"]) {
  return getReviewStatusVisual(status).badgeClass;
}

export default function ReviewTravellerValidation({
  gaps,
  readiness,
}: ReviewTravellerValidationProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#4f46e5]" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Travel Document Readiness
          </p>
        </div>
        <div className="mt-4 grid gap-2">
          {readiness.map((row) => {
            const statusVisual = getReviewStatusVisual(row.status);
            return (
              <div
                key={row.label}
                className={`flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 ${statusVisual.cardClass}`}
              >
                <span className="text-sm font-black text-slate-700">{row.label}</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(row.status)}`}>
                  {row.status}
                </span>
              </div>
            );
          })}
        </div>
      </article>

      <article
        className={`rounded-[1.75rem] border p-5 ${
          gaps.length
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          {gaps.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          Traveller Validation Center
        </div>
        <div className="mt-3 grid gap-2">
          {gaps.length ? (
            gaps.map((gap) => (
              <p
                key={gap}
                className="rounded-2xl border border-red-100 bg-white px-3 py-2 text-sm font-black"
              >
                {gap}
              </p>
            ))
          ) : (
            <p className="rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold">
              No traveller validation gaps detected from the current payload.
            </p>
          )}
        </div>
      </article>
    </div>
  );
}

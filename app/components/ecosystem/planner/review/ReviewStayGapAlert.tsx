"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

type ReviewStayGapAlertProps = {
  gaps: string[];
};

export default function ReviewStayGapAlert({ gaps }: ReviewStayGapAlertProps) {
  if (!gaps.length) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <CheckCircle2 size={18} />
          Stay Gap Alert Center
        </div>
        <p className="mt-3 text-sm font-semibold leading-6">
          No obvious stay coverage gaps detected from the current review
          payload.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-5 text-red-800">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
        <AlertTriangle size={18} />
        Stay Gap Alert Center
      </div>
      <div className="mt-3 grid gap-2">
        {gaps.map((gap) => (
          <p key={gap} className="rounded-2xl border border-red-100 bg-white px-3 py-2 text-sm font-black">
            {gap}
          </p>
        ))}
      </div>
    </div>
  );
}

"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

type ReviewProceedGuardProps = {
  blockers: string[];
};

export default function ReviewProceedGuard({
  blockers,
}: ReviewProceedGuardProps) {
  if (!blockers.length) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <CheckCircle2 size={18} />
          Proceed guard clear
        </div>
        <p className="mt-2 text-sm font-semibold leading-6">
          Review payload and selected basket are available for booking handoff.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-4 text-red-800">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
        <AlertTriangle size={18} />
        Proceed blockers
      </div>
      <div className="mt-3 grid gap-2">
        {blockers.map((blocker) => (
          <p
            key={blocker}
            className="rounded-2xl border border-red-100 bg-white px-3 py-2 text-sm font-black"
          >
            {blocker}
          </p>
        ))}
      </div>
    </div>
  );
}

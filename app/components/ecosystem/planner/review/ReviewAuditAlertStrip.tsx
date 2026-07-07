"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

type ReviewAuditAlertStripProps = {
  criticalCount: number;
};

export default function ReviewAuditAlertStrip({
  criticalCount,
}: ReviewAuditAlertStripProps) {
  if (criticalCount > 0) {
    return (
      <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-red-800">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <AlertTriangle size={18} />
          Critical issues require review before booking.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
        <CheckCircle2 size={18} />
        No critical blockers detected.
      </div>
    </div>
  );
}

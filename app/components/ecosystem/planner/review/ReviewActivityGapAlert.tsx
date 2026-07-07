"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

type ReviewActivityGapAlertProps = {
  alerts: string[];
};

export default function ReviewActivityGapAlert({
  alerts,
}: ReviewActivityGapAlertProps) {
  if (!alerts.length) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <CheckCircle2 size={18} />
          Activity Load Validation
        </div>
        <p className="mt-3 text-sm font-semibold leading-6">
          No activity load gaps detected from the current review payload.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-amber-800">
      <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
        <AlertTriangle size={18} />
        Activity Load Validation
      </div>
      <div className="mt-3 grid gap-2">
        {alerts.map((alert) => (
          <p
            key={alert}
            className="rounded-2xl border border-amber-100 bg-white px-3 py-2 text-sm font-black"
          >
            {alert}
          </p>
        ))}
      </div>
    </div>
  );
}

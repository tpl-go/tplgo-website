"use client";

import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type ReviewReadinessBlockersProps = {
  blockers: string[];
  optionalItems: string[];
};

export default function ReviewReadinessBlockers({
  blockers,
  optionalItems,
}: ReviewReadinessBlockersProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <article
        className={`rounded-[1.75rem] border p-5 ${
          blockers.length
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          {blockers.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          Booking Blockers
        </div>
        <div className="mt-3 grid gap-2">
          {blockers.length ? (
            blockers.map((blocker) => (
              <p
                key={blocker}
                className="rounded-2xl border border-red-100 bg-white px-3 py-2 text-sm font-black"
              >
                {blocker}
              </p>
            ))
          ) : (
            <p className="rounded-2xl border border-emerald-100 bg-white px-3 py-2 text-sm font-semibold">
              No booking blockers detected.
            </p>
          )}
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-blue-200 bg-blue-50 p-5 text-blue-800">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em]">
          <Info size={18} />
          Optional Items
        </div>
        <div className="mt-3 grid gap-2">
          {optionalItems.map((item) => (
            <p
              key={item}
              className="rounded-2xl border border-blue-100 bg-white px-3 py-2 text-sm font-black"
            >
              {item}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

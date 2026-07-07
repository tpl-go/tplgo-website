"use client";

import { Sparkles } from "lucide-react";

type ReviewTravellerPreferencesProps = {
  preferences: string[];
  roomSummary: Array<{ label: string; value: string | number }>;
};

export default function ReviewTravellerPreferences({
  preferences,
  roomSummary,
}: ReviewTravellerPreferencesProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#4f46e5]" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Traveller Preferences
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {preferences.length ? (
            preferences.map((preference) => (
              <span
                key={preference}
                className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700"
              >
                {preference}
              </span>
            ))
          ) : (
            <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-500">
              No traveller preferences available.
            </p>
          )}
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Room Allocation Summary
        </p>
        <div className="mt-4 grid gap-2">
          {roomSummary.map((row) => (
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
    </div>
  );
}

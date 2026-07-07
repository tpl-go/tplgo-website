"use client";

import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";

import type { ActivityReviewItem } from "./ReviewActivityCard";
import { getReviewStatusVisual } from "./reviewStatusStyles";

type DayActivityCoverage = {
  count: number;
  dayNumber: number;
  status: "Balanced" | "Heavy" | "Missing";
};

type ReviewActivityCoverageSummaryProps = {
  activities: ActivityReviewItem[];
  coverage: DayActivityCoverage[];
};

function statusClass(status: DayActivityCoverage["status"]) {
  return getReviewStatusVisual(status === "Balanced" ? "Ready" : status === "Heavy" ? "Pending" : "Missing").badgeClass;
}

export default function ReviewActivityCoverageSummary({
  activities,
  coverage,
}: ReviewActivityCoverageSummaryProps) {
  const selected = activities.filter(
    (activity) => activity.status === "Added to Booking"
  ).length;
  const recommended = activities.filter(
    (activity) => activity.status === "Recommended"
  ).length;
  const pending = activities.filter(
    (activity) => activity.status === "Pending"
  ).length;
  const heavyDays = coverage.filter((day) => day.status === "Heavy").length;
  const emptyDays = coverage.filter((day) => day.status === "Missing").length;
  const readiness = activities.length
    ? Math.min(100, Math.round((selected / activities.length) * 100 + 28))
    : 0;

  return (
    <aside className="grid gap-4 self-start">
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Activity Readiness
        </p>
        <p className="mt-3 text-5xl font-black text-slate-950">{readiness}%</p>
        <p className="mt-2 inline-flex rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-black text-[#4f46e5]">
          Coverage Status:{" "}
          {emptyDays > 0 ? "Needs Review" : heavyDays > 0 ? "Activity Heavy" : "Balanced"}
        </p>

        <div className="mt-5 grid gap-2">
          {[
            ["Selected Activities", selected],
            ["Recommended Activities", recommended],
            ["Pending Activities", pending],
            ["Activity-heavy Days", heavyDays],
            ["Empty Activity Days", emptyDays],
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
      </div>

      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#4f46e5]" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Day-wise Activity Coverage
          </p>
        </div>
        <div className="mt-4 grid gap-2">
          {coverage.length ? (
            coverage.map((day) => (
              <div
                key={day.dayNumber}
                className={`flex items-center justify-between rounded-2xl border px-3 py-2 ${statusClass(
                  day.status
                )}`}
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-black">
                  {day.status === "Missing" ? (
                    <AlertTriangle size={14} />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  Day {day.dayNumber}
                </span>
                <span className="text-sm font-black">
                  {day.count} {day.count === 1 ? "Activity" : "Activities"}
                  {day.status !== "Balanced" ? ` · ${day.status}` : ""}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-500">
              No day-wise activity coverage available.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

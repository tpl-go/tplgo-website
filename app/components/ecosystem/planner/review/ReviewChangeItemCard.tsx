"use client";

import {
  BadgeIndianRupee,
  CalendarClock,
  Gauge,
  ShieldAlert,
} from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type ReviewChangeCategory =
  | "Route"
  | "Stay"
  | "Transport"
  | "Activity"
  | "Budget"
  | "Weather"
  | "Risk"
  | "Local Life"
  | "Creator"
  | "Booking"
  | "Other";

export type ReviewChangeStatus =
  | "Applied"
  | "Saved"
  | "Removed"
  | "Updated"
  | "Pending";

export type ReviewChangeItem = {
  affectedDay?: string;
  affectedService?: string;
  category: ReviewChangeCategory;
  comfortImpact?: number;
  costImpact?: number;
  id: string;
  newValue?: string;
  previousValue?: string;
  riskImpact?: number;
  sourceModule: string;
  status: ReviewChangeStatus;
  summary?: string;
  timestamp?: string;
  title: string;
};

type ReviewChangeItemCardProps = {
  change: ReviewChangeItem;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) === 0) return "Not available";
  const prefix = Number(value) > 0 ? "+" : "-";
  return `${prefix}₹${Math.abs(Number(value)).toLocaleString("en-IN")}`;
}

function dateLabel(value?: string) {
  if (!value) return "Timestamp unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: ReviewChangeStatus) {
  return getReviewStatusVisual(status).badgeClass;
}

function categoryClass(category: ReviewChangeCategory) {
  if (category === "Budget") return "border-orange-200 bg-orange-50 text-orange-700";
  if (category === "Route" || category === "Transport") return "border-blue-200 bg-blue-50 text-blue-700";
  if (category === "Risk" || category === "Weather") return "border-amber-200 bg-amber-50 text-amber-700";
  if (category === "Local Life" || category === "Creator") return "border-violet-200 bg-violet-50 text-violet-700";
  if (category === "Stay" || category === "Activity") return "border-cyan-200 bg-cyan-50 text-cyan-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function ReviewChangeItemCard({
  change,
}: ReviewChangeItemCardProps) {
  const statusVisual = getReviewStatusVisual(change.status);

  return (
    <article className={`rounded-3xl border border-slate-200 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${statusVisual.cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${categoryClass(change.category)}`}>
              {change.category}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusClass(change.status)}`}>
              {change.status}
            </span>
          </div>
          <h4 className="mt-3 break-words text-lg font-black text-slate-950">
            {change.title}
          </h4>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            {change.sourceModule}
          </p>
        </div>
      </div>

      {change.summary ? (
        <p className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">
          {change.summary}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 text-xs">
        {[
          ["Affected Day", change.affectedDay || "Not specified"],
          ["Affected Service", change.affectedService || "Not specified"],
          ["Previous Value", change.previousValue || "Not available"],
          ["New Value", change.newValue || "Not available"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2"
          >
            <span className="font-bold text-slate-500">{label}</span>
            <span className="text-right font-black text-slate-900">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 xl:grid-cols-4">
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-700">
          <BadgeIndianRupee size={13} />
          Cost {formatCurrency(change.costImpact)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
          <Gauge size={13} />
          Comfort {change.comfortImpact ? `${change.comfortImpact > 0 ? "+" : ""}${change.comfortImpact}` : "NA"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
          <ShieldAlert size={13} />
          Risk {change.riskImpact ? `${change.riskImpact > 0 ? "+" : ""}${change.riskImpact}` : "NA"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-600">
          <CalendarClock size={13} />
          {dateLabel(change.timestamp)}
        </span>
      </div>
    </article>
  );
}

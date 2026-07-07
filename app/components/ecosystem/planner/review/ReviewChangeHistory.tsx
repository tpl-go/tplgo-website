"use client";

import { useMemo, useState } from "react";
import { BadgeIndianRupee, Gauge, History, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ReviewChangeSummaryCard from "./ReviewChangeSummaryCard";
import ReviewChangeTimeline from "./ReviewChangeTimeline";
import type {
  ReviewChangeCategory,
  ReviewChangeItem,
  ReviewChangeStatus,
} from "./ReviewChangeItemCard";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewChangeHistoryProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type UnknownRecord = Record<string, unknown>;

const filters: Array<"All" | ReviewChangeCategory> = [
  "All",
  "Route",
  "Stay",
  "Transport",
  "Activity",
  "Budget",
  "Weather",
  "Risk",
  "Local Life",
  "Creator",
  "Booking",
];

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function textValue(record: UnknownRecord, keys: string[]) {
  const value = keys.map((key) => record[key]).find((item) => typeof item === "string");
  return typeof value === "string" ? value : "";
}

function numberValue(record: UnknownRecord, keys: string[]) {
  const value = keys
    .map((key) => record[key])
    .find((item) => typeof item === "number" || typeof item === "string");
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function inferCategory(key: string, record: UnknownRecord): ReviewChangeCategory {
  const text = [
    key,
    record.type,
    record.actionType,
    record.category,
    record.sourceModule,
    record.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("route")) return "Route";
  if (text.includes("stay") || text.includes("hotel") || text.includes("homestay")) return "Stay";
  if (text.includes("transport") || text.includes("cab") || text.includes("flight") || text.includes("transfer")) return "Transport";
  if (text.includes("activity") || text.includes("experience")) return "Activity";
  if (text.includes("budget") || text.includes("cost") || text.includes("saving")) return "Budget";
  if (text.includes("weather")) return "Weather";
  if (text.includes("risk") || text.includes("safe")) return "Risk";
  if (text.includes("local life")) return "Local Life";
  if (text.includes("creator")) return "Creator";
  if (text.includes("booking") || text.includes("checkout")) return "Booking";
  return "Other";
}

function inferStatus(record: UnknownRecord): ReviewChangeStatus {
  const text = [
    record.status,
    record.action,
    record.actionType,
    record.title,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("remove") || text.includes("removed")) return "Removed";
  if (text.includes("save") || text.includes("saved")) return "Saved";
  if (text.includes("pending")) return "Pending";
  if (text.includes("update") || text.includes("changed") || text.includes("modified")) return "Updated";
  return "Applied";
}

function flattenChanges(payload: TiyaSmartPlannerReviewPayload): ReviewChangeItem[] {
  const history = payload.changeHistory || {};
  const changes: ReviewChangeItem[] = [];

  Object.entries(history).forEach(([key, entries]) => {
    if (!Array.isArray(entries)) return;

    entries.forEach((entry, index) => {
      const record = asRecord(entry);
      const category = inferCategory(key, record);
      const timestamp =
        textValue(record, ["appliedAt", "timestamp", "createdAt", "updatedAt", "savedAt"]) ||
        undefined;

      changes.push({
        affectedDay: textValue(record, ["affectedDay", "day", "dayLabel"]),
        affectedService: textValue(record, ["affectedService", "service", "serviceName"]),
        category,
        comfortImpact: numberValue(record, ["comfortImpact", "comfortGain"]),
        costImpact: numberValue(record, ["costImpact", "budgetImpact", "estimatedCostImpact"]),
        id: `${key}-${String(record.id || index)}-${timestamp || index}`,
        newValue: textValue(record, ["newValue", "to", "after"]),
        previousValue: textValue(record, ["previousValue", "from", "before"]),
        riskImpact: numberValue(record, ["riskImpact", "riskReduction"]),
        sourceModule: textValue(record, ["sourceModule", "source"]) || key,
        status: inferStatus(record),
        summary: textValue(record, ["summary", "reason", "description", "impact"]),
        timestamp,
        title: textValue(record, ["title", "action", "actionType"]) || key,
      });
    });
  });

  return changes.sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return bTime - aTime;
  });
}

function formatCurrency(value: number) {
  if (!value) return "Not available";
  const prefix = value > 0 ? "+" : "-";
  return `${prefix}₹${Math.abs(value).toLocaleString("en-IN")}`;
}

export default function ReviewChangeHistory({
  payload,
}: ReviewChangeHistoryProps) {
  const [activeFilter, setActiveFilter] = useState<"All" | ReviewChangeCategory>("All");
  const changes = useMemo(() => flattenChanges(payload), [payload]);
  const visibleChanges =
    activeFilter === "All"
      ? changes
      : changes.filter((change) => change.category === activeFilter);
  const totalCostImpact = changes.reduce((sum, change) => sum + Number(change.costImpact || 0), 0);
  const totalSavings = changes
    .filter((change) => Number(change.costImpact || 0) < 0)
    .reduce((sum, change) => sum + Math.abs(Number(change.costImpact || 0)), 0);
  const comfortImproved = changes.reduce(
    (sum, change) => sum + Math.max(0, Number(change.comfortImpact || 0)),
    0
  );
  const riskReduced = changes.reduce(
    (sum, change) => sum + Math.abs(Math.min(0, Number(change.riskImpact || 0))),
    0
  );
  const daysModified = new Set(changes.map((change) => change.affectedDay).filter(Boolean)).size;
  const bookingItemsChanged = changes.filter((change) => change.category === "Booking").length;
  const impactMetrics: Array<{ icon: LucideIcon; label: string; value: number | string }> = [
    { icon: BadgeIndianRupee, label: "Total Cost Impact", value: formatCurrency(totalCostImpact) },
    {
      icon: BadgeIndianRupee,
      label: "Total Savings",
      value: totalSavings ? formatCurrency(-totalSavings) : "Not available",
    },
    { icon: Gauge, label: "Comfort Improved", value: comfortImproved || "Not available" },
    { icon: ShieldAlert, label: "Risk Reduced", value: riskReduced || "Not available" },
    { icon: History, label: "Days Modified", value: daysModified || "Not available" },
    {
      icon: History,
      label: "Booking Items Changed",
      value: bookingItemsChanged || "Not available",
    },
  ];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Transparent Workspace Log
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            CHANGE HISTORY
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review all important changes made during Smart Planner workspace
            planning.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Read-only change log
        </div>
      </div>

      <div className="mt-6">
        <ReviewChangeSummaryCard changes={changes} />
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <div className="flex items-center gap-2">
          <History size={18} className="text-[#4f46e5]" />
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Change Category Filters
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                activeFilter === filter
                  ? "border-[#4f46e5] bg-[#4f46e5] text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#4f46e5]/40"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-6">
        {impactMetrics.map(({ icon: MetricIcon, label, value }) => {
          return (
            <article
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
            >
              <MetricIcon size={18} className="text-[#4f46e5]" />
              <p className="mt-3 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                {label}
              </p>
              <p className="mt-2 break-words text-2xl font-black text-slate-950">
                {value}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-6">
        <ReviewChangeTimeline changes={visibleChanges} />
      </div>
    </section>
  );
}

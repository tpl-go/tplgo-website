"use client";

import {
  AlertTriangle,
  BadgeIndianRupee,
  CalendarX,
  CloudSun,
  FileWarning,
  Luggage,
  Route,
  ShieldAlert,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import ReviewAuditAlertStrip from "./ReviewAuditAlertStrip";
import ReviewAuditCategoryCard from "./ReviewAuditCategoryCard";
import ReviewAuditScoreCard from "./ReviewAuditScoreCard";
import type {
  AuditIssueSeverity,
  ReviewAuditIssue,
} from "./ReviewAuditIssueCard";
import { severityClass } from "./ReviewAuditIssueCard";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewPlannerAuditCenterProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type UnknownRecord = Record<string, unknown>;
type PlannerAuditExtras = TiyaSmartPlannerReviewPayload["plannerAudit"] & {
  availabilityAlerts?: unknown[];
  bookingGaps?: unknown[];
  criticalIssues?: unknown[];
  documentationAlerts?: unknown[];
  longTransfers?: unknown[];
  missingItems?: unknown[];
  overBudgetAlerts?: unknown[];
  passedChecks?: unknown[];
  safetyComfortAlerts?: unknown[];
  travelRisks?: unknown[];
  warnings?: unknown[];
  weatherRisks?: unknown[];
};

const auditCategories = [
  { icon: Luggage, key: "Missing Items", title: "Missing Items" },
  { icon: ShieldAlert, key: "Travel Risks", title: "Travel Risks" },
  { icon: CloudSun, key: "Weather Risks", title: "Weather Risks" },
  { icon: TimerReset, key: "Long Transfers", title: "Long Transfers" },
  { icon: BadgeIndianRupee, key: "Over Budget Alerts", title: "Over Budget Alerts" },
  { icon: CalendarX, key: "Availability Alerts", title: "Availability Alerts" },
  { icon: FileWarning, key: "Booking Gaps", title: "Booking Gaps" },
  { icon: ShieldCheck, key: "Safety / Comfort Alerts", title: "Safety / Comfort Alerts" },
  { icon: Route, key: "Documentation Alerts", title: "Documentation Alerts" },
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function textValue(record: UnknownRecord, keys: string[]) {
  const value = keys.map((key) => record[key]).find((item) => typeof item === "string");
  return typeof value === "string" ? value : "";
}

function normalizeSeverity(value: unknown, fallback: AuditIssueSeverity): AuditIssueSeverity {
  const normalized = String(value || "").toLowerCase();
  if (normalized.includes("critical")) return "Critical";
  if (normalized.includes("warning")) return "Warning";
  if (normalized.includes("passed") || normalized.includes("clear")) return "Passed";
  if (normalized.includes("info")) return "Info";
  return fallback;
}

function issueFromUnknown(
  value: unknown,
  category: string,
  index: number,
  fallbackSeverity: AuditIssueSeverity,
  sourceModule: string
): ReviewAuditIssue {
  const record = asRecord(value);
  const severity = normalizeSeverity(record.severity || record.status, fallbackSeverity);
  const statusText = textValue(record, ["status"]);

  return {
    affectedDay: textValue(record, ["affectedDay", "day", "dayLabel"]),
    affectedService: textValue(record, ["affectedService", "service", "serviceName"]),
    category,
    city: textValue(record, ["city", "route", "location"]),
    id: `${category}-${String(record.id || index)}`,
    reason:
      textValue(record, ["reason", "summary", "description", "message"]) ||
      (typeof value === "string" ? value : undefined),
    severity,
    sourceModule: textValue(record, ["sourceModule", "source"]) || sourceModule,
    status:
      statusText.toLowerCase().includes("resolved")
        ? "Resolved"
        : statusText.toLowerCase().includes("ignored")
          ? "Ignored"
          : severity === "Passed"
            ? "Passed"
            : "Open",
    suggestedFix: textValue(record, ["suggestedFix", "fix", "recommendedFix"]),
    title:
      textValue(record, ["title", "label"]) ||
      (typeof value === "string" ? value : category),
  };
}

function auditExtras(payload: TiyaSmartPlannerReviewPayload): PlannerAuditExtras {
  return (payload.plannerAudit || {}) as PlannerAuditExtras;
}

function buildIssues(payload: TiyaSmartPlannerReviewPayload) {
  const audit = auditExtras(payload);
  const issues: ReviewAuditIssue[] = [];
  const mappings: Array<{
    category: string;
    fallbackSeverity: AuditIssueSeverity;
    items: unknown[];
    sourceModule: string;
  }> = [
    { category: "Missing Items", fallbackSeverity: "Warning", items: safeArray(audit.missingItems), sourceModule: "Booking Readiness" },
    { category: "Travel Risks", fallbackSeverity: "Critical", items: safeArray(audit.travelRisks), sourceModule: "Route Risk Analysis" },
    { category: "Weather Risks", fallbackSeverity: "Warning", items: safeArray(audit.weatherRisks), sourceModule: "Weather Intelligence" },
    { category: "Long Transfers", fallbackSeverity: "Warning", items: safeArray(audit.longTransfers), sourceModule: "Route Risk Analysis" },
    { category: "Over Budget Alerts", fallbackSeverity: "Warning", items: safeArray(audit.overBudgetAlerts), sourceModule: "Budget Overview" },
    { category: "Availability Alerts", fallbackSeverity: "Warning", items: safeArray(audit.availabilityAlerts), sourceModule: "Booking Readiness" },
    { category: "Booking Gaps", fallbackSeverity: "Critical", items: safeArray(audit.bookingGaps), sourceModule: "Checkout Readiness" },
    { category: "Safety / Comfort Alerts", fallbackSeverity: "Warning", items: safeArray(audit.safetyComfortAlerts), sourceModule: "Smart Recommendations" },
    { category: "Documentation Alerts", fallbackSeverity: "Warning", items: safeArray(audit.documentationAlerts), sourceModule: "Checkout Readiness" },
  ];

  mappings.forEach((mapping) => {
    mapping.items.forEach((item, index) => {
      issues.push(
        issueFromUnknown(
          item,
          mapping.category,
          index,
          mapping.fallbackSeverity,
          mapping.sourceModule
        )
      );
    });
  });

  if (!payload.route?.name && !payload.route?.activeRouteId) {
    issues.push({
      category: "Missing Items",
      id: "safe-route-missing",
      reason: "Selected route information was not found in the review payload.",
      severity: "Critical",
      sourceModule: "Workspace",
      status: "Open",
      suggestedFix: "Return to Workspace and select a route.",
      title: "Route not selected",
    });
  }
  if (!safeArray(payload.itinerary).length) {
    issues.push({
      category: "Missing Items",
      id: "safe-itinerary-missing",
      reason: "No day-wise itinerary was found in the review payload.",
      severity: "Critical",
      sourceModule: "Workspace",
      status: "Open",
      suggestedFix: "Build itinerary before review.",
      title: "Itinerary missing",
    });
  }
  if (!safeArray(payload.selectedBasketItems).length) {
    issues.push({
      category: "Booking Gaps",
      id: "safe-basket-missing",
      reason: "No booking items are selected in the basket.",
      severity: "Critical",
      sourceModule: "Booking Readiness",
      status: "Open",
      suggestedFix: "Add at least one service to booking.",
      title: "No booking items selected",
    });
  }
  if (!payload.travellers?.total) {
    issues.push({
      category: "Documentation Alerts",
      id: "safe-traveller-count-missing",
      reason: "Traveller count is not available in the review payload.",
      severity: "Warning",
      sourceModule: "Checkout Readiness",
      status: "Open",
      suggestedFix: "Complete traveller details.",
      title: "Traveller details missing",
    });
  }
  if (!payload.budgetEstimate?.totalEstimatedCost && !payload.quoteEstimate?.estimatedTotal) {
    issues.push({
      category: "Over Budget Alerts",
      id: "safe-budget-missing",
      reason: "Budget or quote estimate is not available.",
      severity: "Warning",
      sourceModule: "Budget Overview",
      status: "Open",
      suggestedFix: "Review budget in Workspace.",
      title: "Quote not available",
    });
  }

  return issues;
}

function passedChecks(payload: TiyaSmartPlannerReviewPayload): ReviewAuditIssue[] {
  const checks = [
    {
      passed: Boolean(payload.route?.name || payload.route?.activeRouteId),
      title: "Route selected",
    },
    {
      passed: safeArray(payload.itinerary).length > 0,
      title: "At least one itinerary day available",
    },
    {
      passed: safeArray(payload.selectedBasketItems).length > 0,
      title: "Basket prepared",
    },
    {
      passed: Boolean(payload.travellers?.total),
      title: "Traveller count available",
    },
    {
      passed: Boolean(payload.budgetEstimate?.totalEstimatedCost || payload.quoteEstimate?.estimatedTotal),
      title: "Budget estimate available",
    },
    {
      passed: Boolean(payload.changeHistory && Object.keys(payload.changeHistory).length),
      title: "Change history available",
    },
  ];

  return checks.map((check, index) => ({
    category: "Passed Checks",
    id: `passed-${index}`,
    reason: check.passed ? "Payload check passed." : "Payload check is pending.",
    severity: check.passed ? "Passed" : "Info",
    sourceModule: "Workspace",
    status: check.passed ? "Passed" : "Open",
    title: check.title,
  }));
}

function statusFromIssue(issue: ReviewAuditIssue) {
  if (issue.severity === "Critical") return "Critical";
  if (issue.severity === "Warning") return "Warning";
  if (issue.severity === "Passed") return "Clear";
  return "Pending";
}

export default function ReviewPlannerAuditCenter({
  payload,
}: ReviewPlannerAuditCenterProps) {
  const issues = buildIssues(payload);
  const checks = passedChecks(payload);
  const allAuditItems = [...issues, ...checks];
  const critical = issues.filter((issue) => issue.severity === "Critical").length;
  const warnings = issues.filter((issue) => issue.severity === "Warning").length;
  const passed = checks.filter((issue) => issue.severity === "Passed").length;
  const pending = allAuditItems.filter((issue) => issue.status === "Open" && issue.severity !== "Critical" && issue.severity !== "Warning").length;
  const score =
    payload.plannerAudit?.healthScore ||
    Math.max(0, Math.min(100, 92 - critical * 18 - warnings * 7 + passed * 2));
  const status =
    critical > 0
      ? "Needs Critical Review"
      : warnings > 0
        ? "Ready With Minor Warnings"
        : "Safe to Proceed";
  const bookingBlockers = issues.filter((issue) => issue.severity === "Critical");
  const warningCenter = issues.filter((issue) => issue.severity === "Warning");

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Final Validation Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            PLANNER AUDIT CENTER
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review missing items, travel risks, weather risks, transfer
            warnings, budget alerts and booking gaps before proceeding.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Read-only planner audit
        </div>
      </div>

      <div className="mt-6">
        <ReviewAuditAlertStrip criticalCount={critical} />
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-10">
        {[
          ["Missing Items", "Missing Items"],
          ["Travel Risks", "Travel Risks"],
          ["Weather Risks", "Weather Risks"],
          ["Long Transfers", "Long Transfers"],
          ["Over Budget Alerts", "Over Budget Alerts"],
          ["Availability Alerts", "Availability Alerts"],
          ["Booking Gaps", "Booking Gaps"],
          ["Critical Issues", "Critical"],
          ["Warnings", "Warning"],
          ["Passed Checks", "Passed"],
        ].map(([label, match]) => {
          const count =
            match === "Critical" || match === "Warning" || match === "Passed"
              ? allAuditItems.filter((item) => item.severity === match).length
              : issues.filter((item) => item.category === match).length;
          const severity: AuditIssueSeverity =
            match === "Critical" && count > 0
              ? "Critical"
              : match === "Warning" && count > 0
                ? "Warning"
                : match === "Passed"
                  ? "Passed"
                  : count > 0
                    ? "Warning"
                    : "Passed";
          return (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                {label}
              </p>
              <p className="mt-3 text-3xl font-black text-slate-950">{count}</p>
              <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${severityClass(severity)}`}>
                {count ? statusFromIssue({ severity, status: "Open", category: "", id: "", sourceModule: "", title: "" } as ReviewAuditIssue) : "Clear"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          {auditCategories.map((category) => (
            <ReviewAuditCategoryCard
              key={category.key}
              category={category}
              issues={issues.filter((issue) => issue.category === category.key)}
            />
          ))}

          <div className="grid gap-5 lg:grid-cols-2">
            <ReviewAuditCategoryCard
              category={{ icon: AlertTriangle, title: "Booking Blockers" }}
              issues={bookingBlockers}
            />
            <ReviewAuditCategoryCard
              category={{ icon: ShieldAlert, title: "Warning Center" }}
              issues={warningCenter}
            />
          </div>

          <ReviewAuditCategoryCard
            category={{ icon: ShieldCheck, title: "Passed Checks" }}
            issues={checks}
          />
        </div>

        <aside className="self-start">
          <ReviewAuditScoreCard
            critical={critical}
            passed={passed}
            pending={pending}
            score={score}
            status={status}
            warnings={warnings}
          />
        </aside>
      </div>
    </section>
  );
}

"use client";

import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type AuditIssueSeverity = "Critical" | "Warning" | "Info" | "Passed";
export type AuditIssueStatus = "Open" | "Resolved" | "Ignored" | "Passed";

export type ReviewAuditIssue = {
  affectedDay?: string;
  affectedService?: string;
  category: string;
  city?: string;
  id: string;
  reason?: string;
  severity: AuditIssueSeverity;
  sourceModule: string;
  status: AuditIssueStatus;
  suggestedFix?: string;
  title: string;
};

type ReviewAuditIssueCardProps = {
  issue: ReviewAuditIssue;
};

export function severityClass(severity: AuditIssueSeverity) {
  return getReviewStatusVisual(severity).badgeClass;
}

const severityIcons = {
  Critical: ShieldAlert,
  Info,
  Passed: CheckCircle2,
  Warning: AlertTriangle,
} satisfies Record<AuditIssueSeverity, typeof AlertTriangle>;

export default function ReviewAuditIssueCard({
  issue,
}: ReviewAuditIssueCardProps) {
  const Icon = severityIcons[issue.severity];
  const severityVisual = getReviewStatusVisual(issue.severity);
  const statusVisual = getReviewStatusVisual(issue.status);

  return (
    <article className={`rounded-3xl border border-slate-200 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${severityVisual.cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${severityClass(issue.severity)}`}>
              <Icon size={13} />
              {issue.severity}
            </span>
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusVisual.badgeClass}`}>
              {issue.status}
            </span>
          </div>
          <h4 className="mt-3 break-words text-lg font-black text-slate-950">
            {issue.title}
          </h4>
          <p className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            {issue.category} · {issue.sourceModule}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        {[
          ["Affected Day", issue.affectedDay || "Not specified"],
          ["Affected Service", issue.affectedService || "Not specified"],
          ["Route / City", issue.city || "Not specified"],
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

      {issue.reason ? (
        <p className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">
          {issue.reason}
        </p>
      ) : null}

      {issue.suggestedFix ? (
        <p className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-black leading-6 text-blue-700">
          Suggested fix: {issue.suggestedFix}
        </p>
      ) : null}
    </article>
  );
}

"use client";

import type { LucideIcon } from "lucide-react";

import ReviewAuditIssueCard from "./ReviewAuditIssueCard";
import type { ReviewAuditIssue } from "./ReviewAuditIssueCard";

type ReviewAuditCategoryCardProps = {
  category: {
    icon: LucideIcon;
    title: string;
  };
  issues: ReviewAuditIssue[];
};

export default function ReviewAuditCategoryCard({
  category,
  issues,
}: ReviewAuditCategoryCardProps) {
  const Icon = category.icon;

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Audit Category
          </p>
          <h3 className="mt-2 text-xl font-black text-slate-950">{category.title}</h3>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
          <Icon size={20} />
        </span>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {issues.length ? (
          issues.map((issue) => (
            <ReviewAuditIssueCard key={issue.id} issue={issue} />
          ))
        ) : (
          <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-5 text-sm font-black text-slate-500">
            No issues detected.
          </p>
        )}
      </div>
    </article>
  );
}

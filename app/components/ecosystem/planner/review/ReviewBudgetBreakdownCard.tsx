"use client";

import type { LucideIcon } from "lucide-react";
import { BadgeIndianRupee } from "lucide-react";

export type BudgetBreakdownStatus = "High" | "Balanced" | "Good" | "Missing";

export type BudgetBreakdownItem = {
  amount: number;
  icon: LucideIcon;
  label: string;
  percentage: number;
  status: BudgetBreakdownStatus;
};

type ReviewBudgetBreakdownCardProps = {
  items: BudgetBreakdownItem[];
  total: number;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function statusClass(status: BudgetBreakdownStatus) {
  if (status === "High") return "bg-orange-50 text-orange-700 border-orange-200";
  if (status === "Balanced") return "bg-blue-50 text-blue-700 border-blue-200";
  if (status === "Good") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-500 border-slate-200";
}

export default function ReviewBudgetBreakdownCard({
  items,
  total,
}: ReviewBudgetBreakdownCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Budget Breakdown
          </p>
          <h3 className="mt-2 text-2xl font-black text-slate-950">
            Category-wise Cost View
          </h3>
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-700">
          <BadgeIndianRupee size={22} />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#4f46e5]">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-950">{item.label}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-950">
                    {item.percentage}%
                  </p>
                  <span className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2563eb] via-[#7c3aed] to-[#f97316]"
                  style={{
                    width: `${Math.min(100, Math.max(0, total ? item.percentage : 0))}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}

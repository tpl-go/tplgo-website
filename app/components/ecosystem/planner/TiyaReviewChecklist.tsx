"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import type { TiyaReviewChecklistItem } from "@/app/lib/ecosystem/planner/plannerReviewEngine";

type TiyaReviewChecklistProps = {
  items: TiyaReviewChecklistItem[];
};

export default function TiyaReviewChecklist({ items }: TiyaReviewChecklistProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        Review checklist
      </div>
      <div className="mt-3 grid gap-2">
        {safeItems.map((item) => {
          const Icon = item.checked ? CheckCircle2 : CircleAlert;

          return (
            <article
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/10 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-2">
                  <Icon
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      item.checked ? "text-emerald-100" : "text-orange-100"
                    }`}
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/60">
                      {item.detail}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${
                    item.checked
                      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                      : "border-orange-300/20 bg-orange-400/10 text-orange-100"
                  }`}
                >
                  {item.checked ? "Checked" : "Review"}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

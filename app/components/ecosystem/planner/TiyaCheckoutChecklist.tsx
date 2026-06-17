"use client";

import { AlertCircle, CheckCircle2, CircleDashed } from "lucide-react";
import type { TiyaCheckoutChecklistItem } from "@/app/lib/ecosystem/planner/plannerCheckoutBridge";

type TiyaCheckoutChecklistProps = {
  items: TiyaCheckoutChecklistItem[];
};

const statusStyle: Record<TiyaCheckoutChecklistItem["status"], string> = {
  Ready: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
  Warning: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  Required: "border-orange-300/20 bg-orange-400/10 text-orange-100",
  Optional: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
  "Not started": "border-white/10 bg-white/10 text-white/60",
};

const statusIcon: Record<TiyaCheckoutChecklistItem["status"], typeof CheckCircle2> = {
  Ready: CheckCircle2,
  Warning: AlertCircle,
  Required: AlertCircle,
  Optional: CircleDashed,
  "Not started": CircleDashed,
};

export default function TiyaCheckoutChecklist({
  items,
}: TiyaCheckoutChecklistProps) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        Checkout readiness checklist
      </div>
      <div className="mt-3 grid gap-2">
        {safeItems.map((item) => {
          const Icon = statusIcon[item.status];

          return (
            <article
              key={item.id}
              className="rounded-2xl border border-white/10 bg-white/10 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-2">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-100" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-white">
                      {item.label}
                    </h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/65">
                      {item.detail}
                    </p>
                  </div>
                </div>
                <span
                  className={`w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${statusStyle[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

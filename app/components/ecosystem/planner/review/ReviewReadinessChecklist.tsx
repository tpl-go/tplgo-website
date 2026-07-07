"use client";

import { CheckCircle2, CircleAlert, Info, XCircle } from "lucide-react";

import type { ReadinessStatus } from "./ReviewReadinessServiceCard";
import { readinessStatusClass } from "./ReviewReadinessServiceCard";

export type ReadinessChecklistItem = {
  label: string;
  status: "Passed" | "Warning" | "Missing" | "Optional";
};

type ReviewReadinessChecklistProps = {
  items: ReadinessChecklistItem[];
};

function mapStatus(status: ReadinessChecklistItem["status"]): ReadinessStatus {
  if (status === "Passed") return "Ready";
  if (status === "Warning") return "Pending";
  if (status === "Missing") return "Missing";
  return "Optional";
}

function IconForStatus({ status }: { status: ReadinessChecklistItem["status"] }) {
  if (status === "Passed") return <CheckCircle2 size={15} />;
  if (status === "Missing") return <XCircle size={15} />;
  if (status === "Warning") return <CircleAlert size={15} />;
  return <Info size={15} />;
}

export default function ReviewReadinessChecklist({
  items,
}: ReviewReadinessChecklistProps) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        Readiness Checklist
      </p>
      <div className="mt-4 grid gap-2 xl:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <span className="text-sm font-black text-slate-700">{item.label}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${readinessStatusClass(mapStatus(item.status))}`}>
              <IconForStatus status={item.status} />
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

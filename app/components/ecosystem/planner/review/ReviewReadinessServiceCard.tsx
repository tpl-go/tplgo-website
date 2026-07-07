"use client";

import type { LucideIcon } from "lucide-react";
import { PackageCheck } from "lucide-react";
import { getReviewStatusVisual } from "./reviewStatusStyles";

export type ReadinessStatus =
  | "Ready"
  | "Pending"
  | "Optional"
  | "Missing"
  | "Not Required";

export type ReviewReadinessService = {
  basketCount: number;
  icon: LucideIcon;
  reason: string;
  selectedCount: number;
  serviceName: string;
  status: ReadinessStatus;
};

type ReviewReadinessServiceCardProps = {
  service: ReviewReadinessService;
};

export function readinessStatusClass(status: ReadinessStatus) {
  return getReviewStatusVisual(status).badgeClass;
}

export default function ReviewReadinessServiceCard({
  service,
}: ReviewReadinessServiceCardProps) {
  const Icon = service.icon || PackageCheck;
  const statusVisual = getReviewStatusVisual(service.status);

  return (
    <article className={`rounded-3xl border border-slate-200 p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)] ${statusVisual.cardClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-slate-950">
            {service.serviceName}
          </p>
          <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${readinessStatusClass(service.status)}`}>
            {service.status}
          </span>
        </div>
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-current/10 bg-white/70 ${statusVisual.iconClass}`}>
          <Icon size={20} />
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs">
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="font-bold text-slate-500">Selected Items</span>
          <span className="font-black text-slate-950">{service.selectedCount}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
          <span className="font-bold text-slate-500">Basket Items</span>
          <span className="font-black text-slate-950">{service.basketCount}</span>
        </div>
      </div>

      <p className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold leading-5 text-slate-600">
        {service.reason}
      </p>
    </article>
  );
}

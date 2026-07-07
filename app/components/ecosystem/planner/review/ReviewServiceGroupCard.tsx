"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import ReviewServiceItemCard, {
  type ReviewServiceGroup,
} from "./ReviewServiceItemCard";

type ReviewServiceGroupCardProps = {
  group: ReviewServiceGroup;
};

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "₹0";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function readinessClass(status: ReviewServiceGroup["readiness"]) {
  if (status === "Ready") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "Optional") return "border-blue-200 bg-blue-50 text-blue-700";
  if (status === "Missing") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

export default function ReviewServiceGroupCard({
  group,
}: ReviewServiceGroupCardProps) {
  const [open, setOpen] = useState(group.items.length > 0);
  const Icon = group.icon;

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-5 p-5 text-left transition hover:bg-slate-50"
      >
        <div className="flex min-w-0 gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#4f46e5]/10 bg-[#eef2ff] text-[#4f46e5]">
            <Icon size={22} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-xl font-black text-slate-950">
                {group.name}
              </h3>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-black ${readinessClass(group.readiness)}`}
              >
                {group.readiness}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              {group.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                {group.items.length} selected
              </span>
              <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                {group.selectedBasketCount} added to basket
              </span>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {formatCurrency(group.value)}
              </span>
            </div>
          </div>
        </div>

        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {open ? (
        <div className="border-t border-slate-100 bg-slate-50/70 p-4">
          {group.items.length ? (
            <div className="grid gap-3">
              {group.items.map((item) => (
                <ReviewServiceItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-black text-slate-500">
              Not selected yet
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}

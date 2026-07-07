"use client";

import { ShieldCheck, Sparkles } from "lucide-react";

type RecordValue = Record<string, unknown>;

type PlannerPaymentAddOnsCardProps = {
  addOnData?: RecordValue | null;
  selectedBasketItems?: RecordValue[];
};

function safeArray(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value.filter((item): item is RecordValue => typeof item === "object" && item !== null)
    : [];
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function isAddOnLike(item: RecordValue) {
  const raw = [
    item.serviceType,
    item.type,
    item.category,
    item.title,
    item.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /\binsurance\b|\bvisa\b|\baddon\b|\badd-on\b|\bprotection\b|\bassistance\b/.test(
    raw
  );
}

export default function PlannerPaymentAddOnsCard({
  addOnData,
  selectedBasketItems = [],
}: PlannerPaymentAddOnsCardProps) {
  const plannerAddOns = [
    ...safeArray(addOnData?.plannerAddOns),
    ...safeArray(addOnData?.selectedAddons),
    ...safeArray(addOnData?.selectedInsurance),
    ...selectedBasketItems.filter(isAddOnLike),
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d9e2ec] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e5e7eb] px-5 py-[18px]">
        <div>
          <div className="flex items-center gap-2 text-[16px] font-extrabold text-[#111827]">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            Planner Add-ons
          </div>
          <div className="mt-1 text-[13px] text-[#6b7280]">
            Add-ons are shown only when they are present in the Smart Planner basket.
          </div>
        </div>

        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[12px] font-extrabold text-slate-700">
          {plannerAddOns.length} selected
        </span>
      </div>

      <div className="px-5 py-4">
        {plannerAddOns.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {plannerAddOns.map((item, index) => (
              <div
                key={`${text(item.title) || text(item.name) || "planner-addon"}-${index}`}
                className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-wide text-emerald-700">
                  <Sparkles className="h-4 w-4" />
                  Planner Add-on
                </div>
                <div className="mt-1 break-words text-[14px] font-black text-slate-900">
                  {text(item.title) || text(item.name) || "Selected planner add-on"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-[14px] font-bold text-slate-600">
            No planner add-ons selected.
          </div>
        )}
      </div>
    </section>
  );
}

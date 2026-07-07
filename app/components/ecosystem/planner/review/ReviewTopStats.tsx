"use client";

import {
  BadgeIndianRupee,
  BriefcaseBusiness,
  CalendarCheck2,
  ShieldCheck,
} from "lucide-react";

import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaDayPlan } from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewTopStatsProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

function formatCurrency(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function isFinalizedDay(day: TiyaDayPlan) {
  const dayStatus = day as TiyaDayPlan & {
    finalized?: boolean;
    isFinalized?: boolean;
    status?: string;
  };

  return Boolean(
    dayStatus.finalized ||
      dayStatus.isFinalized ||
      dayStatus.status?.toLowerCase() === "finalized"
  );
}

function StatCard({
  accent,
  detail,
  icon: Icon,
  label,
  value,
}: {
  accent: string;
  detail: string;
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-black tracking-normal text-slate-950">
            {value}
          </p>
        </div>
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}
        >
          <Icon size={22} />
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-slate-500">
        {detail}
      </p>
    </article>
  );
}

export default function ReviewTopStats({ payload }: ReviewTopStatsProps) {
  const basketItems = Array.isArray(payload.selectedBasketItems)
    ? payload.selectedBasketItems
    : [];
  const itinerary = Array.isArray(payload.itinerary) ? payload.itinerary : [];
  const estimatedValue =
    payload.quoteEstimate?.estimatedTotal ||
    payload.quoteEstimate?.totalQuoteEstimate ||
    payload.budgetEstimate?.totalEstimatedCost ||
    basketItems.reduce(
      (sum, item) =>
        sum + Number(item.estimatedTotal || item.estimatedPrice || item.price || 0),
      0
    );
  const readinessScore =
    payload.plannerAudit?.readinessScore ||
    payload.readinessStatus?.selectedItemsCount ||
    0;
  const finalizedDays = itinerary.filter(isFinalizedDay).length;

  return (
    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        accent="bg-emerald-50 text-emerald-600"
        detail="Pulled from the current Smart Planner review payload."
        icon={ShieldCheck}
        label="Booking Readiness"
        value={`${readinessScore}%`}
      />
      <StatCard
        accent="bg-blue-50 text-blue-600"
        detail="Selected services/items from the Workspace booking basket."
        icon={BriefcaseBusiness}
        label="Basket Items"
        value={`${basketItems.length}`}
      />
      <StatCard
        accent="bg-orange-50 text-orange-600"
        detail="Estimated from the Workspace quote and selected basket."
        icon={BadgeIndianRupee}
        label="Estimated Trip Value"
        value={formatCurrency(estimatedValue)}
      />
      <StatCard
        accent="bg-violet-50 text-violet-600"
        detail={`${itinerary.length || 0} itinerary day${
          itinerary.length === 1 ? "" : "s"
        } available in review.`}
        icon={CalendarCheck2}
        label="Finalized Days"
        value={`${finalizedDays}/${itinerary.length || 0}`}
      />
    </section>
  );
}

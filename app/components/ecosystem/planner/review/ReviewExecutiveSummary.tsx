"use client";

import {
  BadgeIndianRupee,
  BedDouble,
  BriefcaseBusiness,
  Bus,
  CalendarDays,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaDayPlan } from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewExecutiveSummaryProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type SummaryTone = "blue" | "cyan" | "emerald" | "orange" | "purple";

const toneClasses: Record<SummaryTone, string> = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  purple: "bg-violet-50 text-violet-700 border-violet-100",
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value))) return "₹0";
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function isFinalizedDay(day: TiyaDayPlan) {
  const status = day as TiyaDayPlan & {
    finalized?: boolean;
    isFinalized?: boolean;
    status?: string;
  };

  return Boolean(
    status.finalized ||
      status.isFinalized ||
      status.status?.toLowerCase() === "finalized"
  );
}

function basketValue(items: WorkspaceBookingBasketItem[]) {
  return items.reduce(
    (sum, item) =>
      sum + Number(item.estimatedTotal || item.estimatedPrice || item.price || 0),
    0
  );
}

function countByServiceType(items: WorkspaceBookingBasketItem[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const key = item.serviceType || "service";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function SummaryCard({
  detail,
  icon: Icon,
  label,
  metric,
  secondary,
  tone = "blue",
}: {
  detail: Array<{ label: string; value: string | number }>;
  icon: typeof CalendarDays;
  label: string;
  metric: string | number;
  secondary?: string;
  tone?: SummaryTone;
}) {
  return (
    <article className="min-w-0 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 break-words text-4xl font-black tracking-normal text-slate-950">
            {metric}
          </p>
          {secondary ? (
            <p className="mt-1 break-words text-sm font-bold text-slate-500">
              {secondary}
            </p>
          ) : null}
        </div>
        <span
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}
        >
          <Icon size={22} />
        </span>
      </div>

      <div className="mt-5 grid gap-2">
        {detail.map((item) => (
          <div
            key={item.label}
            className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
          >
            <span className="min-w-0 break-words text-xs font-bold text-slate-500">
              {item.label}
            </span>
            <span className="shrink-0 text-sm font-black text-slate-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function ReviewExecutiveSummary({
  payload,
}: ReviewExecutiveSummaryProps) {
  const itinerary = safeArray(payload.itinerary);
  const basketItems = safeArray(payload.selectedBasketItems);
  const serviceTypeCounts = countByServiceType(basketItems);
  const finalizedDays = itinerary.filter(isFinalizedDay).length;
  const pendingDays = Math.max(0, itinerary.length - finalizedDays);
  const routeStops = [
    payload.trip?.origin,
    ...itinerary.map((day) => day.city),
    payload.trip?.destination,
  ].filter(Boolean);
  const uniqueDestinations = Array.from(new Set(routeStops.map(String)));
  const selectedLocalLifeItems = [
    ...safeArray(payload.selectedLocalLifeItems),
    ...safeArray(payload.selectedLocalMarketItems),
  ];
  const selectedBasketValue = basketValue(basketItems);
  const budgetEstimate =
    payload.budgetEstimate?.totalEstimatedCost ||
    payload.quoteEstimate?.totalQuoteEstimate ||
    0;
  const quoteEstimate =
    payload.quoteEstimate?.estimatedTotal ||
    payload.quoteEstimate?.totalQuoteEstimate ||
    0;
  const readinessScore =
    payload.plannerAudit?.readinessScore ||
    payload.readinessStatus?.selectedItemsCount ||
    0;
  const changes = payload.changeHistory
    ? Object.values(payload.changeHistory).flat()
    : [];
  const warningCount = changes.filter((change) =>
    `${change.title} ${change.summary || ""}`.toLowerCase().includes("warning")
  ).length;
  const missingItemsCount = [
    basketItems.length > 0,
    itinerary.length > 0,
    Boolean(payload.route?.name || payload.trip?.origin),
    Boolean(quoteEstimate || budgetEstimate),
  ].filter((ready) => !ready).length;
  const nights = basketItems.reduce(
    (sum, item) => sum + Number(item.nights || 0),
    0
  );
  const transportCount =
    (serviceTypeCounts.flight || 0) +
    (serviceTypeCounts.cab || 0) +
    safeArray(payload.selectedTransfers).length;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Executive Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            Executive Trip Summary
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            A complete snapshot of your route, days, services, basket and
            readiness.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Payload read-only review
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          detail={[
            { label: "Finalized days", value: finalizedDays },
            { label: "Pending days", value: pendingDays },
          ]}
          icon={CalendarDays}
          label="Trip Days"
          metric={itinerary.length}
          secondary="Workspace itinerary"
          tone="blue"
        />
        <SummaryCard
          detail={[
            { label: "Total destinations", value: uniqueDestinations.length },
            { label: "Route stops", value: routeStops.length },
          ]}
          icon={MapPinned}
          label="Cities / Destinations"
          metric={uniqueDestinations.length}
          secondary={uniqueDestinations.slice(0, 3).join(" -> ") || "Not available"}
          tone="purple"
        />
        <SummaryCard
          detail={[
            { label: "Flight / transport", value: serviceTypeCounts.flight || 0 },
            { label: "Cab / transfer", value: serviceTypeCounts.cab || 0 },
            { label: "Stay", value: serviceTypeCounts.hotel || 0 },
            { label: "Activity", value: serviceTypeCounts.activity || 0 },
          ]}
          icon={BriefcaseBusiness}
          label="Basket Items"
          metric={basketItems.length}
          secondary="Selected booking basket"
          tone="cyan"
        />
        <SummaryCard
          detail={[
            { label: "Flights / trains / bus", value: serviceTypeCounts.flight || 0 },
            { label: "Cabs", value: safeArray(payload.selectedCabs).length + (serviceTypeCounts.cab || 0) },
            { label: "Transfers", value: safeArray(payload.selectedTransfers).length },
          ]}
          icon={Plane}
          label="Transport"
          metric={transportCount}
          secondary={payload.route?.transportMode || payload.preferences?.transportMode || "Not available"}
          tone="orange"
        />
        <SummaryCard
          detail={[
            { label: "Hotels", value: safeArray(payload.selectedHotels).length },
            { label: "Homestays", value: safeArray(payload.selectedHomestays).length },
            { label: "Nights", value: nights || "Not available" },
          ]}
          icon={BedDouble}
          label="Stays"
          metric={
            safeArray(payload.selectedHotels).length +
            safeArray(payload.selectedHomestays).length +
            (serviceTypeCounts.hotel || 0)
          }
          secondary={payload.preferences?.stayPreference || "Stay preference pending"}
          tone="emerald"
        />
        <SummaryCard
          detail={[
            { label: "Activities", value: safeArray(payload.selectedActivities).length },
            { label: "Local Life", value: selectedLocalLifeItems.length },
            { label: "Creator spots", value: safeArray(payload.selectedCreatorSpots).length },
          ]}
          icon={Sparkles}
          label="Activities"
          metric={
            safeArray(payload.selectedActivities).length +
            selectedLocalLifeItems.length +
            safeArray(payload.selectedCreatorSpots).length
          }
          secondary="Experiences and add-ons"
          tone="purple"
        />
        <SummaryCard
          detail={[
            { label: "Insurance", value: safeArray(payload.selectedInsurance).length },
            { label: "Visa", value: "Not available" },
          ]}
          icon={ShieldCheck}
          label="Insurance / Visa"
          metric={safeArray(payload.selectedInsurance).length}
          secondary="Optional protection layer"
          tone="blue"
        />
        <SummaryCard
          detail={[
            { label: "Budget estimate", value: formatCurrency(budgetEstimate) },
            { label: "Quote estimate", value: formatCurrency(quoteEstimate) },
            { label: "Basket value", value: formatCurrency(selectedBasketValue) },
          ]}
          icon={BadgeIndianRupee}
          label="Budget Snapshot"
          metric={formatCurrency(quoteEstimate || budgetEstimate || selectedBasketValue)}
          secondary="Payload financial summary"
          tone="orange"
        />
        <SummaryCard
          detail={[
            { label: "Readiness", value: `${readinessScore}%` },
            { label: "Missing items", value: missingItemsCount },
            { label: "Warnings", value: warningCount },
          ]}
          icon={Bus}
          label="Booking Readiness"
          metric={`${readinessScore}%`}
          secondary={payload.plannerAudit?.finalVerdict || "Review required"}
          tone="emerald"
        />
      </div>
    </section>
  );
}

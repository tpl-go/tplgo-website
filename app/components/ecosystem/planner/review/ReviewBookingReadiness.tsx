"use client";

import {
  BedDouble,
  Bus,
  Car,
  FileCheck2,
  IdCard,
  Mountain,
  Plane,
  Sailboat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stamp,
  Train,
} from "lucide-react";

import ReviewReadinessBlockers from "./ReviewReadinessBlockers";
import ReviewReadinessChecklist from "./ReviewReadinessChecklist";
import ReviewReadinessScoreCard from "./ReviewReadinessScoreCard";
import ReviewReadinessServiceCard from "./ReviewReadinessServiceCard";
import type { ReadinessChecklistItem } from "./ReviewReadinessChecklist";
import type {
  ReadinessStatus,
  ReviewReadinessService,
} from "./ReviewReadinessServiceCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewBookingReadinessProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type PayloadWithReadinessExtras = TiyaSmartPlannerReviewPayload & {
  selectedVisa?: unknown[];
  emergencyContact?: unknown;
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function basketCountBy(itemList: WorkspaceBookingBasketItem[], aliases: string[]) {
  return itemList.filter((item) => {
    const text = normalizeText(
      [item.serviceType, item.serviceName, item.serviceLabel, item.category, item.title].join(" ")
    );
    return aliases.some((alias) => text.includes(alias));
  }).length;
}

function serviceStatus(
  selectedCount: number,
  basketCount: number,
  optional = false
): ReadinessStatus {
  if (basketCount > 0) return "Ready";
  if (selectedCount > 0) return "Pending";
  return optional ? "Optional" : "Missing";
}

function serviceCards(payload: TiyaSmartPlannerReviewPayload): ReviewReadinessService[] {
  const basket = safeArray(payload.selectedBasketItems);

  return [
    {
      basketCount: basketCountBy(basket, ["flight", "air"]),
      icon: Plane,
      reason: "Flight readiness is based on selected basket transport signals.",
      selectedCount: basketCountBy(basket, ["flight", "air"]),
      serviceName: "Flights Ready",
      status: serviceStatus(basketCountBy(basket, ["flight", "air"]), basketCountBy(basket, ["flight", "air"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["hotel", "stay"]),
      icon: BedDouble,
      reason: "Hotel readiness uses selected hotel and basket stay data.",
      selectedCount: safeArray(payload.selectedHotels).length,
      serviceName: "Hotels Ready",
      status: serviceStatus(safeArray(payload.selectedHotels).length, basketCountBy(basket, ["hotel", "stay"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["homestay", "home stay"]),
      icon: Mountain,
      reason: "Homestays are optional unless selected in the basket.",
      selectedCount: safeArray(payload.selectedHomestays).length,
      serviceName: "Homestays Ready",
      status: serviceStatus(safeArray(payload.selectedHomestays).length, basketCountBy(basket, ["homestay", "home stay"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["cab", "transfer", "taxi"]),
      icon: Car,
      reason: "Cab and transfer readiness uses selected transfers and cabs.",
      selectedCount: safeArray(payload.selectedCabs).length + safeArray(payload.selectedTransfers).length,
      serviceName: "Cab / Transfers Ready",
      status: serviceStatus(safeArray(payload.selectedCabs).length + safeArray(payload.selectedTransfers).length, basketCountBy(basket, ["cab", "transfer", "taxi"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["train", "rail"]),
      icon: Train,
      reason: "Train is optional unless selected in the basket.",
      selectedCount: basketCountBy(basket, ["train", "rail"]),
      serviceName: "Train Ready",
      status: serviceStatus(basketCountBy(basket, ["train", "rail"]), basketCountBy(basket, ["train", "rail"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["bus", "coach"]),
      icon: Bus,
      reason: "Bus is optional unless selected in the basket.",
      selectedCount: basketCountBy(basket, ["bus", "coach"]),
      serviceName: "Bus Ready",
      status: serviceStatus(basketCountBy(basket, ["bus", "coach"]), basketCountBy(basket, ["bus", "coach"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["cruise", "sail"]),
      icon: Sailboat,
      reason: "Cruise is optional unless selected.",
      selectedCount: basketCountBy(basket, ["cruise", "sail"]),
      serviceName: "Cruise Ready",
      status: serviceStatus(basketCountBy(basket, ["cruise", "sail"]), basketCountBy(basket, ["cruise", "sail"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["activity", "experience", "tour"]),
      icon: Sparkles,
      reason: "Activities are ready when added to booking basket.",
      selectedCount: safeArray(payload.selectedActivities).length,
      serviceName: "Activities Ready",
      status: serviceStatus(safeArray(payload.selectedActivities).length, basketCountBy(basket, ["activity", "experience", "tour"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["insurance"]),
      icon: ShieldCheck,
      reason: "Insurance can remain optional until checkout.",
      selectedCount: safeArray(payload.selectedInsurance).length,
      serviceName: "Insurance Ready",
      status: serviceStatus(safeArray(payload.selectedInsurance).length, basketCountBy(basket, ["insurance"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["visa"]),
      icon: Stamp,
      reason: "Visa is optional unless destination or selected service requires it.",
      selectedCount: safeArray((payload as PayloadWithReadinessExtras).selectedVisa).length,
      serviceName: "Visa Ready",
      status: serviceStatus(safeArray((payload as PayloadWithReadinessExtras).selectedVisa).length, basketCountBy(basket, ["visa"]), true),
    },
    {
      basketCount: 0,
      icon: IdCard,
      reason: "Documents depend on traveller details, ID, visa and emergency contact payload.",
      selectedCount: payload.travellers?.profilesComplete ? 1 : 0,
      serviceName: "Documents Ready",
      status: payload.travellers?.profilesComplete ? "Ready" : "Pending",
    },
    {
      basketCount: basketCountBy(basket, ["local life"]),
      icon: ShoppingBag,
      reason: "Local Life is optional unless added to basket.",
      selectedCount: safeArray(payload.selectedLocalLifeItems).length,
      serviceName: "Local Life Ready",
      status: serviceStatus(safeArray(payload.selectedLocalLifeItems).length, basketCountBy(basket, ["local life"]), true),
    },
    {
      basketCount: basketCountBy(basket, ["creator"]),
      icon: Sparkles,
      reason: "Creator experiences are optional unless selected.",
      selectedCount: safeArray(payload.selectedCreatorSpots).length,
      serviceName: "Creator Experience Ready",
      status: serviceStatus(safeArray(payload.selectedCreatorSpots).length, basketCountBy(basket, ["creator"]), true),
    },
  ];
}

function checklist(payload: TiyaSmartPlannerReviewPayload): ReadinessChecklistItem[] {
  const hasRoute = Boolean(payload.route?.name || payload.route?.activeRouteId);
  const itinerary = safeArray(payload.itinerary);
  const basket = safeArray(payload.selectedBasketItems);
  const hasBudget = Boolean(payload.budgetEstimate?.totalEstimatedCost);
  const hasQuote = Boolean(payload.quoteEstimate?.estimatedTotal || payload.quoteEstimate?.totalQuoteEstimate);
  const criticalAudit =
    payload.plannerAudit?.finalVerdict?.toLowerCase().includes("not") ||
    payload.plannerAudit?.finalVerdict?.toLowerCase().includes("critical");

  return [
    { label: "Route selected", status: hasRoute ? "Passed" : "Missing" },
    { label: "Itinerary available", status: itinerary.length ? "Passed" : "Missing" },
    { label: "At least one day finalized", status: itinerary.length ? "Warning" : "Missing" },
    { label: "Booking basket has items", status: basket.length ? "Passed" : "Missing" },
    { label: "Traveller count available", status: payload.travellers?.total ? "Passed" : "Missing" },
    { label: "Traveller details available if present", status: payload.travellers?.profilesComplete ? "Passed" : "Warning" },
    { label: "Budget estimate available", status: hasBudget ? "Passed" : "Warning" },
    { label: "Quote estimate available", status: hasQuote ? "Passed" : "Warning" },
    { label: "Transport reviewed", status: safeArray(payload.selectedCabs).length || safeArray(payload.selectedTransfers).length ? "Passed" : "Optional" },
    { label: "Stay reviewed", status: safeArray(payload.selectedHotels).length || safeArray(payload.selectedHomestays).length ? "Passed" : "Optional" },
    { label: "Activities reviewed", status: safeArray(payload.selectedActivities).length ? "Passed" : "Optional" },
    { label: "Insurance reviewed / optional", status: safeArray(payload.selectedInsurance).length ? "Passed" : "Optional" },
    { label: "Visa reviewed / optional", status: safeArray((payload as PayloadWithReadinessExtras).selectedVisa).length ? "Passed" : "Optional" },
    { label: "Planner audit clear", status: criticalAudit ? "Missing" : "Passed" },
    { label: "Critical blockers clear", status: criticalAudit ? "Missing" : "Passed" },
    { label: "Change history available", status: payload.changeHistory && Object.keys(payload.changeHistory).length ? "Passed" : "Optional" },
  ];
}

function readinessScore(payload: TiyaSmartPlannerReviewPayload) {
  if (payload.plannerAudit?.readinessScore) {
    return Math.min(100, Math.max(0, payload.plannerAudit.readinessScore));
  }

  const checks = [
    Boolean(payload.route?.name || payload.route?.activeRouteId),
    safeArray(payload.itinerary).length > 0,
    safeArray(payload.selectedBasketItems).length > 0,
    Boolean(payload.travellers?.total),
    Boolean(payload.budgetEstimate?.totalEstimatedCost || payload.quoteEstimate?.estimatedTotal || payload.quoteEstimate?.totalQuoteEstimate),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function readinessStatus(score: number) {
  if (score >= 85) return "Ready To Book";
  if (score >= 55) return "Needs Review";
  return "Not Ready";
}

function blockers(payload: TiyaSmartPlannerReviewPayload) {
  const items: string[] = [];
  if (!safeArray(payload.selectedBasketItems).length) items.push("No booking items selected");
  if (!payload.travellers?.total) items.push("No traveller data");
  if (!payload.route?.name && !payload.route?.activeRouteId) items.push("No route selected");
  if (!safeArray(payload.itinerary).length) items.push("No itinerary generated");
  if (!payload.quoteEstimate?.estimatedTotal && !payload.quoteEstimate?.totalQuoteEstimate) items.push("No quote estimate");
  if (payload.plannerAudit?.finalVerdict?.toLowerCase().includes("critical")) {
    items.push("Critical planner audit issue");
  }
  return items;
}

function documentRows(payload: TiyaSmartPlannerReviewPayload) {
  const extended = payload as PayloadWithReadinessExtras;
  const visaSelected = safeArray(extended.selectedVisa).length > 0;
  const insuranceSelected = safeArray(payload.selectedInsurance).length > 0;
  return [
    ["ID Required", "Ready"],
    ["Passport Required", visaSelected ? "Pending" : "Optional"],
    ["Visa Required", visaSelected ? "Pending" : "Optional"],
    ["Insurance Document", insuranceSelected ? "Ready" : "Optional"],
    ["Emergency Contact", extended.emergencyContact ? "Ready" : "Pending"],
    ["Medical Requirement", "Optional"],
  ];
}

export default function ReviewBookingReadiness({
  payload,
}: ReviewBookingReadinessProps) {
  const services = serviceCards(payload);
  const checklistItems = checklist(payload);
  const score = readinessScore(payload);
  const status = readinessStatus(score);
  const blockerItems = blockers(payload);
  const optionalItems = [
    "Insurance optional",
    "Visa optional",
    "Local Life optional",
    "Creator spots optional",
    "Market items optional",
  ];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Booking Preparation Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            BOOKING READINESS CENTER
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Check whether your selected flights, stays, activities, transfers,
            insurance and documents are ready before proceeding to booking.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Read-only readiness validation
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <div className="grid gap-4 xl:grid-cols-3">
            {services.map((service) => (
              <ReviewReadinessServiceCard
                key={service.serviceName}
                service={service}
              />
            ))}
          </div>

          <ReviewReadinessChecklist items={checklistItems} />
          <ReviewReadinessBlockers
            blockers={blockerItems}
            optionalItems={optionalItems}
          />

          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-2">
              <FileCheck2 size={18} className="text-[#4f46e5]" />
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Document Readiness
              </p>
            </div>
            <div className="mt-4 grid gap-2 xl:grid-cols-2">
              {documentRows(payload).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm font-black text-slate-700">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </article>

          <p className="rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4 text-sm font-black leading-6 text-blue-800">
            Only items added to the booking basket will continue to booking.
            Itinerary-only suggestions will remain saved for reference.
          </p>
        </div>

        <aside className="self-start">
          <ReviewReadinessScoreCard
            score={score}
            status={status}
            summary={[
              ["Selected Services", services.filter((service) => service.status === "Ready").length],
              ["Pending Services", services.filter((service) => service.status === "Pending").length],
              ["Missing Services", services.filter((service) => service.status === "Missing").length],
              ["Optional Services", services.filter((service) => service.status === "Optional" || service.status === "Not Required").length],
              ["Basket Items", safeArray(payload.selectedBasketItems).length],
            ].map(([label, value]) => ({ label: String(label), value }))}
          />
        </aside>
      </div>
    </section>
  );
}

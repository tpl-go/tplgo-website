"use client";

import Link from "next/link";
import {
  BedDouble,
  Bus,
  Car,
  Mountain,
  PackageCheck,
  Plane,
  Sailboat,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stamp,
  Train,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import ReviewBasketServiceGroup from "./ReviewBasketServiceGroup";
import { basketItemValue } from "./ReviewBasketItemCard";
import ReviewBasketValueSummary from "./ReviewBasketValueSummary";
import ReviewBasketWarningCard from "./ReviewBasketWarningCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";

type ReviewFinalBookingBasketProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type PayloadWithMode = TiyaSmartPlannerReviewPayload & {
  bookingMode?: string;
  tripMode?: string;
};

type BasketGroupDefinition = {
  aliases: string[];
  icon: LucideIcon;
  name: string;
};

const groupDefinitions: BasketGroupDefinition[] = [
  { aliases: ["flight", "air"], icon: Plane, name: "Flights" },
  { aliases: ["hotel", "stay"], icon: BedDouble, name: "Hotels" },
  { aliases: ["homestay", "home stay"], icon: Mountain, name: "Homestays" },
  { aliases: ["cab", "transfer", "taxi"], icon: Car, name: "Cabs / Transfers" },
  { aliases: ["train", "rail"], icon: Train, name: "Train" },
  { aliases: ["bus", "coach"], icon: Bus, name: "Bus" },
  { aliases: ["cruise", "sail"], icon: Sailboat, name: "Cruise" },
  { aliases: ["activity", "experience", "tour"], icon: Sparkles, name: "Activities" },
  { aliases: ["insurance"], icon: ShieldCheck, name: "Insurance" },
  { aliases: ["visa"], icon: Stamp, name: "Visa" },
  { aliases: ["local life"], icon: ShoppingBag, name: "Local Life" },
  { aliases: ["creator"], icon: Sparkles, name: "Creator Experiences" },
  { aliases: ["market", "shopping"], icon: ShoppingBag, name: "Local Market" },
  { aliases: ["package", "bundle"], icon: PackageCheck, name: "Packages / Bundles" },
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function itemText(item: WorkspaceBookingBasketItem) {
  return normalizeText(
    [item.serviceType, item.serviceName, item.serviceLabel, item.category, item.title].join(" ")
  );
}

function groupNameForItem(item: WorkspaceBookingBasketItem) {
  const text = itemText(item);
  const match = groupDefinitions.find((group) =>
    group.aliases.some((alias) => text.includes(alias))
  );
  return match?.name || "Other";
}

function groupIcon(name: string) {
  return groupDefinitions.find((group) => group.name === name)?.icon || PackageCheck;
}

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function basketValue(items: WorkspaceBookingBasketItem[]) {
  return items.reduce((sum, item) => sum + basketItemValue(item), 0);
}

function tripMode(payload: TiyaSmartPlannerReviewPayload, basketItems: WorkspaceBookingBasketItem[]) {
  const mode = normalizeText((payload as PayloadWithMode).tripMode || (payload as PayloadWithMode).bookingMode);
  if (mode.includes("partial")) return "PARTIAL_TRIP_BOOKING";
  if (mode.includes("full")) return "FULL_TRIP_BOOKING";
  const itineraryDays = safeArray(payload.itinerary).map((day) => day.day);
  const basketDays = new Set(basketItems.map((item) => item.day).filter(Boolean));
  return itineraryDays.length && basketDays.size >= itineraryDays.length
    ? "FULL_TRIP_BOOKING"
    : "PARTIAL_TRIP_BOOKING";
}

function basketWarnings(
  payload: TiyaSmartPlannerReviewPayload,
  basketItems: WorkspaceBookingBasketItem[],
  mode: string
) {
  const warnings: string[] = [];
  if (!basketItems.length) warnings.push("Basket is empty");
  const itineraryDays = safeArray(payload.itinerary).map((day) => day.day);
  const basketDays = new Set(basketItems.map((item) => item.day).filter(Boolean));
  itineraryDays.forEach((day) => {
    if (!basketDays.has(day)) warnings.push(`Day ${day} has no booking items`);
  });
  if (basketItems.some((item) => basketItemValue(item) <= 0)) {
    warnings.push("Some basket items have no estimated value");
  }
  if (basketItems.some((item) => !item.serviceType)) {
    warnings.push("Some basket items have missing service type");
  }
  if (mode === "PARTIAL_TRIP_BOOKING") warnings.push("Partial trip booking selected");
  if (!payload.quoteEstimate?.estimatedTotal && !payload.quoteEstimate?.totalQuoteEstimate) {
    warnings.push("No quote estimate available");
  }
  return Array.from(new Set(warnings));
}

function groupedItems(items: WorkspaceBookingBasketItem[]) {
  return items.reduce<Record<string, WorkspaceBookingBasketItem[]>>((acc, item) => {
    const group = groupNameForItem(item);
    acc[group] = [...(acc[group] || []), item];
    return acc;
  }, {});
}

export default function ReviewFinalBookingBasket({
  payload,
}: ReviewFinalBookingBasketProps) {
  const basketItems = safeArray(payload.selectedBasketItems);
  const groups = groupedItems(basketItems);
  const basketSubtotal = basketValue(basketItems);
  const taxes = Number(payload.budgetEstimate?.taxesPlaceholder || 0);
  const quote = Number(payload.quoteEstimate?.estimatedTotal || payload.quoteEstimate?.totalQuoteEstimate || 0);
  const budget = Number(payload.budgetEstimate?.totalEstimatedCost || 0);
  const mode = tripMode(payload, basketItems);
  const daysCovered = new Set(basketItems.map((item) => item.day).filter(Boolean)).size;
  const warnings = basketWarnings(payload, basketItems, mode);
  const serviceTypesCount = Object.keys(groups).length;
  const dayCoverage = safeArray(payload.itinerary).map((day) => ({
    count: basketItems.filter((item) => item.day === day.day).length,
    day: day.day,
  }));

  return (
    <section className="rounded-[2rem] border border-orange-200 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] p-6 shadow-[0_18px_54px_rgba(154,52,18,0.08)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
            Pre-booking Basket Review
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            FINAL BOOKING BASKET
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-stone-700">
            Review the exact items that will move forward into the TPL booking
            ecosystem.
          </p>
        </div>
        <div className="hidden rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700 xl:block">
          Read-only basket review
        </div>
      </div>

      <p className="mt-6 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4 text-sm font-black leading-6 text-blue-800">
        Only the items below will continue to booking. Itinerary-only
        suggestions and saved items will remain for reference.
      </p>

      <div className="mt-6 grid gap-3 xl:grid-cols-6">
        {[
          ["Total Basket Items", basketItems.length],
          ["Selected Services", serviceTypesCount],
          ["Estimated Basket Value", formatCurrency(basketSubtotal)],
          ["Trip Mode", mode === "FULL_TRIP_BOOKING" ? "Full Trip Booking" : "Partial Trip Booking"],
          ["Service Types Count", serviceTypesCount],
          ["Days Covered", daysCovered],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-3xl border border-orange-100 bg-white p-4 shadow-[0_12px_34px_rgba(154,52,18,0.05)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">
              {label}
            </p>
            <p className="mt-3 break-words text-2xl font-black text-slate-950">
              {value}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
          Trip Mode Clarity
        </p>
        <p className="mt-3 text-2xl font-black text-slate-950">
          {mode === "FULL_TRIP_BOOKING" ? "Full Trip Booking" : "Partial Trip Booking"}
        </p>
        <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
          {mode === "FULL_TRIP_BOOKING"
            ? "All finalized itinerary booking items are included."
            : "You are continuing with selected booking items only. Other itinerary items will remain as reference."}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          {basketItems.length ? (
            Object.entries(groups).map(([serviceName, items]) => (
              <ReviewBasketServiceGroup
                key={serviceName}
                icon={groupIcon(serviceName)}
                items={items}
                serviceName={serviceName}
              />
            ))
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-orange-200 bg-orange-50 p-8 text-center">
              <p className="text-xl font-black text-orange-800">
                No booking basket items found.
              </p>
              <Link
                href="/smart-planner/workspace"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-black text-white"
              >
                Back to Workspace
              </Link>
            </div>
          )}

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Day Coverage
            </p>
            <div className="mt-4 grid gap-2 xl:grid-cols-4">
              {dayCoverage.length ? (
                dayCoverage.map((day) => (
                  <div
                    key={day.day}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="text-sm font-black text-slate-950">Day {day.day}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {day.count} {day.count === 1 ? "item" : "items"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-500">
                  No itinerary day coverage available.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="grid gap-4 self-start">
          <ReviewBasketValueSummary
            budgetEstimate={budget}
            estimatedTaxes={taxes}
            quoteEstimate={quote}
            subtotal={basketSubtotal}
          />
          <ReviewBasketWarningCard warnings={warnings} />
        </aside>
      </div>
    </section>
  );
}

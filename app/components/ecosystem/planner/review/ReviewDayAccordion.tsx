"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";

import ReviewDayItemCard, {
  type ReviewDayItemGroup,
} from "./ReviewDayItemCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type {
  TiyaDayPlan,
  TiyaTimelineItem,
} from "@/app/lib/ecosystem/planner/plannerTypes";

export type ReviewDayBookingLookup = {
  exactIds: Set<string>;
  looseKeys: Set<string>;
};

type ReviewDayAccordionProps = {
  basketItems: WorkspaceBookingBasketItem[];
  bookingLookup: ReviewDayBookingLookup;
  day: TiyaDayPlan;
  dayStatuses?: Record<string, string>;
  defaultOpen?: boolean;
};

type DayStatus = TiyaDayPlan & {
  finalized?: boolean;
  isFinalized?: boolean;
  status?: string;
  title?: string;
};

const groupOrder: ReviewDayItemGroup[] = [
  "Transport / Transfers",
  "Stay / Hotel / Homestay",
  "Activities / Experiences",
  "Meals / Food",
  "Local Life",
  "Creator Experience",
  "Local Market / Shopping",
  "Insurance / Visa / Documents",
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "₹0";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function dateLabel(value?: string) {
  if (!value) return "Date pending";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isFinalizedDay(day: TiyaDayPlan, dayStatuses?: Record<string, string>) {
  const explicitStatus = dayStatuses?.[day.id];
  if (explicitStatus) return explicitStatus.toUpperCase() === "FINALIZED";

  const status = day as DayStatus;
  return Boolean(
    status.finalized ||
      status.isFinalized ||
      status.status?.toLowerCase() === "finalized"
  );
}

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function inferGroup(item: TiyaTimelineItem): ReviewDayItemGroup {
  const haystack = normalizeText(
    [
      item.type,
      item.category,
      item.serviceType,
      item.title,
      item.description,
      item.detailSummary,
      item.location,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (
    haystack.includes("flight") ||
    haystack.includes("train") ||
    haystack.includes("bus") ||
    haystack.includes("cab") ||
    haystack.includes("transfer") ||
    item.type === "transport"
  ) {
    return "Transport / Transfers";
  }

  if (
    haystack.includes("hotel") ||
    haystack.includes("homestay") ||
    haystack.includes("stay") ||
    item.type === "stay"
  ) {
    return "Stay / Hotel / Homestay";
  }

  if (
    haystack.includes("breakfast") ||
    haystack.includes("lunch") ||
    haystack.includes("dinner") ||
    haystack.includes("meal") ||
    haystack.includes("food") ||
    item.type === "meal"
  ) {
    return "Meals / Food";
  }

  if (haystack.includes("creator") || haystack.includes("reel")) {
    return "Creator Experience";
  }

  if (
    haystack.includes("local life") ||
    haystack.includes("local-life") ||
    haystack.includes("commerce")
  ) {
    return "Local Life";
  }

  if (
    haystack.includes("market") ||
    haystack.includes("shopping") ||
    haystack.includes("handicraft")
  ) {
    return "Local Market / Shopping";
  }

  if (
    haystack.includes("insurance") ||
    haystack.includes("visa") ||
    haystack.includes("document")
  ) {
    return "Insurance / Visa / Documents";
  }

  return "Activities / Experiences";
}

function itemEstimatedValue(item: TiyaTimelineItem | WorkspaceBookingBasketItem) {
  const priceLike = item as TiyaTimelineItem & WorkspaceBookingBasketItem;
  return (
    Number(priceLike.estimatedTotal || 0) ||
    Number(priceLike.estimatedPrice || 0) ||
    Number(priceLike.price || 0) ||
    Number(priceLike.unitPrice || 0)
  );
}

function dayValue(items: TiyaTimelineItem[], basketItems: WorkspaceBookingBasketItem[]) {
  const itineraryTotal = safeArray(items).reduce(
    (sum, item) => sum + itemEstimatedValue(item),
    0
  );
  const basketTotal = safeArray(basketItems).reduce(
    (sum, item) => sum + itemEstimatedValue(item),
    0
  );

  return basketTotal || itineraryTotal;
}

function groupItems(items: TiyaTimelineItem[]) {
  return safeArray(items).reduce<Record<ReviewDayItemGroup, TiyaTimelineItem[]>>(
    (groups, item) => {
      const group = inferGroup(item);
      groups[group] = [...(groups[group] || []), item];
      return groups;
    },
    {
      "Transport / Transfers": [],
      "Stay / Hotel / Homestay": [],
      "Activities / Experiences": [],
      "Meals / Food": [],
      "Local Life": [],
      "Creator Experience": [],
      "Local Market / Shopping": [],
      "Insurance / Visa / Documents": [],
    }
  );
}

function basketLooseKey(item: TiyaTimelineItem, day: TiyaDayPlan) {
  return [
    day.id || `day-${day.day}`,
    item.id || item.title,
    item.serviceType || item.type,
    item.time || item.date || day.date,
  ]
    .filter(Boolean)
    .join("|")
    .toLowerCase();
}

function itemIsInBasket(
  item: TiyaTimelineItem,
  day: TiyaDayPlan,
  bookingLookup: ReviewDayBookingLookup
) {
  return (
    bookingLookup.exactIds.has(item.id) ||
    bookingLookup.exactIds.has(`timeline:${item.id}`) ||
    bookingLookup.exactIds.has(`${day.id}:${item.id}`) ||
    bookingLookup.looseKeys.has(basketLooseKey(item, day))
  );
}

function sourceModuleForItem(item: TiyaTimelineItem) {
  const extended = item as TiyaTimelineItem & {
    sourceModule?: string;
    source?: string;
  };
  const text = normalizeText(
    [item.title, item.serviceType, item.category, item.detailSummary]
      .filter(Boolean)
      .join(" ")
  );

  if (extended.sourceModule) return extended.sourceModule;
  if (extended.source) return extended.source;
  if (text.includes("weather")) return "Weather";
  if (text.includes("risk")) return "Risk";
  if (text.includes("creator")) return "Creator";
  if (text.includes("local life") || text.includes("market")) return "Local Life";
  if (text.includes("recommend")) return "Recommendation";
  return "Workspace";
}

export default function ReviewDayAccordion({
  basketItems,
  bookingLookup,
  day,
  dayStatuses,
  defaultOpen = false,
}: ReviewDayAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const items = safeArray(day.items);
  const groupedItems = groupItems(items);
  const finalized = isFinalizedDay(day, dayStatuses);
  const value = dayValue(items, basketItems);
  const dayStatus = day as DayStatus;
  const dayTitle = dayStatus.title || day.headline || `${day.city} day plan`;

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-6 bg-white p-5 text-left transition hover:bg-slate-50"
      >
        <div className="grid min-w-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-black text-[#4f46e5]">
                Day {String(day.day).padStart(2, "0")}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-black ${
                  finalized
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                {finalized ? "Finalized" : "Pending"}
              </span>
            </div>
            <h3 className="mt-3 break-words text-2xl font-black text-slate-950">
              Day {String(day.day).padStart(2, "0")} · {dayTitle}
            </h3>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
              <CalendarDays size={15} />
              {dateLabel(day.date)} · {day.city || "Destination pending"}
            </p>
          </div>

          <div className="grid shrink-0 gap-2 text-right">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
              {basketItems.length} booking item{basketItems.length === 1 ? "" : "s"}
            </span>
            <span className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
              {formatCurrency(value)} estimate
            </span>
          </div>
        </div>

        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {open ? (
        <div className="border-t border-slate-100 bg-slate-50/70 p-5">
          {items.length ? (
            <div className="grid gap-5">
              {groupOrder.map((group) => {
                const groupItemsForDay = groupedItems[group] || [];
                if (!groupItemsForDay.length) return null;

                return (
                  <section key={group} className="rounded-3xl border border-slate-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h4 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                        {group}
                      </h4>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                        {groupItemsForDay.length}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {groupItemsForDay.map((item) => (
                        <ReviewDayItemCard
                          key={item.id}
                          addedToBasket={itemIsInBasket(item, day, bookingLookup)}
                          item={item}
                          sourceModule={sourceModuleForItem(item)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              <section className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                  <FileText size={16} className="text-[#4f46e5]" />
                  Planner Notes
                </div>
                <p className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-600">
                  {day.notes || "No planner notes available for this day."}
                </p>
              </section>

              {basketItems.length ? (
                <section className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
                  <h4 className="text-sm font-black uppercase tracking-[0.14em] text-blue-700">
                    Added to Booking Basket
                  </h4>
                  <div className="mt-3 grid gap-2">
                    {basketItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white px-3 py-2"
                      >
                        <span className="min-w-0 break-words text-sm font-black text-slate-950">
                          {item.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                          {formatCurrency(itemEstimatedValue(item))}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <div className="flex items-center gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm font-black text-amber-800">
                  <AlertTriangle size={18} />
                  No booking items have been added from this day.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-black text-slate-700">
                No detailed items available for this day.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

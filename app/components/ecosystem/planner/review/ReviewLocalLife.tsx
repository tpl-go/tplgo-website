"use client";

import {
  Coffee,
  Compass,
  Footprints,
  Gem,
  HeartHandshake,
  Landmark,
  MapPinned,
  ShoppingBag,
  Utensils,
} from "lucide-react";

import ReviewLocalLifeCategoryCard from "./ReviewLocalLifeCategoryCard";
import ReviewLocalLifeCityGroup from "./ReviewLocalLifeCityGroup";
import ReviewLocalLifeInsightCard from "./ReviewLocalLifeInsightCard";
import type {
  LocalLifeCategory,
  LocalLifeReviewItem,
  LocalLifeStatus,
} from "./ReviewLocalLifeItemCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { MyTripSavedItem } from "@/app/lib/ecosystem/planner/myTripsStorage";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type {
  TiyaTimelineDetailValue,
  TiyaTimelineItem,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewLocalLifeProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type UnknownRecord = Record<string, unknown>;

const localLifeCategories: Array<{
  aliases: string[];
  icon: typeof Utensils;
  key: LocalLifeCategory;
}> = [
  { aliases: ["food", "snack", "cafe", "street food", "culinary"], icon: Utensils, key: "Food Experiences" },
  { aliases: ["culture", "folk", "music", "craft", "art"], icon: Landmark, key: "Culture" },
  { aliases: ["hidden", "secret", "offbeat", "rooftop"], icon: Gem, key: "Hidden Gems" },
  { aliases: ["walk", "trail", "old city"], icon: Footprints, key: "Local Walks" },
  { aliases: ["village", "community", "local family"], icon: HeartHandshake, key: "Village / Community Experiences" },
  { aliases: ["lifestyle", "neighbourhood", "daily life"], icon: Compass, key: "Local Lifestyle" },
  { aliases: ["heritage", "corner", "haveli", "old town"], icon: MapPinned, key: "Heritage Corners" },
  { aliases: ["tea", "coffee", "chaat", "local cafe"], icon: Coffee, key: "Local Cafes / Street Food" },
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? (value as UnknownRecord) : {};
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function textValue(record: UnknownRecord, keys: string[]) {
  const value = keys.map((key) => record[key]).find((item) => typeof item === "string");
  return typeof value === "string" ? value : "";
}

function numberValue(record: UnknownRecord, keys: string[]) {
  const value = keys
    .map((key) => record[key])
    .find((item) => typeof item === "number" || typeof item === "string");
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function detailToString(value: TiyaTimelineDetailValue | undefined) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
}

function itemValue(item: WorkspaceBookingBasketItem | TiyaTimelineItem) {
  const valueLike = item as WorkspaceBookingBasketItem & TiyaTimelineItem;
  return (
    Number(valueLike.estimatedTotal || 0) ||
    Number(valueLike.estimatedPrice || 0) ||
    Number(valueLike.price || 0) ||
    Number(valueLike.unitPrice || 0) ||
    undefined
  );
}

function haystack(value: unknown) {
  if (typeof value === "string") return normalizeText(value);
  const record = asRecord(value);
  return normalizeText(
    [
      record.type,
      record.category,
      record.sourceModule,
      record.source,
      record.serviceType,
      record.serviceLabel,
      record.serviceName,
      record.title,
      record.productName,
      record.name,
      record.description,
      record.specialtyLabel,
      record.localRegion,
      record.meta,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isLocalLifeSignal(value: unknown) {
  const text = haystack(value);
  return (
    text.includes("local life") ||
    text.includes("local-life") ||
    text.includes("local market") ||
    text.includes("market") ||
    text.includes("commerce") ||
    text.includes("bazaar") ||
    text.includes("handicraft") ||
    text.includes("village") ||
    text.includes("community") ||
    text.includes("hidden gem") ||
    text.includes("local walk") ||
    text.includes("street food")
  );
}

function inferCategory(text: string): LocalLifeCategory {
  const match = localLifeCategories.find((category) =>
    category.aliases.some((alias) => text.includes(alias))
  );
  return match?.key || "Local Lifestyle";
}

function normalizePayloadLocalLifeItem(
  item: unknown,
  index: number
): LocalLifeReviewItem {
  const record = asRecord(item);
  const text = haystack(item);
  const title =
    textValue(record, ["title", "productName", "name", "label"]) ||
    `Local Life experience ${index + 1}`;

  return {
    category: inferCategory(text),
    city:
      textValue(record, ["city", "destination", "localRegion", "location"]) ||
      "Unassigned Local Life",
    creatorValue: numberValue(record, ["creatorValue", "creatorValueScore"]),
    cultureScore: numberValue(record, ["cultureScore", "cultureValue"]),
    dayNumber: textValue(record, ["day", "dayNumber"]),
    duration: textValue(record, ["duration", "timeRequired"]),
    estimatedSpend:
      textValue(record, ["priceRange", "estimatedSpend"]) ||
      numberValue(record, ["estimatedCost", "price", "estimatedPrice"]),
    experienceScore: numberValue(record, ["localExperienceScore", "commerceValue"]),
    id: `local-life-${String(record.id || title)}-${index}`,
    location: textValue(record, ["location", "localRegion"]),
    routeFitScore: numberValue(record, ["routeFitScore", "routeRelevance"]),
    source: textValue(record, ["source", "sourceModule"]) || "Local Life Intelligence",
    status: "Recommended",
    time: textValue(record, ["time", "bestTime"]),
    title,
  };
}

function normalizeSavedItem(item: MyTripSavedItem): LocalLifeReviewItem | null {
  if (item.type !== "Local Life" && !isLocalLifeSignal(item)) return null;

  return {
    category: inferCategory(haystack(item)),
    city: item.city || item.destination || "Unassigned Local Life",
    dayNumber: item.day,
    estimatedSpend: item.estimatedCost,
    id: `saved-${item.id}`,
    location: item.city || item.destination,
    source: item.sourceModule || "My Trips",
    status: "Saved",
    time: item.time,
    title: item.title,
  };
}

function normalizeBasketItem(item: WorkspaceBookingBasketItem): LocalLifeReviewItem | null {
  if (!isLocalLifeSignal(item)) return null;

  return {
    category: inferCategory(haystack(item)),
    city: item.city || item.to || "Unassigned Local Life",
    dayNumber: item.day,
    duration:
      detailToString(item.details?.duration) ||
      detailToString(item.details?.timeRequired),
    estimatedSpend: itemValue(item),
    id: `basket-${item.id}`,
    location: item.city || item.to || item.from,
    source: item.serviceLabel || item.serviceName || "Workspace",
    status: "Added to Booking",
    time: item.time,
    title: item.selectedOptionName || item.title,
  };
}

function normalizeTimelineItem(
  item: TiyaTimelineItem,
  city: string,
  dayNumber: number
): LocalLifeReviewItem | null {
  if (!isLocalLifeSignal(item)) return null;

  return {
    category: inferCategory(haystack(item)),
    city: city || item.location || "Unassigned Local Life",
    dayNumber,
    duration:
      detailToString(item.details?.duration) ||
      detailToString(item.details?.timeRequired),
    estimatedSpend: itemValue(item),
    id: `timeline-${dayNumber}-${item.id}`,
    location: item.location || city,
    routeFitScore: numberValue(asRecord(item.details), ["routeFitScore", "routeRelevance"]),
    source: "Workspace",
    status: item.bookingStatus === "optional" ? "Pending" : "Itinerary Only",
    time: item.time,
    title: item.title,
  };
}

function buildLocalLifeItems(payload: TiyaSmartPlannerReviewPayload) {
  const basketItems = safeArray(payload.selectedBasketItems)
    .map(normalizeBasketItem)
    .filter(Boolean) as LocalLifeReviewItem[];
  const savedItems = safeArray(payload.savedItems)
    .map(normalizeSavedItem)
    .filter(Boolean) as LocalLifeReviewItem[];
  const payloadItems = [
    ...safeArray(payload.selectedLocalLifeItems),
    ...safeArray(payload.selectedLocalMarketItems),
  ].map(normalizePayloadLocalLifeItem);
  const timelineItems = safeArray(payload.itinerary).flatMap((day) =>
    safeArray(day.items)
      .map((item) => normalizeTimelineItem(item, day.city, day.day))
      .filter(Boolean)
  ) as LocalLifeReviewItem[];

  const statusPriority: Record<LocalLifeStatus, number> = {
    "Added to Booking": 5,
    Saved: 4,
    "Itinerary Only": 3,
    Recommended: 2,
    Pending: 1,
  };
  const byKey = new Map<string, LocalLifeReviewItem>();

  [...basketItems, ...savedItems, ...timelineItems, ...payloadItems].forEach((item) => {
    const key = normalizeText(`${item.title}|${item.city}|${item.dayNumber || ""}`);
    const existing = byKey.get(key);
    if (!existing || statusPriority[item.status] > statusPriority[existing.status]) {
      byKey.set(key, item);
    }
  });

  return Array.from(byKey.values());
}

function groupedByCity(items: LocalLifeReviewItem[]) {
  return items.reduce<Record<string, LocalLifeReviewItem[]>>((acc, item) => {
    const city = item.city || "Unassigned Local Life";
    acc[city] = [...(acc[city] || []), item];
    return acc;
  }, {});
}

function localLifeInsights(
  items: LocalLifeReviewItem[],
  payload: TiyaSmartPlannerReviewPayload
) {
  const insights: string[] = [];
  const foodCount = items.filter((item) => item.category.includes("Food")).length;
  const hiddenCount = items.filter((item) => item.category === "Hidden Gems").length;
  const cities = new Set(items.map((item) => item.city).filter(Boolean)).size;
  const itineraryCities = new Set(safeArray(payload.itinerary).map((day) => day.city).filter(Boolean)).size;

  if (items.length >= 4) insights.push("Strong cultural coverage");
  if (foodCount > 0) insights.push("Food trail added");
  if (hiddenCount > 0) insights.push("Hidden gem detected");
  if (cities >= itineraryCities && itineraryCities > 0) {
    insights.push("Local Life coverage is strong across planned destinations");
  }
  if (items.some((item) => Number(item.creatorValue || 0) >= 75)) {
    insights.push("Good creator/local content opportunity");
  }

  return insights;
}

function localLifeAlerts(
  items: LocalLifeReviewItem[],
  payload: TiyaSmartPlannerReviewPayload
) {
  const alerts: string[] = [];
  const itineraryCities = Array.from(
    new Set(safeArray(payload.itinerary).map((day) => day.city).filter(Boolean))
  );

  if (!items.length) alerts.push("No Local Life experience selected");
  itineraryCities.forEach((city) => {
    const hasCityItem = items.some(
      (item) => normalizeText(item.city) === normalizeText(city)
    );
    if (!hasCityItem) alerts.push(`${city} has no Local Life experience`);
  });
  if (
    items.some((item) => item.status === "Saved") &&
    !items.some((item) => item.status === "Added to Booking")
  ) {
    alerts.push("Saved Local Life items are not part of booking yet");
  }
  if (
    items.some((item) => item.status === "Itinerary Only") &&
    !items.some((item) => item.status === "Added to Booking")
  ) {
    alerts.push("Local Life selected but not in booking basket");
  }

  return Array.from(new Set(alerts));
}

export default function ReviewLocalLife({ payload }: ReviewLocalLifeProps) {
  const items = buildLocalLifeItems(payload);
  const groups = groupedByCity(items);
  const basketCount = items.filter((item) => item.status === "Added to Booking").length;
  const savedCount = items.filter((item) => item.status === "Saved").length;
  const itineraryOnlyCount = items.filter((item) => item.status === "Itinerary Only").length;
  const citiesCovered = Object.keys(groups).filter((city) => city !== "Unassigned Local Life").length;
  const missingCities = safeArray(payload.itinerary).filter(
    (day) =>
      !items.some((item) => normalizeText(item.city) === normalizeText(day.city))
  ).length;
  const readiness = items.length
    ? Math.min(100, Math.round(48 + basketCount * 8 + savedCount * 4 + citiesCovered * 6))
    : 0;
  const insights = localLifeInsights(items, payload);
  const alerts = localLifeAlerts(items, payload);

  return (
    <section className="rounded-[2rem] border border-amber-200 bg-[linear-gradient(180deg,#fffaf2,#ffffff)] p-6 shadow-[0_18px_54px_rgba(120,53,15,0.08)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
            TPL Local Life Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            LOCAL LIFE REVIEW
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-stone-700">
            Review the food, culture, hidden gems, local walks and destination
            experiences added to your Smart Planner trip.
          </p>
        </div>
        <div className="hidden rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-amber-700 xl:block">
          Read-only Local Life validation
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-8">
        {[
          ["Food Experiences", items.filter((item) => item.category === "Food Experiences" || item.category === "Local Cafes / Street Food").length],
          ["Culture", items.filter((item) => item.category === "Culture").length],
          ["Hidden Gems", items.filter((item) => item.category === "Hidden Gems").length],
          ["Local Walks", items.filter((item) => item.category === "Local Walks").length],
          ["Village / Community", items.filter((item) => item.category === "Village / Community Experiences").length],
          ["Basket Added", basketCount],
          ["Saved", savedCount],
          ["Cities Covered", citiesCovered],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-amber-100 bg-white p-4 shadow-[0_12px_34px_rgba(120,53,15,0.05)]"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-stone-500">
              {label}
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-5 shadow-[0_18px_54px_rgba(120,53,15,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
              City-wise Local Life Grouping
            </p>
            <div className="mt-5 grid gap-5">
              {Object.keys(groups).length ? (
                Object.entries(groups).map(([city, cityItems]) => (
                  <ReviewLocalLifeCityGroup
                    key={city}
                    city={city}
                    items={cityItems}
                  />
                ))
              ) : (
                <p className="rounded-3xl border border-dashed border-amber-200 bg-amber-50 p-8 text-center text-sm font-black text-amber-800">
                  No Local Life experiences selected yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-5 shadow-[0_18px_54px_rgba(120,53,15,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
              Category Review
            </p>
            <div className="mt-4 grid gap-4 xl:grid-cols-4">
              {localLifeCategories.map((category) => (
                <ReviewLocalLifeCategoryCard
                  key={category.key}
                  category={category}
                  items={items.filter((item) => item.category === category.key)}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="grid gap-4 self-start">
          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-5 shadow-[0_18px_54px_rgba(120,53,15,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
              Local Life Readiness
            </p>
            <p className="mt-3 text-5xl font-black text-slate-950">{readiness}%</p>
            <p className="mt-2 inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-800">
              Coverage Status:{" "}
              {readiness >= 80
                ? "Rich Local Experience"
                : readiness >= 50
                  ? "Developing Local Layer"
                  : "Needs Local Life"}
            </p>
            <div className="mt-5 grid gap-2">
              {[
                ["Selected Local Life Items", items.length],
                ["Saved Local Life Items", savedCount],
                ["Itinerary Only Items", itineraryOnlyCount],
                ["Basket Items", basketCount],
                ["Cities Covered", citiesCovered],
                ["Missing Local Life Cities", missingCities],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/70 px-3 py-2"
                >
                  <span className="text-xs font-bold text-stone-600">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-amber-100 bg-white p-5 shadow-[0_18px_54px_rgba(120,53,15,0.07)]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-amber-700" />
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
                Booking / Saved Clarity
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["Added to Booking", basketCount],
                ["Saved to My Trips", savedCount],
                ["Itinerary Only", itineraryOnlyCount],
                ["Recommended", items.filter((item) => item.status === "Recommended").length],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50 px-3 py-2"
                >
                  <span className="text-xs font-black text-stone-600">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6">
        <ReviewLocalLifeInsightCard alerts={alerts} insights={insights} />
      </div>
    </section>
  );
}

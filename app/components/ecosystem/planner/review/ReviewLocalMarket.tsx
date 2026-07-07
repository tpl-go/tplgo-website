"use client";

import {
  Coffee,
  Gem,
  Gift,
  PackageCheck,
  Shirt,
  ShoppingBag,
  Soup,
  Store,
  Utensils,
} from "lucide-react";

import ReviewLocalMarketCategoryCard from "./ReviewLocalMarketCategoryCard";
import ReviewLocalMarketCityGroup from "./ReviewLocalMarketCityGroup";
import ReviewLocalMarketInsightCard from "./ReviewLocalMarketInsightCard";
import type {
  LocalMarketCategory,
  LocalMarketReviewItem,
  LocalMarketStatus,
} from "./ReviewLocalMarketItemCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { MyTripSavedItem } from "@/app/lib/ecosystem/planner/myTripsStorage";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type {
  TiyaTimelineDetailValue,
  TiyaTimelineItem,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewLocalMarketProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type UnknownRecord = Record<string, unknown>;
type PayloadWithLegacyMarket = TiyaSmartPlannerReviewPayload & {
  localMarket?: unknown[];
  marketItems?: unknown[];
};

const marketCategories: Array<{
  aliases: string[];
  icon: typeof ShoppingBag;
  key: LocalMarketCategory;
}> = [
  { aliases: ["handicraft", "craft", "pottery", "textile"], icon: Shirt, key: "Handicrafts" },
  { aliases: ["spice", "masala"], icon: Soup, key: "Spices" },
  { aliases: ["tea", "coffee"], icon: Coffee, key: "Tea / Coffee" },
  { aliases: ["souvenir", "keepsake", "gift"], icon: Gift, key: "Souvenirs" },
  { aliases: ["regional", "local product", "product"], icon: PackageCheck, key: "Regional Products" },
  { aliases: ["travel essential", "pouch", "utility"], icon: Gem, key: "Travel Essentials" },
  { aliases: ["shopping", "market", "bazaar", "stop"], icon: Store, key: "Shopping Stops" },
  { aliases: ["snack", "food", "pickle", "sweet"], icon: Utensils, key: "Local Food Products" },
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
      record.productType,
      record.description,
      record.specialtyLabel,
      record.authenticityBadge,
      record.localRegion,
      record.meta,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isMarketSignal(value: unknown) {
  const text = haystack(value);
  return (
    text.includes("market") ||
    text.includes("shopping") ||
    text.includes("bazaar") ||
    text.includes("handicraft") ||
    text.includes("souvenir") ||
    text.includes("spice") ||
    text.includes("tea") ||
    text.includes("coffee") ||
    text.includes("local product") ||
    text.includes("commerce") ||
    text.includes("travel essential")
  );
}

function inferCategory(text: string): LocalMarketCategory {
  const match = marketCategories.find((category) =>
    category.aliases.some((alias) => text.includes(alias))
  );
  return match?.key || "Regional Products";
}

function normalizePayloadMarketItem(
  item: unknown,
  index: number,
  source = "Local Market Intelligence"
): LocalMarketReviewItem {
  const record = asRecord(item);
  const text = haystack(item);
  const title =
    textValue(record, ["title", "productName", "name", "label"]) ||
    `Local Market item ${index + 1}`;

  return {
    category: inferCategory(text),
    city:
      textValue(record, ["city", "destination", "localRegion", "location"]) ||
      "Unassigned Market Items",
    commerceValue: numberValue(record, ["commerceValue", "commerceValueScore"]),
    creatorValue: numberValue(record, ["creatorValue", "creatorValueScore"]),
    dayNumber: textValue(record, ["day", "dayNumber"]),
    estimatedSpend:
      textValue(record, ["priceRange", "estimatedSpend"]) ||
      numberValue(record, ["estimatedCost", "price", "estimatedPrice"]),
    id: `market-${String(record.id || title)}-${index}`,
    location: textValue(record, ["location", "localRegion"]),
    routeFitScore: numberValue(record, ["routeFitScore", "routeRelevance"]),
    sellerVerification:
      textValue(record, ["sellerVerification", "authenticityBadge", "verification"]) ||
      undefined,
    source: textValue(record, ["source", "sourceModule"]) || source,
    status: "Recommended",
    time: textValue(record, ["time", "bestTime"]),
    title,
  };
}

function normalizeSavedItem(item: MyTripSavedItem): LocalMarketReviewItem | null {
  if (!isMarketSignal(item)) return null;

  return {
    category: inferCategory(haystack(item)),
    city: item.city || item.destination || "Unassigned Market Items",
    dayNumber: item.day,
    estimatedSpend: item.estimatedCost,
    id: `saved-market-${item.id}`,
    location: item.city || item.destination,
    source: item.sourceModule || "My Trips",
    status: "Saved",
    time: item.time,
    title: item.title,
  };
}

function normalizeBasketItem(item: WorkspaceBookingBasketItem): LocalMarketReviewItem | null {
  if (!isMarketSignal(item)) return null;

  return {
    category: inferCategory(haystack(item)),
    city: item.city || item.to || "Unassigned Market Items",
    dayNumber: item.day,
    estimatedSpend: itemValue(item),
    id: `basket-market-${item.id}`,
    location: item.city || item.to || item.from,
    sellerVerification:
      detailToString(item.details?.sellerVerification) ||
      detailToString(item.details?.authenticityBadge),
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
): LocalMarketReviewItem | null {
  if (!isMarketSignal(item)) return null;

  return {
    category: inferCategory(haystack(item)),
    city: city || item.location || "Unassigned Market Items",
    dayNumber,
    estimatedSpend: itemValue(item),
    id: `timeline-market-${dayNumber}-${item.id}`,
    location: item.location || city,
    routeFitScore: numberValue(asRecord(item.details), ["routeFitScore", "routeRelevance"]),
    sellerVerification:
      detailToString(item.details?.sellerVerification) ||
      detailToString(item.details?.authenticityBadge),
    source: "Workspace",
    status: item.bookingStatus === "optional" ? "Pending" : "Itinerary Only",
    time: item.time,
    title: item.title,
  };
}

function legacyMarketItems(payload: TiyaSmartPlannerReviewPayload) {
  const legacy = payload as PayloadWithLegacyMarket;
  return [
    ...safeArray(payload.selectedLocalMarketItems),
    ...safeArray(legacy.localMarket),
    ...safeArray(legacy.marketItems),
  ];
}

function buildMarketItems(payload: TiyaSmartPlannerReviewPayload) {
  const basketItems = safeArray(payload.selectedBasketItems)
    .map(normalizeBasketItem)
    .filter(Boolean) as LocalMarketReviewItem[];
  const savedItems = safeArray(payload.savedItems)
    .map(normalizeSavedItem)
    .filter(Boolean) as LocalMarketReviewItem[];
  const payloadItems = legacyMarketItems(payload).map((item, index) =>
    normalizePayloadMarketItem(item, index)
  );
  const relatedLocalLifeSignals = safeArray(payload.selectedLocalLifeItems)
    .filter(isMarketSignal)
    .map((item, index) =>
      normalizePayloadMarketItem(item, index, "Local Life")
    );
  const timelineItems = safeArray(payload.itinerary).flatMap((day) =>
    safeArray(day.items)
      .map((item) => normalizeTimelineItem(item, day.city, day.day))
      .filter(Boolean)
  ) as LocalMarketReviewItem[];

  const statusPriority: Record<LocalMarketStatus, number> = {
    "Added to Booking": 5,
    Saved: 4,
    "Itinerary Only": 3,
    Recommended: 2,
    Pending: 1,
  };
  const byKey = new Map<string, LocalMarketReviewItem>();

  [...basketItems, ...savedItems, ...timelineItems, ...payloadItems, ...relatedLocalLifeSignals].forEach((item) => {
    const key = normalizeText(`${item.title}|${item.city}|${item.dayNumber || ""}`);
    const existing = byKey.get(key);
    if (!existing || statusPriority[item.status] > statusPriority[existing.status]) {
      byKey.set(key, item);
    }
  });

  return Array.from(byKey.values());
}

function groupedByCity(items: LocalMarketReviewItem[]) {
  return items.reduce<Record<string, LocalMarketReviewItem[]>>((acc, item) => {
    const city = item.city || "Unassigned Market Items";
    acc[city] = [...(acc[city] || []), item];
    return acc;
  }, {});
}

function marketInsights(items: LocalMarketReviewItem[]) {
  const insights: string[] = [];
  if (items.filter((item) => item.category === "Handicrafts").length > 1) {
    insights.push("Strong handicraft coverage");
  }
  const shoppingStop = items.find((item) => item.category === "Shopping Stops");
  if (shoppingStop?.dayNumber) {
    insights.push(`Shopping stop added on Day ${shoppingStop.dayNumber}`);
  }
  if (
    items.some((item) => item.status === "Saved") &&
    !items.some((item) => item.status === "Added to Booking")
  ) {
    insights.push("Local market saved but not added");
  }
  if (items.some((item) => Number(item.creatorValue || 0) >= 75)) {
    insights.push("Good creator-commerce opportunity");
  }
  if (items.some((item) => Number(item.routeFitScore || 0) >= 75)) {
    insights.push("Destination commerce match found");
  }
  const numericSpend = items.reduce(
    (sum, item) => sum + (typeof item.estimatedSpend === "number" ? item.estimatedSpend : 0),
    0
  );
  if (numericSpend > 0) insights.push("Estimated local spend within budget");

  return Array.from(new Set(insights));
}

function marketAlerts(
  items: LocalMarketReviewItem[],
  payload: TiyaSmartPlannerReviewPayload
) {
  const alerts: string[] = [];
  const itineraryCities = Array.from(
    new Set(safeArray(payload.itinerary).map((day) => day.city).filter(Boolean))
  );

  if (!items.length) alerts.push("No market items selected");
  if (
    items.some((item) => item.status === "Saved") &&
    !items.some((item) => item.status === "Added to Booking")
  ) {
    alerts.push("Market items saved but not added");
  }
  itineraryCities.forEach((city) => {
    const hasCityItem = items.some(
      (item) => normalizeText(item.city) === normalizeText(city)
    );
    if (!hasCityItem) alerts.push(`${city} has no market coverage`);
  });
  if (
    items.some((item) => item.category === "Shopping Stops") &&
    !items.some((item) => item.status === "Itinerary Only" || item.status === "Added to Booking")
  ) {
    alerts.push("Shopping stop exists but not added to itinerary");
  }

  return Array.from(new Set(alerts));
}

export default function ReviewLocalMarket({ payload }: ReviewLocalMarketProps) {
  const items = buildMarketItems(payload);
  const groups = groupedByCity(items);
  const basketCount = items.filter((item) => item.status === "Added to Booking").length;
  const savedCount = items.filter((item) => item.status === "Saved").length;
  const shoppingStops = items.filter((item) => item.category === "Shopping Stops").length;
  const citiesCovered = Object.keys(groups).filter((city) => city !== "Unassigned Market Items").length;
  const selectedCount = items.length;
  const numericSpend = items.reduce(
    (sum, item) => sum + (typeof item.estimatedSpend === "number" ? item.estimatedSpend : 0),
    0
  );
  const valueScore = items.length
    ? Math.min(100, Math.round(42 + basketCount * 8 + savedCount * 4 + citiesCovered * 6))
    : 0;
  const insights = marketInsights(items);
  const alerts = marketAlerts(items, payload);

  return (
    <section className="rounded-[2rem] border border-orange-200 bg-[linear-gradient(180deg,#fff7ed,#ffffff)] p-6 shadow-[0_18px_54px_rgba(154,52,18,0.08)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-700">
            Destination Commerce Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            LOCAL MARKET REVIEW
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-stone-700">
            Review local products, shopping stops, souvenirs, handicrafts and
            destination commerce items selected for this trip.
          </p>
        </div>
        <div className="hidden rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700 xl:block">
          Read-only commerce validation
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-9">
        {[
          ["Handicrafts", items.filter((item) => item.category === "Handicrafts").length],
          ["Spices", items.filter((item) => item.category === "Spices").length],
          ["Tea", items.filter((item) => item.category === "Tea / Coffee").length],
          ["Souvenirs", items.filter((item) => item.category === "Souvenirs").length],
          ["Shopping Stops", shoppingStops],
          ["Local Products", items.filter((item) => item.category === "Regional Products" || item.category === "Local Food Products").length],
          ["Saved Market Items", savedCount],
          ["Added to Basket", basketCount],
          ["Cities Covered", citiesCovered],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-orange-100 bg-white p-4 shadow-[0_12px_34px_rgba(154,52,18,0.05)]"
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
          <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
              City-wise Local Market Grouping
            </p>
            <div className="mt-5 grid gap-5">
              {Object.keys(groups).length ? (
                Object.entries(groups).map(([city, cityItems]) => (
                  <ReviewLocalMarketCityGroup
                    key={city}
                    city={city}
                    items={cityItems}
                  />
                ))
              ) : (
                <p className="rounded-3xl border border-dashed border-orange-200 bg-orange-50 p-8 text-center text-sm font-black text-orange-800">
                  No local market selections yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
              Category Review
            </p>
            <div className="mt-4 grid gap-4 xl:grid-cols-4">
              {marketCategories.map((category) => (
                <ReviewLocalMarketCategoryCard
                  key={category.key}
                  category={category}
                  items={items.filter((item) => item.category === category.key)}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="grid gap-4 self-start">
          <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
              Local Market Value
            </p>
            <p className="mt-3 text-5xl font-black text-slate-950">{valueScore}%</p>
            <p className="mt-2 inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-black text-orange-800">
              Coverage Status:{" "}
              {valueScore >= 80
                ? "Good Market Coverage"
                : valueScore >= 50
                  ? "Market Coverage Building"
                  : "Needs Market Coverage"}
            </p>
            <div className="mt-5 grid gap-2">
              {[
                ["Selected Market Items", selectedCount],
                ["Saved Market Items", savedCount],
                ["Added to Basket", basketCount],
                ["Shopping Stops", shoppingStops],
                ["Estimated Local Spend", numericSpend > 0 ? `₹${numericSpend.toLocaleString("en-IN")}` : "NA"],
                ["Cities Covered", citiesCovered],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/70 px-3 py-2"
                >
                  <span className="text-xs font-bold text-stone-600">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.07)]">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-orange-700" />
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
                Booking / Saved Clarity
              </p>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                ["Added to Booking", basketCount],
                ["Saved to My Trips", savedCount],
                ["Itinerary Only", items.filter((item) => item.status === "Itinerary Only").length],
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
        <ReviewLocalMarketInsightCard alerts={alerts} insights={insights} />
      </div>
    </section>
  );
}

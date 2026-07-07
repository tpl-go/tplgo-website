"use client";

import {
  BedDouble,
  Building2,
  Castle,
  Home,
  Leaf,
  Tent,
} from "lucide-react";

import ReviewRoomBreakdown from "./ReviewRoomBreakdown";
import ReviewStayCoverageCard from "./ReviewStayCoverageCard";
import ReviewStayGapAlert from "./ReviewStayGapAlert";
import ReviewStayTimeline from "./ReviewStayTimeline";
import type {
  StayCategoryKey,
  StayCoverageStatus,
  StayReviewItem,
} from "./ReviewStayCoverageCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaDayPlan, TiyaTimelineItem } from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewStayMasterProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type StayDefinition = {
  aliases: string[];
  icon: typeof BedDouble;
  key: StayCategoryKey;
  title: string;
};

const stayDefinitions: StayDefinition[] = [
  { aliases: ["hotel"], icon: Building2, key: "hotels", title: "Hotels" },
  { aliases: ["homestay", "home stay"], icon: Home, key: "homestays", title: "Homestays" },
  { aliases: ["resort"], icon: Castle, key: "resorts", title: "Resorts" },
  { aliases: ["villa"], icon: BedDouble, key: "villas", title: "Villas" },
  { aliases: ["retreat", "wellness"], icon: Leaf, key: "retreats", title: "Retreats" },
  { aliases: ["camp", "glamp", "tent"], icon: Tent, key: "camps", title: "Camps" },
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function stayValue(item: TiyaTimelineItem | WorkspaceBookingBasketItem) {
  const priceLike = item as TiyaTimelineItem & WorkspaceBookingBasketItem;
  return (
    Number(priceLike.estimatedTotal || 0) ||
    Number(priceLike.estimatedPrice || 0) ||
    Number(priceLike.price || 0) ||
    Number(priceLike.unitPrice || 0) ||
    undefined
  );
}

function tripNightCount(payload: TiyaSmartPlannerReviewPayload) {
  const start = payload.trip?.startDate ? new Date(payload.trip.startDate) : null;
  const end = payload.trip?.endDate ? new Date(payload.trip.endDate) : null;
  if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
    return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
  }
  return Math.max(0, safeArray(payload.itinerary).length - 1);
}

function inferStayCategory(text: string): StayCategoryKey {
  const normalized = normalizeText(text);
  const match = stayDefinitions.find((definition) =>
    definition.aliases.some((alias) => normalized.includes(alias))
  );
  return match?.key || "hotels";
}

function dayById(days: TiyaDayPlan[]) {
  return days.reduce<Record<string, TiyaDayPlan>>((acc, day) => {
    acc[day.id] = day;
    return acc;
  }, {});
}

function stayFromBasket(
  item: WorkspaceBookingBasketItem,
  daysById: Record<string, TiyaDayPlan>
): StayReviewItem | null {
  const text = normalizeText(
    [
      item.serviceType,
      item.serviceName,
      item.serviceLabel,
      item.category,
      item.title,
      item.description,
      item.detailSummary,
    ].join(" ")
  );
  const isStay =
    item.serviceType === "hotel" ||
    text.includes("stay") ||
    text.includes("hotel") ||
    text.includes("homestay") ||
    text.includes("resort") ||
    text.includes("villa") ||
    text.includes("retreat") ||
    text.includes("camp");

  if (!isStay) return null;

  const linkedDay = item.dayId ? daysById[item.dayId] : undefined;

  return {
    adults: item.travellers,
    category: inferStayCategory(text),
    checkIn: item.checkInDate || item.startDate || item.date || linkedDay?.date,
    checkOut: item.checkOutDate || item.endDate,
    city: item.city || linkedDay?.city || "",
    estimatedCost: stayValue(item),
    id: `basket-${item.id}`,
    location: item.city || linkedDay?.city || "",
    mealPlan: String(item.details?.mealPlan || item.details?.meals || ""),
    nights: item.nights,
    propertyName: item.selectedOptionName || item.title,
    propertyType: item.serviceLabel || item.serviceName || "Hotel / Stay",
    rooms: item.rooms,
    source: item.serviceLabel || item.serviceName || "Workspace",
    status: "Selected",
    travellerCount: item.travellers,
  };
}

function stayFromTimeline(
  item: TiyaTimelineItem,
  day: TiyaDayPlan,
  status: StayCoverageStatus,
  source: string
): StayReviewItem {
  const text = normalizeText(
    [item.serviceType, item.category, item.type, item.title, item.description].join(" ")
  );

  return {
    adults: item.travellers,
    category: inferStayCategory(text),
    checkIn: item.checkInDate || item.date || day.date,
    checkOut: item.checkOutDate,
    city: item.location || day.city,
    estimatedCost: stayValue(item),
    id: `${source}-${day.id}-${item.id}`,
    location: item.location || day.city,
    mealPlan: String(item.details?.mealPlan || item.details?.meals || ""),
    nights: item.nights,
    propertyName: item.title,
    propertyType: item.serviceType || item.category || "Stay",
    rooms: item.rooms,
    source,
    status,
    travellerCount: item.travellers,
  };
}

function buildStayItems(payload: TiyaSmartPlannerReviewPayload) {
  const days = safeArray(payload.itinerary);
  const daysMap = dayById(days);
  const fromBasket = safeArray(payload.selectedBasketItems)
    .map((item) => stayFromBasket(item, daysMap))
    .filter(Boolean) as StayReviewItem[];
  const selectedIds = new Set(
    fromBasket.map((item) => normalizeText(`${item.propertyName}|${item.city}|${item.checkIn}`))
  );
  const fromTimeline = days.flatMap((day) =>
    safeArray(day.items)
      .filter((item) => item.type === "stay")
      .map((item) => {
        const key = normalizeText(`${item.title}|${item.location || day.city}|${item.checkInDate || item.date || day.date}`);
        return selectedIds.has(key)
          ? null
          : stayFromTimeline(
              item,
              day,
              item.bookingStatus === "optional" ? "Pending" : "Recommended",
              "Workspace"
            );
      })
      .filter(Boolean)
  ) as StayReviewItem[];
  const selectedHotels = safeArray(payload.selectedHotels).map((item) =>
    stayFromTimeline(item, { id: "selected-hotels", day: 0, date: item.date || "", city: item.location, pace: "Balanced", headline: "", notes: "", items: [] }, "Recommended", "Stay Intelligence")
  );
  const selectedHomestays = safeArray(payload.selectedHomestays).map((item) =>
    stayFromTimeline(item, { id: "selected-homestays", day: 0, date: item.date || "", city: item.location, pace: "Balanced", headline: "", notes: "", items: [] }, "Recommended", "Stay Intelligence")
  );
  const seen = new Set<string>();

  return [...fromBasket, ...fromTimeline, ...selectedHotels, ...selectedHomestays].filter((item) => {
    const key = normalizeText(`${item.propertyName}|${item.city}|${item.checkIn}|${item.status}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function categoryStatus(category: StayCategoryKey, stays: StayReviewItem[]): StayCoverageStatus {
  const items = stays.filter((stay) => stay.category === category);
  if (items.some((item) => item.status === "Selected")) return "Selected";
  if (items.some((item) => item.status === "Recommended")) return "Recommended";
  if (items.some((item) => item.status === "Pending")) return "Pending";
  return "Missing";
}

function coveredCities(payload: TiyaSmartPlannerReviewPayload, stays: StayReviewItem[]) {
  const cities = Array.from(
    new Set(safeArray(payload.itinerary).map((day) => day.city).filter(Boolean))
  );

  return cities.map((city) => {
    const hasSelected = stays.some(
      (stay) => normalizeText(stay.city) === normalizeText(city) && stay.status === "Selected"
    );
    const hasAny = stays.some((stay) => normalizeText(stay.city) === normalizeText(city));
    return {
      city,
      status: hasSelected ? "Covered" : hasAny ? "Pending" : "Missing",
    };
  });
}

function stayGaps(payload: TiyaSmartPlannerReviewPayload, stays: StayReviewItem[]) {
  const gaps: string[] = [];
  const tripNights = tripNightCount(payload);
  const covered = stays.reduce((sum, stay) => sum + Number(stay.nights || 0), 0);
  const missingCities = coveredCities(payload, stays).filter((city) => city.status === "Missing");

  if (!stays.length) gaps.push("No accommodation has been selected yet");
  if (tripNights > covered) gaps.push("Night not covered");
  missingCities.forEach((city) => gaps.push(`${city.city} accommodation missing`));
  if (
    stays.some((stay) => stay.checkIn && stay.checkOut && stay.checkIn > stay.checkOut)
  ) {
    gaps.push("Check-in / check-out mismatch");
  }

  return Array.from(new Set(gaps));
}

function stayInsights(stays: StayReviewItem[]) {
  const insights: string[] = [];
  if (stays.some((stay) => Number(stay.nights || 0) >= 4)) insights.push("Long stay detected");
  if (stays.length >= 3) insights.push("Multiple hotel switches");
  if (new Set(stays.map((stay) => stay.category)).size >= 2) {
    insights.push("Mixed accommodation strategy");
  }
  if (stays.some((stay) => normalizeText(stay.propertyType).includes("premium"))) {
    insights.push("Premium stay concentration");
  }
  if (stays.some((stay) => normalizeText(stay.propertyType).includes("budget"))) {
    insights.push("Budget stay concentration");
  }
  return insights;
}

function statusColor(status: string) {
  if (status === "Selected" || status === "Covered") return "bg-emerald-50 text-emerald-700";
  if (status === "Recommended") return "bg-blue-50 text-blue-700";
  if (status === "Pending") return "bg-amber-50 text-amber-700";
  if (status === "Missing") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

export default function ReviewStayMaster({ payload }: ReviewStayMasterProps) {
  const stays = buildStayItems(payload);
  const tripNights = tripNightCount(payload);
  const coveredNights = stays.reduce((sum, stay) => sum + Number(stay.nights || 0), 0);
  const uncoveredNights = Math.max(0, tripNights - coveredNights);
  const selectedStays = stays.filter((stay) => stay.status === "Selected").length;
  const pendingStays = stays.filter((stay) => stay.status === "Pending").length;
  const coverageScore = tripNights
    ? Math.min(100, Math.round((Math.min(tripNights, coveredNights) / tripNights) * 100))
    : selectedStays
      ? 100
      : 0;
  const cityCoverage = coveredCities(payload, stays);
  const gaps = stayGaps(payload, stays);
  const insights = stayInsights(stays);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Stay Coverage Validation Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            STAY MASTER REVIEW
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review every stay selection, accommodation coverage and night
            allocation across your complete journey.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Read-only stay validation
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-6">
        {stayDefinitions.map((definition) => {
          const Icon = definition.icon;
          const status = categoryStatus(definition.key, stays);
          return (
            <div key={definition.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <Icon size={20} className="text-[#4f46e5]" />
              <p className="mt-3 text-sm font-black text-slate-950">{definition.title}</p>
              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${statusColor(status)}`}>
                {status}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ReviewStayTimeline stays={stays} />

        <aside className="grid gap-4 self-start">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Stay Readiness
            </p>
            <p className="mt-3 text-5xl font-black text-slate-950">{coverageScore}%</p>
            <p className="mt-2 rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-black text-[#4f46e5]">
              Coverage Status: {coverageScore >= 85 ? "Excellent" : coverageScore >= 60 ? "Good" : "Needs Review"}
            </p>
            <div className="mt-5 grid gap-2">
              {[
                ["Total Stay Locations", new Set(stays.map((stay) => stay.city).filter(Boolean)).size],
                ["Total Nights", tripNights],
                ["Covered Nights", coveredNights],
                ["Uncovered Nights", uncoveredNights],
                ["Selected Stays", selectedStays],
                ["Pending Stays", pendingStays],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-xs font-bold text-slate-500">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <ReviewStayGapAlert gaps={gaps} />
        </aside>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
          Stay Coverage Map
        </p>
        <div className="mt-4 grid gap-3 xl:grid-cols-4">
          {cityCoverage.length ? (
            cityCoverage.map((item) => (
              <div key={item.city} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm font-black text-slate-950">{item.city}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${statusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm font-black text-slate-500">
              Stay coverage information unavailable.
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Check-In / Check-Out Review
          </p>
          <div className="mt-4 grid gap-3">
            {stays.length ? (
              stays.map((stay) => (
                <div
                  key={`${stay.id}-check-window`}
                  className="grid grid-cols-[minmax(0,1fr)_120px] gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">
                      {stay.propertyName}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {stay.city || stay.location || "Stay location unavailable"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-slate-950">
                      {stay.checkIn || "Check-in pending"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      to {stay.checkOut || "Check-out pending"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-black text-slate-500">
                No check-in or check-out details available.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
            Night Coverage Validation
          </p>
          <div className="mt-4 grid gap-3">
            {[
              ["Trip Nights", tripNights],
              ["Covered", coveredNights],
              ["Missing", uncoveredNights],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <span className="text-sm font-black text-slate-600">{label}</span>
                <span className="text-2xl font-black text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {stayDefinitions.map((definition) => (
          <ReviewStayCoverageCard
            key={definition.key}
            definition={definition}
            stays={stays.filter((stay) => stay.category === definition.key)}
            status={categoryStatus(definition.key, stays)}
          />
        ))}
      </div>

      <ReviewRoomBreakdown stays={stays} totalTravellers={payload.travellers?.total || 0} />

      {insights.length ? (
        <div className="mt-6 rounded-[1.75rem] border border-violet-100 bg-violet-50 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-700">
            Stay Intelligence Insights
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {insights.map((insight) => (
              <span key={insight} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-violet-700">
                {insight}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

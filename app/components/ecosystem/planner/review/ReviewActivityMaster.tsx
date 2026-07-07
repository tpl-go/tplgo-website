"use client";

import {
  Binoculars,
  Compass,
  Footprints,
  Leaf,
  Mountain,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";

import ReviewActivityCityGroup from "./ReviewActivityCityGroup";
import ReviewActivityCoverageSummary from "./ReviewActivityCoverageSummary";
import ReviewActivityGapAlert from "./ReviewActivityGapAlert";
import type {
  ActivityReviewCategory,
  ActivityReviewItem,
  ActivityReviewStatus,
} from "./ReviewActivityCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type {
  TiyaDayPlan,
  TiyaTimelineDetailValue,
  TiyaTimelineItem,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewActivityMasterProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type DayActivityCoverage = {
  count: number;
  dayNumber: number;
  status: "Balanced" | "Heavy" | "Missing";
};

const activityCategories: Array<{
  aliases: string[];
  icon: typeof Sparkles;
  key: ActivityReviewCategory;
}> = [
  { aliases: ["culture", "heritage", "museum", "palace", "fort"], icon: Compass, key: "Culture" },
  { aliases: ["food", "meal", "cafe", "culinary", "trail"], icon: Utensils, key: "Food" },
  { aliases: ["adventure", "trek", "hike", "rafting"], icon: Mountain, key: "Adventure" },
  { aliases: ["nature", "lake", "forest", "park", "viewpoint"], icon: Leaf, key: "Nature" },
  { aliases: ["spiritual", "temple", "monastery", "prayer"], icon: Sparkles, key: "Spiritual" },
  { aliases: ["shopping", "bazaar"], icon: ShoppingBag, key: "Shopping" },
  { aliases: ["wellness", "spa", "yoga"], icon: Footprints, key: "Wellness" },
  { aliases: ["sightseeing", "walk", "tour", "show", "experience"], icon: Binoculars, key: "Sightseeing" },
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function detailToString(value: TiyaTimelineDetailValue | undefined) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
}

function detailToNumber(value: TiyaTimelineDetailValue | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function itemValue(item: TiyaTimelineItem | WorkspaceBookingBasketItem) {
  const priceLike = item as TiyaTimelineItem & WorkspaceBookingBasketItem;
  return (
    Number(priceLike.estimatedTotal || 0) ||
    Number(priceLike.estimatedPrice || 0) ||
    Number(priceLike.price || 0) ||
    Number(priceLike.unitPrice || 0) ||
    undefined
  );
}

function activityHaystack(
  item: TiyaTimelineItem | WorkspaceBookingBasketItem,
  extra = ""
) {
  const reviewItem = item as TiyaTimelineItem & WorkspaceBookingBasketItem;
  return normalizeText(
    [
      reviewItem.serviceType,
      reviewItem.serviceName,
      reviewItem.serviceLabel,
      reviewItem.category,
      reviewItem.type,
      reviewItem.title,
      reviewItem.description,
      reviewItem.detailSummary,
      reviewItem.meta,
      extra,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function isLocalOrCreatorSignal(text: string) {
  return (
    text.includes("local life") ||
    text.includes("local-life") ||
    text.includes("local market") ||
    text.includes("market pick") ||
    text.includes("commerce") ||
    text.includes("creator") ||
    text.includes("reel") ||
    text.includes("story spot")
  );
}

function isCoreActivity(
  item: TiyaTimelineItem | WorkspaceBookingBasketItem,
  extra = ""
) {
  const text = activityHaystack(item, extra);
  if (isLocalOrCreatorSignal(text)) return false;
  return (
    text.includes("activity") ||
    text.includes("experience") ||
    text.includes("tour") ||
    text.includes("walk") ||
    text.includes("show") ||
    text.includes("food") ||
    text.includes("sightseeing") ||
    (item as TiyaTimelineItem).type === "activity" ||
    (item as WorkspaceBookingBasketItem).serviceType === "activity"
  );
}

function inferCategory(text: string): ActivityReviewCategory {
  const match = activityCategories.find((category) =>
    category.aliases.some((alias) => text.includes(alias))
  );
  return match?.key || "Sightseeing";
}

function basketKey(item: WorkspaceBookingBasketItem) {
  return normalizeText(
    [
      item.sourceItemId || item.id,
      item.dayId,
      item.day,
      item.title,
      item.city,
      item.time,
    ].join("|")
  );
}

function activityFromBasket(
  item: WorkspaceBookingBasketItem
): ActivityReviewItem | null {
  if (!isCoreActivity(item)) return null;
  const text = activityHaystack(item);

  return {
    category: inferCategory(text),
    city: item.city || item.to || "",
    date: item.date || item.startDate,
    dayNumber: item.day,
    duration:
      detailToString(item.details?.duration) ||
      detailToString(item.details?.timeRequired),
    estimatedCost: itemValue(item),
    id: `basket-${item.id}`,
    location: item.city || item.to || item.from,
    source: item.serviceLabel || item.serviceName || "Workspace",
    status: "Added to Booking",
    time: item.time,
    title: item.selectedOptionName || item.title,
  };
}

function activityFromTimeline(
  item: TiyaTimelineItem,
  day: TiyaDayPlan,
  status: ActivityReviewStatus,
  source: string
): ActivityReviewItem {
  const text = activityHaystack(item);

  return {
    category: inferCategory(text),
    city: day.city || item.location || "Unassigned Activities",
    crowdScore: detailToNumber(item.details?.crowdScore),
    date: item.date || day.date,
    dayNumber: day.day,
    duration:
      detailToString(item.details?.duration) ||
      detailToString(item.details?.timeRequired),
    estimatedCost: itemValue(item),
    fatigueScore: detailToNumber(item.details?.fatigueScore),
    fitScore: detailToNumber(item.details?.fitScore),
    id: `${source}-${day.id}-${item.id}`,
    location: item.location || day.city,
    source,
    status,
    time: item.time,
    title: item.title || "Selected activity",
  };
}

function buildActivityItems(payload: TiyaSmartPlannerReviewPayload) {
  const basketActivities = safeArray(payload.selectedBasketItems)
    .map(activityFromBasket)
    .filter(Boolean) as ActivityReviewItem[];
  const selectedBasketKeys = new Set(
    safeArray(payload.selectedBasketItems).map(basketKey)
  );

  const itineraryActivities = safeArray(payload.itinerary).flatMap((day) =>
    safeArray(day.items)
      .filter((item) => isCoreActivity(item))
      .map((item) => {
        const matchesBasket = selectedBasketKeys.has(
          normalizeText(
            [
              item.id,
              day.id,
              day.day,
              item.title,
              item.location || day.city,
              item.time,
            ].join("|")
          )
        );

        if (matchesBasket) return null;

        return activityFromTimeline(
          item,
          day,
          item.bookingStatus === "optional" ? "Pending" : "Itinerary Only",
          "Workspace"
        );
      })
      .filter(Boolean)
  ) as ActivityReviewItem[];

  const selectedActivities = safeArray(payload.selectedActivities)
    .filter((item) => isCoreActivity(item))
    .map((item) =>
      activityFromTimeline(
        item,
        {
          city: item.location || "Unassigned Activities",
          date: item.date || "",
          day: Number(item.details?.day || 0),
          headline: "",
          id: "selected-activities",
          items: [],
          notes: "",
          pace: "Balanced",
        },
        item.bookingStatus === "optional" ? "Pending" : "Recommended",
        "Activity Intelligence"
      )
    );

  const seen = new Set<string>();
  return [...basketActivities, ...itineraryActivities, ...selectedActivities].filter(
    (activity) => {
      const key = normalizeText(
        `${activity.title}|${activity.city}|${activity.dayNumber}|${activity.time}|${activity.status}`
      );
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }
  );
}

function groupedByCity(activities: ActivityReviewItem[]) {
  return activities.reduce<Record<string, ActivityReviewItem[]>>((acc, activity) => {
    const city = activity.city || "Unassigned Activities";
    acc[city] = [...(acc[city] || []), activity];
    return acc;
  }, {});
}

function dayCoverage(
  payload: TiyaSmartPlannerReviewPayload,
  activities: ActivityReviewItem[]
): DayActivityCoverage[] {
  return safeArray(payload.itinerary).map((day) => {
    const count = activities.filter((activity) => activity.dayNumber === day.day).length;
    return {
      count,
      dayNumber: day.day,
      status: count === 0 ? "Missing" : count >= 5 ? "Heavy" : "Balanced",
    };
  });
}

function activityAlerts(
  coverage: DayActivityCoverage[],
  activities: ActivityReviewItem[]
) {
  const alerts: string[] = [];

  coverage
    .filter((day) => day.status === "Missing")
    .forEach((day) => alerts.push(`No activity planned for Day ${day.dayNumber}`));
  coverage
    .filter((day) => day.status === "Heavy")
    .forEach((day) => alerts.push(`Too many activities on Day ${day.dayNumber}`));

  activities.forEach((activity) => {
    const text = normalizeText(
      `${activity.title} ${activity.category} ${activity.time || ""}`
    );
    if (text.includes("night") || text.includes("late")) {
      alerts.push(`Late-night activity detected: ${activity.title}`);
    }
    if (Number(activity.fatigueScore || 0) >= 75) {
      alerts.push(`High fatigue activity cluster: ${activity.title}`);
    }
    if (text.includes("weather") || text.includes("outdoor")) {
      alerts.push(`Weather-sensitive activity: ${activity.title}`);
    }
  });

  return Array.from(new Set(alerts));
}

function categoryCounts(activities: ActivityReviewItem[]) {
  return activityCategories.map((category) => ({
    ...category,
    count: activities.filter((activity) => activity.category === category.key).length,
  }));
}

export default function ReviewActivityMaster({
  payload,
}: ReviewActivityMasterProps) {
  const activities = buildActivityItems(payload);
  const groups = groupedByCity(activities);
  const coverage = dayCoverage(payload, activities);
  const alerts = activityAlerts(coverage, activities);
  const addedToBooking = activities.filter(
    (activity) => activity.status === "Added to Booking"
  ).length;
  const itineraryOnly = activities.filter(
    (activity) => activity.status === "Itinerary Only"
  ).length;
  const pending = activities.filter((activity) => activity.status === "Pending").length;
  const highFit = activities.filter((activity) => Number(activity.fitScore || 0) >= 80)
    .length;
  const citiesCovered = Object.keys(groups).filter(
    (city) => city !== "Unassigned Activities"
  ).length;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Activity Coverage Validation Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            ACTIVITY MASTER REVIEW
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review all planned activities and experiences city-wise before
            booking.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Read-only activity validation
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-6">
        {[
          ["Total Activities", activities.length],
          ["Added to Booking", addedToBooking],
          ["Itinerary Only", itineraryOnly],
          ["Cities Covered", citiesCovered],
          ["High Fit Activities", highFit],
          ["Pending Activities", pending],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
              {label}
            </p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              City-wise Activity Grouping
            </p>
            <div className="mt-5 grid gap-5">
              {Object.keys(groups).length ? (
                Object.entries(groups).map(([city, cityActivities]) => (
                  <ReviewActivityCityGroup
                    key={city}
                    activities={cityActivities}
                    city={city}
                  />
                ))
              ) : (
                <p className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-black text-slate-500">
                  No activities selected yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Activity Category Review
            </p>
            <div className="mt-4 grid gap-3 xl:grid-cols-4">
              {categoryCounts(activities).map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.key}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <Icon size={18} className="text-[#4f46e5]" />
                    <p className="mt-2 text-sm font-black text-slate-950">
                      {category.key}
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {category.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <ReviewActivityCoverageSummary
          activities={activities}
          coverage={coverage}
        />
      </div>

      <div className="mt-6">
        <ReviewActivityGapAlert alerts={alerts} />
      </div>
    </section>
  );
}

"use client";

import {
  Bus,
  Car,
  Plane,
  Route,
  Sailboat,
  Train,
} from "lucide-react";

import ReviewTransportCoverageCard from "./ReviewTransportCoverageCard";
import ReviewTransportGapAlert from "./ReviewTransportGapAlert";
import ReviewTransportTimeline from "./ReviewTransportTimeline";
import type {
  TransportCoverageStatus,
  TransportMovement,
  TransportModeKey,
} from "./ReviewTransportCoverageCard";
import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type { TiyaDayPlan, TiyaTimelineItem } from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewTransportMasterProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type TransportDefinition = {
  aliases: string[];
  icon: typeof Plane;
  key: TransportModeKey;
  title: string;
};

const transportDefinitions: TransportDefinition[] = [
  { aliases: ["flight", "air", "airport"], icon: Plane, key: "flight", title: "Flights" },
  { aliases: ["train", "rail", "station"], icon: Train, key: "train", title: "Trains" },
  { aliases: ["bus", "coach"], icon: Bus, key: "bus", title: "Bus" },
  { aliases: ["cab", "taxi", "car", "self-drive", "local"], icon: Car, key: "cab", title: "Cab" },
  { aliases: ["cruise", "sail", "ship"], icon: Sailboat, key: "cruise", title: "Cruise" },
  { aliases: ["transfer", "pickup", "drop", "airport transfer", "station transfer"], icon: Route, key: "transfer", title: "Transfers" },
];

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value: unknown) {
  return String(value || "").toLowerCase();
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function valueFromItem(item: TiyaTimelineItem | WorkspaceBookingBasketItem) {
  const priceLike = item as TiyaTimelineItem & WorkspaceBookingBasketItem;
  return (
    Number(priceLike.estimatedTotal || 0) ||
    Number(priceLike.estimatedPrice || 0) ||
    Number(priceLike.price || 0) ||
    Number(priceLike.unitPrice || 0) ||
    undefined
  );
}

function dayById(days: TiyaDayPlan[]) {
  return days.reduce<Record<string, TiyaDayPlan>>((acc, day) => {
    acc[day.id] = day;
    return acc;
  }, {});
}

function inferMode(text: string): TransportModeKey {
  const normalized = normalizeText(text);
  const match = transportDefinitions.find((definition) =>
    definition.aliases.some((alias) => normalized.includes(alias))
  );
  return match?.key || "transfer";
}

function movementFromBasket(
  item: WorkspaceBookingBasketItem,
  daysById: Record<string, TiyaDayPlan>
): TransportMovement | null {
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
  const isTransport =
    item.serviceType === "flight" ||
    item.serviceType === "cab" ||
    text.includes("train") ||
    text.includes("bus") ||
    text.includes("cruise") ||
    text.includes("transfer");

  if (!isTransport) return null;

  const linkedDay = item.dayId ? daysById[item.dayId] : undefined;
  const mode = inferMode(text);

  return {
    city: item.city || linkedDay?.city || "",
    date: item.date || linkedDay?.date || "",
    day: item.day || linkedDay?.day,
    estimatedValue: valueFromItem(item),
    from: item.from || linkedDay?.city || "Origin",
    id: `basket-${item.id}`,
    mode,
    source: item.serviceLabel || item.serviceName || "Workspace",
    status: "Selected",
    time: item.time,
    title: item.title,
    to: item.to || item.finalDestination || item.city || "Destination",
    travellerCount: item.travellers,
  };
}

function movementFromTimeline(
  item: TiyaTimelineItem,
  day: TiyaDayPlan,
  selectedIds: Set<string>
): TransportMovement | null {
  const text = normalizeText(
    [
      item.type,
      item.category,
      item.serviceType,
      item.title,
      item.description,
      item.detailSummary,
    ].join(" ")
  );

  if (
    item.type !== "transport" &&
    !text.includes("flight") &&
    !text.includes("train") &&
    !text.includes("bus") &&
    !text.includes("cab") &&
    !text.includes("transfer") &&
    !text.includes("cruise")
  ) {
    return null;
  }

  const mode = inferMode(text);
  const selected = selectedIds.has(item.id) || selectedIds.has(`timeline:${item.id}`);
  const status: TransportCoverageStatus = selected
    ? "Selected"
    : item.bookingStatus === "recommended"
      ? "Recommended"
      : item.bookingStatus === "optional"
        ? "Pending"
        : "Recommended";

  return {
    city: item.location || day.city,
    date: item.date || day.date,
    day: day.day,
    estimatedValue: valueFromItem(item),
    from: item.from || day.city || "Origin",
    id: `timeline-${day.id}-${item.id}`,
    mode,
    source: item.providerName || item.serviceType || "Workspace",
    status,
    time: item.time,
    title: item.title,
    to: item.to || item.finalDestination || item.location || day.city || "Destination",
    travellerCount: item.travellers,
  };
}

function movementKey(movement: TransportMovement) {
  return [
    movement.mode,
    movement.from,
    movement.to,
    movement.day,
    movement.time,
    movement.title,
  ]
    .filter(Boolean)
    .join("|")
    .toLowerCase();
}

function buildMovements(payload: TiyaSmartPlannerReviewPayload) {
  const days = safeArray(payload.itinerary);
  const basketItems = safeArray(payload.selectedBasketItems);
  const selectedIds = new Set<string>();
  basketItems.forEach((item) => {
    selectedIds.add(item.id);
    if (item.sourceItemId) selectedIds.add(item.sourceItemId);
  });

  const fromTimeline = days.flatMap((day) =>
    safeArray(day.items)
      .map((item) => movementFromTimeline(item, day, selectedIds))
      .filter(Boolean)
  ) as TransportMovement[];
  const fromBasket = basketItems
    .map((item) => movementFromBasket(item, dayById(days)))
    .filter(Boolean) as TransportMovement[];
  const fromSelectedCabs = [
    ...safeArray(payload.selectedCabs),
    ...safeArray(payload.selectedTransfers),
  ]
    .map((item, index) => {
      const mode = inferMode(`${item.serviceType || ""} ${item.title || ""} cab transfer`);
      return {
        city: item.location,
        date: item.date,
        estimatedValue: valueFromItem(item),
        from: item.from || item.location || "Origin",
        id: `selected-transfer-${item.id || index}`,
        mode,
        source: item.providerName || "Transport Planning",
        status: item.bookingStatus === "selected" ? "Selected" : "Recommended",
        time: item.time,
        title: item.title,
        to: item.to || item.finalDestination || item.location || "Destination",
        travellerCount: item.travellers,
      } satisfies TransportMovement;
    });

  const seen = new Set<string>();
  return [...fromBasket, ...fromTimeline, ...fromSelectedCabs].filter((movement) => {
    const key = movementKey(movement);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function statusForMode(
  mode: TransportModeKey,
  movements: TransportMovement[],
  routeHasMode: boolean
): TransportCoverageStatus {
  const modeMovements = movements.filter((movement) => movement.mode === mode);
  if (modeMovements.some((movement) => movement.status === "Selected")) return "Selected";
  if (modeMovements.some((movement) => movement.status === "Recommended")) return "Recommended";
  if (modeMovements.some((movement) => movement.status === "Pending")) return "Pending";
  if (routeHasMode) return "Recommended";
  return "Missing";
}

function routeCities(payload: TiyaSmartPlannerReviewPayload) {
  return [
    payload.trip?.origin,
    ...safeArray(payload.itinerary).map((day) => day.city),
    payload.trip?.destination,
  ].filter(Boolean) as string[];
}

function buildGaps(payload: TiyaSmartPlannerReviewPayload, movements: TransportMovement[]) {
  const cities = routeCities(payload);
  const gaps: string[] = [];
  const hasIntercity = movements.some((movement) => movement.from && movement.to && movement.from !== movement.to);
  const hasTransfer = movements.some((movement) => movement.mode === "transfer" || movement.mode === "cab");

  if (cities.length > 1 && !hasIntercity) gaps.push("Intercity transport missing");
  if (cities.length > 0 && !hasTransfer) gaps.push("Hotel or local transfer missing");
  if (
    movements.some((movement) => normalizeText(movement.title).includes("airport")) &&
    !movements.some((movement) => normalizeText(movement.title).includes("hotel"))
  ) {
    gaps.push("Airport to hotel transfer requires attention");
  }
  if (
    movements.some((movement) => normalizeText(movement.title).includes("station")) &&
    !hasTransfer
  ) {
    gaps.push("Station transfer missing");
  }

  return Array.from(new Set(gaps));
}

function buildInsights(movements: TransportMovement[]) {
  const insights: string[] = [];
  const lateNight = movements.some((movement) =>
    /(?:2[0-3]|00|01):/.test(String(movement.time || ""))
  );
  const transportHeavyDays = movements.reduce<Record<number, number>>((acc, movement) => {
    if (!movement.day) return acc;
    acc[movement.day] = (acc[movement.day] || 0) + 1;
    return acc;
  }, {});

  if (lateNight) insights.push("Late night arrival or movement detected");
  if (Object.values(transportHeavyDays).some((count) => count >= 3)) {
    insights.push("Transport-heavy day detected");
  }
  if (new Set(movements.map((movement) => movement.mode)).size >= 3) {
    insights.push("Multiple transport changes across the trip");
  }
  if (movements.some((movement) => movement.status === "Pending")) {
    insights.push("Pending transfer requires traveller attention");
  }

  return insights;
}

function coverageStatus(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 40) return "Needs Review";
  return "Incomplete";
}

export default function ReviewTransportMaster({
  payload,
}: ReviewTransportMasterProps) {
  const movements = buildMovements(payload);
  const routeModeText = normalizeText(
    `${payload.route?.transportMode || ""} ${payload.preferences?.transportMode || ""}`
  );
  const modeSummary = transportDefinitions.map((definition) => ({
    ...definition,
    status: statusForMode(
      definition.key,
      movements,
      definition.aliases.some((alias) => routeModeText.includes(alias))
    ),
  }));
  const selectedCount = movements.filter((movement) => movement.status === "Selected").length;
  const recommendedCount = movements.filter((movement) => movement.status === "Recommended").length;
  const pendingCount = movements.filter((movement) => movement.status === "Pending").length;
  const missingCount = modeSummary.filter((mode) => mode.status === "Missing").length;
  const coverageScore = modeSummary.length
    ? Math.round(
        ((selectedCount * 1 + recommendedCount * 0.65 + pendingCount * 0.35) /
          Math.max(1, modeSummary.length)) *
          100
      )
    : 0;
  const gaps = buildGaps(payload, movements);
  const insights = buildInsights(movements);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Journey Mobility Validation Layer
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            TRANSPORT MASTER REVIEW
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review every transport movement across your journey and identify
            missing travel coverage before booking.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Read-only transport validation
        </div>
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-6">
        {modeSummary.map((mode) => {
          const Icon = mode.icon;
          return (
            <div key={mode.key} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">
              <Icon size={20} className="text-[#4f46e5]" />
              <p className="mt-3 text-sm font-black text-slate-950">{mode.title}</p>
              <span
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black ${
                  mode.status === "Selected"
                    ? "bg-emerald-50 text-emerald-700"
                    : mode.status === "Recommended"
                      ? "bg-blue-50 text-blue-700"
                      : mode.status === "Pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                }`}
              >
                {mode.status}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ReviewTransportTimeline
          movements={movements}
          routeStops={routeCities(payload)}
        />

        <aside className="grid gap-4 self-start">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Transport Readiness
            </p>
            <p className="mt-3 text-5xl font-black text-slate-950">
              {Math.min(100, coverageScore)}%
            </p>
            <p className="mt-2 rounded-full bg-[#eef2ff] px-3 py-1 text-sm font-black text-[#4f46e5]">
              Coverage Status: {coverageStatus(coverageScore)}
            </p>
            <div className="mt-5 grid gap-2">
              {[
                ["Selected Segments", selectedCount],
                ["Recommended Segments", recommendedCount],
                ["Pending Segments", pendingCount],
                ["Missing Segments", missingCount],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-xs font-bold text-slate-500">{label}</span>
                  <span className="text-sm font-black text-slate-950">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <ReviewTransportGapAlert gaps={gaps} />
        </aside>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        {transportDefinitions.map((definition) => (
          <ReviewTransportCoverageCard
            key={definition.key}
            definition={definition}
            movements={movements.filter((movement) => movement.mode === definition.key)}
            status={modeSummary.find((mode) => mode.key === definition.key)?.status || "Missing"}
          />
        ))}
      </div>

      {insights.length ? (
        <div className="mt-6 rounded-[1.75rem] border border-violet-100 bg-violet-50 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-700">
            Transport Intelligence Insights
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {insights.map((insight) => (
              <span key={insight} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-violet-700">
                {titleCase(insight)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

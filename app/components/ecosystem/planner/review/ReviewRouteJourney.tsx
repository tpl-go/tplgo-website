"use client";

import {
  BadgeIndianRupee,
  Clock3,
  Compass,
  MapPinned,
  Milestone,
  Route,
  ShieldCheck,
} from "lucide-react";

import type { WorkspaceBookingBasketItem } from "@/app/components/ecosystem/planner/workspace/utils/bookingBasket";
import type { TiyaSmartPlannerReviewPayload } from "@/app/lib/ecosystem/planner/plannerReviewPayload";
import type {
  TiyaDayPlan,
  TiyaTimelineDetailValue,
  TiyaTimelineItem,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type ReviewRouteJourneyProps = {
  payload: TiyaSmartPlannerReviewPayload;
};

type RouteStop = {
  city: string;
  day?: number;
  nightInfo?: string;
  transportMode?: string;
};

type RouteSegment = {
  cost?: number;
  distance?: string;
  duration?: string;
  from: string;
  mode?: string;
  title?: string;
  to: string;
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function formatCurrency(value?: number) {
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Not available";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function detailToString(value: TiyaTimelineDetailValue | undefined) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
}

function itemCost(item: TiyaTimelineItem | WorkspaceBookingBasketItem) {
  const priceLike = item as TiyaTimelineItem & WorkspaceBookingBasketItem;
  return (
    Number(priceLike.estimatedTotal || 0) ||
    Number(priceLike.estimatedPrice || 0) ||
    Number(priceLike.price || 0) ||
    Number(priceLike.unitPrice || 0) ||
    undefined
  );
}

function routeStopsFromPayload(payload: TiyaSmartPlannerReviewPayload): RouteStop[] {
  const itineraryStops = safeArray(payload.itinerary)
    .filter((day) => Boolean(day.city))
    .map((day) => {
      const dayWithReviewFields = day as TiyaDayPlan & {
        staySummary?: string;
      };

      return {
        city: day.city,
        day: day.day,
        nightInfo: dayWithReviewFields.staySummary || day.notes || undefined,
        transportMode:
          safeArray(day.items).find((item) => item.type === "transport")
            ?.serviceType ||
          payload.route?.transportMode ||
          payload.preferences?.transportMode,
      };
    });

  const rawStops: RouteStop[] = [
    payload.trip?.origin ? { city: payload.trip.origin, transportMode: payload.route?.transportMode } : null,
    ...itineraryStops,
    payload.trip?.destination
      ? { city: payload.trip.destination, transportMode: payload.route?.transportMode }
      : null,
  ].filter(Boolean) as RouteStop[];

  return rawStops.filter(
    (stop, index, list) =>
      index === 0 ||
      stop.city.toLowerCase() !== list[index - 1]?.city?.toLowerCase() ||
      stop.day !== list[index - 1]?.day
  );
}

function timelineTransportSegments(days: TiyaDayPlan[]): RouteSegment[] {
  return safeArray(days).flatMap((day) =>
    safeArray(day.items)
      .filter((item) => item.type === "transport")
      .map((item) => {
        const itemWithReviewFields = item as TiyaTimelineItem & {
          distance?: string;
          duration?: string;
        };
        const from =
          detailToString(item.details?.from) ||
          detailToString(item.details?.origin) ||
          item.from ||
          day.city ||
          "Origin";
        const to =
          detailToString(item.details?.to) ||
          detailToString(item.details?.destination) ||
          item.to ||
          item.location ||
          day.city ||
          "Destination";

        return {
          cost: itemCost(item),
          distance:
            detailToString(item.details?.distance) ||
            itemWithReviewFields.distance ||
            undefined,
          duration:
            detailToString(item.details?.duration) ||
            itemWithReviewFields.duration ||
            undefined,
          from,
          mode: item.serviceType || item.category || "Transport",
          title: item.title,
          to,
        };
      })
  );
}

function basketTransportSegments(items: WorkspaceBookingBasketItem[]): RouteSegment[] {
  return safeArray(items)
    .filter((item) => item.serviceType === "flight" || item.serviceType === "cab")
    .map((item) => ({
      cost: itemCost(item),
      distance: detailToString(item.details?.distance) || undefined,
      duration: detailToString(item.details?.duration) || item.meta || undefined,
      from: item.from || item.city || "Origin",
      mode: item.serviceLabel || item.serviceName || item.serviceType,
      title: item.title,
      to: item.to || item.finalDestination || item.city || "Destination",
    }));
}

function uniqueSegments(segments: RouteSegment[]) {
  const seen = new Set<string>();

  return segments.filter((segment) => {
    const key = `${segment.from}|${segment.to}|${segment.mode}|${segment.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function routeChips(payload: TiyaSmartPlannerReviewPayload) {
  const values = [
    payload.route?.routeType,
    payload.route?.selectedRouteVariant?.routeStyle,
    payload.preferences?.travelStyle,
    payload.trip?.travelStyle,
    payload.trip?.tripType,
    (payload as TiyaSmartPlannerReviewPayload & { bookingMode?: string }).bookingMode,
  ];

  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .map((value) => String(value).replace(/_/g, " "))
    )
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="shrink-0 text-[#4f46e5]" size={17} />
        <span className="min-w-0 break-words text-sm font-bold text-slate-500">
          {label}
        </span>
      </div>
      <span className="shrink-0 text-sm font-black text-slate-950">
        {value}
      </span>
    </div>
  );
}

export default function ReviewRouteJourney({ payload }: ReviewRouteJourneyProps) {
  const stops = routeStopsFromPayload(payload);
  const timelineSegments = timelineTransportSegments(safeArray(payload.itinerary));
  const basketSegments = basketTransportSegments(safeArray(payload.selectedBasketItems));
  const segments = uniqueSegments([...timelineSegments, ...basketSegments]);
  const transportModes = Array.from(
    new Set(
      [
        payload.route?.transportMode,
        payload.preferences?.transportMode,
        ...segments.map((segment) => segment.mode),
      ]
        .filter(Boolean)
        .map(String)
    )
  );
  const totalDestinations = Array.from(
    new Set(stops.map((stop) => stop.city).filter(Boolean))
  ).length;
  const chips = routeChips(payload);
  const healthScore = payload.plannerAudit?.healthScore;
  const confidenceScore = payload.plannerAudit?.bookingConfidenceScore;
  const routeVariant = payload.route?.name || payload.route?.selectedRouteVariant?.name;
  const selectedRouteVariant = payload.route?.selectedRouteVariant as
    | (NonNullable<TiyaSmartPlannerReviewPayload["route"]>["selectedRouteVariant"] & {
        description?: string;
        bestFor?: string;
      })
    | undefined;
  const routeStrategy =
    selectedRouteVariant?.description ||
    selectedRouteVariant?.bestFor ||
    payload.route?.routeType ||
    "Strategy not available";

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/70 p-6 shadow-[0_18px_54px_rgba(15,23,42,0.06)]">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4f46e5]">
            Route Review
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            Visual Route Journey
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
            Review the route flow, travel segments and selected route strategy
            before booking.
          </p>
        </div>
        <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500 xl:block">
          Existing payload visualization
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Route Flow Timeline
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {payload.trip?.origin || "Origin"} to{" "}
                {payload.trip?.destination || "Destination"}
              </h3>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
              <MapPinned size={22} />
            </span>
          </div>

          {stops.length ? (
            <div className="mt-6 grid gap-0">
              {stops.map((stop, index) => (
                <div key={`${stop.city}-${stop.day || index}`} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
                  <div className="flex flex-col items-center">
                    <span className="mt-2 h-4 w-4 rounded-full border-4 border-white bg-gradient-to-r from-[#2563eb] to-[#7c3aed] shadow-[0_0_0_1px_rgba(79,70,229,0.22)]" />
                    {index < stops.length - 1 ? (
                      <span className="h-full min-h-16 w-px bg-gradient-to-b from-[#4f46e5]/60 to-slate-200" />
                    ) : null}
                  </div>
                  <div className="min-w-0 pb-5">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="break-words text-lg font-black text-slate-950">
                            {stop.city}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            {stop.day ? `Day ${String(stop.day).padStart(2, "0")}` : "Route stop"}
                            {stop.nightInfo ? ` · ${stop.nightInfo}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full border border-white bg-white px-3 py-1 text-xs font-black text-[#4f46e5]">
                          {stop.transportMode || "Mode pending"}
                        </span>
                      </div>
                    </div>

                    {segments[index] ? (
                      <div className="mx-5 mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                          Segment
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-950">
                          {segments[index].from} &rarr; {segments[index].to}
                        </p>
                        <div className="mt-2 grid gap-2 md:grid-cols-4">
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {segments[index].mode || "Mode pending"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {segments[index].distance || "Distance pending"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {segments[index].duration || "Duration pending"}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600">
                            {formatCurrency(segments[index].cost)}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <Milestone className="mx-auto text-slate-400" size={32} />
              <p className="mt-3 text-sm font-black text-slate-700">
                Route details will appear here once available.
              </p>
            </div>
          )}
        </article>

        <aside className="self-start rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_54px_rgba(15,23,42,0.07)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                Route Intelligence Summary
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {routeVariant || "Selected route"}
              </h3>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-700">
              <Compass size={22} />
            </span>
          </div>

          <p className="mt-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
            {routeStrategy}
          </p>

          <div className="mt-5 grid gap-3">
            <MetricRow
              icon={Route}
              label="Selected route type"
              value={payload.route?.routeType || payload.route?.selectedRouteVariant?.routeStyle || "Not available"}
            />
            <MetricRow
              icon={MapPinned}
              label="Total destinations"
              value={totalDestinations}
            />
            <MetricRow
              icon={Milestone}
              label="Route segments"
              value={segments.length}
            />
            <MetricRow
              icon={Route}
              label="Total distance"
              value={payload.route?.distance || "Not available"}
            />
            <MetricRow
              icon={Clock3}
              label="Total travel time"
              value={payload.route?.duration || "Not available"}
            />
            <MetricRow
              icon={ShieldCheck}
              label="Route health / risk"
              value={
                healthScore
                  ? `${healthScore}%`
                  : payload.plannerAudit?.finalVerdict || "Not available"
              }
            />
            <MetricRow
              icon={BadgeIndianRupee}
              label="Comfort / confidence"
              value={confidenceScore ? `${confidenceScore}%` : "Not available"}
            />
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Transport modes used
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {transportModes.length ? (
                transportModes.map((mode) => (
                  <span
                    key={mode}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700"
                  >
                    {mode}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                  Not available
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Strategy chips
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {chips.length ? (
                chips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700"
                  >
                    {chip}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                  Strategy not available
                </span>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

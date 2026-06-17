"use client";
import {
  AlertTriangle,
  BedDouble,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  MapPinned,
  Plane,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import type {
  TiyaBookingModule,
  TiyaDayPlan,
  TiyaGeneratedPlan,
  TiyaRouteOption,
  TiyaTimelineItem,
  TiyaTripIntent,
} from "@/app/lib/ecosystem/planner/plannerTypes";

type SmartPlannerChangeHistoryItem = {
  appliedAt?: string;
  costDelta?: number;
  diffs?: Array<{ label: string; previousValue: string; nextValue: string }>;
  summary?: string;
  title: string;
};

type TiyaBookingReadyLayerProps = {
  modules?: TiyaBookingModule[] | null;
  intent?: TiyaTripIntent;
  plan?: TiyaGeneratedPlan;
  days?: TiyaDayPlan[];
  selectedRoute?: TiyaRouteOption;
  changeHistory?: SmartPlannerChangeHistoryItem[];
  isGenerating?: boolean;
  onProceedToBook?: (serviceName: string) => void;
};

const iconMap = {
  flights: Plane,
  hotels: BedDouble,
  homestays: BedDouble,
  cabs: Car,
  packages: BriefcaseBusiness,
  experiences: Ticket,
  insurance: ShieldCheck,
  "local-market": MapPinned,
};

const serviceStorageKeys: Record<TiyaBookingModule["id"], string> = {
  flights: "tpl_smart_planner_flight_search_v1",
  hotels: "tpl_smart_planner_hotel_search_v1",
  homestays: "tpl_smart_planner_homestay_search_v1",
  cabs: "tpl_smart_planner_cab_search_v1",
  packages: "tpl_smart_planner_package_search_v1",
  experiences: "tpl_smart_planner_activity_search_v1",
  insurance: "tpl_smart_planner_insurance_search_v1",
  "local-market": "tpl_smart_planner_market_search_v1",
};

function localLifeLabel(text?: string) {
  return String(text || "")
    .replace(/Local Market Picks/g, "Local Life")
    .replace(/Local Market/g, "Local Life")
    .replace(/local market/g, "Local Life");
}

function dateParam(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function travellerCount(intent?: TiyaTripIntent, plan?: TiyaGeneratedPlan) {
  const fromIntent =
    Number(intent?.adults || 0) +
    Number(intent?.children || 0) +
    Number(intent?.seniors || 0);

  return fromIntent || Number(plan?.travellerCount || 0) || 1;
}

function roomCount(intent?: TiyaTripIntent, days?: TiyaDayPlan[]) {
  const itineraryRooms =
    days
      ?.flatMap((day) => day.items || [])
      .map((item) => Number(item.rooms || 0))
      .filter((rooms) => rooms > 0)
      .sort((a, b) => b - a)[0] || 0;

  return itineraryRooms || Math.max(1, Math.ceil(travellerCount(intent) / 2));
}

function budgetAmount(plan?: TiyaGeneratedPlan, label?: string) {
  if (!label) return 0;
  return (
    plan?.budgetLines?.find((line) =>
      line.label.toLowerCase().includes(label.toLowerCase())
    )?.amount || 0
  );
}

function serviceMissingFields(module: TiyaBookingModule, intent?: TiyaTripIntent) {
  const missing: string[] = [];
  const needsOrigin = module.id === "flights" || module.id === "cabs";
  const needsDestination = true;
  const needsStart = module.id !== "local-market";
  const needsEnd =
    module.id === "hotels" ||
    module.id === "homestays" ||
    module.id === "packages" ||
    module.id === "insurance";

  if (needsOrigin && !intent?.fromCity) missing.push("origin");
  if (needsDestination && !intent?.toCity) missing.push("destination");
  if (needsStart && !intent?.startDate) missing.push("travel date");
  if (needsEnd && !intent?.endDate) missing.push("return/check-out date");
  if (travellerCount(intent) <= 0) missing.push("travellers");

  return missing;
}

function itemsByType(days: TiyaDayPlan[] | undefined, type: TiyaTimelineItem["type"]) {
  return (days || [])
    .flatMap((day) =>
      (day.items || []).map((item) => ({
        ...item,
        day: day.day,
        date: day.date,
        city: day.city,
      }))
    )
    .filter((item) => item.type === type);
}

function buildHandoffPayload({
  changeHistory = [],
  days = [],
  intent,
  plan,
  selectedRoute,
}: {
  changeHistory?: SmartPlannerChangeHistoryItem[];
  days?: TiyaDayPlan[];
  intent?: TiyaTripIntent;
  plan?: TiyaGeneratedPlan;
  selectedRoute?: TiyaRouteOption;
}) {
  const safeDays = Array.isArray(days) ? days : plan?.days || [];
  const transportItems = itemsByType(safeDays, "transport");
  const stayItems = itemsByType(safeDays, "stay");
  const activityItems = itemsByType(safeDays, "activity");
  const routeSegments = transportItems.map((item) => ({
    day: item.day,
    date: item.date,
    from: item.from || item.location || item.city,
    to: item.to || item.finalDestination || intent?.toCity || item.city,
    title: item.title,
    transportMode: item.serviceType || intent?.transportMode,
    price: item.price || item.unitPrice || 0,
  }));
  const serviceReadiness = {
    activitiesRecommended: Boolean(activityItems.length || intent?.interests?.length),
    cabRequired: ["Cab", "Self-drive Car", "EV", "Mixed Mode"].includes(intent?.transportMode || ""),
    flightsRecommended: ["Flight", "Mixed Mode"].includes(intent?.transportMode || ""),
    hotelRequired: Boolean(intent?.smartPreferences?.includeStays && intent.stayPreference === "Hotel"),
    homestayRequired: Boolean(intent?.smartPreferences?.includeStays && intent.stayPreference === "Homestay"),
    insuranceRecommended: Boolean(intent?.smartPreferences?.includeInsurance),
    localMarketEnabled: Boolean(intent?.smartPreferences?.includeLocalMarket),
    packageRecommended: Boolean(intent?.tripType === "Multi-city" || intent?.travelStyle === "Family"),
  };
  const totalDays = safeDays.length || (Number(plan?.nights || 0) > 0 ? Number(plan?.nights || 0) + 1 : 0);

  return {
    source: "smart-planner",
    createdAt: new Date().toISOString(),
    tripCore: {
      budgetPreference: intent?.customBudgetAmount || intent?.budgetTier || "",
      destination: intent?.toCity || plan?.routeStops?.at(-1)?.city || "",
      endDate: dateParam(intent?.endDate),
      origin: intent?.fromCity || "",
      rooms: roomCount(intent, safeDays),
      startDate: dateParam(intent?.startDate),
      totalDays,
      travellerType: intent?.travelStyle || "",
      travellers: {
        adults: intent?.adults || 0,
        children: intent?.children || 0,
        seniors: intent?.seniors || 0,
        total: travellerCount(intent, plan),
      },
      tripStyle: intent?.travelStyle || intent?.tripType || "",
    },
    selectedRoute: {
      activeRouteId: selectedRoute?.id || "",
      distance: selectedRoute?.distance || "",
      duration: selectedRoute?.duration || "",
      routeName: selectedRoute?.name || plan?.routeTitle || "",
      routeSegments,
      routeType: selectedRoute?.routeStyle || "",
      transferPlan: transportItems,
      transportMode: intent?.transportMode || "",
    },
    selectedItinerary: {
      appliedOptimizations: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("optimization")
      ),
      dayWiseItinerary: safeDays,
      includedVsUpgradedItems: safeDays.flatMap((day) =>
        (day.items || []).map((item) => ({
          day: day.day,
          id: item.id,
          status: item.bookingStatus || "available",
          title: item.title,
          type: item.type,
        }))
      ),
      riskFixes: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("risk")
      ),
      selectedActivities: activityItems,
      selectedPlaces: Array.from(
        new Set(
          safeDays.flatMap((day) => [
            day.city,
            ...(day.items || []).map((item) => item.location).filter(Boolean),
          ])
        )
      ),
      selectedStays: stayItems,
      selectedTransfers: transportItems,
      weatherAdjustments: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("weather")
      ),
    },
    pricingBudget: {
      activityCost: budgetAmount(plan, "activit"),
      appliedSavings: changeHistory
        .map((change) => Number(change.costDelta || 0))
        .filter((value) => value < 0)
        .reduce((sum, value) => sum + Math.abs(value), 0),
      baseBudget: intent?.customBudgetAmount || intent?.budgetTier || "",
      finalPlannerEstimate: plan?.totalBudget || 0,
      localTravelCost: budgetAmount(plan, "local"),
      optimizationSavings: changeHistory
        .filter((change) => change.title.toLowerCase().includes("optimization"))
        .reduce((sum, change) => sum + Math.abs(Math.min(0, Number(change.costDelta || 0))), 0),
      stayCost: budgetAmount(plan, "stay"),
      totalEstimatedCost: plan?.totalBudget || 0,
      transportCost: budgetAmount(plan, "transport"),
    },
    serviceReadiness,
    changeHistory: {
      budgetChanges: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("budget")
      ),
      costOptimizationChanges: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("optimization")
      ),
      riskFixes: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("risk")
      ),
      routeChanges: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("route")
      ),
      weatherChanges: changeHistory.filter((change) =>
        change.title.toLowerCase().includes("weather")
      ),
    },
  };
}

function buildServicePayload(
  module: TiyaBookingModule,
  payload: ReturnType<typeof buildHandoffPayload>
) {
  const servicePayload = {
    source: "smart-planner",
    service: module.id,
    module,
    tripCore: payload.tripCore,
    selectedRoute: payload.selectedRoute,
    pricingBudget: payload.pricingBudget,
    readiness: payload.serviceReadiness,
  };

  if (module.id === "flights") {
    return {
      ...servicePayload,
      search: {
        date: payload.tripCore.startDate,
        destination: payload.tripCore.destination,
        origin: payload.tripCore.origin,
        travellers: payload.tripCore.travellers,
        tripType: "planner-flight-search",
      },
    };
  }

  if (module.id === "hotels" || module.id === "homestays") {
    return {
      ...servicePayload,
      search: {
        checkIn: payload.tripCore.startDate,
        checkOut: payload.tripCore.endDate,
        destination: payload.tripCore.destination,
        rooms: payload.tripCore.rooms,
        travellers: payload.tripCore.travellers,
        stays: payload.selectedItinerary.selectedStays,
      },
    };
  }

  if (module.id === "cabs") {
    return {
      ...servicePayload,
      search: {
        routeSegments: payload.selectedRoute.routeSegments,
        transferPlan: payload.selectedRoute.transferPlan,
        transportMode: payload.selectedRoute.transportMode,
      },
    };
  }

  if (module.id === "packages") {
    return {
      ...servicePayload,
      search: {
        dates: { endDate: payload.tripCore.endDate, startDate: payload.tripCore.startDate },
        destination: payload.tripCore.destination,
        itinerary: payload.selectedItinerary.dayWiseItinerary,
        travellers: payload.tripCore.travellers,
      },
    };
  }

  if (module.id === "experiences") {
    return {
      ...servicePayload,
      search: {
        activities: payload.selectedItinerary.selectedActivities,
        dates: { endDate: payload.tripCore.endDate, startDate: payload.tripCore.startDate },
        destination: payload.tripCore.destination,
        interests: payload.selectedItinerary.selectedPlaces,
      },
    };
  }

  if (module.id === "insurance") {
    return {
      ...servicePayload,
      search: {
        dates: { endDate: payload.tripCore.endDate, startDate: payload.tripCore.startDate },
        destination: payload.tripCore.destination,
        travellers: payload.tripCore.travellers,
        tripType: payload.tripCore.tripStyle,
      },
    };
  }

  return {
    ...servicePayload,
    search: {
      destination: payload.tripCore.destination,
      itineraryPlaces: payload.selectedItinerary.selectedPlaces,
      travellerInterests: payload.selectedItinerary.selectedActivities.map((item) => item.title),
    },
  };
}

function serviceSendSummary(module: TiyaBookingModule, payload: ReturnType<typeof buildHandoffPayload>) {
  if (module.id === "flights") {
    return [
      `${payload.tripCore.origin || "Origin"} → ${payload.tripCore.destination || "Destination"}`,
      `Date: ${payload.tripCore.startDate || "Missing"}`,
      `Travellers: ${payload.tripCore.travellers.total}`,
      "Source: Smart Planner",
    ];
  }

  if (module.id === "hotels" || module.id === "homestays") {
    return [
      `Destination: ${payload.tripCore.destination || "Missing"}`,
      `Check-in: ${payload.tripCore.startDate || "Missing"}`,
      `Check-out: ${payload.tripCore.endDate || "Missing"}`,
      `Rooms: ${payload.tripCore.rooms}`,
    ];
  }

  if (module.id === "cabs") {
    return [
      `Route segments: ${payload.selectedRoute.routeSegments.length}`,
      `Transport: ${payload.selectedRoute.transportMode || "Missing"}`,
      `Route: ${payload.selectedRoute.routeName || "Current planner route"}`,
    ];
  }

  if (module.id === "packages") {
    return [
      `Destination: ${payload.tripCore.destination || "Missing"}`,
      `Days: ${payload.tripCore.totalDays}`,
      `Itinerary items: ${payload.selectedItinerary.includedVsUpgradedItems.length}`,
    ];
  }

  if (module.id === "experiences") {
    return [
      `Destination: ${payload.tripCore.destination || "Missing"}`,
      `Activities: ${payload.selectedItinerary.selectedActivities.length}`,
      `Places: ${payload.selectedItinerary.selectedPlaces.slice(0, 2).join(", ") || "Planner places"}`,
    ];
  }

  if (module.id === "insurance") {
    return [
      `Destination: ${payload.tripCore.destination || "Missing"}`,
      `Dates: ${payload.tripCore.startDate || "Missing"} → ${payload.tripCore.endDate || "Missing"}`,
      `Travellers: ${payload.tripCore.travellers.total}`,
    ];
  }

  return [
    `Destination: ${payload.tripCore.destination || "Missing"}`,
    `Places: ${payload.selectedItinerary.selectedPlaces.length}`,
    `Source: Smart Planner`,
  ];
}

export default function TiyaBookingReadyLayer({
  modules = [],
  intent,
  plan,
  days,
  selectedRoute,
  changeHistory = [],
  isGenerating = false,
  onProceedToBook,
}: TiyaBookingReadyLayerProps) {
  const safeModules = Array.isArray(modules) ? modules : [];
  const readyCount = safeModules.filter((module) => module.isHighlighted).length;
  const handoffPayload = buildHandoffPayload({
    changeHistory,
    days,
    intent,
    plan,
    selectedRoute,
  });

  function storeHandoff(module: TiyaBookingModule) {
    if (typeof window === "undefined") return;

    const servicePayload = buildServicePayload(module, handoffPayload);
    window.sessionStorage.setItem(
      "tpl_smart_planner_handoff_v1",
      JSON.stringify(handoffPayload)
    );
    window.sessionStorage.setItem(
      serviceStorageKeys[module.id],
      JSON.stringify(servicePayload)
    );

    if (process.env.NODE_ENV === "development") {
      console.log("TPL Smart Planner Handoff Payload", handoffPayload);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/80 bg-[#061839]/95 text-white shadow-[0_22px_80px_rgba(6,24,57,0.2)] backdrop-blur-xl">
      <div className="relative border-b border-white/10 bg-[#061839]/95 p-4 text-white sm:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(249,115,22,0.18),transparent_26%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
              <Sparkles
                size={15}
                className={isGenerating ? "animate-pulse" : undefined}
              />
              Booking-ready handoff layer
            </div>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Ready to Book with TPL
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-white/70">
              Carries the selected Smart Planner route, itinerary, dates,
              travellers, pricing and readiness data into existing TPL service
              flows.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-cyan-100">
            {readyCount} matched module{readyCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-3 sm:p-5 md:grid-cols-2 xl:grid-cols-4">
        {safeModules.map((module) => {
          const Icon = iconMap[module.id];
          const missing = serviceMissingFields(module, intent);
          const isReady = missing.length === 0;
          const summary = serviceSendSummary(module, handoffPayload);

          return (
            <article
              key={module.id}
              className={`flex min-h-[330px] flex-col rounded-3xl border p-4 transition ${
                module.isHighlighted
                  ? "border-orange-300/25 bg-orange-400/10 shadow-[0_14px_38px_rgba(249,115,22,0.16)]"
                  : "border-white/10 bg-white/[0.07]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                    module.isHighlighted
                      ? "bg-orange-500 text-white"
                      : "bg-blue-950 text-white"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${
                  isReady
                    ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                    : "border-orange-300/20 bg-orange-400/10 text-orange-100"
                }`}>
                  {isReady ? module.readiness : "Review"}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-white">
                {localLifeLabel(module.serviceName)}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/65">
                {localLifeLabel(module.reason)}
              </p>

              <div className={`mt-3 rounded-2xl border p-3 text-xs font-bold leading-5 ${
                isReady
                  ? "border-emerald-100 bg-emerald-50 text-emerald-800"
                  : "border-orange-100 bg-orange-50 text-orange-800"
              }`}>
                <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em]">
                  {isReady ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                  {isReady ? "Ready handoff" : "Missing fields"}
                </div>
                {isReady
                  ? `Ready because required planner data is available for ${localLifeLabel(module.serviceName).toLowerCase()}.`
                  : `Missing ${missing.join(", ")}.`}
              </div>

              <div className="mt-3 flex-1 rounded-2xl border border-white/10 bg-white/10 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                  Will send
                </p>
                <div className="mt-2 grid gap-1.5">
                  {summary.map((line) => (
                    <p key={line} className="text-xs font-bold leading-5 text-white/68">
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {isReady ? (
                <button
                  type="button"
                  onClick={() => {
                    storeHandoff(module);
                    onProceedToBook?.(localLifeLabel(module.serviceName));
                  }}
                  className={`mt-4 inline-flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-black transition ${
                    module.isHighlighted
                      ? "bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] text-white shadow-[0_10px_26px_rgba(249,115,22,0.28)]"
                      : "border border-white/10 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  Proceed to Book
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="mt-4 inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-black text-slate-500"
                >
                  Complete Trip Details
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

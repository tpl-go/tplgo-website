"use client";

import { useMemo, useState } from "react";
import {
  Plane,
  Hotel,
  Car,
  UtensilsCrossed,
  Ticket,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  CheckCircle2,
} from "lucide-react";

type PackageFeatures = {
  flights?: number;
  hotels?: number;
  transfers?: number;
  activities?: number;
  meals?: number;
};

type DayItem = {
  day: number;
  title: string;
  items: string[];
  dateLabel?: string;
  included?: {
    flights?: number;
    hotels?: number;
    transfers?: number;
    activities?: number;
    meals?: number;
  };
};

type FlightItem = {
  airline?: string;
  flightNumber?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  fareDiff?: number;
};

type HotelItem = {
  hotelName?: string;
  roomType?: string;
  city?: string;
  mealPlan?: string;
  starRating?: number;
  fareDiff?: number;
};

type TransferItem = {
  title?: string;
  vehicleType?: string;
  subtitle?: string;
  fareDiff?: number;
};

type MealItem = {
  title?: string;
  description?: string;
  fareDiff?: number;
};

type ActivityItem = {
  title?: string;
  description?: string;
  category?: string;
  fareDiff?: number;
};

type PackageSelectionStateShape = {
  selectedFlights?: FlightItem[];
  selectedHotels?: HotelItem[];
  selectedTransfers?: TransferItem[];
  selectedMeals?: MealItem[];
  selectedActivities?: ActivityItem[];
};

interface BookingItinerarySectionProps {
  features: PackageFeatures;
  dayPlans: DayItem[];
  exclusions?: string[];
  initiallyOpen?: boolean;
  packageSelectionState?: PackageSelectionStateShape | null;
  includedFlightLabels?: string[];
  includedHotelLabels?: string[];
  includedTransferLabels?: string[];
  includedMealLabels?: string[];
  includedActivityLabels?: string[];
  travelDate?: string;
}

type DayServiceBlock = {
  type: "flight" | "hotel" | "transfer" | "meal" | "activity";
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
};

function normalizeItemText(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    if (typeof v.title === "string") return v.title;
    if (typeof v.name === "string") return v.name;
    if (typeof v.label === "string") return v.label;
  }
  return "";
}

function isValidDate(value?: string) {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime());
}

function isGenericDayLabel(value?: string) {
  if (!value) return false;
  return /^day\s*\d+$/i.test(value.trim());
}

function formatDayDate(baseDate: string, dayOffset: number) {
  if (!isValidDate(baseDate)) return "";
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function detectServicesFromItems(items: string[]) {
  const text = items.join(" ").toLowerCase();

  return {
    hasFlight:
      text.includes("flight") ||
      text.includes("arrival") ||
      text.includes("departure"),

    hasHotel:
      text.includes("hotel") ||
      text.includes("check-in") ||
      text.includes("check in") ||
      text.includes("stay") ||
      text.includes("resort"),

    hasTransfer:
      text.includes("transfer") ||
      text.includes("pickup") ||
      text.includes("drop") ||
      text.includes("cab") ||
      text.includes("vehicle"),

    hasMeal:
      text.includes("meal") ||
      text.includes("breakfast") ||
      text.includes("lunch") ||
      text.includes("dinner"),

    hasActivity:
      text.includes("activity") ||
      text.includes("sightseeing") ||
      text.includes("tour") ||
      text.includes("excursion") ||
      text.includes("experience"),
  };
}

function getIconByType(type: DayServiceBlock["type"]) {
  if (type === "flight") return <Plane size={16} className="text-blue-600" />;
  if (type === "hotel") return <Hotel size={16} className="text-indigo-600" />;
  if (type === "transfer") return <Car size={16} className="text-cyan-600" />;
  if (type === "meal") {
    return <UtensilsCrossed size={16} className="text-amber-600" />;
  }
  return <Ticket size={16} className="text-emerald-600" />;
}

function getTimelineDescription(item: string) {
  const text = item.toLowerCase();

  if (text.includes("arrival"))
    return "Arrival assistance and onboarding for the journey.";
  if (text.includes("departure"))
    return "Departure coordination and final movement planning.";
  if (text.includes("flight"))
    return "Flight movement as per selected route and timing.";
  if (
    text.includes("transfer") ||
    text.includes("pickup") ||
    text.includes("drop")
  ) {
    return "Transfer movement as per current itinerary flow.";
  }
  if (
    text.includes("hotel") ||
    text.includes("check-in") ||
    text.includes("stay")
  ) {
    return "Hotel stay and check-in flow for this stage.";
  }
  if (
    text.includes("meal") ||
    text.includes("breakfast") ||
    text.includes("lunch") ||
    text.includes("dinner")
  ) {
    return "Meal service aligned with selected meal coverage.";
  }
  if (
    text.includes("activity") ||
    text.includes("sightseeing") ||
    text.includes("tour")
  ) {
    return "Experience or sightseeing planned for this stage.";
  }

  return "Planned itinerary movement as per package flow.";
}

function pickOneOrMany<T>(items: T[], maxCount: number) {
  if (!Array.isArray(items) || items.length === 0 || maxCount <= 0) return [];
  return items.slice(0, maxCount);
}

function mapFlightBlocks(
  selectedFlights: FlightItem[],
  includedFlightLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedFlights, count);

  if (selected.length > 0) {
    return selected.map((flight, index) => {
      const route =
        flight.from && flight.to ? `${flight.from} → ${flight.to}` : "";
      const timing =
        flight.departureTime && flight.arrivalTime
          ? `${flight.departureTime} - ${flight.arrivalTime}`
          : flight.departureTime || flight.arrivalTime || "";

      return {
        type: "flight",
        title: flight.airline || `Flight ${index + 1}`,
        subtitle: flight.flightNumber || undefined,
        meta: [timing, route, flight.duration].filter(Boolean).join(" • "),
        badge: "Selected",
      };
    });
  }

  return includedFlightLabels.slice(0, count).map((label) => ({
    type: "flight",
    title: label,
    badge: "Included",
  }));
}

function mapHotelBlocks(
  selectedHotels: HotelItem[],
  includedHotelLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedHotels, count);

  if (selected.length > 0) {
    return selected.map((hotel, index) => ({
      type: "hotel",
      title: hotel.hotelName || `Hotel ${index + 1}`,
      subtitle:
        typeof hotel.starRating === "number"
          ? `${hotel.starRating} Star Stay`
          : undefined,
      meta: [hotel.roomType, hotel.city, hotel.mealPlan]
        .filter(Boolean)
        .join(" • "),
      badge: "Selected",
    }));
  }

  return includedHotelLabels.slice(0, count).map((label) => ({
    type: "hotel",
    title: label,
    badge: "Included",
  }));
}

function mapTransferBlocks(
  selectedTransfers: TransferItem[],
  includedTransferLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedTransfers, count);

  if (selected.length > 0) {
    return selected.map((transfer, index) => ({
      type: "transfer",
      title: transfer.title || `Transfer ${index + 1}`,
      meta: [transfer.vehicleType, transfer.subtitle]
        .filter(Boolean)
        .join(" • "),
      badge: "Selected",
    }));
  }

  return includedTransferLabels.slice(0, count).map((label) => ({
    type: "transfer",
    title: label,
    badge: "Included",
  }));
}

function mapMealBlocks(
  selectedMeals: MealItem[],
  includedMealLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedMeals, count);

  if (selected.length > 0) {
    return selected.map((meal, index) => ({
      type: "meal",
      title: meal.title || `Meal ${index + 1}`,
      meta: meal.description || "",
      badge: "Selected",
    }));
  }

  return includedMealLabels.slice(0, count).map((label) => ({
    type: "meal",
    title: label,
    badge: "Included",
  }));
}

function mapActivityBlocks(
  selectedActivities: ActivityItem[],
  includedActivityLabels: string[],
  count: number
): DayServiceBlock[] {
  if (count <= 0) return [];

  const selected = pickOneOrMany(selectedActivities, count);

  if (selected.length > 0) {
    return selected.map((activity, index) => ({
      type: "activity",
      title: activity.title || `Activity ${index + 1}`,
      meta: [activity.category, activity.description]
        .filter(Boolean)
        .join(" • "),
      badge: "Selected",
    }));
  }

  return includedActivityLabels.slice(0, count).map((label) => ({
    type: "activity",
    title: label,
    badge: "Included",
  }));
}

export default function BookingItinerarySection({
  features,
  dayPlans,
  exclusions = [],
  initiallyOpen = true,
  packageSelectionState,
  includedFlightLabels = [],
  includedHotelLabels = [],
  includedTransferLabels = [],
  includedMealLabels = [],
  includedActivityLabels = [],
  travelDate = "",
}: BookingItinerarySectionProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const selectedFlights = packageSelectionState?.selectedFlights || [];
  const selectedHotels = packageSelectionState?.selectedHotels || [];
  const selectedTransfers = packageSelectionState?.selectedTransfers || [];
  const selectedMeals = packageSelectionState?.selectedMeals || [];
  const selectedActivities = packageSelectionState?.selectedActivities || [];

  const normalizedDays = useMemo(() => {
    return (dayPlans || []).map((day, dayIndex) => {
      const safeDayNumber =
        typeof day?.day === "number" && !Number.isNaN(day.day)
          ? day.day
          : dayIndex + 1;

      const cleanItems = (day.items || [])
        .map((item) => normalizeItemText(item))
        .filter(Boolean);

      const detected = detectServicesFromItems(cleanItems);

      const includedFlights = Number(day.included?.flights || 0);
      const includedHotels = Number(day.included?.hotels || 0);
      const includedTransfers = Number(day.included?.transfers || 0);
      const includedMeals = Number(day.included?.meals || 0);
      const includedActivities = Number(day.included?.activities || 0);

      const flightCount =
        includedFlights > 0 ? includedFlights : detected.hasFlight ? 1 : 0;

      const hotelCount =
        includedHotels > 0 ? includedHotels : detected.hasHotel ? 1 : 0;

      const transferCount =
        includedTransfers > 0 ? includedTransfers : detected.hasTransfer ? 1 : 0;

      const mealCount =
        includedMeals > 0 ? includedMeals : detected.hasMeal ? 1 : 0;

      const activityCount =
        includedActivities > 0
          ? includedActivities
          : detected.hasActivity
          ? 1
          : 0;

      const serviceBlocks: DayServiceBlock[] = [
        ...(flightCount > 0
          ? mapFlightBlocks(selectedFlights, includedFlightLabels, flightCount)
          : []),
        ...(hotelCount > 0
          ? mapHotelBlocks(selectedHotels, includedHotelLabels, hotelCount)
          : []),
        ...(transferCount > 0
          ? mapTransferBlocks(
              selectedTransfers,
              includedTransferLabels,
              transferCount
            )
          : []),
        ...(mealCount > 0
          ? mapMealBlocks(selectedMeals, includedMealLabels, mealCount)
          : []),
        ...(activityCount > 0
          ? mapActivityBlocks(
              selectedActivities,
              includedActivityLabels,
              activityCount
            )
          : []),
      ];

      const rawDateLabel =
        typeof day.dateLabel === "string" ? day.dateLabel.trim() : "";

      const finalDateLabel =
        rawDateLabel && !isGenericDayLabel(rawDateLabel)
          ? rawDateLabel
          : travelDate && isValidDate(travelDate)
          ? formatDayDate(travelDate, safeDayNumber - 1)
          : "";

      return {
        ...day,
        day: safeDayNumber,
        dayKey: `day-${safeDayNumber}-${dayIndex}`,
        cleanItems,
        serviceBlocks,
        finalDateLabel,
      };
    });
  }, [
    dayPlans,
    selectedFlights,
    selectedHotels,
    selectedTransfers,
    selectedMeals,
    selectedActivities,
    includedFlightLabels,
    includedHotelLabels,
    includedTransferLabels,
    includedMealLabels,
    includedActivityLabels,
    travelDate,
  ]);

  return (
    <section id="package-itinerary">
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          minHeight: "58px",
          padding: "0 18px",
          borderTop: "1px solid #d9e2ec",
          borderBottom: "1px solid #d9e2ec",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          cursor: "pointer",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 800,
            color: "#1f2937",
          }}
        >
          3. Package Itinerary &amp; Inclusions
        </h3>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            color: "#55a8d8",
          }}
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </div>

      {isOpen && (
        <div
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #d9e2ec",
          }}
        >
          <div className="px-5 py-4 border-b bg-gradient-to-r from-slate-50 via-white to-blue-50">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 border border-blue-100">
                ✈ {features.flights ?? 0} Flights
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 border border-indigo-100">
                🏨 {features.hotels ?? 0} Hotels
              </span>
              <span className="inline-flex items-center rounded-full bg-cyan-50 text-cyan-700 text-sm font-semibold px-3 py-1.5 border border-cyan-100">
                🚕 {features.transfers ?? 0} Transfers
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-sm font-semibold px-3 py-1.5 border border-amber-100">
                🍽 {features.meals ?? 0} Meals
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold px-3 py-1.5 border border-emerald-100">
                🎯 {features.activities ?? 0} Activities
              </span>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {normalizedDays.map((day, dayIndex) => {
              const expandKey = `expand-${day.day}-${dayIndex}`;
              const isExpanded = expandedDays[expandKey] ?? true;

              return (
                <div
                  key={day.dayKey}
                  className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]"
                >
                  <div className="bg-gradient-to-r from-[#f8fbff] via-white to-[#fffaf5] border-b px-5 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-[#1e3a8a] text-white text-sm font-bold px-3 py-1">
                            Day {day.day}
                          </span>

                          {day.finalDateLabel ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
                              <CalendarDays size={14} />
                              {day.finalDateLabel}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 text-lg font-bold text-[#111827]">
                          {day.title}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDays((prev) => ({
                            ...prev,
                            [expandKey]: !isExpanded,
                          }))
                        }
                        className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-slate-50"
                      >
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        {isExpanded ? "Collapse" : "Expand"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5">
                      <div className="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-5">
                        <div className="rounded-2xl border border-[#dbeafe] bg-[#f8fbff] overflow-hidden">
                          <div className="px-4 py-3 border-b bg-[#eef6ff]">
                            <div className="text-sm font-extrabold text-[#111827]">
                              Services For This Day
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            {day.serviceBlocks.length > 0 ? (
                              day.serviceBlocks.map((service, index) => (
                                <div
                                  key={`${day.dayKey}-service-${service.type}-${index}`}
                                  className="rounded-xl border bg-white p-4"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        {getIconByType(service.type)}
                                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
                                          {service.type}
                                        </span>
                                      </div>

                                      <div className="mt-2 text-[15px] font-bold text-[#111827] break-words">
                                        {service.title}
                                      </div>

                                      {service.subtitle ? (
                                        <div className="mt-1 text-[13px] font-medium text-gray-600 break-words">
                                          {service.subtitle}
                                        </div>
                                      ) : null}

                                      {service.meta ? (
                                        <div className="mt-2 flex items-start gap-2 text-[13px] text-gray-600">
                                          <Clock3
                                            size={14}
                                            className="mt-[2px] shrink-0"
                                          />
                                          <span className="break-words">
                                            {service.meta}
                                          </span>
                                        </div>
                                      ) : null}
                                    </div>

                                    {service.badge ? (
                                      <span className="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {service.badge}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="rounded-xl border bg-white p-4 text-sm font-medium text-gray-600">
                                No mapped service blocks for this day.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#f3e8d3] bg-[#fffaf3] overflow-hidden">
                          <div className="px-4 py-3 border-b bg-[#fff3df]">
                            <div className="text-sm font-extrabold text-[#111827]">
                              Day Wise Flow
                            </div>
                          </div>

                          <div className="p-5">
                            {day.cleanItems.length > 0 ? (
                              <div className="relative">
                                <div className="absolute left-[15px] top-1 bottom-1 w-[2px] bg-slate-200" />

                                <div className="space-y-5">
                                  {day.cleanItems.map((item, index) => (
                                    <div
                                      key={`${day.dayKey}-flow-${index}`}
                                      className="relative flex items-start gap-4"
                                    >
                                      <div className="relative z-10 w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                                        {index + 1}
                                      </div>

                                      <div className="min-w-0 flex-1 rounded-2xl border border-[#eadfcb] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                        <div className="flex items-start gap-3">
                                          <div className="mt-0.5 shrink-0 text-blue-600">
                                            <CheckCircle2 size={18} />
                                          </div>

                                          <div className="min-w-0">
                                            <div className="text-[15px] font-semibold text-[#111827] break-words">
                                              {item}
                                            </div>

                                            <div className="mt-1 text-[13px] leading-6 text-gray-600">
                                              {getTimelineDescription(item)}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm font-medium text-gray-600">
                                Day-wise flow not available.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {exclusions.length > 0 && (
              <div className="rounded-2xl border border-red-100 bg-red-50/40 overflow-hidden">
                <div className="px-5 py-4 border-b border-red-100">
                  <div className="text-lg font-extrabold text-[#111827]">
                    Package Exclusions
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  {exclusions.map((exclusion, index) => (
                    <div
                      key={`exclusion-${index}`}
                      className="rounded-xl border border-red-100 bg-white px-4 py-3 text-[14px] text-gray-700"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-red-500 font-bold">×</span>
                        <span>{exclusion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
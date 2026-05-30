"use client";

import { useMemo } from "react";

type Variant = "withFlight" | "withoutFlight";

type InclusionCounts = {
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
};

type PackageLike = {
  title?: string;
  route?: string | string[];
  cities?: string[];
  nights?: number;
  days?: number;
  highlights?: string[];
  exclusions?: string[];
  overview?: string;
};

type SelectionStateLike = {
  finalPrice?: number;
  basePrice?: number;
  flightFareDiff?: number;
  hotelFareDiff?: number;
  transferFareDiff?: number;
  mealFareDiff?: number;
  activityFareDiff?: number;
  selectedFlights?: Array<{
    airline?: string;
    from?: string;
    to?: string;
    departureTime?: string;
    arrivalTime?: string;
  }>;
  selectedHotels?: Array<{
    hotelName?: string;
    roomType?: string;
    city?: string;
    mealPlan?: string;
    starRating?: number;
  }>;
  selectedTransfers?: Array<{
    title?: string;
    vehicleType?: string;
    subtitle?: string;
  }>;
  selectedMeals?: Array<{
    title?: string;
    description?: string;
  }>;
  selectedActivities?: Array<{
    title?: string;
    description?: string;
    category?: string;
  }>;
};

type Props = {
  pkg: PackageLike;
  itinerary?: DayItem[];
  inclusions?: InclusionCounts;
  selectionState?: SelectionStateLike | null;
  travelDate?: string;
  originCity?: string;
  variant?: Variant;
};

function formatDate(value?: string) {
  if (!value) return "Flexible / To be confirmed";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getFirstNonEmpty<T>(items?: T[]) {
  if (!Array.isArray(items)) return null;
  for (const item of items) {
    if (item) return item;
  }
  return null;
}

function normalizeRoute(pkg: PackageLike) {
  if (Array.isArray(pkg?.cities) && pkg.cities.length > 0) {
    return pkg.cities.join(" • ");
  }

  if (Array.isArray(pkg?.route) && pkg.route.length > 0) {
    return pkg.route.join(" • ");
  }

  return pkg?.route || "Route details available on booking";
}

function getFlightSummary(selectionState?: SelectionStateLike | null, variant?: Variant) {
  const selected = getFirstNonEmpty(selectionState?.selectedFlights);

  if (selected?.airline) {
    return `${selected.airline}${
      selected.from && selected.to ? ` • ${selected.from} → ${selected.to}` : ""
    }${selected.departureTime ? ` • ${selected.departureTime}` : ""}`;
  }

  return variant === "withFlight" ? "Standard included flight" : "Flight not included";
}

function getHotelSummary(selectionState?: SelectionStateLike | null) {
  const selected = getFirstNonEmpty(selectionState?.selectedHotels);

  if (selected?.hotelName) {
    return `${selected.hotelName}${
      selected.roomType ? ` • ${selected.roomType}` : ""
    }${selected.city ? ` • ${selected.city}` : ""}`;
  }

  return "Standard included hotel stay";
}

function getTransferSummary(selectionState?: SelectionStateLike | null) {
  const selected = getFirstNonEmpty(selectionState?.selectedTransfers);

  if (selected?.title) {
    return `${selected.title}${selected.vehicleType ? ` • ${selected.vehicleType}` : ""}`;
  }

  return "Standard included transfer";
}

function getMealSummary(selectionState?: SelectionStateLike | null) {
  const selectedMeals = Array.isArray(selectionState?.selectedMeals)
    ? selectionState?.selectedMeals.filter(Boolean)
    : [];

  if (selectedMeals.length === 1) return selectedMeals[0]?.title || "Selected meal plan";
  if (selectedMeals.length > 1) return `${selectedMeals.length} meal plans selected`;

  return "Standard included meal plan";
}

function getActivitySummary(selectionState?: SelectionStateLike | null) {
  const selectedActivities = Array.isArray(selectionState?.selectedActivities)
    ? selectionState?.selectedActivities.filter(Boolean)
    : [];

  if (selectedActivities.length === 1) return selectedActivities[0]?.title || "Selected activity";
  if (selectedActivities.length > 1) return `${selectedActivities.length} activities selected`;

  return "Standard included activities / sightseeing";
}

function getCustomizationRows(selectionState?: SelectionStateLike | null, variant?: Variant) {
  return [
    {
      title: "Flight",
      value: getFlightSummary(selectionState, variant),
      diff: selectionState?.flightFareDiff || 0,
    },
    {
      title: "Hotel",
      value: getHotelSummary(selectionState),
      diff: selectionState?.hotelFareDiff || 0,
    },
    {
      title: "Transfer",
      value: getTransferSummary(selectionState),
      diff: selectionState?.transferFareDiff || 0,
    },
    {
      title: "Meal",
      value: getMealSummary(selectionState),
      diff: selectionState?.mealFareDiff || 0,
    },
    {
      title: "Activity",
      value: getActivitySummary(selectionState),
      diff: selectionState?.activityFareDiff || 0,
    },
  ];
}

export default function SummaryTab({
  pkg,
  itinerary = [],
  inclusions,
  selectionState,
  travelDate,
  originCity,
  variant = "withFlight",
}: Props) {
  const durationLabel = useMemo(() => {
    return `${pkg?.nights || 0}N / ${pkg?.days || 0}D`;
  }, [pkg]);

  const routeLabel = useMemo(() => normalizeRoute(pkg), [pkg]);

  const highlights = useMemo(() => {
    if (Array.isArray(pkg?.highlights) && pkg.highlights.length > 0) {
      return pkg.highlights;
    }

    return [
      "Curated itinerary with major destination coverage",
      "Customizable package components",
      "OTA-style structured booking journey",
      "Support for hotel, transfer, activity and meal upgrades",
    ];
  }, [pkg]);

  const exclusions = useMemo(() => {
    if (Array.isArray(pkg?.exclusions) && pkg.exclusions.length > 0) {
      return pkg.exclusions;
    }

    return [
      "Personal expenses",
      "Anything not mentioned under inclusions",
      "Entry tickets unless explicitly included",
      "Optional upgrades and add-ons",
    ];
  }, [pkg]);

  const overviewText = useMemo(() => {
    if (pkg?.overview?.trim()) return pkg.overview.trim();

    return `${pkg?.title || "This package"} covers ${routeLabel} over ${durationLabel}. The package is built in a customizable OTA-style flow where flight, hotel, transfer, meal and activity preferences can be upgraded before booking confirmation.`;
  }, [pkg, routeLabel, durationLabel]);

  const customizationRows = useMemo(
    () => getCustomizationRows(selectionState, variant),
    [selectionState, variant]
  );

  const basePrice = Number(selectionState?.basePrice || 0);
  const finalPrice = Number(selectionState?.finalPrice || basePrice || 0);
  const upgradeTotal = Math.max(finalPrice - basePrice, 0);

  return (
    <div className="px-4 py-4 md:px-5 md:py-5">
      <div className="grid grid-cols-12 gap-5">
        {/* LEFT MAIN */}
        <div className="col-span-12 xl:col-span-8 space-y-5">
          {/* Overview */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b bg-[#f8fbff] px-4 py-3">
              <div className="text-[16px] font-extrabold text-[#111827]">
                Package Overview
              </div>
            </div>

            <div className="p-4">
              <div className="text-[15px] font-bold text-[#111827]">
                {pkg?.title || "Package"}
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border bg-[#fafafa] px-3 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Duration
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {durationLabel}
                  </div>
                </div>

                <div className="rounded-xl border bg-[#fafafa] px-3 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Route
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {routeLabel}
                  </div>
                </div>

                <div className="rounded-xl border bg-[#fafafa] px-3 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Travel Date
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {formatDate(travelDate)}
                  </div>
                </div>

                <div className="rounded-xl border bg-[#fafafa] px-3 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Departure / Package Type
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {variant === "withFlight"
                      ? `${originCity || "Delhi"} • With Flight`
                      : "Land Package • Without Flight"}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border bg-[#fcfcfc] px-4 py-4">
                <div className="text-[13px] font-bold text-[#111827]">
                  Summary Description
                </div>
                <div className="mt-2 text-[13px] leading-6 text-[#4b5563]">
                  {overviewText}
                </div>
              </div>
            </div>
          </div>

          {/* Inclusions & Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl border bg-white overflow-hidden">
              <div className="border-b bg-[#f8fbff] px-4 py-3">
                <div className="text-[16px] font-extrabold text-[#111827]">
                  Included in Package
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                  <span className="text-[14px] font-semibold text-[#111827]">Flights</span>
                  <span className="text-[14px] font-extrabold text-[#111827]">
                    {inclusions?.flights ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                  <span className="text-[14px] font-semibold text-[#111827]">Hotels</span>
                  <span className="text-[14px] font-extrabold text-[#111827]">
                    {inclusions?.hotels ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                  <span className="text-[14px] font-semibold text-[#111827]">Transfers</span>
                  <span className="text-[14px] font-extrabold text-[#111827]">
                    {inclusions?.transfers ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                  <span className="text-[14px] font-semibold text-[#111827]">Activities</span>
                  <span className="text-[14px] font-extrabold text-[#111827]">
                    {inclusions?.activities ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                  <span className="text-[14px] font-semibold text-[#111827]">Meals</span>
                  <span className="text-[14px] font-extrabold text-[#111827]">
                    {inclusions?.meals ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white overflow-hidden">
              <div className="border-b bg-[#f8fbff] px-4 py-3">
                <div className="text-[16px] font-extrabold text-[#111827]">
                  Package Highlights
                </div>
              </div>

              <div className="p-4 space-y-2">
                {highlights.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-xl border bg-[#fcfcfc] px-3 py-3 text-[13px] font-medium text-[#374151]"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customization Summary */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b bg-[#f8fbff] px-4 py-3">
              <div className="text-[16px] font-extrabold text-[#111827]">
                Customization Summary
              </div>
            </div>

            <div className="p-4 space-y-3">
              {customizationRows.map((row) => (
                <div
                  key={row.title}
                  className="rounded-xl border bg-white px-4 py-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0">
                      <div className="text-[14px] font-bold text-[#111827]">
                        {row.title}
                      </div>
                      <div className="mt-1 text-[13px] leading-5 text-[#4b5563] break-words">
                        {row.value}
                      </div>
                    </div>

                    <div
                      className={`w-fit shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${
                        Number(row.diff || 0) > 0
                          ? "border border-orange-200 bg-orange-50 text-orange-700"
                          : Number(row.diff || 0) < 0
                          ? "border border-blue-200 bg-blue-50 text-blue-700"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {Number(row.diff || 0) === 0
                        ? "Included"
                        : Number(row.diff || 0) > 0
                        ? `+ ${formatCurrency(row.diff)}`
                        : `- ${formatCurrency(Math.abs(row.diff))}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day wise quick summary */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b bg-[#f8fbff] px-4 py-3">
              <div className="text-[16px] font-extrabold text-[#111827]">
                Day-wise Quick Summary
              </div>
            </div>

            <div className="p-4 space-y-3">
              {itinerary.map((day) => (
                <div
                  key={day.day}
                  className="rounded-xl border bg-[#fcfcfc] px-4 py-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-[14px] font-bold text-[#111827]">
                        Day {day.day} • {day.title}
                      </div>
                      {day.dateLabel ? (
                        <div className="mt-1 text-[12px] font-medium text-[#6b7280]">
                          {day.dateLabel}
                        </div>
                      ) : null}
                    </div>

                    <div className="text-[12px] font-semibold text-[#4b5563]">
                      {(day.items || []).length} planned item(s)
                    </div>
                  </div>

                  {(day.items || []).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {day.items.map((item, idx) => (
                        <span
                          key={`${day.day}-${idx}`}
                          className="rounded-full border bg-white px-3 py-1 text-[11px] font-semibold text-[#374151]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="rounded-2xl border bg-white overflow-hidden">
            <div className="border-b bg-[#f8fbff] px-4 py-3">
              <div className="text-[16px] font-extrabold text-[#111827]">
                Exclusions & Important Notes
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-[#fcfcfc] p-4">
                  <div className="text-[14px] font-bold text-[#111827]">
                    Exclusions
                  </div>
                  <div className="mt-3 space-y-2">
                    {exclusions.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="text-[13px] font-medium leading-5 text-[#4b5563]"
                      >
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border bg-[#fcfcfc] p-4">
                  <div className="text-[14px] font-bold text-[#111827]">
                    Important Notes
                  </div>
                  <div className="mt-3 space-y-2 text-[13px] leading-5 text-[#4b5563]">
                    <div>• Final price is subject to revalidation at booking step.</div>
                    <div>• Flights, hotels, meals, transfers and activities are dynamic/customizable.</div>
                    <div>• Availability may vary as per selected date, origin city and package variant.</div>
                    <div>• Exact vouchers, timings and confirmations are shared post booking completion.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE PRICE SUMMARY */}
        <div className="col-span-12 xl:col-span-4">
          <div className="xl:sticky xl:top-[110px] space-y-5">
            <div className="rounded-2xl border bg-white overflow-hidden">
              <div className="border-b bg-[#f8fbff] px-4 py-3">
                <div className="text-[16px] font-extrabold text-[#111827]">
                  Price Summary
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 text-[14px]">
                  <span className="font-semibold text-[#4b5563]">Base Package Price</span>
                  <span className="font-bold text-[#111827]">
                    {formatCurrency(basePrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-[14px]">
                  <span className="font-semibold text-[#4b5563]">Customization Total</span>
                  <span className="font-bold text-[#111827]">
                    {formatCurrency(upgradeTotal)}
                  </span>
                </div>

                <div className="border-t pt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[15px] font-extrabold text-[#111827]">
                    Final Price / Adult
                  </span>
                  <span className="text-[20px] font-extrabold text-[#111827]">
                    {formatCurrency(finalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white overflow-hidden">
              <div className="border-b bg-[#f8fbff] px-4 py-3">
                <div className="text-[16px] font-extrabold text-[#111827]">
                  Booking Snapshot
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="rounded-xl border bg-[#fcfcfc] px-3 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Travel Date
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {formatDate(travelDate)}
                  </div>
                </div>

                <div className="rounded-xl border bg-[#fcfcfc] px-3 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Departure City
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {originCity || "To be confirmed"}
                  </div>
                </div>

                <div className="rounded-xl border bg-[#fcfcfc] px-3 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-[#6b7280]">
                    Variant
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-[#111827]">
                    {variant === "withFlight" ? "With Flight" : "Without Flight"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import { normalizeSmartPlannerBooking } from "@/app/lib/ecosystem/planner/smartPlannerBookingNormalizer";
import {
  resolveSmartPlannerBooking,
  type SmartPlannerBookingResolveResult,
} from "@/app/lib/ecosystem/planner/smartPlannerBookingResolver";
import { getSmartPlannerPayloadCompleteness } from "@/app/lib/ecosystem/planner/booking/smartPlannerBookingPayload";

type RecordValue = Record<string, any>;

function asRecord(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
}

function text(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" || typeof value === "number") {
      const result = String(value).trim();
      if (result) return result;
    }
  }
  return "";
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value ?? 0);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return 0;
}

function formatMoney(value: unknown) {
  const amount = numberValue(value);
  if (!amount) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

function toArray(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value)) return value.filter(Boolean);
  }
  return [];
}

function getPath(source: unknown, path: string) {
  return path.split(".").reduce<any>((acc, key) => {
    if (!acc || typeof acc !== "object") return undefined;
    return acc[key];
  }, source);
}

function firstRecord(...values: unknown[]) {
  for (const value of values) {
    const record = asRecord(value);
    if (Object.keys(record).length) return record;
  }
  return {};
}

function firstArray(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value) && value.length) return value.map(asRecord);
  }
  return [];
}

function displayValue(value: unknown) {
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") return value.trim();
  if (typeof value === "object" && value !== null) return "Available";
  return "";
}

function serviceArraysFromPayload(raw: RecordValue) {
  const selectedServices = asRecord(raw.selectedServices);
  const smartPlannerPayload = asRecord(raw.smartPlannerPayload);
  const smartServices = asRecord(smartPlannerPayload.selectedServices);

  return {
    activities: firstArray(
      selectedServices.selectedActivities,
      smartServices.selectedActivities,
      raw.selectedActivities,
      smartPlannerPayload.selectedActivities
    ),
    cabs: firstArray(selectedServices.selectedCabs, smartServices.selectedCabs, raw.selectedCabs),
    creator: firstArray(
      selectedServices.selectedCreatorSpots,
      smartServices.selectedCreatorSpots,
      raw.selectedCreatorSpots,
      smartPlannerPayload.selectedCreatorSpots
    ),
    hotels: firstArray(selectedServices.selectedHotels, smartServices.selectedHotels, raw.selectedHotels),
    homestays: firstArray(
      selectedServices.selectedHomestays,
      smartServices.selectedHomestays,
      raw.selectedHomestays
    ),
    localLife: firstArray(
      selectedServices.selectedLocalLifeItems,
      smartServices.selectedLocalLifeItems,
      raw.selectedLocalLifeItems
    ),
    localMarket: firstArray(
      selectedServices.selectedLocalMarketItems,
      smartServices.selectedLocalMarketItems,
      raw.selectedLocalMarketItems
    ),
    meals: firstArray(selectedServices.selectedMeals, smartServices.selectedMeals, raw.selectedMeals),
    transfers: firstArray(
      selectedServices.selectedTransfers,
      smartServices.selectedTransfers,
      raw.selectedTransfers
    ),
  };
}

function itemType(item: RecordValue) {
  return text(
    item.serviceType,
    item.type,
    item.category,
    item.itemType,
    item.bookingType,
    item.service
  ).toLowerCase();
}

function itemTitle(item: RecordValue) {
  return text(
    item.displayName,
    item.title,
    item.name,
    item.label,
    item.routeLabel,
    item.hotelName,
    item.stayName,
    item.activityName,
    item.mealName,
    item.marketName,
    item.creatorName,
    item.from && item.to ? `${item.from} → ${item.to}` : ""
  ) || "Selected planner item";
}

function itemMeta(item: RecordValue) {
  return text(
    item.subtitle,
    item.description,
    item.route,
    item.location,
    item.city,
    item.coverage,
    item.duration,
    item.roomType,
    item.vehicleType,
    item.providerName
  );
}

function itemCost(item: RecordValue) {
  return numberValue(
    item.total,
    item.totalPrice,
    item.price,
    item.amount,
    item.finalAmount,
    item.cost,
    item.estimatedCost
  );
}

function filterItems(items: RecordValue[], keywords: string[]) {
  return items.filter((item) => {
    const joined = `${itemType(item)} ${itemTitle(item)} ${itemMeta(item)}`.toLowerCase();
    return keywords.some((key) => joined.includes(key));
  });
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {subtitle ? (
          <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyBox({ textValue }: { textValue: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
      {textValue}
    </div>
  );
}

function ItemList({
  items,
  empty,
}: {
  items: RecordValue[];
  empty: string;
}) {
  if (!items.length) return <EmptyBox textValue={empty} />;

  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <div
          key={`${itemTitle(item)}-${index}`}
          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black text-slate-950">
                {itemTitle(item)}
              </p>
              {itemMeta(item) ? (
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {itemMeta(item)}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-2">
                {text(item.dayLabel, item.day, item.dayTitle) ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-600">
                    {text(item.dayLabel, item.day, item.dayTitle)}
                  </span>
                ) : null}
                {text(item.time, item.startTime) ? (
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-600">
                    {text(item.time, item.startTime)}
                  </span>
                ) : null}
                {text(item.status) ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black text-emerald-700">
                    {text(item.status)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-base font-black text-slate-950">
                {formatMoney(itemCost(item))}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Estimated value
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailGrid({
  rows,
}: {
  rows: Array<{ label: string; value: unknown }>;
}) {
  const visibleRows = rows
    .map((row) => ({ ...row, value: displayValue(row.value) }))
    .filter((row) => row.value);

  if (!visibleRows.length) {
    return <EmptyBox textValue="No additional Smart Planner detail is available for this section." />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {visibleRows.map((row) => (
        <div
          key={row.label}
          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
            {row.label}
          </p>
          <p className="mt-2 break-words text-sm font-black text-slate-950">
            {row.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function InsightList({
  records,
  empty,
}: {
  records: Array<{ label: string; value: unknown }>;
  empty: string;
}) {
  const visible = records
    .map((record) => ({ ...record, value: displayValue(record.value) }))
    .filter((record) => record.value);

  if (!visible.length) return <EmptyBox textValue={empty} />;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {visible.map((record) => (
        <div
          key={record.label}
          className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cyan-700">
            {record.label}
          </p>
          <p className="mt-2 break-words text-sm font-bold text-slate-800">
            {record.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function DayItinerary({ days }: { days: RecordValue[] }) {
  if (!days.length) return <EmptyBox textValue="Day-wise planner itinerary is not available in this booking payload." />;

  return (
    <div className="grid gap-4">
      {days.map((day, index) => {
        const items = toArray(
          day.items,
          day.timeline,
          day.timelineItems,
          day.dayItems,
          day.plan,
          day.events
        ).map(asRecord);

        return (
          <div
            key={`${text(day.id, day.dayTitle, index)}-${index}`}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950">
                  {text(day.dayLabel, day.title, day.dayTitle) || `Day ${index + 1}`}
                </p>
                <p className="text-xs font-bold text-slate-500">
                  {text(day.date, day.travelDate, day.city, day.routeLabel)}
                </p>
              </div>
              <span className="w-fit rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-600">
                {items.length} timeline items
              </span>
            </div>

            {items.length ? (
              <div className="mt-4 grid gap-2">
                {items.map((item, itemIndex) => (
                  <div
                    key={`${itemTitle(item)}-${itemIndex}`}
                    className="flex flex-col gap-2 rounded-xl bg-white p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {text(item.time, item.startTime) ? `${text(item.time, item.startTime)} • ` : ""}
                        {itemTitle(item)}
                      </p>
                      {itemMeta(item) ? (
                        <p className="text-xs font-semibold text-slate-500">
                          {itemMeta(item)}
                        </p>
                      ) : null}
                    </div>
                    <p className="text-sm font-black text-slate-950">
                      {itemCost(item) ? formatMoney(itemCost(item)) : ""}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function PlannerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = String(params?.bookingId || "");

  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [data, setData] = useState<RecordValue | null>(null);
  const [debugInfo, setDebugInfo] =
    useState<SmartPlannerBookingResolveResult | null>(null);

  useEffect(() => {
    const loadBookingDetail = () => {
      const resolved = resolveSmartPlannerBooking(bookingId);
      setBooking(resolved.booking);
      setData(asRecord(resolved.payload));
      setDebugInfo(resolved);
    };

    loadBookingDetail();

    window.addEventListener(BOOKING_UPDATED_EVENT, loadBookingDetail);
    window.addEventListener("storage", loadBookingDetail);
    window.addEventListener("focus", loadBookingDetail);

    return () => {
      window.removeEventListener(BOOKING_UPDATED_EVENT, loadBookingDetail);
      window.removeEventListener("storage", loadBookingDetail);
      window.removeEventListener("focus", loadBookingDetail);
    };
  }, [bookingId]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !data) return;
    const payload = asRecord(data.fullPayload || data.originalPayload || data);
    if (
      (payload.serviceType !== "smart-planner" && !payload.smartPlannerBookingId) ||
      !Array.isArray(payload.selectedBasketItems)
    ) {
      return;
    }
    console.info(
      "[SmartPlanner] detail payload completeness",
      getSmartPlannerPayloadCompleteness(payload as any)
    );
  }, [data]);

  const normalized = useMemo(() => {
    return asRecord(normalizeSmartPlannerBooking({ booking, payload: data || {} }));
  }, [booking, data]);

  const raw = asRecord(data);
  const bookingRecord = asRecord(booking);
  const fullPayload = asRecord(raw.fullPayload || raw.originalPayload || raw.__rawPayload || raw);
  const smartPlannerPayload = asRecord(fullPayload.smartPlannerPayload);
  const selectedServices = serviceArraysFromPayload(fullPayload);
  const routeData = firstRecord(
    fullPayload.routeData,
    smartPlannerPayload.routeData,
    fullPayload.selectedRoute,
    smartPlannerPayload.selectedRoute,
    fullPayload.route,
    smartPlannerPayload.route
  );
  const selectedRoute = firstRecord(
    fullPayload.selectedRoute,
    smartPlannerPayload.selectedRoute,
    fullPayload.selectedRouteVariant,
    smartPlannerPayload.selectedRouteVariant
  );
  const selectedRouteVariant = firstRecord(
    fullPayload.selectedRouteVariant,
    smartPlannerPayload.selectedRouteVariant,
    asRecord(routeData).selectedRouteVariant
  );
  const routeVariants = firstArray(fullPayload.routeVariants, smartPlannerPayload.routeVariants);
  const plannerIntelligence = firstRecord(
    fullPayload.plannerIntelligence,
    smartPlannerPayload.plannerIntelligence
  );
  const readinessStatus = firstRecord(
    fullPayload.readinessStatus,
    smartPlannerPayload.readinessStatus
  );
  const plannerAudit = firstRecord(fullPayload.plannerAudit, smartPlannerPayload.plannerAudit);
  const paymentSummary = firstRecord(fullPayload.paymentSummary, smartPlannerPayload.paymentSummary);
  const fareSummary = firstRecord(
    fullPayload.fareSummary,
    fullPayload.pricing,
    smartPlannerPayload.fareSummary,
    smartPlannerPayload.pricing
  );
  const offerSummary = firstRecord(fullPayload.offerSummary, smartPlannerPayload.offerSummary);

  const selectedItems = useMemo(() => {
    return toArray(
      normalized.selectedBasketItems,
      fullPayload.selectedBasketItems,
      smartPlannerPayload.selectedBasketItems,
      fullPayload.bookingBasket,
      fullPayload.selectedItems,
      fullPayload.tripSelections,
      fullPayload.checkoutItems,
      getPath(fullPayload, "reviewPayload.selectedBasketItems"),
      getPath(fullPayload, "confirmationPayload.selectedBasketItems"),
      getPath(fullPayload, "plannerPayload.selectedBasketItems")
    ).map(asRecord);
  }, [normalized, fullPayload, smartPlannerPayload]);

  const itineraryDays = useMemo(() => {
    return toArray(
      normalized.itineraryDays,
      fullPayload.dayPlans,
      smartPlannerPayload.dayPlans,
      fullPayload.itineraryDays,
      fullPayload.dayWiseItinerary,
      fullPayload.days,
      getPath(fullPayload, "itinerary.days"),
      getPath(fullPayload, "trip.itinerary"),
      getPath(fullPayload, "reviewPayload.itinerary"),
      getPath(fullPayload, "plannerPayload.itinerary")
    ).map(asRecord);
  }, [normalized, fullPayload, smartPlannerPayload]);

  const explicitTransportItems = [
    ...selectedServices.transfers,
    ...selectedServices.cabs,
  ];

  const explicitStayItems = [
    ...selectedServices.hotels,
    ...selectedServices.homestays,
  ];

  const transportItems = toArray(normalized.transportItems).map(asRecord).length
    ? toArray(normalized.transportItems).map(asRecord)
    : explicitTransportItems.length
    ? explicitTransportItems
    : filterItems(selectedItems, ["transport", "cab", "transfer", "flight", "train", "bus", "self drive"]);

  const stayItems = toArray(normalized.stayItems).map(asRecord).length
    ? toArray(normalized.stayItems).map(asRecord)
    : explicitStayItems.length
    ? explicitStayItems
    : filterItems(selectedItems, ["stay", "hotel", "homestay", "room"]);

  const activityItems = toArray(normalized.activityItems).map(asRecord).length
    ? toArray(normalized.activityItems).map(asRecord)
    : selectedServices.activities.length
    ? selectedServices.activities
    : filterItems(selectedItems, ["activity", "experience", "sightseeing", "tour"]);

  const mealItems = toArray(normalized.mealItems).map(asRecord).length
    ? toArray(normalized.mealItems).map(asRecord)
    : selectedServices.meals.length
    ? selectedServices.meals
    : filterItems(selectedItems, ["meal", "food", "lunch", "dinner", "breakfast"]);

  const localMarketItems = toArray(normalized.localMarketItems).map(asRecord).length
    ? toArray(normalized.localMarketItems).map(asRecord)
    : selectedServices.localMarket.length
    ? selectedServices.localMarket
    : filterItems(selectedItems, ["market", "local"]);

  const creatorItems = toArray(normalized.creatorItems).map(asRecord).length
    ? toArray(normalized.creatorItems).map(asRecord)
    : selectedServices.creator.length
    ? selectedServices.creator
    : filterItems(selectedItems, ["creator", "photo", "content"]);

  const travellers = asRecord(normalized.travellers);
  const priceSummary = asRecord(normalized.priceSummary);
  const walletSummary = asRecord(normalized.walletSummary);

  const totalAmount = numberValue(
    normalized.totalAmount,
    normalized.totalTripValue,
    priceSummary.total,
    priceSummary.grandTotal,
    priceSummary.finalPayableAmount,
    fareSummary.finalPayable,
    fareSummary.finalPayableAmount,
    paymentSummary.amountPaid,
    paymentSummary.finalPayable,
    bookingRecord.amount,
    fullPayload.amount,
    fullPayload.totalAmount
  );

  const tripTitle =
    text(
      normalized.tripTitle,
      fullPayload.tripTitle,
      fullPayload.title,
      fullPayload.tripName,
      getPath(fullPayload, "trip.title"),
      getPath(fullPayload, "trip.name"),
      bookingRecord.title
    ) || "Smart Planner Trip";

  const routeLabel =
    text(
      normalized.routeLabel,
      fullPayload.routeLabel,
      fullPayload.routeTitle,
      fullPayload.route,
      getPath(fullPayload, "trip.routeLabel"),
      fullPayload.destination,
      bookingRecord.route
    ) || "Smart Planner Route";

  const travelDate =
    text(
      normalized.travelDate,
      fullPayload.travelDate,
      fullPayload.startDate,
      getPath(fullPayload, "trip.startDate"),
      bookingRecord.travelDate
    ) || "Travel date not available";

  const travellerCount = numberValue(
    travellers.count,
    normalized.travellerCount,
    fullPayload.travellerCount,
    fullPayload.totalTravellers,
    bookingRecord.travellers
  );

  if (!booking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f8]">
        <div className="max-w-xl rounded-xl border bg-white p-6 font-semibold text-slate-900">
          <div>Smart Planner booking detail not found.</div>
          {process.env.NODE_ENV === "development" && debugInfo ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-3 font-mono text-xs font-normal text-slate-700">
              <div>Requested: {debugInfo.requestedBookingId}</div>
              <div>Checked: {debugInfo.checkedStorageKeys.join(", ")}</div>
              <div>
                Available: {debugInfo.availableBookingIds.join(", ") || "none"}
              </div>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f8] text-black">
      <div className="flex min-h-[72px] flex-col items-start justify-center gap-3 border-b bg-white px-3 py-3 md:h-[72px] md:flex-row md:items-center md:justify-between md:px-6 md:py-0">
        <div className="text-2xl font-black">TPL</div>
        <button
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#d9e2ec] bg-white px-4 py-2 text-[12px] font-extrabold text-[#111827] shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition hover:border-[#bfd3ea] hover:bg-[#f8fbff] md:px-5 md:text-[13px]"
          onClick={() => router.push("/account/bookings")}
          type="button"
        >
          <span style={{ fontSize: "14px", lineHeight: 1 }}>←</span>
          <span>Back to My Bookings</span>
        </button>
      </div>

      <div className="border-b border-gray-200 bg-white py-4">
        <div className="mx-auto max-w-7xl px-3 md:px-4">
          <div className="text-[19px] font-black leading-7 text-slate-900 md:text-[22px]">
            Smart Planner Trip Detail
          </div>
          <div className="mt-1 break-words text-[12px] text-slate-600 md:text-sm">
            Booking ID: {booking.id}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-3 py-4 md:px-4 md:py-6">
        <div className="grid gap-5">
          <section className="overflow-hidden rounded-[1.7rem] border border-emerald-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-5 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/80">
                Smart Planner booking confirmed
              </p>
              <h1 className="mt-2 text-2xl font-black md:text-3xl">
                {tripTitle}
              </h1>
              <p className="mt-2 text-sm font-semibold text-white/85">
                {routeLabel}
              </p>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-4">
              <StatCard label="Booking ID" value={booking.id} />
              <StatCard label="Travel Date" value={travelDate} />
              <StatCard label="Travellers" value={travellerCount || "—"} />
              <StatCard label="Trip Value" value={formatMoney(totalAmount)} />
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-5">
              <Section
                title="Trip Summary"
                subtitle="Planner-specific booking information from the Smart Planner flow."
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <StatCard label="Trip Title" value={tripTitle} />
                  <StatCard label="Route" value={routeLabel} />
                  <StatCard
                    label="Duration"
                    value={text(normalized.durationLabel, raw.durationLabel, raw.duration) || `${itineraryDays.length || "—"} Days`}
                  />
                  <StatCard
                    label="Status"
                    value={text(booking.status, normalized.status) || "Confirmed"}
                  />
                </div>
              </Section>

              <Section
                title="Route Plan"
                subtitle="Selected route, route variant and route readiness saved from Smart Planner."
              >
                <DetailGrid
                  rows={[
                    {
                      label: "Selected Route",
                      value: text(
                        selectedRoute.title,
                        selectedRoute.name,
                        selectedRoute.label,
                        selectedRoute.routeLabel,
                        routeData.title,
                        routeData.name
                      ),
                    },
                    {
                      label: "Selected Route Variant",
                      value: text(
                        selectedRouteVariant.title,
                        selectedRouteVariant.name,
                        selectedRouteVariant.label,
                        selectedRouteVariant.variant,
                        selectedRouteVariant.strategy
                      ),
                    },
                    {
                      label: "Route Variants",
                      value: routeVariants.length ? routeVariants.length : "",
                    },
                    {
                      label: "Route Readiness",
                      value: text(
                        readinessStatus.routeStatus,
                        readinessStatus.routeReadiness,
                        plannerAudit.routeStatus,
                        plannerAudit.routeReadiness
                      ),
                    },
                    {
                      label: "Difficulty / Toughness",
                      value: text(
                        routeData.difficulty,
                        routeData.toughness,
                        selectedRouteVariant.difficulty,
                        selectedRouteVariant.toughness
                      ),
                    },
                    {
                      label: "Permit / Road / Weather",
                      value: text(
                        readinessStatus.permitStatus,
                        readinessStatus.roadStatus,
                        readinessStatus.weatherStatus,
                        plannerAudit.weatherStatus
                      ),
                    },
                  ]}
                />
              </Section>

              <Section title="Day-wise Itinerary" subtitle="Full planner timeline mapped from the saved Smart Planner booking.">
                <DayItinerary days={itineraryDays} />
              </Section>

              <Section
                title="Selected Basket / Services"
                subtitle="Exact selected booking basket plus planner service arrays preserved in the confirmed payload."
              >
                <ItemList
                  items={selectedItems}
                  empty="No selected basket items found in this planner booking."
                />
              </Section>

              <Section title="Transport Selections">
                <ItemList items={transportItems} empty="No transport selections found in this planner booking." />
              </Section>

              <Section title="Stay Selections">
                <ItemList items={stayItems} empty="No stay selections found in this planner booking." />
              </Section>

              <Section title="Activities">
                <ItemList items={activityItems} empty="No activities found in this planner booking." />
              </Section>

              <Section title="Meals">
                <ItemList items={mealItems} empty="No meals found in this planner booking." />
              </Section>

              <Section title="Local Market Picks">
                <ItemList items={localMarketItems} empty="No local market picks found in this planner booking." />
              </Section>

              <Section title="Creator Experiences">
                <ItemList items={creatorItems} empty="No creator experiences found in this planner booking." />
              </Section>

              <Section
                title="Planner Intelligence"
                subtitle="Readiness, audit and intelligence signals saved with this Smart Planner booking."
              >
                <InsightList
                  empty="No planner intelligence, readiness or audit signals are available for this booking."
                  records={[
                    {
                      label: "Readiness Status",
                      value: text(
                        readinessStatus.status,
                        readinessStatus.label,
                        readinessStatus.bookingReadiness,
                        readinessStatus.overallStatus
                      ),
                    },
                    {
                      label: "Planner Audit",
                      value: text(
                        plannerAudit.status,
                        plannerAudit.summary,
                        plannerAudit.auditStatus,
                        plannerAudit.overallStatus
                      ),
                    },
                    {
                      label: "Route Alerts",
                      value: plannerAudit.routeAlerts || plannerIntelligence.routeAlerts,
                    },
                    {
                      label: "Recommendations",
                      value: plannerIntelligence.recommendations || plannerIntelligence.notes,
                    },
                    {
                      label: "Notes",
                      value: fullPayload.notes || smartPlannerPayload.notes,
                    },
                    {
                      label: "Raw Payload",
                      value: debugInfo?.rawPayloadAvailable ? "Full Smart Planner payload loaded" : "",
                    },
                  ]}
                />
              </Section>
            </div>

            <aside className="grid h-fit gap-5">
              <Section title="Payment Summary">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Total Paid / Trip Value
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {formatMoney(totalAmount)}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm font-bold text-slate-700">
                    <div className="flex justify-between">
                      <span>Selected Basket Value</span>
                      <span>{formatMoney(priceSummary.selectedBasketValue || fareSummary.selectedBasketValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Offer Discount</span>
                      <span>{formatMoney(priceSummary.offerDiscount || fareSummary.offerDiscount || offerSummary.offerDiscount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Fees</span>
                      <span>{formatMoney(priceSummary.taxesAndFees || fareSummary.taxesAndFees)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected Items</span>
                      <span>{selectedItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport</span>
                      <span>{transportItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stay</span>
                      <span>{stayItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Activities</span>
                      <span>{activityItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meals</span>
                      <span>{mealItems.length}</span>
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Wallet Summary">
                <div className="grid gap-2 text-sm font-bold text-slate-700">
                  <div className="flex justify-between">
                    <span>Promo Credit Used</span>
                    <span>{formatMoney(walletSummary.promoCreditUsed || walletSummary.promoUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earned Credit Used</span>
                    <span>{formatMoney(walletSummary.earnedCreditUsed || walletSummary.earnedUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refund Wallet Used</span>
                    <span>{formatMoney(walletSummary.refundWalletUsed || walletSummary.refundUsed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Earned Credit</span>
                    <span>{formatMoney(walletSummary.earnedOnThisBooking || fullPayload.earnedCreditAmount)}</span>
                  </div>
                </div>
              </Section>

              <Section title="Actions">
                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white"
                  >
                    Download / Print Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/smart-planner/manage/${booking.id}?from=account`)}
                    className="rounded-full bg-orange-500 px-5 py-3 text-sm font-black text-white"
                  >
                    Manage Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/account/bookings")}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800"
                  >
                    Back to My Bookings
                  </button>
                </div>
              </Section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

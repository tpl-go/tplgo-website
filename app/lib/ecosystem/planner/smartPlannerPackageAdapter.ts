"use client";

import type { BookingItem } from "@/app/lib/booking/bookingStorage";
import {
  normalizePlannerFareSummary,
  plannerFareSummaryToFare,
} from "@/app/lib/ecosystem/planner/plannerPricing";
import { normalizeSmartPlannerBooking } from "@/app/lib/ecosystem/planner/smartPlannerBookingNormalizer";

type RecordValue = Record<string, unknown>;
type PackageFeatureCounts = {
  activities: number;
  flights: number;
  hotels: number;
  meals: number;
  transfers: number;
};

function asRecord(value: unknown): RecordValue {
  return typeof value === "object" && value !== null ? (value as RecordValue) : {};
}

function safeArray(value: unknown): RecordValue[] {
  return Array.isArray(value)
    ? value.filter((item): item is RecordValue => typeof item === "object" && item !== null)
    : [];
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const numeric = Number(value ?? 0);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
  }
  return 0;
}

function dateText(value: unknown) {
  return text(value);
}

function firstRecord(...values: unknown[]) {
  for (const value of values) {
    const record = asRecord(value);
    if (Object.keys(record).length) return record;
  }
  return {};
}

function routeLabel(value: unknown) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(" → ");
  return text(value);
}

function itemTitle(item: RecordValue) {
  return (
    text(item.title) ||
    text(item.name) ||
    text(item.label) ||
    text(item.serviceName) ||
    text(item.serviceLabel) ||
    text(item.selectedOptionName) ||
    text(item.selectedOption) ||
    "Selected Smart Planner item"
  );
}

function itemAmount(item: RecordValue) {
  return numberValue(
    item.value,
    item.price,
    item.amount,
    item.estimatedValue,
    item.estimatedCost,
    item.total,
    item.fare
  );
}

function itemMeta(item: RecordValue) {
  return [
    text(item.dayLabel) || (item.day ? `Day ${item.day}` : ""),
    dateText(item.date),
    text(item.time),
    text(item.city) || text(item.location),
  ]
    .filter(Boolean)
    .join(" • ");
}

function rawService(item: RecordValue) {
  const priority = [
    item.serviceType,
    item.type,
    item.category,
    item.serviceName,
    item.serviceLabel,
    item.title,
    item.name,
  ];

  return priority.map((value) => String(value || "").toLowerCase()).join(" ");
}

export function resolvePlannerServiceGroup(item: RecordValue) {
  const raw = rawService(item);

  if (/\b(train|rail)\b/.test(raw)) return "train";
  if (/\b(bus|coach)\b/.test(raw)) return "bus";
  if (/\b(flight|air|airline)\b/.test(raw)) return "flight";
  if (/\b(cruise|ship)\b/.test(raw)) return "cruise";
  if (/\b(private\s*ev|ev)\b/.test(raw)) return "transfer";
  if (/\b(cab|taxi|transfer|private\s*car|car|pickup|drop)\b/.test(raw)) return "transfer";
  if (/\b(homestay)\b/.test(raw)) return "homestay";
  if (/\b(hotel|resort|villa|stay|retreat|camp)\b/.test(raw)) return "hotel";
  if (/\b(meal|food|dinner|breakfast|lunch|cafe|restaurant)\b/.test(raw)) return "meal";
  if (/\b(local[-\s]*market|shopping|souvenir|handicraft|spice)\b/.test(raw)) return "localMarket";
  if (/\b(creator|reel|photo|story|influencer)\b/.test(raw)) return "creator";
  if (/\b(local[-\s]*life|hidden\s*gem|local\s*walk|culture)\b/.test(raw)) return "localLife";
  if (/\b(activity|experience|tour|sightseeing|walk|show)\b/.test(raw)) return "activity";
  if (/\b(insurance)\b/.test(raw)) return "insurance";
  if (/\b(visa)\b/.test(raw)) return "visa";

  return "other";
}

function selectedBasketItems(data: RecordValue) {
  const summary = asRecord(data.summary);
  const smartPayload = asRecord(data.smartPlannerPayload);
  const payload = asRecord(data.payload);
  const candidates = [
    summary.selectedBasketItems,
    data.selectedBasketItems,
    smartPayload.selectedBasketItems,
    payload.selectedBasketItems,
  ];

  for (const candidate of candidates) {
    const items = safeArray(candidate);
    if (items.length) return items;
  }

  return [];
}

function routeFromPayload(data: RecordValue) {
  const summary = asRecord(data.summary);
  const smartPayload = asRecord(data.smartPlannerPayload);
  const trip = asRecord(smartPayload.trip || data.trip);
  const route = asRecord(smartPayload.route || data.route);
  const selectedRoute = asRecord(route.selectedRouteVariant);
  const routeStops = safeArray(selectedRoute.stops).map((item) => text(item.name) || text(item.city)).filter(Boolean);
  const destinations = Array.isArray(trip.destinations)
    ? trip.destinations.map(text).filter(Boolean)
    : [];

  return (
    routeLabel(summary.route) ||
    routeLabel(routeStops) ||
    routeLabel(destinations) ||
    [trip.origin, trip.destination].map(text).filter(Boolean).join(" → ")
  );
}

function itineraryDays(data: RecordValue) {
  const itinerary = asRecord(data.itinerary);
  const smartPayload = asRecord(data.smartPlannerPayload);
  const smartItinerary = smartPayload.itinerary;

  const candidates = [
    itinerary.dayPlans,
    itinerary.days,
    smartItinerary,
    asRecord(smartItinerary).days,
    data.itinerary,
  ];

  for (const candidate of candidates) {
    const days = safeArray(candidate);
    if (days.length) return days;
  }

  return [];
}

function dayNumber(item: RecordValue) {
  return numberValue(item.day, item.dayNumber, item.dayIndex);
}

function mapDayPlans(data: RecordValue, basket: RecordValue[]) {
  const days = itineraryDays(data);

  if (days.length) {
    return days.map((day, index) => {
      const dayNo = numberValue(day.day, day.dayNumber, day.number, index + 1) || index + 1;
      const dayItems = safeArray(day.items).length
        ? safeArray(day.items).map(itemTitle)
        : safeArray(day.timeline).map(itemTitle);
      const basketForDay = basket
        .filter((item) => dayNumber(item) === dayNo || text(item.dayId) === text(day.id))
        .map((item) => itemTitle(item));

      return {
        day: dayNo,
        title: text(day.title) || text(day.dayTitle) || `Day ${dayNo}`,
        dateLabel: text(day.dateLabel) || text(day.date),
        items: [...dayItems, ...basketForDay].filter(Boolean),
        included: countPackageFeatures(basket.filter((item) => dayNumber(item) === dayNo)),
      };
    });
  }

  const grouped = basket.reduce<Record<string, RecordValue[]>>((acc, item) => {
    const key = String(dayNumber(item) || 1);
    acc[key] = [...(acc[key] || []), item];
    return acc;
  }, {});

  return Object.entries(grouped).map(([day, items]) => ({
    day: Number(day),
    title: `Day ${day}`,
    items: items.map(itemTitle),
    included: countPackageFeatures(items),
  }));
}

function countPackageFeatures(items: RecordValue[]): PackageFeatureCounts {
  return items.reduce<PackageFeatureCounts>(
    (acc, item) => {
      const group = resolvePlannerServiceGroup(item);
      if (group === "flight") acc.flights += 1;
      else if (group === "hotel" || group === "homestay") acc.hotels += 1;
      else if (group === "train" || group === "bus" || group === "transfer" || group === "cruise") acc.transfers += 1;
      else if (group === "meal") acc.meals += 1;
      else acc.activities += 1;
      return acc;
    },
    { flights: 0, hotels: 0, transfers: 0, activities: 0, meals: 0 } as PackageFeatureCounts
  );
}

function labelItems(items: RecordValue[]) {
  return items.map((item) => {
    const meta = itemMeta(item);
    const price = itemAmount(item);
    return [itemTitle(item), meta, price ? `₹${price.toLocaleString("en-IN")}` : ""]
      .filter(Boolean)
      .join(" • ");
  });
}

function buildSelectionState(basket: RecordValue[]) {
  const groups = basket.reduce<Record<string, RecordValue[]>>((acc, item) => {
    const group = resolvePlannerServiceGroup(item);
    acc[group] = [...(acc[group] || []), item];
    return acc;
  }, {});

  const transport = [
    ...(groups.flight || []),
    ...(groups.train || []),
    ...(groups.bus || []),
    ...(groups.transfer || []),
    ...(groups.cruise || []),
  ];
  const stay = [...(groups.hotel || []), ...(groups.homestay || [])];
  const activities = [
    ...(groups.activity || []),
    ...(groups.localLife || []),
    ...(groups.creator || []),
    ...(groups.localMarket || []),
    ...(groups.insurance || []),
    ...(groups.visa || []),
    ...(groups.other || []),
  ];

  return {
    groups,
    selectionState: {
      selectedFlights: transport.map((item, index) => ({
        airline: itemTitle(item),
        flightNumber: text(item.serviceType) || text(item.type) || `transport-${index + 1}`,
        from: text(item.from) || text(item.origin),
        to: text(item.to) || text(item.destination),
        departureTime: text(item.time) || text(item.departureTime),
        duration: text(item.duration),
      })),
      selectedHotels: stay.map((item) => ({
        hotelName: itemTitle(item),
        roomType: text(item.roomType) || text(item.type),
        city: text(item.city) || text(item.location),
        mealPlan: text(item.mealPlan),
      })),
      selectedTransfers: transport.map((item) => ({
        title: itemTitle(item),
        vehicleType: text(item.serviceType) || text(item.type) || "Transport",
        subtitle: itemMeta(item),
      })),
      selectedMeals: (groups.meal || []).map((item) => ({
        title: itemTitle(item),
        description: itemMeta(item),
      })),
      selectedActivities: activities.map((item) => ({
        title: itemTitle(item),
        description: itemMeta(item),
        category: text(item.category) || text(item.serviceType) || text(item.type),
      })),
      flightFareDiff: 0,
      hotelFareDiff: 0,
      transferFareDiff: 0,
      mealFareDiff: 0,
      activityFareDiff: 0,
    },
    transport,
    stay,
    meals: groups.meal || [],
    activities,
  };
}

function durationParts(data: RecordValue) {
  const summary = asRecord(data.summary);
  const smartPayload = asRecord(data.smartPlannerPayload);
  const trip = asRecord(smartPayload.trip || data.trip);
  const explicitDays = numberValue(summary.days, trip.durationDays, trip.days);
  const itineraryCount = itineraryDays(data).length;
  const days = explicitDays || itineraryCount;
  if (days > 0) return { days, nights: Math.max(days - 1, 0) };

  const start = text(summary.travelDate) || text(trip.startDate);
  const end = text(trip.endDate);
  if (start && end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
      const diff = Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;
      if (diff > 0) return { days: diff, nights: Math.max(diff - 1, 0) };
    }
  }

  return { days: 0, nights: 0 };
}

function normalizeFare(data: RecordValue, booking?: BookingItem | null) {
  const fare = asRecord(data.fare);
  const payment = asRecord(data.payment);
  const smartPayload = asRecord(data.smartPlannerPayload);
  const plannerFare =
    normalizePlannerFareSummary(data.plannerFareSummary) ||
    normalizePlannerFareSummary(fare.plannerFareSummary) ||
    normalizePlannerFareSummary(smartPayload.plannerFareSummary);
  const plannerFareRecord: RecordValue = plannerFare ? plannerFareSummaryToFare(plannerFare) : {};

  const selectedBasketValue = numberValue(
    plannerFare?.selectedBasketValue,
    plannerFareRecord.basePrice,
    fare.basePrice,
    data.selectedBasketValue
  );

  return {
    ...fare,
    ...plannerFareRecord,
    baseAfterOffer: numberValue(plannerFareRecord.baseAfterOffer, fare.baseAfterOffer, selectedBasketValue),
    basePrice: selectedBasketValue || numberValue(fare.basePrice),
    couponDiscount: numberValue(plannerFareRecord.couponDiscount, fare.couponDiscount),
    feesAndTaxes: numberValue(plannerFareRecord.feesAndTaxes, fare.feesAndTaxes),
    finalPayableAmount: numberValue(
      plannerFareRecord.finalPayableAmount,
      fare.finalPayableAmount,
      fare.grandTotal,
      payment.amountPaid,
      booking?.amount
    ),
    grandTotal: numberValue(plannerFareRecord.grandTotal, fare.grandTotal, payment.amountPaid, booking?.amount),
    insuranceAmount: numberValue(fare.insuranceAmount),
    tplCreditUsed: numberValue(plannerFareRecord.tplCreditUsed, fare.tplCreditUsed),
    totalBeforeWallet: numberValue(plannerFareRecord.totalBeforeWallet, fare.totalBeforeWallet),
    upgradedDiffTotal: 0,
    walletBreakdown: {
      ...asRecord(fare.walletBreakdown),
      ...asRecord(plannerFareRecord.walletBreakdown),
      earnedOnThisBooking: numberValue(
        plannerFare?.earnedCreditAmount,
        asRecord(plannerFareRecord.walletBreakdown).earnedOnThisBooking,
        asRecord(fare.walletBreakdown).earnedOnThisBooking
      ),
    },
  };
}

export function adaptSmartPlannerBookingForPackage(
  booking: BookingItem | null,
  payload: RecordValue | null
): RecordValue {
  const data = asRecord(payload);
  const normalized = normalizeSmartPlannerBooking({ booking, payload: data });
  const sourcePayload = firstRecord(data.smartPlannerPayload, data.payload, data.reviewPayload, data.checkoutPayload, data);
  const summary = asRecord(data.summary);
  const trip = asRecord(sourcePayload.trip || data.trip);
  const traveller = asRecord(data.traveller);
  const payment = asRecord(data.payment);
  const basket = selectedBasketItems(data);
  const built = buildSelectionState(basket);
  const duration = durationParts(data);
  const fare = normalizeFare(data, booking);
  const route = normalized.routeLabel || routeFromPayload(data) || booking?.title || "Smart Planner Route";
  const title =
    normalized.tripTitle ||
    text(summary.packageTitle) ||
    text(trip.title) ||
    text(trip.name) ||
    booking?.title ||
    "Smart Planner Trip";
  const travellers = safeArray(traveller.travellers);
  const leadTraveller = firstRecord(data.leadTraveller, travellers[0], booking?.leadTraveller);
  const travelDate = normalized.travelDate || text(summary.travelDate) || text(trip.startDate) || booking?.travelDate || "";
  const totalAdults = numberValue(summary.totalAdults, asRecord(sourcePayload.travellers).adults, asRecord(sourcePayload.travellers).total, normalized.travellers.count, travellers.length, 1);
  const totalChildren = numberValue(summary.totalChildren, asRecord(sourcePayload.travellers).children);
  const totalRooms = numberValue(summary.totalRooms, asRecord(sourcePayload.travellers).rooms, 1);
  const packageSummary = {
    ...summary,
    days: duration.days || normalized.itineraryDays.length,
    durationLabel: normalized.durationLabel || (duration.days ? `${duration.nights}N / ${duration.days}D` : text(summary.durationLabel)),
    includedActivityLabels: labelItems(built.activities),
    includedFlightLabels: labelItems(built.transport),
    includedHotelLabels: labelItems(built.stay),
    includedMealLabels: labelItems(built.meals),
    includedTransferLabels: labelItems(built.transport),
    isInternationalTrip: Boolean(summary.isInternationalTrip),
    nights: duration.nights || Math.max(normalized.itineraryDays.length - 1, 0),
    originCity: normalized.origin || text(summary.originCity) || text(trip.origin),
    packageSelectionState: built.selectionState,
    packageSlug: text(summary.packageSlug) || "smart-planner",
    packageTitle: title,
    route,
    rooms: Array.isArray(summary.rooms) ? summary.rooms : [{ adults: totalAdults, children: totalChildren }],
    selectedBasketItems: basket,
    totalAdults,
    totalChildren,
    totalRooms,
    travelDate,
    variant: "smartPlanner",
  };

  const itinerary = {
    ...asRecord(data.itinerary),
    dayPlans: mapDayPlans(data, basket),
    features: countPackageFeatures(basket),
    includedActivityLabels: packageSummary.includedActivityLabels,
    includedFlightLabels: packageSummary.includedFlightLabels,
    includedHotelLabels: packageSummary.includedHotelLabels,
    includedMealLabels: packageSummary.includedMealLabels,
    includedTransferLabels: packageSummary.includedTransferLabels,
    packageSelectionState: built.selectionState,
    travelDate,
  };

  return {
    ...data,
    addOn: asRecord(data.addOn),
    basket,
    cancellation: asRecord(data.cancellation),
    fare,
    itinerary,
    leadTraveller,
    payment: {
      ...payment,
      totalTravellers: numberValue(payment.totalTravellers, totalAdults + totalChildren, travellers.length, 1),
    },
    plannerGroups: built.groups,
    smartPlannerPayload: sourcePayload,
    summary: packageSummary,
    traveller: {
      ...traveller,
      contactDetails: firstRecord(traveller.contactDetails, data.contactDetails, leadTraveller),
      travellers,
    },
  };
}
